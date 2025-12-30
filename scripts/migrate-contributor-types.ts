// scripts/migrate-contributor-types.ts
// Migration script to add contributorType field to existing contributors
// Run with: npx ts-node scripts/migrate-contributor-types.ts

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import Ticket from '@/models/Ticket';
import Functionality from '@/models/Functionality';

async function migrateContributorTypes() {
  try {
    console.log('🔄 Starting migration: Adding contributorType to existing contributors\n');
    
    await dbConnect();
    
    // Get all tickets with contributors
    const tickets = await Ticket.find({
      'contributors.0': { $exists: true }
    }).populate('functionality');

    console.log(`📊 Found ${tickets.length} tickets with contributors\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const ticket of tickets) {
      try {
        console.log(`\n┌─────────────────────────────────────────┐`);
        console.log(`│ Processing: ${ticket.ticketNumber}`);
        console.log(`│ Contributors: ${ticket.contributors.length}`);
        console.log(`└─────────────────────────────────────────┘`);

        // Skip if all contributors already have contributorType
        const missingType = ticket.contributors.some(c => !c.contributorType);
        if (!missingType) {
          console.log('✅ All contributors already have contributorType, skipping');
          skippedCount++;
          continue;
        }

        const functionality = ticket.functionality as any;
        if (!functionality || !functionality.workflow) {
          console.log('⚠️  No workflow found, skipping');
          errorCount++;
          continue;
        }

        // Find first employee node
        const startNode = functionality.workflow.nodes.find((n: any) => n.type === 'start');
        if (!startNode) {
          console.log('⚠️  No start node found, skipping');
          errorCount++;
          continue;
        }

        const firstEdge = functionality.workflow.edges.find((e: any) => e.source === startNode.id);
        if (!firstEdge) {
          console.log('⚠️  No first edge found, skipping');
          errorCount++;
          continue;
        }

        const firstNodeId = firstEdge.target;
        console.log(`   First node ID: ${firstNodeId}`);

        // Update contributors
        let updated = false;
        ticket.contributors.forEach((contributor: any) => {
          if (!contributor.contributorType) {
            // Check if this contributor was ever at the first node
            const wasAtFirstNode = ticket.workflowHistory.some(
              (action: any) => 
                action.performedBy.userId === contributor.userId &&
                (action.toNode === firstNodeId || action.fromNode === firstNodeId)
            );

            // Check if ticket is currently at first node and contributor is current assignee
            const isCurrentFirstNode = ticket.workflowStage === firstNodeId &&
              (ticket.currentAssignees.includes(contributor.userId));

            // Determine contributor type
            if (wasAtFirstNode || isCurrentFirstNode) {
              // Was at first node - check role
              if (contributor.role === 'group_lead') {
                contributor.contributorType = 'primary';
                console.log(`   ✓ ${contributor.name}: PRIMARY (group lead at first node)`);
              } else if (contributor.role === 'group_member') {
                contributor.contributorType = 'secondary';
                console.log(`   ✓ ${contributor.name}: SECONDARY (group member at first node)`);
              } else {
                // Single assignee at first node
                contributor.contributorType = 'primary';
                console.log(`   ✓ ${contributor.name}: PRIMARY (single assignee at first node)`);
              }
            } else {
              // Not at first node - always secondary
              contributor.contributorType = 'secondary';
              console.log(`   ✓ ${contributor.name}: SECONDARY (not at first node)`);
            }
            updated = true;
          }
        });

        if (updated) {
          await ticket.save();
          updatedCount++;
          console.log('✅ Ticket updated successfully');
        }

      } catch (error) {
        console.error(`❌ Error processing ticket ${ticket.ticketNumber}:`, error);
        errorCount++;
      }
    }

    console.log('\n========================================');
    console.log('📊 MIGRATION COMPLETE');
    console.log('========================================');
    console.log(`✅ Updated: ${updatedCount} tickets`);
    console.log(`⏭️  Skipped: ${skippedCount} tickets (already migrated)`);
    console.log(`❌ Errors: ${errorCount} tickets`);
    console.log(`📊 Total: ${tickets.length} tickets processed`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateContributorTypes()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export default migrateContributorTypes;