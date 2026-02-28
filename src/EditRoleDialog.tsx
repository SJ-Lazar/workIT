import React from 'react';
import './edit-user-dialog.css';

interface EditRoleDialogProps {
  open: boolean;
  role: { id: string; name: string } | null;
  onClose: () => void;
  onSave: (role: { id: string; name: string }) => void;
}

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({ open, role, onClose, onSave }) => {
  const [form, setForm] = React.useState(role || { id: '', name: '' });

  React.useEffect(() => {
    setForm(role || { id: '', name: '' });
  }, [role, open]);

  if (!open) return null;

  return (
    <div className="edit-user-dialog-backdrop">
      <div className="edit-user-dialog">
        <h2>Edit Role</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <label>Role ID</label>
          <input type="text" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} required />
          <label>Role Name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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

export default EditRoleDialog;
