import React, { useState } from 'react';
import CreateRoleDialog from '../CreateRoleDialog';
import EditRoleDialog from '../EditRoleDialog';
import { seedRoles } from '../data/users';

type Role = {
  id: string;
  name: string;
};

const Roles: React.FC = () => {
  // ...existing code from RoleCrud...
  const [roles, setRoles] = useState<Role[]>(seedRoles);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(roles.length / pageSize);

  // Search
  const [search, setSearch] = useState('');
  const filteredRoles = roles.filter(r =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const [sortKey, setSortKey] = useState<'id'|'name'>('id');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let aVal = a[sortKey] || '';
    let bVal = b[sortKey] || '';
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      if (sortDir === 'asc') return aVal.localeCompare(bVal);
      else return bVal.localeCompare(aVal);
    }
    return 0;
  });
  const finalRoles = sortedRoles.slice((page - 1) * pageSize, page * pageSize);

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };
  const handleDelete = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
    if (editingRole?.id === id) setEditingRole(null);
  };

  // Pagination controls
  const handlePrevPage = () => setPage(page > 1 ? page - 1 : 1);
  const handleNextPage = () => setPage(page < totalPages ? page + 1 : totalPages);
  const handleSort = (key: 'id'|'name') => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div style={{ padding: '12px 8px' }}>
      <h2>Roles</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <button
          className="icon-btn"
          style={{ marginRight: 12, fontSize: '1rem', padding: '4px 8px' }}
          title="Add Role"
          onClick={() => setCreateDialogOpen(true)}
        >
          <span role="img" aria-label="add">➕</span> Add Role
        </button>
        <input
          type="text"
          placeholder="Search roles..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #35374a', background: '#181a20', color: '#f3f4f6', fontSize: '1rem', marginLeft: 8 }}
        />
      </div>
      <table border={0} cellPadding={8} style={{ width: '100%', background: '#23263a', color: '#f3f4f6', borderRadius: 12 }}>
        <thead>
          <tr style={{ background: '#181a20', height: 32 }}>
            <th style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSort('id')}>
              Role ID {sortKey === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
              Role Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '4px 8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {finalRoles.map(role => (
            <tr key={role.id} style={{ height: 32 }}>
              <td style={{ padding: '4px 8px' }}>{role.id}</td>
              <td style={{ padding: '4px 8px' }}>{role.name}</td>
              <td style={{ padding: '4px 8px' }}>
                <button
                  onClick={() => handleEdit(role)}
                  className="icon-btn"
                  title="Edit Role"
                  style={{ marginRight: 4, fontSize: '1rem', padding: '2px 6px' }}
                >
                  <span role="img" aria-label="edit">✏️</span>
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="icon-btn"
                  title="Delete Role"
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
      <EditRoleDialog
        open={dialogOpen}
        role={editingRole}
        onClose={() => { setDialogOpen(false); setEditingRole(null); }}
        onSave={(updated: Role) => {
          setRoles(roles.map(r => r.id === updated.id ? updated : r));
          setDialogOpen(false);
          setEditingRole(null);
        }}
      />
      <CreateRoleDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={(newRole: Role) => {
          setRoles([...roles, newRole]);
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Roles;
