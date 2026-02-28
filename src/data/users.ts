// User, Role, and Department data models and One Piece seed data
export interface Role {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  userId: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  roles: Role[];
  departments: Department[];
}

// Seed roles
export const seedRoles: Role[] = [
  { id: 'captain', name: 'Captain' },
  { id: 'swordsman', name: 'Swordsman' },
  { id: 'navigator', name: 'Navigator' },
  { id: 'cook', name: 'Cook' },
  { id: 'doctor', name: 'Doctor' },
  { id: 'archaeologist', name: 'Archaeologist' },
  { id: 'shipwright', name: 'Shipwright' },
  { id: 'sniper', name: 'Sniper' },
];

// Seed departments
export const departments: Department[] = [
  { id: 'straw-hat', name: 'Straw Hat Pirates' },
  { id: 'marine', name: 'Marine' },
  { id: 'revolutionary', name: 'Revolutionary Army' },
];

// Seed users (One Piece characters)
export const users: User[] = [
  {
    userId: 'luffy',
    emailAddress: 'luffy@onepiece.com',
    firstName: 'Monkey D.',
    lastName: 'Luffy',
    contactNumber: '123-456-7890',
    roles: [seedRoles[0]],
    departments: [departments[0]],
  },
  {
    userId: 'zoro',
    emailAddress: 'zoro@onepiece.com',
    firstName: 'Roronoa',
    lastName: 'Zoro',
    contactNumber: '234-567-8901',
    roles: [seedRoles[1]],
    departments: [departments[0]],
  },
  {
    userId: 'nami',
    emailAddress: 'nami@onepiece.com',
    firstName: 'Nami',
    lastName: '',
    contactNumber: '345-678-9012',
    roles: [seedRoles[2]],
    departments: [departments[0]],
  },
  {
    userId: 'sanji',
    emailAddress: 'sanji@onepiece.com',
    firstName: 'Sanji',
    lastName: '',
    contactNumber: '456-789-0123',
    roles: [seedRoles[3]],
    departments: [departments[0]],
  },
  {
    userId: 'chopper',
    emailAddress: 'chopper@onepiece.com',
    firstName: 'Tony Tony',
    lastName: 'Chopper',
    contactNumber: '567-890-1234',
    roles: [seedRoles[4]],
    departments: [departments[0]],
  },
  {
    userId: 'robin',
    emailAddress: 'robin@onepiece.com',
    firstName: 'Nico',
    lastName: 'Robin',
    contactNumber: '678-901-2345',
    roles: [seedRoles[5]],
    departments: [departments[0]],
  },
  {
    userId: 'franky',
    emailAddress: 'franky@onepiece.com',
    firstName: 'Franky',
    lastName: '',
    contactNumber: '789-012-3456',
    roles: [seedRoles[6]],
    departments: [departments[0]],
  },
  {
    userId: 'usopp',
    emailAddress: 'usopp@onepiece.com',
    firstName: 'Usopp',
    lastName: '',
    contactNumber: '890-123-4567',
    roles: [seedRoles[7]],
    departments: [departments[0]],
  },
];
