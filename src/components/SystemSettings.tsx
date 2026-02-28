import React, { useState } from 'react';

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
};

interface SystemSettingsProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ colors, onChange }) => {
  const [localColors, setLocalColors] = useState(colors);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalColors({ ...localColors, [name]: value });
  };

  const handleSave = () => {
    onChange(localColors);
  };

  return (
    <div className="system-settings-modal">
      <h2>System Settings</h2>
      <label>
        Primary Color (60%)
        <input type="color" name="primary" value={localColors.primary} onChange={handleChange} />
      </label>
      <label>
        Secondary Color (30%)
        <input type="color" name="secondary" value={localColors.secondary} onChange={handleChange} />
      </label>
      <label>
        Accent Color (10%)
        <input type="color" name="accent" value={localColors.accent} onChange={handleChange} />
      </label>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default SystemSettings;
// Empty file. Ready for new code.
