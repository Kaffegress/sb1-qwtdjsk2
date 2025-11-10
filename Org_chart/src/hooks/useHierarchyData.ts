import { useState, useEffect } from 'react';
import {
  HierarchyNode,
  HierarchyNodeWithAssignments,
  MemberAssignment,
  TeamMember,
} from '../types';
import {
  mockProject,
  mockTeamMembers,
  mockHierarchyNodes,
  mockMemberAssignments,
} from '../mockData';

export function useHierarchyData() {
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [hierarchyNodes, setHierarchyNodes] = useState<HierarchyNode[]>(mockHierarchyNodes);
  const [memberAssignments, setMemberAssignments] = useState<MemberAssignment[]>(
    mockMemberAssignments
  );

  const buildHierarchyTree = (): HierarchyNodeWithAssignments[] => {
    const nodeMap = new Map<string, HierarchyNodeWithAssignments>();

    hierarchyNodes.forEach((node) => {
      const assignments = memberAssignments
        .filter((a) => a.hierarchy_node_id === node.id)
        .map((a) => ({
          ...a,
          member: teamMembers.find((m) => m.id === a.team_member_id)!,
        }))
        .filter((a) => a.member);

      nodeMap.set(node.id, {
        ...node,
        assignments,
        children: [],
      });
    });

    const rootNodes: HierarchyNodeWithAssignments[] = [];

    nodeMap.forEach((node) => {
      if (node.parent_id === null) {
        rootNodes.push(node);
      } else {
        const parent = nodeMap.get(node.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return rootNodes;
  };

  const assignMemberToNode = (nodeId: string, memberId: string) => {
    const existingAssignment = memberAssignments.find(
      (a) => a.hierarchy_node_id === nodeId && a.team_member_id === memberId
    );

    if (existingAssignment) {
      return;
    }

    const newAssignment: MemberAssignment = {
      id: `ma-${Date.now()}`,
      hierarchy_node_id: nodeId,
      team_member_id: memberId,
      assigned_at: new Date().toISOString(),
    };

    setMemberAssignments((prev) => [...prev, newAssignment]);
  };

  const removeMemberFromNode = (nodeId: string, memberId: string) => {
    setMemberAssignments((prev) =>
      prev.filter(
        (a) => !(a.hierarchy_node_id === nodeId && a.team_member_id === memberId)
      )
    );
  };

  const addNewNode = (parentId: string | null) => {
    const parentNode = parentId ? hierarchyNodes.find((n) => n.id === parentId) : null;
    const level = parentNode ? parentNode.level + 1 : 0;

    const newNode: HierarchyNode = {
      id: `hn-${Date.now()}`,
      project_id: mockProject.id,
      parent_id: parentId,
      role_title: 'New Role',
      role_description: 'Define the responsibilities for this role',
      position_x: 0,
      position_y: level * 150,
      level,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setHierarchyNodes((prev) => [...prev, newNode]);
  };

  const resetData = () => {
    setHierarchyNodes(mockHierarchyNodes);
    setMemberAssignments(mockMemberAssignments);
  };

  const getAssignedMemberIds = (): Set<string> => {
    return new Set(memberAssignments.map((a) => a.team_member_id));
  };

  return {
    project: mockProject,
    teamMembers,
    hierarchyTree: buildHierarchyTree(),
    assignMemberToNode,
    removeMemberFromNode,
    addNewNode,
    resetData,
    assignedMemberIds: getAssignedMemberIds(),
  };
}
