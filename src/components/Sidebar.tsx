import React, { useState } from 'react';

interface SidebarProps {
  userName: string;
  onOpenSettings: () => void;
  onSelect: (section: string) => void;
}

const navItems = [
  { label: 'Overview', value: 'overview' },
  { label: 'Build Team', value: 'build-team' },
  { label: 'Team Stats', value: 'team-stats' },
];

const Sidebar: React.FC<SidebarProps> = ({ userName, onOpenSettings, onSelect }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('overview');

  const handleSelect = (value: string) => {
    setActive(value);
    onSelect(value);
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '>' : '<'}
      </button>
      <div className="sidebar-content">
        {navItems.map(item => (
          <button
            key={item.value}
            className={`sidebar-nav-btn${active === item.value ? ' active' : ''}`}
            onClick={() => handleSelect(item.value)}
            style={{
              display: 'block',
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--color-text)',
              padding: '12px 8px',
              textAlign: 'left',
              fontWeight: active === item.value ? 'bold' : 'normal',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <span className="user-name">{userName}</span>
        <button className="settings-btn" onClick={onOpenSettings}>
          System Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
// Empty file. Ready for new code.
