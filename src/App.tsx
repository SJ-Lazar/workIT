import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Users from './components/Users';
import Roles from './components/Roles';
import Departments from './components/Departments';
import Teams from './components/Teams';
import Projects from './components/Projects';
import Items from './components/Items';
import Timelines from './components/Timelines.tsx';
import { seedProjects } from './data/projects';
import { users as seedUsers, seedRoles, departments as seedDepartments } from './data/users';
import { seedTeams } from './data/teams';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'team', label: 'Team', icon: '👥' },
  { key: 'projects', label: 'Projects', icon: '📁' },
  { key: 'items', label: 'Items', icon: '📦' },
  { key: 'timelines', label: 'Timelines', icon: '🗓️' },
  { key: 'users', label: 'Users', icon: '🧑' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

function App() {
  const [section, setSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState(seedProjects);
  const [isLightMode, setIsLightMode] = useState(false);
  const [showHiddenItems, setShowHiddenItems] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('theme-light', isLightMode);
  }, [isLightMode]);

  const dashboardStats = useMemo(() => {
    const allItems = projects
      .flatMap(project => project.workItems)
      .filter(item => showHiddenItems || !item.deletedAt);
    const completedItems = allItems.filter(item => Boolean(item.completedDate)).length;
    const openItems = allItems.length - completedItems;
    const projectsWithOpenItems = projects.filter(project => {
      const visibleItems = showHiddenItems
        ? project.workItems
        : project.workItems.filter(item => !item.deletedAt);
      return visibleItems.some(item => !item.completedDate);
    }).length;

    return {
      totalProjects: projects.length,
      projectsWithOpenItems,
      totalItems: allItems.length,
      openItems,
      completedItems,
      totalUsers: seedUsers.length,
      totalTeams: seedTeams.length,
      totalRoles: seedRoles.length,
      totalDepartments: seedDepartments.length,
    };
  }, [projects, showHiddenItems]);

  const dashboardCharts = useMemo(() => {
    const allItems = projects
      .flatMap(project => project.workItems)
      .filter(item => showHiddenItems || !item.deletedAt);
    const completedItems = allItems.filter(item => Boolean(item.completedDate)).length;
    const openItems = allItems.length - completedItems;
    const totalItems = allItems.length || 1;

    const itemsByProject = projects
      .map(project => ({
        id: project.id,
        name: project.name,
        count: showHiddenItems
          ? project.workItems.length
          : project.workItems.filter(item => !item.deletedAt).length,
      }))
      .sort((a, b) => b.count - a.count);

    const maxProjectItems = Math.max(1, ...itemsByProject.map(item => item.count));

    return {
      status: {
        open: openItems,
        completed: completedItems,
        openPct: Math.round((openItems / totalItems) * 100),
        completedPct: Math.round((completedItems / totalItems) * 100),
      },
      itemsByProject,
      maxProjectItems,
    };
  }, [projects, showHiddenItems]);

  let mainContent;
  if (section === 'dashboard') {
    mainContent = (
      <div className="dashboard">
        <div className="dashboard-head">
          <h1>Dashboard</h1>
          <p>App overview with the latest project and team activity.</p>
        </div>

        <div className="dashboard-grid">
          <div className="overview-card">
            <span className="overview-label">Projects</span>
            <span className="overview-value">{dashboardStats.totalProjects}</span>
            <span className="overview-sub">
              {dashboardStats.projectsWithOpenItems} with open work
            </span>
          </div>
          <div className="overview-card">
            <span className="overview-label">Work items</span>
            <span className="overview-value">{dashboardStats.totalItems}</span>
            <span className="overview-sub">{dashboardStats.openItems} open</span>
          </div>
          <div className="overview-card">
            <span className="overview-label">Completed items</span>
            <span className="overview-value">{dashboardStats.completedItems}</span>
            <span className="overview-sub">Closed work items</span>
          </div>
          <div className="overview-card">
            <span className="overview-label">Teams</span>
            <span className="overview-value">{dashboardStats.totalTeams}</span>
            <span className="overview-sub">Active delivery groups</span>
          </div>
          <div className="overview-card">
            <span className="overview-label">Users</span>
            <span className="overview-value">{dashboardStats.totalUsers}</span>
            <span className="overview-sub">Across departments</span>
          </div>
          <div className="overview-card">
            <span className="overview-label">Org structure</span>
            <span className="overview-value">
              {dashboardStats.totalRoles + dashboardStats.totalDepartments}
            </span>
            <span className="overview-sub">
              {dashboardStats.totalRoles} roles, {dashboardStats.totalDepartments} departments
            </span>
          </div>
        </div>

        <div className="dashboard-charts">
          <div className="chart-card">
            <div className="chart-title">
              <h3>Item status</h3>
              <span>{dashboardStats.totalItems} items</span>
            </div>
            <div className="status-bar">
              <span
                className="status-segment open"
                style={{ width: `${dashboardCharts.status.openPct}%` }}
              />
              <span
                className="status-segment done"
                style={{ width: `${dashboardCharts.status.completedPct}%` }}
              />
            </div>
            <div className="status-legend">
              <div>
                <span className="legend-dot open" />
                Open {dashboardCharts.status.open}
              </div>
              <div>
                <span className="legend-dot done" />
                Completed {dashboardCharts.status.completed}
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">
              <h3>Items per project</h3>
              <span>Workload breakdown</span>
            </div>
            <div className="bar-list">
              {dashboardCharts.itemsByProject.map(project => (
                <div key={project.id} className="bar-row">
                  <span className="bar-label">{project.name}</span>
                  <div className="bar-track">
                    <span
                      className="bar-fill"
                      style={{ width: `${(project.count / dashboardCharts.maxProjectItems) * 100}%` }}
                    />
                  </div>
                  <span className="bar-value">{project.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (section === 'team') {
    mainContent = (
      <div>
        <Teams />
      </div>
    );
  } else if (section === 'projects') {
    mainContent = (
      <div>
        <Projects projects={projects} setProjects={setProjects} showHiddenItems={showHiddenItems} />
      </div>
    );
  } else if (section === 'items') {
    mainContent = (
      <div>
        <Items projects={projects} showHiddenItems={showHiddenItems} />
      </div>
    );
  } else if (section === 'timelines') {
    mainContent = (
      <div>
        <Timelines projects={projects} />
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
      <div className="settings">
        <div className="dashboard-head">
          <h1>Settings</h1>
          <p>Manage preferences and appearance.</p>
        </div>

        <div className="settings-card">
          <div>
            <h3>Appearance</h3>
            <p>Switch between dark and light mode.</p>
          </div>
          <label className="toggle-row">
            <span>Light mode</span>
            <input
              type="checkbox"
              checked={isLightMode}
              onChange={event => setIsLightMode(event.target.checked)}
            />
          </label>
        </div>

        <div className="settings-card">
          <div>
            <h3>Work items</h3>
            <p>Reveal tasks that have been hidden from boards.</p>
          </div>
          <label className="toggle-row">
            <span>Show hidden items</span>
            <input
              type="checkbox"
              checked={showHiddenItems}
              onChange={event => setShowHiddenItems(event.target.checked)}
            />
          </label>
        </div>
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
