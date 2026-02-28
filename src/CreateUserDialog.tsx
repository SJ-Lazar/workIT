import React from 'react';
import './edit-user-dialog.css';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (user: any) => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose, onCreate }) => {
  const [form, setForm] = React.useState({
    userId: '',
    emailAddress: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    roles: [],
    departments: [],
    status: 'Active',
  });

  if (!open) return null;

  return (
    <div className="edit-user-dialog-backdrop">
      <div className="edit-user-dialog">
        <h2>Create User</h2>
        <form onSubmit={e => { e.preventDefault(); onCreate(form); }}>
          <label>User ID</label>
          <input type="text" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required />
          <label>Email</label>
          <input type="email" value={form.emailAddress} onChange={e => setForm({ ...form, emailAddress: e.target.value })} required />
          <label>First Name</label>
          <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
          <label>Last Name</label>
          <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
          <label>Contact Number</label>
          <input type="text" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} />
          <label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="edit-user-dialog-actions">
            <button type="button" onClick={onClose} title="Cancel" className="icon-btn">
              <span role="img" aria-label="cancel">❌</span>
            </button>
            <button type="submit" title="Create" className="icon-btn">
              <span role="img" aria-label="save">💾</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserDialog;
