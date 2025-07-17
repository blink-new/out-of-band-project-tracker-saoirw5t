import { blink } from './blink'

export const initializeSampleData = async (userId: string, businessId: string) => {
  try {
    // Check if we already have projects
    const existingProjects = await blink.db.projects.list({
      where: { businessId },
      limit: 1
    })

    if (existingProjects.length > 0) {
      console.log('Sample data already exists')
      return
    }

    // Create sample projects
    const sampleProjects = [
      {
        id: `project_${Date.now()}_1`,
        projectName: 'Customer Portal Enhancement',
        projectDescription: 'Improve the customer self-service portal with new features including advanced search, user dashboard improvements, and mobile responsiveness enhancements.',
        status: 'in_progress',
        effortLevel: 'high',
        timeCommitmentPerWeek: 15,
        projectOwner: 'John Smith',
        supportManagementResource: 'Sarah Johnson',
        supportRole: 'Technical Lead',
        targetCompletionDate: '2024-08-15',
        startDate: '2024-07-01',
        expectedOutcomes: 'Improved customer satisfaction, reduced support tickets, better user experience',
        trainingNeeded: 'React advanced patterns, API integration best practices',
        toolProcessChange: 'New deployment pipeline, updated testing framework',
        meetingCadence: 'Weekly standup, bi-weekly review',
        commChannel: '#customer-portal-team',
        escalationPath: 'Sarah Johnson -> Mike Davis -> CTO',
        dependencies: 'API team completion of user endpoints, Design team mockups',
        keyMilestones: 'Phase 1: Search feature (July 15), Phase 2: Dashboard (Aug 1), Phase 3: Mobile (Aug 15)',
        risksBlockers: 'API integration delays, potential scope creep from stakeholders',
        actionItems: '1. Complete search API integration, 2. Review mobile designs, 3. Setup testing environment',
        latestUpdate: 'Search feature 80% complete, mobile designs approved, testing environment ready',
        projectDocsLinks: 'https://wiki.company.com/customer-portal, https://github.com/company/portal-docs',
        businessId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `project_${Date.now()}_2`,
        projectName: 'Support Ticket Automation',
        projectDescription: 'Automate common support ticket responses using AI and machine learning to reduce response time and improve customer satisfaction.',
        status: 'review',
        effortLevel: 'medium',
        timeCommitmentPerWeek: 8,
        projectOwner: 'Sarah Johnson',
        supportManagementResource: 'Mike Davis',
        supportRole: 'Project Manager',
        targetCompletionDate: '2024-07-30',
        startDate: '2024-06-15',
        expectedOutcomes: 'Reduced response time by 50%, improved customer satisfaction scores',
        trainingNeeded: 'AI/ML basics, ticket system API',
        toolProcessChange: 'Integration with existing ticket system',
        meetingCadence: 'Bi-weekly check-ins',
        commChannel: '#support-automation',
        escalationPath: 'Mike Davis -> Director of Support',
        dependencies: 'AI team model training, Legal approval for automated responses',
        keyMilestones: 'Model training (June 30), Integration testing (July 15), Go-live (July 30)',
        risksBlockers: 'Model accuracy concerns, legal compliance requirements',
        actionItems: '1. Complete model testing, 2. Legal review, 3. Staff training materials',
        latestUpdate: 'Model testing complete, awaiting legal approval, training materials 90% done',
        projectDocsLinks: 'https://docs.company.com/support-automation',
        businessId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `project_${Date.now()}_3`,
        projectName: 'Knowledge Base Restructure',
        projectDescription: 'Reorganize and update the internal knowledge base to improve searchability and user experience for both staff and customers.',
        status: 'todo',
        effortLevel: 'low',
        timeCommitmentPerWeek: 5,
        projectOwner: 'Mike Davis',
        supportManagementResource: 'Lisa Chen',
        supportRole: 'Content Manager',
        targetCompletionDate: '2024-09-01',
        startDate: '2024-07-10',
        expectedOutcomes: 'Improved search functionality, better content organization, reduced time to find information',
        trainingNeeded: 'Content management system, SEO basics',
        toolProcessChange: 'New content management workflow',
        meetingCadence: 'Weekly content review',
        commChannel: '#knowledge-base',
        escalationPath: 'Lisa Chen -> Head of Documentation',
        dependencies: 'Content audit completion, New CMS selection',
        keyMilestones: 'Content audit (July 20), Structure design (Aug 1), Migration (Aug 15), Testing (Aug 30)',
        risksBlockers: 'Large volume of legacy content, resource availability',
        actionItems: '1. Complete content audit, 2. Design new structure, 3. Create migration plan',
        latestUpdate: 'Content audit 60% complete, initial structure design in progress',
        projectDocsLinks: 'https://wiki.company.com/kb-restructure',
        businessId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `project_${Date.now()}_4`,
        projectName: 'Mobile App Bug Fixes',
        projectDescription: 'Fix critical bugs in the mobile application affecting user login, data synchronization, and push notifications.',
        status: 'completed',
        effortLevel: 'high',
        timeCommitmentPerWeek: 20,
        projectOwner: 'Lisa Chen',
        supportManagementResource: 'John Smith',
        supportRole: 'QA Lead',
        targetCompletionDate: '2024-07-10',
        startDate: '2024-06-01',
        expectedOutcomes: 'Stable mobile app, improved user experience, reduced crash reports',
        trainingNeeded: 'Mobile debugging tools, crash analysis',
        toolProcessChange: 'Enhanced testing procedures',
        meetingCadence: 'Daily standups during critical phase',
        commChannel: '#mobile-bugs',
        escalationPath: 'John Smith -> Mobile Team Lead',
        dependencies: 'QA team availability, App store approval process',
        keyMilestones: 'Bug identification (June 10), Fixes implementation (June 25), Testing (July 5), Release (July 10)',
        risksBlockers: 'Complex legacy code, app store review delays',
        actionItems: 'All action items completed',
        latestUpdate: 'Project completed successfully, app released with all critical bugs fixed',
        projectDocsLinks: 'https://github.com/company/mobile-app/issues',
        businessId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `project_${Date.now()}_5`,
        projectName: 'Security Audit Implementation',
        projectDescription: 'Implement security recommendations from the recent third-party security audit to enhance system security and compliance.',
        status: 'in_progress',
        effortLevel: 'high',
        timeCommitmentPerWeek: 12,
        projectOwner: 'Alex Rodriguez',
        supportManagementResource: 'Sarah Johnson',
        supportRole: 'Security Coordinator',
        targetCompletionDate: '2024-08-30',
        startDate: '2024-07-15',
        expectedOutcomes: 'Enhanced security posture, compliance with industry standards, reduced security risks',
        trainingNeeded: 'Security best practices, compliance requirements',
        toolProcessChange: 'New security monitoring tools, updated access controls',
        meetingCadence: 'Weekly security review',
        commChannel: '#security-audit',
        escalationPath: 'Sarah Johnson -> CISO',
        dependencies: 'Security team availability, Budget approval for new tools',
        keyMilestones: 'Access control update (Aug 1), Monitoring setup (Aug 15), Final review (Aug 30)',
        risksBlockers: 'Complex system integrations, potential service disruptions',
        actionItems: '1. Update access controls, 2. Install monitoring tools, 3. Staff training',
        latestUpdate: 'Access control updates 70% complete, monitoring tools selected and ordered',
        projectDocsLinks: 'https://security.company.com/audit-2024',
        businessId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Create projects in database
    for (const project of sampleProjects) {
      await blink.db.projects.create(project)
    }

    console.log('Sample data initialized successfully')
  } catch (error) {
    console.error('Error initializing sample data:', error)
  }
}