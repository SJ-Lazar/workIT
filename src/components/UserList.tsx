import React, { useState } from 'react';
import EditUserDialog from '../EditUserDialog';
import CreateUserDialog from '../CreateUserDialog';
import { users as seedUsers, departments as seedDepartments, seedRoles } from '../data/users';
// Remove conflicting type import and use local type

type Role = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};

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

const UserList: React.FC = () => {
  // Add default status to seedUsers if missing
  const [users, setUsers] = useState<User[]>(seedUsers.map(u => ({ ...(u as any), status: (u as any).status ?? 'Active' })));
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  type DialogUser = {
    userId: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    roles: string[];
    departments: string[];
    status: string;
  };
  const [dialogUser, setDialogUser] = useState<DialogUser | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(users.length / pageSize);

  // Search
  const [search, setSearch] = useState('');
  const filteredUsers = users.filter(u =>
    u.userId.toLowerCase().includes(search.toLowerCase()) ||
    u.emailAddress.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const [sortKey, setSortKey] = useState<'userId'|'emailAddress'|'firstName'|'lastName'>('userId');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = a[sortKey] || '';
    let bVal = b[sortKey] || '';
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      if (sortDir === 'asc') return aVal.localeCompare(bVal);
      else return bVal.localeCompare(aVal);
    }
    return 0;
  });
  const finalUsers = sortedUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleEdit = (user: User) => {
    setDialogUser({
      userId: user.userId,
      emailAddress: user.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      roles: user.roles.map(r => r.id),
      departments: user.departments.map(d => d.id),
      status: user.status ?? 'Active',
    });
    setEditingUser(user);
    setDialogOpen(true);
  };
  const handleDelete = (userId: string) => {
    setUsers(users.filter(u => u.userId !== userId));
    if (editingUser?.userId === userId) setEditingUser(null);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setDialogUser(null);
  };
  const handleDialogSave = (updated: any) => {
    const updatedUser: User = {
      userId: updated.userId,
      emailAddress: updated.emailAddress,
      firstName: updated.firstName,
      lastName: updated.lastName,
      contactNumber: updated.contactNumber,
      roles: (updated.roles || []).map((id: string) => seedRoles.find(r => r.id === id)).filter(Boolean) as Role[],
      departments: (updated.departments || []).map((id: string) => seedDepartments.find(d => d.id === id)).filter(Boolean) as Department[],
      status: updated.status,
    };
    setUsers(users.map(u => (u.userId === updatedUser.userId ? updatedUser : u)));
    setDialogOpen(false);
    setEditingUser(null);
    setDialogUser(null);
  };

  // Pagination controls
  const handlePrevPage = () => setPage(page > 1 ? page - 1 : 1);
  const handleNextPage = () => setPage(page < totalPages ? page + 1 : totalPages);
  const handleSort = (key: 'userId'|'emailAddress'|'firstName'|'lastName') => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <>
      <h2>Users</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <button
          className="icon-btn"
          style={{ marginRight: 12, fontSize: '1rem', padding: '4px 8px' }}
          title="Add User"
          onClick={() => setCreateDialogOpen(true)}
        >
          <span role="img" aria-label="add">➕</span> Add User
        </button>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #35374a', background: '#181a20', color: '#f3f4f6', fontSize: '1rem', marginLeft: 8 }}
        />
      </div>
      <table border={0} cellPadding={8} style={{ width: '100%', background: '#23263a', color: '#f3f4f6', borderRadius: 12 }}>
        <thead>
          <tr style={{ background: '#181a20', height: 32 }}>
            <th style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSort('userId')}>
              User ID {sortKey === 'userId' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSort('emailAddress')}>
              Email {sortKey === 'emailAddress' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSort('firstName')}>
              Name {sortKey === 'firstName' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '4px 8px' }}>Contact</th>
            <th style={{ padding: '4px 8px' }}>Roles</th>
            <th style={{ padding: '4px 8px' }}>Departments</th>
            <th style={{ padding: '4px 8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {finalUsers.map((user: User) => (
            <tr key={user.userId} style={{ height: 32 }}>
              <td style={{ padding: '4px 8px' }}>{user.userId}</td>
              <td style={{ padding: '4px 8px' }}>{user.emailAddress}</td>
              <td style={{ padding: '4px 8px' }}>{user.firstName} {user.lastName}</td>
              <td style={{ padding: '4px 8px' }}>{user.contactNumber}</td>
              <td style={{ padding: '4px 8px' }}>{user.roles.map((r: Role) => r.name).join(', ')}</td>
              <td style={{ padding: '4px 8px' }}>{user.departments.map((d: Department) => d.name).join(', ')}</td>
              <td style={{ padding: '4px 8px' }}>
                <button
                  onClick={() => handleEdit(user)}
                  className="icon-btn"
                  title="Edit User"
                  style={{ marginRight: 4, fontSize: '1rem', padding: '2px 6px' }}
                >
                  <span role="img" aria-label="edit">✏️</span>
                </button>
                <button
                  onClick={() => handleDelete(user.userId)}
                  className="icon-btn"
                  title="Delete User"
                  style={{ fontSize: '1rem', padding: '2px 6px' }}
                >
                  <span role="img" aria-label="delete">🗑️</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, gap: 8 }}>
        <button className="icon-btn" onClick={handlePrevPage} disabled={page === 1} title="Previous Page" style={{ fontSize: '1rem', padding: '2px 6px' }}>⏪</button>
        <span style={{ color: '#4ea8de', fontSize: '1rem' }}>Page {page} of {totalPages}</span>
        <button className="icon-btn" onClick={handleNextPage} disabled={page === totalPages} title="Next Page" style={{ fontSize: '1rem', padding: '2px 6px' }}>⏩</button>
      </div>
      <EditUserDialog
        open={dialogOpen}
        user={dialogUser}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
      />
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={(newUser: any) => {
          const userToAdd: User = {
            userId: newUser.userId,
            emailAddress: newUser.emailAddress,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            contactNumber: newUser.contactNumber,
            roles: (newUser.roles || []).map((id: string) => seedRoles.find(r => r.id === id)).filter(Boolean) as Role[],
            departments: (newUser.departments || []).map((id: string) => seedDepartments.find(d => d.id === id)).filter(Boolean) as Department[],
            status: newUser.status,
          };
          setUsers([...users, userToAdd]);
          setCreateDialogOpen(false);
        }}
      />
    </>
  );
};

export default UserList;
