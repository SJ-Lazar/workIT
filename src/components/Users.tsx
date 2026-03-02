import React, { useState } from 'react';
import '../users-section.css';
import '../users-section-dark.css';
import UserList from './UserList';
import { users as seedUsers, seedRoles, departments as seedDepartments } from '../data/users';

type Role = { id: string; name: string };
type Department = { id: string; name: string };
type User = {
  userId: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  roles: Role[];
  departments: Department[];
  status?: string;
};

const BulkAssign: React.FC = () => {
  const [users, setUsers] = useState<User[]>(seedUsers.map(u => ({ ...(u as any), status: (u as any).status ?? 'Active' })));
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const handleAssign = () => {
    setUsers(users.map(u =>
      u.userId === selectedUserId
        ? {
            ...u,
            roles: selectedRoles.map(id => seedRoles.find(r => r.id === id)).filter(Boolean) as Role[],
            departments: selectedDepartments.map(id => seedDepartments.find(d => d.id === id)).filter(Boolean) as Department[],
          }
        : u
    ));
    setSelectedUserId('');
    setSelectedRoles([]);
    setSelectedDepartments([]);
  };

  return (
    <div
      style={{
        background: 'var(--surface-1)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        color: 'var(--text-strong)',
        border: '1px solid var(--border-strong)',
      }}
    >
      <h3 style={{ color: 'var(--text-accent)', marginBottom: 12 }}>Bulk Assign Roles & Departments</h3>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={selectedUserId}
          onChange={e => setSelectedUserId(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-strong)', border: '1px solid var(--border-strong)', minWidth: 120 }}
        >
          <option value="">Select User</option>
          {users.map(u => (
            <option key={u.userId} value={u.userId}>
              {u.firstName} {u.lastName} ({u.userId})
            </option>
          ))}
        </select>
        <select
          multiple
          value={selectedRoles}
          onChange={e => setSelectedRoles(Array.from(e.target.selectedOptions, opt => opt.value))}
          style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-strong)', border: '1px solid var(--border-strong)', minWidth: 120, height: 80 }}
        >
          {seedRoles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select
          multiple
          value={selectedDepartments}
          onChange={e => setSelectedDepartments(Array.from(e.target.selectedOptions, opt => opt.value))}
          style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-strong)', border: '1px solid var(--border-strong)', minWidth: 120, height: 80 }}
        >
          {seedDepartments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <button
          className="icon-btn"
          style={{ fontSize: '1rem', padding: '6px 16px', background: 'var(--color-accent)', color: '#0b111a', borderRadius: 6, border: 'none', fontWeight: 600 }}
          disabled={!selectedUserId || (selectedRoles.length === 0 && selectedDepartments.length === 0)}
          onClick={handleAssign}
        >Assign</button>
      </div>
      <div style={{ marginTop: 16, color: 'var(--text-strong)', fontSize: '0.98rem' }}>
        <b>Current Assignments:</b>
        <ul style={{ marginTop: 8 }}>
          {users.map(u => (
            <li key={u.userId}>
              <span style={{ color: 'var(--text-accent)' }}>{u.firstName} {u.lastName} ({u.userId}):</span>
              <span> Roles: {u.roles.map(r => r.name).join(', ') || 'None'} | Departments: {u.departments.map(d => d.name).join(', ') || 'None'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Users: React.FC = () => {
  return (
    <>
      <BulkAssign />
      <UserList />
    </>
  );
};

export default Users;
