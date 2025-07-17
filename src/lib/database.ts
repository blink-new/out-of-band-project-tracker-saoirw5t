import { blink } from './blink'

// Database initialization and helper functions
export const initializeDatabase = async () => {
  try {
    // Check if we have any businesses, if not create a default one
    const businesses = await blink.db.businesses.list({ limit: 1 })
    if (businesses.length === 0) {
      await blink.db.businesses.create({
        id: 'default-business',
        name: 'Default Organization',
        description: 'Default business for new users',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
  }
}

// Helper functions for database operations
export const createBusiness = async (name: string, description?: string) => {
  const id = `business_${Date.now()}`
  await blink.db.businesses.create({
    id,
    name,
    description: description || null,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return id
}

export const createUserProfile = async (userId: string, businessId: string, role: 'admin' | 'manager' | 'staff', name: string) => {
  const id = `profile_${Date.now()}`
  await blink.db.userProfiles.create({
    id,
    userId,
    businessId,
    role,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return id
}

export const getUserProfile = async (userId: string) => {
  try {
    const profiles = await blink.db.userProfiles.list({
      where: { userId },
      limit: 1
    })
    
    if (profiles.length > 0) {
      const profile = profiles[0]
      const businesses = await blink.db.businesses.list({
        where: { id: profile.businessId },
        limit: 1
      })
      
      return {
        ...profile,
        business_name: businesses[0]?.name,
        business_id: profile.businessId,
        user_id: profile.userId
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const getBusinessProjects = async (businessId: string) => {
  try {
    const projects = await blink.db.projects.list({
      where: { businessId },
      orderBy: { updatedAt: 'desc' }
    })
    return projects
  } catch (error) {
    console.error('Error getting business projects:', error)
    return []
  }
}

export const createProject = async (projectData: any) => {
  const id = `project_${Date.now()}`
  await blink.db.projects.create({
    id,
    projectName: projectData.projectName,
    projectDescription: projectData.projectDescription,
    startDate: projectData.startDate,
    targetCompletionDate: projectData.targetCompletionDate,
    status: projectData.status || 'todo',
    projectOwner: projectData.projectOwner,
    supportManagementResource: projectData.supportManagementResource,
    supportRole: projectData.supportRole,
    effortLevel: projectData.effortLevel || 'medium',
    timeCommitmentPerWeek: projectData.timeCommitmentPerWeek,
    projectDocsLinks: projectData.projectDocsLinks,
    expectedOutcomes: projectData.expectedOutcomes,
    trainingNeeded: projectData.trainingNeeded,
    toolProcessChange: projectData.toolProcessChange,
    meetingCadence: projectData.meetingCadence,
    commChannel: projectData.commChannel,
    escalationPath: projectData.escalationPath,
    dependencies: projectData.dependencies,
    keyMilestones: projectData.keyMilestones,
    risksBlockers: projectData.risksBlockers,
    actionItems: projectData.actionItems,
    latestUpdate: projectData.latestUpdate,
    businessId: projectData.businessId,
    createdBy: projectData.createdBy,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return id
}

export const updateProject = async (projectId: string, updates: any) => {
  await blink.db.projects.update(projectId, {
    ...updates,
    updatedAt: new Date()
  })
}

export const deleteProject = async (projectId: string) => {
  await blink.db.projects.delete(projectId)
}

export const getProject = async (projectId: string) => {
  try {
    const projects = await blink.db.projects.list({
      where: { id: projectId },
      limit: 1
    })
    return projects[0] || null
  } catch (error) {
    console.error('Error getting project:', error)
    return null
  }
}

// Convert database format to frontend format (now they should match)
export const convertProjectToFrontend = (dbProject: any) => {
  return {
    id: dbProject.id,
    projectName: dbProject.projectName,
    projectDescription: dbProject.projectDescription,
    startDate: dbProject.startDate,
    targetCompletionDate: dbProject.targetCompletionDate,
    status: dbProject.status,
    projectOwner: dbProject.projectOwner,
    supportManagementResource: dbProject.supportManagementResource,
    supportRole: dbProject.supportRole,
    effortLevel: dbProject.effortLevel,
    timeCommitmentPerWeek: dbProject.timeCommitmentPerWeek,
    projectDocsLinks: dbProject.projectDocsLinks,
    expectedOutcomes: dbProject.expectedOutcomes,
    trainingNeeded: dbProject.trainingNeeded,
    toolProcessChange: dbProject.toolProcessChange,
    meetingCadence: dbProject.meetingCadence,
    commChannel: dbProject.commChannel,
    escalationPath: dbProject.escalationPath,
    dependencies: dbProject.dependencies,
    keyMilestones: dbProject.keyMilestones,
    risksBlockers: dbProject.risksBlockers,
    actionItems: dbProject.actionItems,
    latestUpdate: dbProject.latestUpdate,
    businessId: dbProject.businessId,
    createdBy: dbProject.createdBy,
    createdAt: dbProject.createdAt,
    updatedAt: dbProject.updatedAt
  }
}