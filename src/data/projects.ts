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
  startDate: string;
  endDate: string;
  workItems: WorkItem[];
}

export const seedProjects: Project[] = [
  {
    id: 'website-redesign',
    name: 'Website Redesign',
    startDate: '2026-03-01',
    endDate: '2026-05-30',
    workItems: [
      {
        id: 'wireframes',
        title: 'Create wireframes',
        description: 'Draft and review page wireframes for new marketing pages.',
        startDate: '2026-03-02',
        etaDate: '2026-03-10',
        completedDate: '',
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
    ],
  },
];