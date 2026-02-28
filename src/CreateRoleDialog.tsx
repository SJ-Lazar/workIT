import React from 'react';
import './edit-user-dialog.css';

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (role: { id: string; name: string }) => void;
}

const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({ open, onClose, onCreate }) => {
  const [form, setForm] = React.useState({ id: '', name: '' });

  if (!open) return null;

  return (
    <div className="edit-user-dialog-backdrop">
      <div className="edit-user-dialog">
        <h2>Create Role</h2>
        <form onSubmit={e => { e.preventDefault(); onCreate(form); }}>
          <label>Role ID</label>
          <input type="text" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} required />
          <label>Role Name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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

export default CreateRoleDialog;
