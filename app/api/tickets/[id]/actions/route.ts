// app/api/tickets/[id]/actions/route.ts
// VERSION: 2025-01-22-WITH-ACTUAL-NAMES-FROM-FORMDATA
// Enhancement: Fetches actual user names from FormData collection for all actions

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Ticket from '@/models/Ticket';
import Functionality from '@/models/Functionality';
import SuperFunctionality from '@/models/SuperFunctionality';
import FormData from '@/models/FormData';
import { saveAttachment } from '@/app/utils/fileUpload';
import { getUserDisplayName } from '@/app/utils/getUserDisplayName';
import { 
  sendTicketForwardedEmail,
  sendTicketReassignedEmail,
  sendGroupFormedEmail,
  sendTicketRevertedEmail,
  sendTicketResolvedEmail,
  sendBlockerReportedEmail,
  sendBlockerResolvedEmail
} from '@/app/utils/sendTicketNotification';

function isFirstEmployeeNode(nodeId: string, workflow: any): boolean {
  const startNode = workflow.nodes.find((n: any) => n.type === 'start');
  if (!startNode) return false;
  
  const firstEdge = workflow.edges.find((e: any) => e.source === startNode.id);
  if (!firstEdge) return false;
  
  return firstEdge.target === nodeId;
}

function addSecondaryCredit(secondaryCredits: any[], userId: string, name: string) {
  const exists = secondaryCredits.some(c => c.userId === userId);
  if (!exists) {
    secondaryCredits.push({ userId, name });
  }
  return secondaryCredits;
}

function getRelativeAttachmentPath(absolutePath: string): string {
  const uploadsIndex = absolutePath.indexOf('uploads');
  
  if (uploadsIndex === -1) {
    console.warn('⚠️ Could not find "uploads" in path:', absolutePath);
    return absolutePath;
  }
  
  const relativePath = absolutePath.substring(uploadsIndex);
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  console.log(`📁 Converted path: ${absolutePath} → ${normalizedPath}`);
  
  return normalizedPath;
}

// 📧 Helper function to send emails to notification recipients
async function sendToNotificationRecipients(
  ticket: any, 
  emailFunction: Function, 
  ...args: any[]
) {
  const recipients = ticket.formData?.['notification-recipients'];
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    console.log('📧 No notification recipients configured');
    return;
  }
  
  console.log(`📧 Sending to ${recipients.length} notification recipients`);
  
  for (const recipient of recipients) {
    try {
      await emailFunction(...args, recipient.userId);
      console.log(`✅ Notification email sent to: ${recipient.name} (${recipient.email})`);
    } catch (err) {
      console.error(`❌ Failed to send notification to ${recipient.name}:`, err);
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('\n🎯🎯🎯 ACTIONS ROUTE - WITH FORMDATA NAMES 🎯🎯🎯\n');
  
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const bodyText = await request.text();
    console.log('🔍 DEBUG - Raw request body text:', bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.log('🔍 DEBUG - Parsed body:', JSON.stringify(body, null, 2));
    
    const { 
      action, 
      performedBy, 
      toNode, 
      explanation,
      reassignTo,
      blockerDescription,
      groupMembers,
      groupLead,
      revertMessage,
      revertAttachments,
      forwardAttachments,
      blockerAttachments,
      resolutionAttachments
    } = body;

    console.log(`\n🎬 TICKET ACTION: ${action}`);
    console.log(`Ticket ID: ${id}`);
    console.log(`performedBy object (from client):`, performedBy);

    if (!action || !performedBy || !performedBy.userId) {
      console.error('❌ VALIDATION FAILED!');
      return NextResponse.json(
        { error: 'Missing required fields: action, performedBy (with userId)' },
        { status: 400 }
      );
    }

    // ✅ FETCH ACTUAL NAME FROM FORMDATA
    console.log(`\n🔍 Fetching actual name for user: ${performedBy.userId}`);
    const actualPerformerName = await getUserDisplayName(performedBy.userId, FormData);
    
    const enrichedPerformedBy = {
      userId: performedBy.userId,
      name: actualPerformerName  // Use fetched name instead of client-provided name
    };

    console.log(`✅ Enriched performer: ${performedBy.name || 'N/A'} → ${actualPerformerName}`);
    console.log(`Performed by: ${enrichedPerformedBy.name} (${enrichedPerformedBy.userId})`);

    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const isSuper = ticket.department === 'Super Workflow';
    console.log(`🌟 Ticket type: ${isSuper ? 'Super Workflow' : 'Regular'}`);

    let functionality: any;
    if (isSuper) {
      functionality = await SuperFunctionality.findById(ticket.functionality);
      console.log(`🌟 Loaded SuperFunctionality: ${functionality?.name}`);
    } else {
      functionality = await Functionality.findById(ticket.functionality);
      console.log(`📋 Loaded Functionality: ${functionality?.name}`);
    }

    if (!functionality || !functionality.workflow) {
      return NextResponse.json(
        { error: 'Functionality workflow not found' },
        { status: 400 }
      );
    }

    console.log(`Current stage: ${ticket.workflowStage}`);
    console.log(`Primary credit: ${ticket.primaryCredit?.name || 'None'}`);
    console.log(`Secondary credits: ${ticket.secondaryCredits.length}`);

    const isFirstNode = isFirstEmployeeNode(ticket.workflowStage, functionality.workflow);

    switch (action) {
      // ========================================
      // REVERT ACTION
      // ========================================
      case 'revert': {
        console.log('\n⏪ ========== REVERT ACTION START ==========');
        
        if (!revertMessage) {
          return NextResponse.json(
            { error: 'revertMessage is required for revert action' },
            { status: 400 }
          );
        }

        if (isFirstNode) {
          return NextResponse.json(
            { error: 'Cannot revert from the first node in the workflow' },
            { status: 400 }
          );
        }

        const workflow = functionality.workflow;
        const prevEdge = workflow.edges.find((e: any) => e.target === ticket.workflowStage);
        
        if (!prevEdge) {
          return NextResponse.json(
            { error: 'No previous node found in workflow' },
            { status: 400 }
          );
        }

        const prevNode = workflow.nodes.find((n: any) => n.id === prevEdge.source);
        
        if (!prevNode || prevNode.type === 'start') {
          return NextResponse.json(
            { error: 'Cannot revert to start node' },
            { status: 400 }
          );
        }

        console.log(`Reverting from: ${ticket.workflowStage}`);
        console.log(`Reverting to: ${prevNode.id} (${prevNode.data?.label})`);

        // Handle attachments if provided
        let savedAttachmentPaths: string[] = [];
        if (revertAttachments && Array.isArray(revertAttachments) && revertAttachments.length > 0) {
          console.log(`📎 Processing ${revertAttachments.length} revert attachments`);
          
          for (const attachment of revertAttachments) {
            if (attachment && typeof attachment === 'object' && (attachment.data || attachment.content) && attachment.name) {
              try {
                const fileData = attachment.data || attachment.content;
                const savedPath = saveAttachment(ticket.ticketNumber, {
                  name: attachment.name,
                  data: fileData,
                  type: attachment.type || attachment.mimeType || 'application/octet-stream'
                });
                
                const relativePath = getRelativeAttachmentPath(savedPath);
                savedAttachmentPaths.push(relativePath);
                
                console.log(`✅ Saved revert attachment: ${attachment.name} → ${relativePath}`);
              } catch (fileError) {
                console.error(`❌ Failed to save revert attachment ${attachment.name}:`, fileError);
              }
            }
          }
        }

        console.log(`📊 Total revert attachments saved: ${savedAttachmentPaths.length}`);

        // Give credit to performer using ACTUAL NAME
        if (!isFirstNode) {
          ticket.secondaryCredits = addSecondaryCredit(
            ticket.secondaryCredits,
            enrichedPerformedBy.userId,
            enrichedPerformedBy.name
          );
          console.log(`✅ Gave SECONDARY credit to ${enrichedPerformedBy.name} for revert action`);
        }

        // Determine new assignee based on previous node type
        let newAssignee: string;
        let newAssignees: string[];
        let newGroupLead: string | null = null;

        if (prevNode.data.nodeType === 'parallel' && prevNode.data.groupMembers) {
          newGroupLead = prevNode.data.groupLead || prevNode.data.employeeId;
          const members = [...prevNode.data.groupMembers];
          if (!members.includes(newGroupLead)) {
            members.push(newGroupLead);
          }
          newAssignees = members;
          newAssignee = newGroupLead;
          console.log(`⏪ Reverting to GROUP: Lead ${newGroupLead}, ${members.length} total members`);
        } else {
          newAssignee = prevNode.data.employeeId;
          newAssignees = [newAssignee];
          console.log(`⏪ Reverting to SINGLE: ${newAssignee}`);
        }

        const fromNode = ticket.workflowStage;
        ticket.workflowStage = prevNode.id;
        ticket.currentAssignee = newAssignee;
        ticket.currentAssignees = newAssignees;
        ticket.groupLead = newGroupLead;
        ticket.status = 'pending';

        // Create history entry with ACTUAL NAME
        const historyEntry: any = {
          actionType: 'reverted',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name  // Using actual name
          },
          performedAt: new Date(),
          fromNode,
          toNode: prevNode.id,
          explanation: revertMessage
        };

        if (savedAttachmentPaths.length > 0) {
          historyEntry.attachments = savedAttachmentPaths;
          console.log(`🎯 Adding ${savedAttachmentPaths.length} attachments to revert history entry`);
        }

        ticket.workflowHistory.push(historyEntry);

        await ticket.save();
        console.log(`✅ Reverted to ${prevNode.data?.label}`);

        // 📧 SEND EMAIL NOTIFICATION
        try {
          const ticketObject = ticket.toObject();
          await sendTicketRevertedEmail(ticketObject, enrichedPerformedBy, revertMessage, FormData);
          console.log('✅ Revert email sent');
          
          await sendToNotificationRecipients(ticket, sendTicketRevertedEmail, ticketObject, enrichedPerformedBy, revertMessage, FormData);
        } catch (emailError) {
          console.error('❌ Revert email failed:', emailError);
        }

        console.log('========== REVERT ACTION END ==========\n');
        break;
      }

      case 'in_progress':
      case 'mark_in_progress': {
        console.log('📝 Handling in_progress action');
        
        if (isFirstNode && !ticket.primaryCredit) {
          ticket.primaryCredit = {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          };
          console.log(`✅ Gave PRIMARY credit to ${enrichedPerformedBy.name}`);
        } else if (!isFirstNode) {
          ticket.secondaryCredits = addSecondaryCredit(
            ticket.secondaryCredits,
            enrichedPerformedBy.userId,
            enrichedPerformedBy.name
          );
          console.log(`✅ Gave SECONDARY credit to ${enrichedPerformedBy.name}`);
        }

        ticket.status = 'in-progress';
        
        ticket.workflowHistory.push({
          actionType: 'in_progress',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date()
        });

        await ticket.save();
        break;
      }

      case 'form_group': {
        console.log('\n👥 ========== FORM GROUP ACTION START ==========');
        
        if (!groupMembers || groupMembers.length < 2) {
          return NextResponse.json(
            { error: 'groupMembers array with at least 2 members (including lead) is required' },
            { status: 400 }
          );
        }

        if (!groupLead) {
          return NextResponse.json(
            { error: 'groupLead is required for form_group action' },
            { status: 400 }
          );
        }

        console.log(`Group lead: ${groupLead}`);
        console.log(`Group members (${groupMembers.length}):`, groupMembers.map((m: any) => m.name));

        const memberIds = groupMembers.map((m: any) => m.userId);
        
        ticket.currentAssignee = groupLead;
        ticket.currentAssignees = memberIds;
        ticket.groupLead = groupLead;
        ticket.status = 'pending';

        if (isFirstNode) {
          console.log(`\n📝 AT FIRST NODE - Assigning credits`);
          
          const leadMember = groupMembers.find((m: any) => m.userId === groupLead);
          if (leadMember && !ticket.primaryCredit) {
            ticket.primaryCredit = {
              userId: groupLead,
              name: leadMember.name
            };
            console.log(`   ✅ PRIMARY credit: ${leadMember.name} (group lead)`);
          }

          groupMembers.forEach((member: any) => {
            if (member.userId !== groupLead) {
              ticket.secondaryCredits = addSecondaryCredit(
                ticket.secondaryCredits,
                member.userId,
                member.name
              );
              console.log(`   ✅ SECONDARY credit: ${member.name}`);
            }
          });
        } else {
          console.log(`\n📝 NOT AT FIRST NODE - All get SECONDARY`);
          
          groupMembers.forEach((member: any) => {
            ticket.secondaryCredits = addSecondaryCredit(
              ticket.secondaryCredits,
              member.userId,
              member.name
            );
            console.log(`   ✅ SECONDARY credit: ${member.name}`);
          });
        }

        const groupMembersForHistory = groupMembers.map((m: any) => ({
          userId: m.userId,
          name: m.name,
          isLead: m.userId === groupLead
        }));

        ticket.workflowHistory.push({
          actionType: 'group_formed',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date(),
          groupMembers: groupMembersForHistory
        });

        await ticket.save();
        console.log(`\n✅ Group formed successfully!`);

        // 📧 SEND EMAIL NOTIFICATION
        try {
          const ticketObject = ticket.toObject();
          await sendGroupFormedEmail(ticketObject, enrichedPerformedBy, groupMembersForHistory, FormData);
          console.log('✅ Group formation emails sent');
          
          await sendToNotificationRecipients(ticket, sendGroupFormedEmail, ticketObject, enrichedPerformedBy, groupMembersForHistory, FormData);
        } catch (emailError) {
          console.error('❌ Group formation email failed:', emailError);
        }

        console.log('========== FORM GROUP ACTION END ==========\n');
        break;
      }

      case 'reassign': {
        console.log('\n🔄 ========== REASSIGN ACTION START ==========');
        
        if (!reassignTo || reassignTo.length === 0) {
          return NextResponse.json(
            { error: 'reassignTo is required for reassign action' },
            { status: 400 }
          );
        }

        console.log(`Performed by: ${enrichedPerformedBy.name} (${enrichedPerformedBy.userId})`);
        console.log(`Reassigning to: ${reassignTo.join(', ')}`);

        const atFirstNode = isFirstEmployeeNode(ticket.workflowStage, functionality.workflow);

        const newAssignees = await FormData.find({ _id: { $in: reassignTo } })
          .select('_id basicDetails.name username')
          .lean();

        if (newAssignees.length === 0) {
          return NextResponse.json(
            { error: 'New assignees not found' },
            { status: 400 }
          );
        }

        const firstNewAssignee = newAssignees[0];
        const newAssigneeName = (firstNewAssignee as any).basicDetails?.name || 
                               (firstNewAssignee as any).username || 'Unknown';
        const newAssigneeId = reassignTo[0];

        console.log(`\n👤 New assignee: ${newAssigneeName} (${newAssigneeId})`);

        if (atFirstNode) {
          console.log(`\n📝 AT FIRST NODE - Transferring PRIMARY credit`);
          
          ticket.primaryCredit = {
            userId: newAssigneeId,
            name: newAssigneeName
          };
          
          console.log(`   ✅ PRIMARY credit transferred!`);
        } else {
          console.log(`\n📝 NOT AT FIRST NODE - Updating SECONDARY credits`);
          
          ticket.secondaryCredits = ticket.secondaryCredits.filter(
            c => c.userId !== enrichedPerformedBy.userId
          );
          
          newAssignees.forEach(assignee => {
            const assigneeId = assignee._id.toString();
            const assigneeName = (assignee as any).basicDetails?.name || 
                                (assignee as any).username || 'Unknown';
            
            ticket.secondaryCredits = addSecondaryCredit(
              ticket.secondaryCredits,
              assigneeId,
              assigneeName
            );
            console.log(`   Added to SECONDARY: ${assigneeName}`);
          });
        }

        ticket.currentAssignee = newAssigneeId;
        ticket.currentAssignees = reassignTo;
        ticket.groupLead = null;
        ticket.status = 'pending';

        ticket.workflowHistory.push({
          actionType: 'reassigned',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date(),
          reassignedTo: reassignTo,
          explanation
        });

        await ticket.save();
        console.log(`\n✅ Reassignment complete!`);

        // 📧 SEND EMAIL NOTIFICATION
        try {
          const ticketObject = ticket.toObject();
          await sendTicketReassignedEmail(ticketObject, enrichedPerformedBy, explanation, FormData);
          console.log('✅ Reassignment email sent');
          
          await sendToNotificationRecipients(ticket, sendTicketReassignedEmail, ticketObject, enrichedPerformedBy, explanation, FormData);
        } catch (emailError) {
          console.error('❌ Reassignment email failed:', emailError);
        }

        console.log('========== REASSIGN ACTION END ==========\n');
        break;
      }

      // ========================================
      // FORWARD ACTION
      // ========================================
      case 'forward': {
        console.log('\n➡️ ========== FORWARD ACTION START ==========');
        
        if (!toNode) {
          return NextResponse.json(
            { error: 'toNode is required for forward action' },
            { status: 400 }
          );
        }

        if (!explanation) {
          return NextResponse.json(
            { error: 'explanation is required for forward action' },
            { status: 400 }
          );
        }

        // Handle attachments if provided (optional)
        let savedAttachmentPaths: string[] = [];
        
        if (forwardAttachments && Array.isArray(forwardAttachments) && forwardAttachments.length > 0) {
          console.log(`📎 Processing ${forwardAttachments.length} forward attachments`);
          
          for (const attachment of forwardAttachments) {
            if (attachment && typeof attachment === 'object' && (attachment.data || attachment.content) && attachment.name) {
              try {
                const fileData = attachment.data || attachment.content;
                const savedPath = saveAttachment(ticket.ticketNumber, {
                  name: attachment.name,
                  data: fileData,
                  type: attachment.type || attachment.mimeType || 'application/octet-stream'
                });
                
                const relativePath = getRelativeAttachmentPath(savedPath);
                savedAttachmentPaths.push(relativePath);
                
                console.log(`✅ Saved forward attachment: ${attachment.name} → ${relativePath}`);
              } catch (fileError) {
                console.error(`❌ Failed to save forward attachment ${attachment.name}:`, fileError);
              }
            }
          }
        }

        console.log(`📊 Total attachments saved: ${savedAttachmentPaths.length}`);

        if (isFirstNode && !ticket.primaryCredit) {
          ticket.primaryCredit = {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          };
          console.log(`✅ Gave PRIMARY credit to ${enrichedPerformedBy.name}`);
        } else if (!isFirstNode) {
          ticket.secondaryCredits = addSecondaryCredit(
            ticket.secondaryCredits,
            enrichedPerformedBy.userId,
            enrichedPerformedBy.name
          );
          console.log(`✅ Gave SECONDARY credit to ${enrichedPerformedBy.name}`);
        }

        const fromNode = ticket.workflowStage;
        const targetNode = functionality.workflow.nodes.find((n: any) => n.id === toNode);

        if (!targetNode) {
          return NextResponse.json(
            { error: 'Target node not found in workflow' },
            { status: 400 }
          );
        }

        console.log(`   Forwarding to: ${targetNode.data.label} (${targetNode.type})`);

        if (targetNode.type === 'end') {
          ticket.status = 'resolved';
          ticket.workflowStage = toNode;
          
          const forwardEntry: any = {
            actionType: 'forwarded',
            performedBy: {
              userId: enrichedPerformedBy.userId,
              name: enrichedPerformedBy.name
            },
            performedAt: new Date(),
            fromNode,
            toNode,
            explanation
          };

          if (savedAttachmentPaths.length > 0) {
            forwardEntry.attachments = savedAttachmentPaths;
          }

          ticket.workflowHistory.push(
            forwardEntry,
            {
              actionType: 'resolved',
              performedBy: {
                userId: enrichedPerformedBy.userId,
                name: enrichedPerformedBy.name
              },
              performedAt: new Date()
            }
          );

          await ticket.save();
          console.log('✅ Forwarded to END, marked as resolved');

          // 📧 SEND RESOLUTION EMAIL TO CREATOR
          try {
            const ticketObject = ticket.toObject();
            await sendTicketResolvedEmail(ticketObject, enrichedPerformedBy, FormData);
            console.log('✅ Resolution email sent to creator');
            
            await sendToNotificationRecipients(ticket, sendTicketResolvedEmail, ticketObject, enrichedPerformedBy, FormData);
          } catch (emailError) {
            console.error('❌ Resolution email failed:', emailError);
          }

          console.log('========== FORWARD ACTION END ==========\n');
          break;
        }

        const targetIsFirst = isFirstEmployeeNode(toNode, functionality.workflow);

        if (targetNode.data.nodeType === 'parallel') {
          const groupLead = targetNode.data.groupLead || targetNode.data.employeeId;
          const groupMembers = targetNode.data.groupMembers || [];
          
          console.log(`   Target is GROUP node (first: ${targetIsFirst})`);

          const allMembers = [groupLead, ...groupMembers.filter((m: string) => m !== groupLead)];
          const memberDetails = await FormData.find({ 
            _id: { $in: allMembers } 
          }).select('_id basicDetails.name username').lean();

          if (targetIsFirst) {
            const leadDoc = memberDetails.find(m => m._id.toString() === groupLead);
            if (leadDoc && !ticket.primaryCredit) {
              ticket.primaryCredit = {
                userId: groupLead,
                name: (leadDoc as any).basicDetails?.name || (leadDoc as any).username || 'Unknown'
              };
            }

            memberDetails.forEach(member => {
              const memberId = member._id.toString();
              if (memberId !== groupLead) {
                const memberName = (member as any).basicDetails?.name || (member as any).username || 'Unknown';
                ticket.secondaryCredits = addSecondaryCredit(
                  ticket.secondaryCredits,
                  memberId,
                  memberName
                );
              }
            });
          } else {
            memberDetails.forEach(member => {
              const memberId = member._id.toString();
              const memberName = (member as any).basicDetails?.name || (member as any).username || 'Unknown';
              ticket.secondaryCredits = addSecondaryCredit(
                ticket.secondaryCredits,
                memberId,
                memberName
              );
            });
          }

          ticket.currentAssignee = groupLead;
          ticket.currentAssignees = allMembers;
          ticket.groupLead = groupLead;

          const groupMembersForHistory = memberDetails.map((emp: any) => ({
            userId: emp._id.toString(),
            name: emp.basicDetails?.name || emp.username,
            isLead: emp._id.toString() === groupLead
          }));

          const historyEntry: any = {
            actionType: 'forwarded',
            performedBy: {
              userId: enrichedPerformedBy.userId,
              name: enrichedPerformedBy.name
            },
            performedAt: new Date(),
            fromNode,
            toNode,
            explanation,
            groupMembers: groupMembersForHistory
          };

          if (savedAttachmentPaths.length > 0) {
            historyEntry.attachments = savedAttachmentPaths;
          }

          ticket.workflowHistory.push(historyEntry);
        } else {
          const newAssigneeId = targetNode.data.employeeId;
          
          const newAssignee = await FormData.findById(newAssigneeId)
            .select('basicDetails.name username')
            .lean();

          if (newAssignee) {
            const newAssigneeName = (newAssignee as any).basicDetails?.name || (newAssignee as any).username;
            
            if (targetIsFirst && !ticket.primaryCredit) {
              ticket.primaryCredit = {
                userId: newAssigneeId,
                name: newAssigneeName
              };
            } else {
              ticket.secondaryCredits = addSecondaryCredit(
                ticket.secondaryCredits,
                newAssigneeId,
                newAssigneeName
              );
            }
          }

          ticket.currentAssignee = newAssigneeId;
          ticket.currentAssignees = [newAssigneeId];
          ticket.groupLead = null;

          const historyEntry: any = {
            actionType: 'forwarded',
            performedBy: {
              userId: enrichedPerformedBy.userId,
              name: enrichedPerformedBy.name
            },
            performedAt: new Date(),
            fromNode,
            toNode,
            explanation
          };

          if (savedAttachmentPaths.length > 0) {
            historyEntry.attachments = savedAttachmentPaths;
          }

          ticket.workflowHistory.push(historyEntry);
        }

        ticket.workflowStage = toNode;
        ticket.status = 'pending';
        
        await ticket.save();
        console.log(`✅ Forward complete`);

        // 📧 SEND FORWARD EMAIL
        try {
          const ticketObject = ticket.toObject();
          await sendTicketForwardedEmail(ticketObject, enrichedPerformedBy, explanation, FormData);
          console.log('✅ Forward email sent');
          
          await sendToNotificationRecipients(ticket, sendTicketForwardedEmail, ticketObject, enrichedPerformedBy, explanation, FormData);
        } catch (emailError) {
          console.error('❌ Forward email failed:', emailError);
        }

        console.log('========== FORWARD ACTION END ==========\n');
        break;
      }

      // ========================================
      // BLOCKER REPORTED ACTION (WITH ATTACHMENTS)
      // ========================================
      case 'blocker_reported':
      case 'report_blocker': {
        console.log('\n🚧 ========== BLOCKER REPORTED ACTION START ==========');
        
        if (!blockerDescription) {
          return NextResponse.json(
            { error: 'blockerDescription is required' },
            { status: 400 }
          );
        }

        // Handle blocker attachments
        let savedBlockerPaths: string[] = [];
        
        if (blockerAttachments && Array.isArray(blockerAttachments) && blockerAttachments.length > 0) {
          console.log(`📎 Processing ${blockerAttachments.length} blocker attachments`);
          
          for (const attachment of blockerAttachments) {
            if (attachment && typeof attachment === 'object' && (attachment.data || attachment.content) && attachment.name) {
              try {
                const fileData = attachment.data || attachment.content;
                const savedPath = saveAttachment(ticket.ticketNumber, {
                  name: attachment.name,
                  data: fileData,
                  type: attachment.type || attachment.mimeType || 'application/octet-stream'
                });
                
                const relativePath = getRelativeAttachmentPath(savedPath);
                savedBlockerPaths.push(relativePath);
                
                console.log(`✅ Saved blocker attachment: ${attachment.name} → ${relativePath}`);
              } catch (fileError) {
                console.error(`❌ Failed to save blocker attachment ${attachment.name}:`, fileError);
              }
            }
          }
        }

        console.log(`📊 Total blocker attachments saved: ${savedBlockerPaths.length}`);

        if (isFirstNode && !ticket.primaryCredit) {
          ticket.primaryCredit = {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          };
        } else if (!isFirstNode) {
          ticket.secondaryCredits = addSecondaryCredit(
            ticket.secondaryCredits,
            enrichedPerformedBy.userId,
            enrichedPerformedBy.name
          );
        }

        ticket.status = 'blocked';
        
        const blockerEntry: any = {
          description: blockerDescription,
          reportedBy: enrichedPerformedBy.userId,
          reportedByName: enrichedPerformedBy.name,
          reportedAt: new Date(),
          isResolved: false
        };
        
        if (savedBlockerPaths.length > 0) {
          blockerEntry.attachments = savedBlockerPaths;
        }
        
        ticket.blockers.push(blockerEntry);

        const historyEntry: any = {
          actionType: 'blocker_reported',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date(),
          blockerDescription
        };
        
        if (savedBlockerPaths.length > 0) {
          historyEntry.attachments = savedBlockerPaths;
        }
        
        ticket.workflowHistory.push(historyEntry);

        await ticket.save();
        console.log(`✅ Blocker reported with ${savedBlockerPaths.length} attachments`);

        // 📧 SEND BLOCKER EMAIL TO CREATOR
        try {
          const ticketObject = ticket.toObject();
          await sendBlockerReportedEmail(ticketObject, enrichedPerformedBy, blockerDescription, savedBlockerPaths, FormData);
          console.log('✅ Blocker email sent to creator');
          
          await sendToNotificationRecipients(ticket, sendBlockerReportedEmail, ticketObject, enrichedPerformedBy, blockerDescription, savedBlockerPaths, FormData);
        } catch (emailError) {
          console.error('❌ Blocker email failed:', emailError);
        }

        console.log('========== BLOCKER REPORTED ACTION END ==========\n');
        break;
      }

      // ========================================
      // BLOCKER RESOLVED ACTION (WITH ATTACHMENTS)
      // ========================================
      case 'blocker_resolved': {
        console.log('\n✅ ========== BLOCKER RESOLVED ACTION START ==========');
        
        // Handle resolution attachments
        let savedResolutionPaths: string[] = [];
        
        if (resolutionAttachments && Array.isArray(resolutionAttachments) && resolutionAttachments.length > 0) {
          console.log(`📎 Processing ${resolutionAttachments.length} resolution attachments`);
          
          for (const attachment of resolutionAttachments) {
            if (attachment && typeof attachment === 'object' && (attachment.data || attachment.content) && attachment.name) {
              try {
                const fileData = attachment.data || attachment.content;
                const savedPath = saveAttachment(ticket.ticketNumber, {
                  name: attachment.name,
                  data: fileData,
                  type: attachment.type || attachment.mimeType || 'application/octet-stream'
                });
                
                const relativePath = getRelativeAttachmentPath(savedPath);
                savedResolutionPaths.push(relativePath);
                
                console.log(`✅ Saved resolution attachment: ${attachment.name} → ${relativePath}`);
              } catch (fileError) {
                console.error(`❌ Failed to save resolution attachment ${attachment.name}:`, fileError);
              }
            }
          }
        }

        console.log(`📊 Total resolution attachments saved: ${savedResolutionPaths.length}`);

        if (isFirstNode && !ticket.primaryCredit) {
          ticket.primaryCredit = {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          };
        } else if (!isFirstNode) {
          ticket.secondaryCredits = addSecondaryCredit(
            ticket.secondaryCredits,
            enrichedPerformedBy.userId,
            enrichedPerformedBy.name
          );
        }

        if (ticket.blockers.length > 0) {
          const latestBlocker = ticket.blockers[ticket.blockers.length - 1];
          latestBlocker.isResolved = true;
          latestBlocker.resolvedBy = enrichedPerformedBy.userId;
          latestBlocker.resolvedByName = enrichedPerformedBy.name;
          latestBlocker.resolvedAt = new Date();
          
          if (savedResolutionPaths.length > 0) {
            latestBlocker.resolutionAttachments = savedResolutionPaths;
          }
        }

        ticket.status = 'in-progress';

        const historyEntry: any = {
          actionType: 'blocker_resolved',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date()
        };
        
        if (savedResolutionPaths.length > 0) {
          historyEntry.attachments = savedResolutionPaths;
        }
        
        ticket.workflowHistory.push(historyEntry);

        await ticket.save();
        console.log(`✅ Blocker resolved with ${savedResolutionPaths.length} attachments`);

        // 📧 SEND RESOLUTION EMAIL TO CREATOR AND ASSIGNEE
        try {
          const ticketObject = ticket.toObject();
          await sendBlockerResolvedEmail(ticketObject, enrichedPerformedBy, savedResolutionPaths, FormData);
          console.log('✅ Blocker resolution email sent');
          
          await sendToNotificationRecipients(ticket, sendBlockerResolvedEmail, ticketObject, enrichedPerformedBy, savedResolutionPaths, FormData);
        } catch (emailError) {
          console.error('❌ Blocker resolution email failed:', emailError);
        }

        console.log('========== BLOCKER RESOLVED ACTION END ==========\n');
        break;
      }

      case 'resolve': {
        if (isFirstNode && !ticket.primaryCredit) {
          ticket.primaryCredit = {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          };
        } else if (!isFirstNode) {
          ticket.secondaryCredits = addSecondaryCredit(
            ticket.secondaryCredits,
            enrichedPerformedBy.userId,
            enrichedPerformedBy.name
          );
        }

        ticket.status = 'resolved';

        ticket.workflowHistory.push({
          actionType: 'resolved',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date()
        });

        await ticket.save();
        console.log(`✅ Resolved`);

        // 📧 SEND RESOLUTION EMAIL TO CREATOR
        try {
          const ticketObject = ticket.toObject();
          await sendTicketResolvedEmail(ticketObject, enrichedPerformedBy, FormData);
          console.log('✅ Resolution email sent to creator');
          
          await sendToNotificationRecipients(ticket, sendTicketResolvedEmail, ticketObject, enrichedPerformedBy, FormData);
        } catch (emailError) {
          console.error('❌ Resolution email failed:', emailError);
        }

        break;
      }

      case 'close': {
        ticket.status = 'closed';

        ticket.workflowHistory.push({
          actionType: 'closed',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date()
        });

        await ticket.save();
        console.log('✅ Closed');
        break;
      }

      case 'reopen': {
        if (!toNode) {
          return NextResponse.json(
            { error: 'toNode is required for reopen action' },
            { status: 400 }
          );
        }

        const targetNode = functionality.workflow.nodes.find((n: any) => n.id === toNode);

        if (!targetNode) {
          return NextResponse.json(
            { error: 'Target node not found' },
            { status: 400 }
          );
        }

        ticket.workflowStage = toNode;
        ticket.status = 'pending';

        ticket.workflowHistory.push({
          actionType: 'reopened',
          performedBy: {
            userId: enrichedPerformedBy.userId,
            name: enrichedPerformedBy.name
          },
          performedAt: new Date(),
          toNode,
          explanation
        });

        await ticket.save();
        console.log('✅ Reopened');
        break;
      }

      default:
        console.error(`❌ Unknown action: ${action}`);
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    console.log(`\n📊 FINAL CREDITS AFTER ACTION:`);
    console.log(`   Primary: ${ticket.primaryCredit?.name || 'None'}`);
    console.log(`   Secondary: ${ticket.secondaryCredits.length} people`);
    console.log('✅ Action completed successfully\n');

    return NextResponse.json({
      success: true,
      ticket: {
        _id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        workflowStage: ticket.workflowStage,
        currentAssignees: ticket.currentAssignees,
        groupLead: ticket.groupLead,
        primaryCredit: ticket.primaryCredit,
        secondaryCredits: ticket.secondaryCredits
      }
    });

  } catch (error) {
    console.error('❌ Error processing ticket action:', error);
    return NextResponse.json(
      { error: 'Failed to process action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}