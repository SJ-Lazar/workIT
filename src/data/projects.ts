export interface WorkItemComment {
  id: string;
  text: string;
  createdAt: string;
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  etaDate: string;
  completedDate: string;
  status: 'backlog' | 'inProgress' | 'done';
  assignedUserIds: string[];
  assignedTeamIds: string[];
  notes: string;
  comments: WorkItemComment[];
  attachments: string[];
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedUserIds: string[];
  workItems: WorkItem[];
}

export const seedProjects: Project[] = [
  {
    id: 'website-redesign',
    name: 'Website Redesign',
    description: 'Refresh the marketing site with a new navigation, hero layout, and performance polish.',
    startDate: '2026-03-01',
    endDate: '2026-05-30',
    assignedUserIds: ['nami', 'robin', 'franky'],
    workItems: [
      {
        id: 'wireframes',
        title: 'Create wireframes',
        description: 'Draft and review page wireframes for new marketing pages.',
        startDate: '2026-03-02',
        etaDate: '2026-03-10',
        completedDate: '',
        status: 'inProgress',
        assignedUserIds: ['nami'],
        assignedTeamIds: ['core-platform'],
        notes: 'Keep mobile-first constraints in scope.',
        comments: [
          {
            id: 'wireframes-c1',
            text: 'Initial homepage draft is ready for review.',
            createdAt: '2026-03-03',
          },
        ],
        attachments: ['https://example.com/docs/wireframes-v1.pdf'],
        tags: ['design', 'frontend'],
      },
      {
        id: 'landing-build',
        title: 'Build landing templates',
        description: 'Implement the new layouts and shared components.',
        startDate: '2026-03-12',
        etaDate: '2026-03-28',
        completedDate: '2026-03-27',
        status: 'done',
        assignedUserIds: ['franky'],
        assignedTeamIds: ['core-platform'],
        notes: 'Prioritize Lighthouse performance targets.',
        comments: [],
        attachments: ['https://example.com/repos/website-redesign'],
        tags: ['frontend', 'performance'],
      },
    ],
  },
  {
    id: 'mobile-launch',
    name: 'Mobile App Launch',
    description: 'Coordinate the release prep, QA sign-off, and App Store assets for the new mobile app.',
    startDate: '2026-02-10',
    endDate: '2026-04-15',
    assignedUserIds: ['luffy', 'sanji', 'chopper'],
    workItems: [
      {
        id: 'qa-pass',
        title: 'Final QA pass',
        description: 'Run the full regression suite on iOS and Android.',
        startDate: '2026-03-01',
        etaDate: '2026-03-12',
        completedDate: '2026-03-11',
        status: 'done',
        assignedUserIds: ['chopper'],
        assignedTeamIds: ['field-ops'],
        notes: 'Focus on offline workflows and login edge cases.',
        comments: [
          {
            id: 'qa-pass-c1',
            text: 'iOS build verified, Android pending final device sweep.',
            createdAt: '2026-03-05',
          },
        ],
        attachments: ['https://example.com/docs/qa-checklist.pdf'],
        tags: ['qa', 'release'],
      },
      {
        id: 'store-assets',
        title: 'App Store assets',
        description: 'Finalize screenshots and launch copy for stores.',
        startDate: '2026-03-08',
        etaDate: '2026-03-18',
        completedDate: '',
        status: 'inProgress',
        assignedUserIds: ['sanji'],
        assignedTeamIds: ['creative'],
        notes: 'Awaiting product marketing approval.',
        comments: [],
        attachments: ['https://example.com/figma/mobile-launch-assets'],
        tags: ['marketing', 'design'],
      },
      {
        id: 'release-review',
        title: 'Release readiness review',
        description: 'Gather sign-off from ops, support, and product.',
        startDate: '2026-03-20',
        etaDate: '2026-03-28',
        completedDate: '',
        status: 'backlog',
        assignedUserIds: ['luffy'],
        assignedTeamIds: ['core-platform'],
        notes: 'Share launch timeline in the weekly sync.',
        comments: [],
        attachments: [],
        tags: ['release', 'coordination'],
      },
    ],
  },
  {
    id: 'client-portal',
    name: 'Client Portal Refresh',
    description: 'Improve onboarding, permissions, and reports for the enterprise portal.',
    startDate: '2026-01-20',
    endDate: '2026-04-25',
    assignedUserIds: ['robin', 'zoro', 'usopp'],
    workItems: [
      {
        id: 'onboarding-flow',
        title: 'Simplify onboarding flow',
        description: 'Reduce the number of steps required to activate a new account.',
        startDate: '2026-02-01',
        etaDate: '2026-02-20',
        completedDate: '2026-02-18',
        status: 'done',
        assignedUserIds: ['robin'],
        assignedTeamIds: ['enterprise-success'],
        notes: 'Track drop-off metrics weekly.',
        comments: [],
        attachments: ['https://example.com/metrics/onboarding-dropoff'],
        tags: ['ux', 'product'],
      },
      {
        id: 'role-matrix',
        title: 'Role matrix update',
        description: 'Define new permission tiers for large accounts.',
        startDate: '2026-02-15',
        etaDate: '2026-03-05',
        completedDate: '',
        status: 'inProgress',
        assignedUserIds: ['zoro'],
        assignedTeamIds: ['security'],
        notes: 'Coordinate with compliance before roll-out.',
        comments: [],
        attachments: ['https://example.com/docs/role-matrix-v2.xlsx'],
        tags: ['security', 'governance'],
      },
      {
        id: 'reporting-dashboard',
        title: 'Reporting dashboard',
        description: 'Add usage and billing insights for client admins.',
        startDate: '2026-03-01',
        etaDate: '2026-03-22',
        completedDate: '',
        status: 'inProgress',
        assignedUserIds: ['usopp'],
        assignedTeamIds: ['analytics'],
        notes: 'Line up export requirements with finance.',
        comments: [],
        attachments: [],
        tags: ['analytics', 'backend'],
      },
    ],
  },
];