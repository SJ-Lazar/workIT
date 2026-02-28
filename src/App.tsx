import React, { useState } from 'react';
import './App.css';
import Users from './components/Users';
import Roles from './components/Roles';
import Departments from './components/Departments';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'team', label: 'Team', icon: '👥' },
  { key: 'projects', label: 'Projects', icon: '📁' },
  { key: 'items', label: 'Items', icon: '📦' },
  { key: 'users', label: 'Users', icon: '🧑' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

function App() {
  const [section, setSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  let mainContent;
  if (section === 'dashboard') {
    mainContent = (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard overview.</p>
      </div>
    );
  } else if (section === 'team') {
    mainContent = (
      <div>
        <h1>Team</h1>
        <p>Manage your team here.</p>
      </div>
    );
  } else if (section === 'projects') {
    mainContent = (
      <div>
        <h1>Projects</h1>
        <p>View and manage your projects here.</p>
      </div>
    );
  } else if (section === 'items') {
    mainContent = (
      <div>
        <h1>Items</h1>
        <p>Browse and manage your items here.</p>
      </div>
    );
  } else if (section === 'users') {
    mainContent = (
      <div>
          <Users />
          <Roles />
          <Departments />
      </div>
    );
  } else if (section === 'settings') {
    mainContent = (
      <div>
        <h1>Settings</h1>
        <p>Configure your application settings here.</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-header">
          {collapsed ? '🔷' : 'WorkIT'}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '➡️' : '⬅️'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-btn${section === item.key ? ' active' : ''}`}
              onClick={() => setSection(item.key)}
              title={item.label}
            >
              {item.icon}
              {!collapsed && <span className="nav-label"> {item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">{!collapsed && <>Logged in as <b>User</b></>}</div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          {/* Optionally show section name in header */}
        </header>
        <section className="main-section">
          {mainContent}
        </section>
      </main>
    </div>
  );
}

export default App;
