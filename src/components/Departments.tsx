import React, { useState } from 'react';
import EditDepartmentDialog from '../EditDepartmentDialog';
import CreateDepartmentDialog from '../CreateDepartmentDialog';
import { departments as seedDepartments } from '../data/users';

type Department = {
  id: string;
  name: string;
};

const Departments: React.FC = () => {
  // ...existing code from DepartmentCrud...
  const [departments, setDepartments] = useState<Department[]>(seedDepartments);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(departments.length / pageSize);

  // Search
  const [search, setSearch] = useState('');
  const filteredDepartments = departments.filter(d =>
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const [sortKey, setSortKey] = useState<'id'|'name'>('id');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    let aVal = a[sortKey] || '';
    let bVal = b[sortKey] || '';
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      if (sortDir === 'asc') return aVal.localeCompare(bVal);
      else return bVal.localeCompare(aVal);
    }
    return 0;
  });
  const finalDepartments = sortedDepartments.slice((page - 1) * pageSize, page * pageSize);

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setDialogOpen(true);
  };
  const handleDelete = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    if (editingDept?.id === id) setEditingDept(null);
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
      <h2>Departments</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <button
          className="icon-btn"
          style={{ marginRight: 12, fontSize: '1rem', padding: '4px 8px' }}
          title="Add Department"
          onClick={() => setCreateDialogOpen(true)}
        >
          <span role="img" aria-label="add">➕</span> Add Department
        </button>
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #35374a', background: '#181a20', color: '#f3f4f6', fontSize: '1rem', marginLeft: 8 }}
        />
      </div>
      <table border={0} cellPadding={8} style={{ width: '100%', background: '#23263a', color: '#f3f4f6', borderRadius: 12 }}>
        <thead>
          <tr style={{ background: '#181a20', height: 32 }}>
            <th style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSort('id')}>
              Department ID {sortKey === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
              Department Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '4px 8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {finalDepartments.map(dept => (
            <tr key={dept.id} style={{ height: 32 }}>
              <td style={{ padding: '4px 8px' }}>{dept.id}</td>
              <td style={{ padding: '4px 8px' }}>{dept.name}</td>
              <td style={{ padding: '4px 8px' }}>
                <button
                  onClick={() => handleEdit(dept)}
                  className="icon-btn"
                  title="Edit Department"
                  style={{ marginRight: 4, fontSize: '1rem', padding: '2px 6px' }}>
                  <span role="img" aria-label="edit">✏️</span>
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="icon-btn"
                  title="Delete Department"
                  style={{ fontSize: '1rem', padding: '2px 6px' }}>
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
      <EditDepartmentDialog
        open={dialogOpen}
        department={editingDept}
        onClose={() => { setDialogOpen(false); setEditingDept(null); }}
        onSave={updated => {
          setDepartments(departments.map(d => d.id === updated.id ? updated : d));
          setDialogOpen(false);
          setEditingDept(null);
        }}
      />
      <CreateDepartmentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={(newDept: Department) => {
          setDepartments([...departments, newDept]);
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Departments;
