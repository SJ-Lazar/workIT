export interface Team {
  id: string;
  name: string;
  description: string;
  memberUserIds: string[];
}

export const seedTeams: Team[] = [
  {
    id: 'core-platform',
    name: 'Core Platform',
    description: 'Owns shared foundations and internal tooling.',
    memberUserIds: ['luffy', 'zoro', 'nami'],
  },
  {
    id: 'delivery-ops',
    name: 'Delivery Ops',
    description: 'Coordinates releases and environment readiness.',
    memberUserIds: ['sanji', 'usopp'],
  },
];