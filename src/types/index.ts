export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  businessId?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Business {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  projectName: string
  projectDescription?: string
  startDate?: string
  targetCompletionDate?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  projectOwner?: string
  supportManagementResource?: string
  supportRole?: string
  effortLevel?: 'low' | 'medium' | 'high'
  timeCommitmentPerWeek?: number
  projectDocsLinks?: string
  expectedOutcomes?: string
  trainingNeeded?: string
  toolProcessChange?: string
  meetingCadence?: string
  commChannel?: string
  escalationPath?: string
  dependencies?: string
  keyMilestones?: string
  risksBlockers?: string
  actionItems?: string
  latestUpdate?: string
  businessId: string
  createdBy: string
  assignedUsers?: User[]
  createdAt: string
  updatedAt: string
}

export interface ProjectAssignment {
  id: string
  projectId: string
  userId: string
  role?: string
  assignedAt: string
}