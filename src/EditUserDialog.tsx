import React from 'react';
import './edit-user-dialog.css';

interface EditUserDialogProps {
  open: boolean;
  user: {
    userId: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    roles: string[];
    departments: string[];
    status: string;
  } | null;
  onClose: () => void;
  onSave: (user: any) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, user, onClose, onSave }) => {
  const [form, setForm] = React.useState(user || {
    userId: '',
    emailAddress: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    roles: [],
    departments: [],
    status: 'Active',
  });

  React.useEffect(() => {
    setForm(user || {
      userId: '',
      emailAddress: '',
      firstName: '',
      lastName: '',
      contactNumber: '',
      roles: [],
      departments: [],
      status: 'Active',
    });
  }, [user, open]);

  if (!open) return null;

  return (
    <div className="edit-user-dialog-backdrop">
      <div className="edit-user-dialog">
        <h2>Edit User</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
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
            <button type="submit" title="Save" className="icon-btn">
              <span role="img" aria-label="save">💾</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserDialog;
