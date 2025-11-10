export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  photo_url: string;
  role_type: string;
  bio: string;
  skills: string[];
  created_at: string;
}

export interface HierarchyNode {
  id: string;
  project_id: string;
  parent_id: string | null;
  role_title: string;
  role_description: string;
  position_x: number;
  position_y: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface MemberAssignment {
  id: string;
  hierarchy_node_id: string;
  team_member_id: string;
  assigned_at: string;
}

export interface HierarchyNodeWithAssignments extends HierarchyNode {
  assignments: (MemberAssignment & { member: TeamMember })[];
  children: HierarchyNodeWithAssignments[];
}
