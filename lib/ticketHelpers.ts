// lib/ticketHelpers.ts
// Helper functions to manage ticket contributors with PRIMARY/SECONDARY tracking

import { IContributor } from '@/models/Ticket';

/**
 * Add or update a contributor in the contributors array
 * @param contributorType - 'primary' for first node, 'secondary' for subsequent nodes
 */
export function addOrUpdateContributor(
  contributors: IContributor[],
  userId: string,
  name: string,
  role: 'assignee' | 'group_lead' | 'group_member',
  contributorType: 'primary' | 'secondary'
): IContributor[] {
  // Check if contributor already exists and is active
  const existingIndex = contributors.findIndex(
    c => c.userId === userId && !c.leftAt
  );

  if (existingIndex >= 0) {
    // Already active, update role and contributorType if needed
    contributors[existingIndex].role = role;
    // Keep the highest priority type (primary > secondary)
    if (contributors[existingIndex].contributorType === 'secondary' && contributorType === 'primary') {
      contributors[existingIndex].contributorType = 'primary';
    }
    return contributors;
  }

  // Add new contributor
  const newContributor: IContributor = {
    userId,
    name,
    role,
    contributorType,
    joinedAt: new Date(),
  };

  return [...contributors, newContributor];
}

/**
 * Mark a contributor as having left (when they reassign without doing work)
 * This removes their credit entirely
 */
export function markContributorLeft(
  contributors: IContributor[],
  userId: string
): IContributor[] {
  return contributors.map(c => {
    if (c.userId === userId && !c.leftAt) {
      return { ...c, leftAt: new Date() };
    }
    return c;
  });
}

/**
 * Add multiple contributors for a group ticket
 * @param isFirstNode - true if this is the first node in workflow (primary), false for secondary
 */
export function addGroupContributors(
  contributors: IContributor[],
  groupMembers: Array<{ userId: string; name: string; isLead: boolean }>,
  isFirstNode: boolean = false
): IContributor[] {
  let updated = [...contributors];

  for (const member of groupMembers) {
    const role = member.isLead ? 'group_lead' : 'group_member';
    // Group lead gets primary credit if first node, others get secondary
    const contributorType = (isFirstNode && member.isLead) ? 'primary' : 'secondary';
    
    updated = addOrUpdateContributor(updated, member.userId, member.name, role, contributorType);
  }

  return updated;
}

/**
 * Determine if a node is the first employee node in the workflow
 */
export function isFirstEmployeeNode(
  nodeId: string,
  workflow: any
): boolean {
  // Find start node
  const startNode = workflow.nodes.find((n: any) => n.type === 'start');
  if (!startNode) return false;

  // Find first edge from start
  const firstEdge = workflow.edges.find((e: any) => e.source === startNode.id);
  if (!firstEdge) return false;

  // Check if target is our node
  return firstEdge.target === nodeId;
}

/**
 * Replace contributor credit when reassignment happens
 * Marks old assignee as left, gives credit to new assignee(s)
 */
export function replaceContributor(
  contributors: IContributor[],
  oldUserId: string,
  newAssignees: Array<{ userId: string; name: string; role: 'assignee' | 'group_lead' | 'group_member' }>,
  contributorType: 'primary' | 'secondary'
): IContributor[] {
  // Mark old contributor as left (they keep their entry but marked as left)
  let updated = markContributorLeft(contributors, oldUserId);

  // Add new assignees with the inherited contributor type
  for (const assignee of newAssignees) {
    updated = addOrUpdateContributor(
      updated,
      assignee.userId,
      assignee.name,
      assignee.role,
      contributorType
    );
  }

  return updated;
}