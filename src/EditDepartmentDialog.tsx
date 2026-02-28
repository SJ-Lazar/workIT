import React from 'react';
import './edit-user-dialog.css';

interface EditDepartmentDialogProps {
  open: boolean;
  department: { id: string; name: string } | null;
  onClose: () => void;
  onSave: (department: { id: string; name: string }) => void;
}

const EditDepartmentDialog: React.FC<EditDepartmentDialogProps> = ({ open, department, onClose, onSave }) => {
  const [form, setForm] = React.useState(department || { id: '', name: '' });

  React.useEffect(() => {
    setForm(department || { id: '', name: '' });
  }, [department, open]);

  if (!open) return null;

  return (
    <div className="edit-user-dialog-backdrop">
      <div className="edit-user-dialog">
        <h2>Edit Department</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <label>Department ID</label>
          <input type="text" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} required />
          <label>Department Name</label>
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

export default EditDepartmentDialog;
