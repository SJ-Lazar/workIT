import React, { useEffect, useMemo, useState } from 'react';
import { users as seedUsers } from '../data/users';
import { seedTeams } from '../data/teams';
import { type Project, type WorkItem } from '../data/projects';
import './projects.css';

interface ProjectsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  showHiddenItems: boolean;
}

const toId = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const makeUniqueId = (name: string, existingIds: string[]) => {
  const base = toId(name);
  if (!base) {
    return '';
  }

  if (!existingIds.includes(base)) {
    return base;
  }

  let i = 2;
  while (existingIds.includes(`${base}-${i}`)) {
    i += 1;
  }
  return `${base}-${i}`;
};

const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, showHiddenItems }) => {
  const [activeProjectId, setActiveProjectId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWorkItemDialogOpen, setIsWorkItemDialogOpen] = useState(false);
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [draggingItemId, setDraggingItemId] = useState('');
  const [editingWorkItemId, setEditingWorkItemId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineEta, setInlineEta] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    details: false,
    schedule: false,
    tags: false,
    notes: false,
    attachments: false,
  });
  const [laneCollapsed, setLaneCollapsed] = useState({
    backlog: false,
    inProgress: false,
    done: false,
  });

  const [projectName, setProjectName] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');

  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemStartDate, setItemStartDate] = useState('');
  const [itemEtaDate, setItemEtaDate] = useState('');
  const [itemCompleteDate, setItemCompleteDate] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [itemComments, setItemComments] = useState('');
  const [itemAttachments, setItemAttachments] = useState('');
  const [itemTags, setItemTags] = useState('');
  const [itemAssignedUserIds, setItemAssignedUserIds] = useState<string[]>([]);
  const [itemAssignedTeamIds, setItemAssignedTeamIds] = useState<string[]>([]);

  const activeProject = useMemo(
    () => projects.find(project => project.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  const visibleWorkItems = useMemo(() => {
    if (!activeProject) {
      return [] as WorkItem[];
    }
    return showHiddenItems
      ? activeProject.workItems
      : activeProject.workItems.filter(item => !item.deletedAt);
  }, [activeProject, showHiddenItems]);

  const userTaskCounts = useMemo(() => {
    if (!activeProject) {
      return {} as Record<string, number>;
    }
    const sourceItems = showHiddenItems ? activeProject.workItems : visibleWorkItems;
    return sourceItems.reduce<Record<string, number>>((counts, item) => {
      item.assignedUserIds.forEach(userId => {
        counts[userId] = (counts[userId] ?? 0) + 1;
      });
      return counts;
    }, {});
  }, [activeProject, showHiddenItems, visibleWorkItems]);

  useEffect(() => {
    if (isDialogOpen && !activeProject) {
      setIsDialogOpen(false);
    }
  }, [activeProject, isDialogOpen]);

  const clearWorkItemForm = () => {
    setItemTitle('');
    setItemDescription('');
    setItemStartDate('');
    setItemEtaDate('');
    setItemCompleteDate('');
    setItemNotes('');
    setItemComments('');
    setItemAttachments('');
    setItemTags('');
    setItemAssignedUserIds([]);
    setItemAssignedTeamIds([]);
  };

  const populateWorkItemForm = (workItem: WorkItem) => {
    setItemTitle(workItem.title);
    setItemDescription(workItem.description);
    setItemStartDate(workItem.startDate);
    setItemEtaDate(workItem.etaDate);
    setItemCompleteDate(workItem.completedDate);
    setItemNotes(workItem.notes);
    setItemComments(workItem.comments.map(comment => comment.text).join('\n'));
    setItemAttachments(workItem.attachments.join('\n'));
    setItemTags(workItem.tags.join(', '));
    setItemAssignedUserIds(workItem.assignedUserIds);
    setItemAssignedTeamIds(workItem.assignedTeamIds);
  };

  const computeStatusFromDates = (startDate: string, completedDate: string) => {
    if (completedDate) {
      return 'done';
    }
    const today = new Date().toISOString().slice(0, 10);
    if (startDate && startDate > today) {
      return 'backlog';
    }
    return 'inProgress';
  };

  const handleCreateProject = () => {
    const cleanName = projectName.trim();
    if (!cleanName || !projectStartDate || !projectEndDate) {
      return;
    }

    const id = makeUniqueId(cleanName, projects.map(project => project.id));
    if (!id) {
      return;
    }

    const newProject: Project = {
      id,
      name: cleanName,
      description: '',
      startDate: projectStartDate,
      endDate: projectEndDate,
      assignedUserIds: [],
      workItems: [],
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setIsDialogOpen(true);
    setProjectName('');
    setProjectStartDate('');
    setProjectEndDate('');
  };

  const handleCreateWorkItem = () => {
    if (!activeProject || !itemTitle.trim() || !itemStartDate || !itemEtaDate) {
      return false;
    }

    const existingItemIds = activeProject.workItems.map(item => item.id);
    const itemId = makeUniqueId(itemTitle, existingItemIds);
    if (!itemId) {
      return false;
    }

    const comments = itemComments
      .split('\n')
      .map(comment => comment.trim())
      .filter(Boolean)
      .map((text, index) => ({
        id: `${itemId}-comment-${index + 1}`,
        text,
        createdAt: new Date().toISOString().slice(0, 10),
      }));

    const attachments = itemAttachments
      .split('\n')
      .map(value => value.trim())
      .filter(Boolean);

    const tags = itemTags
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);

    const defaultStatus = computeStatusFromDates(itemStartDate, itemCompleteDate);

    const newItem: WorkItem = {
      id: itemId,
      title: itemTitle.trim(),
      description: itemDescription.trim(),
      startDate: itemStartDate,
      etaDate: itemEtaDate,
      completedDate: itemCompleteDate,
      status: defaultStatus,
      deletedAt: '',
      assignedUserIds: itemAssignedUserIds,
      assignedTeamIds: itemAssignedTeamIds,
      notes: itemNotes.trim(),
      comments,
      attachments,
      tags,
    };

    setProjects(prev =>
      prev.map(project =>
        project.id === activeProject.id
          ? { ...project, workItems: [newItem, ...project.workItems] }
          : project
      )
    );

    clearWorkItemForm();
    return true;
  };

  const handleUpdateWorkItem = () => {
    if (!activeProject || !editingWorkItemId || !itemTitle.trim() || !itemStartDate || !itemEtaDate) {
      return false;
    }

    const comments = itemComments
      .split('\n')
      .map(comment => comment.trim())
      .filter(Boolean)
      .map((text, index) => ({
        id: `${editingWorkItemId}-comment-${index + 1}`,
        text,
        createdAt: new Date().toISOString().slice(0, 10),
      }));

    const attachments = itemAttachments
      .split('\n')
      .map(value => value.trim())
      .filter(Boolean);

    const tags = itemTags
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);

    const nextStatus = computeStatusFromDates(itemStartDate, itemCompleteDate);

    setProjects(prev =>
      prev.map(project => {
        if (project.id !== activeProject.id) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item =>
            item.id === editingWorkItemId
              ? {
                  ...item,
                  title: itemTitle.trim(),
                  description: itemDescription.trim(),
                  startDate: itemStartDate,
                  etaDate: itemEtaDate,
                  completedDate: itemCompleteDate,
                  status: nextStatus,
                  assignedUserIds: itemAssignedUserIds,
                  assignedTeamIds: itemAssignedTeamIds,
                  notes: itemNotes.trim(),
                  comments,
                  attachments,
                  tags,
                }
              : item
          ),
        };
      })
    );

    clearWorkItemForm();
    setEditingWorkItemId(null);
    return true;
  };

  const renderAssigneeNames = (workItem: WorkItem) => {
    const userNames = workItem.assignedUserIds
      .map(userId => {
        const user = seedUsers.find(candidate => candidate.userId === userId);
        return user ? `${user.firstName} ${user.lastName}`.trim() : userId;
      })
      .filter(Boolean);

    const teamNames = workItem.assignedTeamIds
      .map(teamId => seedTeams.find(team => team.id === teamId)?.name ?? teamId)
      .filter(Boolean);

    const all = [...userNames, ...teamNames];
    return all.length > 0 ? all.join(', ') : 'Unassigned';
  };

  const getUserInitials = (userId: string) => {
    const user = seedUsers.find(candidate => candidate.userId === userId);
    if (!user) {
      return userId.slice(0, 2).toUpperCase();
    }
    const name = `${user.firstName} ${user.lastName}`.trim();
    if (!name) {
      return userId.slice(0, 2).toUpperCase();
    }
    const parts = name.split(' ').filter(Boolean);
    const initials = parts.slice(0, 2).map(part => part[0]).join('');
    return initials.toUpperCase();
  };

  const getProjectProgress = (project: Project) => {
    const total = project.workItems.length;
    const completed = project.workItems.filter(item => Boolean(item.completedDate)).length;
    const remaining = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining, percent };
  };

  const handleOpenProject = (projectId: string) => {
    clearWorkItemForm();
    setIsWorkItemDialogOpen(false);
    setSelectedWorkItem(null);
    setEditingWorkItemId(null);
    setInlineEditId(null);
    setActiveProjectId(projectId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsWorkItemDialogOpen(false);
    setIsAssigneeDialogOpen(false);
    setSelectedWorkItem(null);
    setEditingWorkItemId(null);
    setInlineEditId(null);
    setDraggingItemId('');
    setIsDialogOpen(false);
  };

  const handleOpenWorkItemDialog = () => {
    clearWorkItemForm();
    setEditingWorkItemId(null);
    setIsAssigneeDialogOpen(false);
    setExpandedSections({
      details: false,
      schedule: false,
      tags: false,
      notes: false,
      attachments: false,
    });
    setIsWorkItemDialogOpen(true);
  };

  const handleCloseWorkItemDialog = () => {
    setIsWorkItemDialogOpen(false);
    setEditingWorkItemId(null);
    setIsAssigneeDialogOpen(false);
  };

  const handleSubmitWorkItem = () => {
    const didSave = editingWorkItemId ? handleUpdateWorkItem() : handleCreateWorkItem();
    if (didSave) {
      setIsAssigneeDialogOpen(false);
      setIsWorkItemDialogOpen(false);
    }
  };

  const getWorkItemStatus = (workItem: WorkItem) => {
    if (workItem.status) {
      return workItem.status;
    }
    if (workItem.completedDate) {
      return 'done';
    }
    const today = new Date().toISOString().slice(0, 10);
    if (workItem.startDate && workItem.startDate > today) {
      return 'backlog';
    }
    return 'inProgress';
  };

  const lanes = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'inProgress', label: 'In progress' },
    { id: 'done', label: 'Done' },
  ];

  const getLaneItems = (workItems: WorkItem[], laneId: string) =>
    workItems.filter(item => getWorkItemStatus(item) === laneId);

  const toggleLane = (laneId: 'backlog' | 'inProgress' | 'done') => {
    setLaneCollapsed(prev => ({ ...prev, [laneId]: !prev[laneId] }));
  };

  const handleOpenWorkItemDetail = (workItem: WorkItem) => {
    setSelectedWorkItem(workItem);
  };

  const handleCloseWorkItemDetail = () => {
    setSelectedWorkItem(null);
  };

  const handleOpenAssigneeDialog = () => {
    setAssigneeSearch('');
    setIsAssigneeDialogOpen(true);
  };

  const handleCloseAssigneeDialog = () => {
    setIsAssigneeDialogOpen(false);
    setAssigneeSearch('');
  };

  const toggleAssignee = (userId: string) => {
    setItemAssignedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = useMemo(() => {
    const normalized = assigneeSearch.trim().toLowerCase();
    if (!normalized) {
      return seedUsers;
    }
    return seedUsers.filter(user => {
      const label = `${user.firstName} ${user.lastName} ${user.userId}`.toLowerCase();
      return label.includes(normalized);
    });
  }, [assigneeSearch]);

  const handleStartInlineEdit = (workItem: WorkItem) => {
    setInlineEditId(workItem.id);
    setInlineTitle(workItem.title);
    setInlineEta(workItem.etaDate);
  };

  const handleCancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineTitle('');
    setInlineEta('');
  };

  const handleSaveInlineEdit = (workItemId: string) => {
    if (!activeProject || !inlineTitle.trim() || !inlineEta) {
      return;
    }
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== activeProject.id) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item =>
            item.id === workItemId
              ? {
                  ...item,
                  title: inlineTitle.trim(),
                  etaDate: inlineEta,
                }
              : item
          ),
        };
      })
    );
    handleCancelInlineEdit();
  };

  const handleToggleHidden = (workItem: WorkItem, restore = false) => {
    if (!activeProject) {
      return;
    }
    const nextDeletedAt = restore ? '' : new Date().toISOString().slice(0, 10);
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== activeProject.id) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item =>
            item.id === workItem.id
              ? {
                  ...item,
                  deletedAt: nextDeletedAt,
                }
              : item
          ),
        };
      })
    );
    if (!restore && selectedWorkItem?.id === workItem.id) {
      setSelectedWorkItem(null);
    }
    if (!restore && inlineEditId === workItem.id) {
      handleCancelInlineEdit();
    }
  };

  const handleEditWorkItem = (workItem: WorkItem) => {
    populateWorkItemForm(workItem);
    setEditingWorkItemId(workItem.id);
    setSelectedWorkItem(null);
    setExpandedSections({
      details: false,
      schedule: false,
      tags: false,
      notes: false,
      attachments: false,
    });
    setIsWorkItemDialogOpen(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExpandAllSections = () => {
    setExpandedSections({
      details: true,
      schedule: true,
      tags: true,
      notes: true,
      attachments: true,
    });
  };

  const handleCollapseAllSections = () => {
    setExpandedSections({
      details: false,
      schedule: false,
      tags: false,
      notes: false,
      attachments: false,
    });
  };

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>, workItem: WorkItem) => {
    event.dataTransfer.setData('text/plain', workItem.id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingItemId(workItem.id);
  };

  const handleDragEnd = () => {
    setDraggingItemId('');
  };

  const handleDropOnLane = (laneId: 'backlog' | 'inProgress' | 'done') => {
    if (!activeProject || !draggingItemId) {
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== activeProject.id) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item => {
            if (item.id !== draggingItemId) {
              return item;
            }
            const completedDate =
              laneId === 'done'
                ? item.completedDate || today
                : item.completedDate
                  ? ''
                  : item.completedDate;
            return {
              ...item,
              status: laneId,
              completedDate,
            };
          }),
        };
      })
    );
    setSelectedWorkItem(null);
    setDraggingItemId('');
  };

  return (
    <div className="projects-container">
      <div className="projects-header-row">
        <h2>Projects</h2>
        <span className="projects-meta">Create projects and track work items</span>
      </div>

      <div className="projects-card projects-create-card">
        <div className="projects-form-grid three">
          <input
            className="projects-input"
            placeholder="Project name"
            value={projectName}
            onChange={event => setProjectName(event.target.value)}
          />
          <input
            className="projects-input"
            type="date"
            value={projectStartDate}
            onChange={event => setProjectStartDate(event.target.value)}
            title="Project start date"
          />
          <input
            className="projects-input"
            type="date"
            value={projectEndDate}
            onChange={event => setProjectEndDate(event.target.value)}
            title="Project end date"
          />
        </div>
        <button
          className="projects-primary-btn"
          onClick={handleCreateProject}
          disabled={!projectName.trim() || !projectStartDate || !projectEndDate}
        >
          Create Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.map(project => {
          const progress = getProjectProgress(project);
          return (
            <button
              key={project.id}
              className="projects-card projects-overview-card"
              type="button"
              onClick={() => handleOpenProject(project.id)}
            >
              <div className="projects-overview-head">
                <div>
                  <h3>{project.name}</h3>
                  <span className="projects-overview-dates">
                    {project.startDate} → {project.endDate}
                  </span>
                </div>
                <div className="projects-pill">{progress.total} items</div>
              </div>

              <p className="projects-overview-description">
                {project.description || 'Project overview pending.'}
              </p>

              <div className="projects-badge-row">
                {project.assignedUserIds.length > 0 ? (
                  project.assignedUserIds.map(userId => (
                    <span key={`${project.id}-${userId}`} className="projects-user-badge">
                      {getUserInitials(userId)}
                    </span>
                  ))
                ) : (
                  <span className="projects-muted">No assigned users</span>
                )}
              </div>

              <div className="projects-progress">
                <div className="projects-progress-track">
                  <span
                    className="projects-progress-fill"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <div className="projects-progress-meta">
                  <span>{progress.completed} completed</span>
                  <span>{progress.remaining} remaining</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isDialogOpen && activeProject ? (
        <div className="projects-dialog-backdrop" onClick={handleCloseDialog}>
          <div className="projects-dialog" onClick={event => event.stopPropagation()}>
            <div className="projects-dialog-header">
              <div>
                <h3>{activeProject.name}</h3>
                <p>Timeline: {activeProject.startDate} → {activeProject.endDate}</p>
              </div>
              <button className="projects-dialog-close" type="button" onClick={handleCloseDialog}>
                Close
              </button>
            </div>

            <p className="projects-dialog-description">
              {activeProject.description || 'No project description yet.'}
            </p>

            <div className="projects-dialog-stats">
              {(() => {
                const progress = getProjectProgress(activeProject);
                return (
                  <>
                    <div className="projects-stat-card">
                      <span className="projects-stat-label">Completed</span>
                      <strong>{progress.completed}</strong>
                    </div>
                    <div className="projects-stat-card">
                      <span className="projects-stat-label">Remaining</span>
                      <strong>{progress.remaining}</strong>
                    </div>
                    <div className="projects-stat-card">
                      <span className="projects-stat-label">Total items</span>
                      <strong>{progress.total}</strong>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="projects-progress dialog">
              {(() => {
                const progress = getProjectProgress(activeProject);
                return (
                  <>
                    <div className="projects-progress-track">
                      <span
                        className="projects-progress-fill"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <div className="projects-progress-meta">
                      <span>{progress.percent}% complete</span>
                      <span>{progress.completed} done</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="projects-dialog-section">
              <h4>Assigned team</h4>
              <div className="projects-badge-row">
                {activeProject.assignedUserIds.length > 0 ? (
                  activeProject.assignedUserIds.map(userId => (
                    <span key={`${activeProject.id}-${userId}`} className="projects-user-badge">
                      {getUserInitials(userId)}
                    </span>
                  ))
                ) : (
                  <span className="projects-muted">No assigned users</span>
                )}
              </div>
            </div>

            <div className="projects-dialog-section">
              <div className="projects-dialog-action-row">
                <div>
                  <h4>Add work item</h4>
                  <p className="projects-muted">Capture new tasks in a focused editor.</p>
                </div>
                <button
                  className="projects-primary-btn"
                  type="button"
                  onClick={handleOpenWorkItemDialog}
                >
                  Add Work Item
                </button>
              </div>
            </div>

            <div className="projects-dialog-section">
              <h4>Work items</h4>
              {activeProject.workItems.length === 0 ? (
                <div className="projects-empty">No work items added yet.</div>
              ) : (
                <div className="projects-lanes">
                  {lanes.map(lane => {
                    const items = getLaneItems(visibleWorkItems, lane.id);
                    const collapsed = laneCollapsed[lane.id as keyof typeof laneCollapsed];
                    return (
                      <section
                        key={lane.id}
                        className="projects-lane"
                        onDragOver={event => event.preventDefault()}
                        onDrop={() => handleDropOnLane(lane.id as 'backlog' | 'inProgress' | 'done')}
                      >
                        <button
                          className="projects-lane-header"
                          type="button"
                          onClick={() => toggleLane(lane.id as 'backlog' | 'inProgress' | 'done')}
                        >
                          <div>
                            <h5>{lane.label}</h5>
                            <span className="projects-muted">{items.length} items</span>
                          </div>
                          <span className="projects-lane-toggle">
                            {collapsed ? 'Expand' : 'Collapse'}
                          </span>
                        </button>

                        {!collapsed ? (
                          <div className="projects-lane-list">
                            {items.length === 0 ? (
                              <div className="projects-empty">No items in this lane.</div>
                            ) : (
                              items.map(workItem => (
                                (() => {
                                  const isHidden = Boolean(workItem.deletedAt);
                                  const isEditing = inlineEditId === workItem.id;
                                  return (
                                    <button
                                      key={workItem.id}
                                      className={`projects-item-card projects-item-mini${draggingItemId === workItem.id ? ' dragging' : ''}${isHidden ? ' hidden' : ''}`}
                                      type="button"
                                      draggable={!isEditing && !isHidden}
                                      onClick={() => {
                                        if (!isEditing) {
                                          handleOpenWorkItemDetail(workItem);
                                        }
                                      }}
                                      onDragStart={event => {
                                        if (!isHidden && !isEditing) {
                                          handleDragStart(event, workItem);
                                        }
                                      }}
                                      onDragEnd={handleDragEnd}
                                    >
                                      <div className="projects-item-mini-head">
                                        {isEditing ? (
                                          <input
                                            className="projects-inline-input"
                                            value={inlineTitle}
                                            onChange={event => setInlineTitle(event.target.value)}
                                          />
                                        ) : (
                                          <h6>{workItem.title}</h6>
                                        )}
                                        {isEditing ? (
                                          <input
                                            className="projects-inline-input"
                                            type="date"
                                            value={inlineEta}
                                            onChange={event => setInlineEta(event.target.value)}
                                          />
                                        ) : (
                                          <span className="projects-item-dates">
                                            ETA {workItem.etaDate}
                                          </span>
                                        )}
                                      </div>
                                      <div className="projects-item-mini-meta">
                                        <span className="projects-muted">
                                          {workItem.description || 'No description.'}
                                        </span>
                                        {isHidden ? (
                                          <span className="projects-item-hidden">Hidden</span>
                                        ) : null}
                                        <div className="projects-badge-row">
                                          {workItem.assignedUserIds.length > 0 ? (
                                            workItem.assignedUserIds.slice(0, 3).map(userId => (
                                              <span key={`${workItem.id}-${userId}`} className="projects-user-badge">
                                                {getUserInitials(userId)}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="projects-muted">Unassigned</span>
                                          )}
                                          {workItem.assignedUserIds.length > 3 ? (
                                            <span className="projects-user-badge">+{workItem.assignedUserIds.length - 3}</span>
                                          ) : null}
                                        </div>
                                        <div
                                          className="projects-item-actions"
                                          onClick={event => event.stopPropagation()}
                                        >
                                          {isEditing ? (
                                            <>
                                              <button
                                                className="projects-item-action"
                                                type="button"
                                                onClick={() => handleSaveInlineEdit(workItem.id)}
                                              >
                                                Save
                                              </button>
                                              <button
                                                className="projects-item-action"
                                                type="button"
                                                onClick={handleCancelInlineEdit}
                                              >
                                                Cancel
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                className="projects-item-action"
                                                type="button"
                                                onClick={() => handleStartInlineEdit(workItem)}
                                              >
                                                Inline edit
                                              </button>
                                              <button
                                                className="projects-item-action"
                                                type="button"
                                                onClick={() => handleToggleHidden(workItem, isHidden)}
                                              >
                                                {isHidden ? 'Restore' : 'Hide'}
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })()
                              ))
                            )}
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isDialogOpen && isWorkItemDialogOpen ? (
        <div className="projects-subdialog-backdrop" onClick={handleCloseWorkItemDialog}>
          <div className="projects-subdialog" onClick={event => event.stopPropagation()}>
            <div className="projects-subdialog-header">
              <h4>{editingWorkItemId ? 'Edit work item' : 'Add work item'}</h4>
              <div className="projects-dialog-actions">
                <button
                  className="projects-secondary-btn"
                  type="button"
                  onClick={handleOpenAssigneeDialog}
                >
                  Assign users
                </button>
                <button className="projects-dialog-close" type="button" onClick={handleCloseWorkItemDialog}>
                  Close
                </button>
              </div>
            </div>

            <div className="projects-assignee-compact">
              <span className="projects-muted">Assignees</span>
              <div className="projects-badge-row">
                {itemAssignedUserIds.length > 0 ? (
                  itemAssignedUserIds.map(userId => (
                    <span key={`assigned-${userId}`} className="projects-user-badge">
                      {getUserInitials(userId)}
                    </span>
                  ))
                ) : (
                  <span className="projects-muted">No assignees yet</span>
                )}
              </div>
            </div>

            <div className="projects-workitem-layout">
              <aside className="projects-workitem-sidebar">
                <div className="projects-workitem-sidebar-actions">
                  <button
                    className="projects-secondary-btn"
                    type="button"
                    onClick={handleExpandAllSections}
                  >
                    Expand all
                  </button>
                  <button
                    className="projects-secondary-btn"
                    type="button"
                    onClick={handleCollapseAllSections}
                  >
                    Collapse all
                  </button>
                </div>
                <div className="projects-workitem-step active">Details</div>
                <div className="projects-workitem-step">Schedule</div>
                <div className="projects-workitem-step">Tags & Teams</div>
                <div className="projects-workitem-step">Notes</div>
                <div className="projects-workitem-step">Attachments</div>
              </aside>

              <div className="projects-workitem-body">
                <div className={`projects-workitem-section${expandedSections.details ? ' expanded' : ' collapsed'}`}>
                  <button
                    className="projects-workitem-section-head"
                    type="button"
                    onClick={() => toggleSection('details')}
                  >
                    <h5>Details</h5>
                    <span className="projects-muted">Title and summary</span>
                    <span className="projects-section-toggle">
                      {expandedSections.details ? 'Collapse' : 'Expand'}
                    </span>
                  </button>
                  <div className="projects-workitem-section-body">
                    <div className="projects-form-grid two">
                      <input
                        className="projects-input"
                        placeholder="Work item title"
                        value={itemTitle}
                        onChange={event => setItemTitle(event.target.value)}
                      />
                      <input
                        className="projects-input"
                        placeholder="Description"
                        value={itemDescription}
                        onChange={event => setItemDescription(event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={`projects-workitem-section${expandedSections.schedule ? ' expanded' : ' collapsed'}`}>
                  <button
                    className="projects-workitem-section-head"
                    type="button"
                    onClick={() => toggleSection('schedule')}
                  >
                    <h5>Schedule</h5>
                    <span className="projects-muted">Dates and milestones</span>
                    <span className="projects-section-toggle">
                      {expandedSections.schedule ? 'Collapse' : 'Expand'}
                    </span>
                  </button>
                  <div className="projects-workitem-section-body">
                    <div className="projects-form-grid three">
                      <input
                        className="projects-input"
                        type="date"
                        value={itemStartDate}
                        onChange={event => setItemStartDate(event.target.value)}
                        title="Work item start date"
                      />
                      <input
                        className="projects-input"
                        type="date"
                        value={itemEtaDate}
                        onChange={event => setItemEtaDate(event.target.value)}
                        title="Work item ETA date"
                      />
                      <input
                        className="projects-input"
                        type="date"
                        value={itemCompleteDate}
                        onChange={event => setItemCompleteDate(event.target.value)}
                        title="Work item completed date"
                      />
                    </div>
                  </div>
                </div>

                <div className={`projects-workitem-section${expandedSections.tags ? ' expanded' : ' collapsed'}`}>
                  <button
                    className="projects-workitem-section-head"
                    type="button"
                    onClick={() => toggleSection('tags')}
                  >
                    <h5>Tags & Teams</h5>
                    <span className="projects-muted">Categorize and route</span>
                    <span className="projects-section-toggle">
                      {expandedSections.tags ? 'Collapse' : 'Expand'}
                    </span>
                  </button>
                  <div className="projects-workitem-section-body">
                    <div className="projects-form-grid two">
                      <input
                        className="projects-input"
                        placeholder="Tags (comma separated)"
                        value={itemTags}
                        onChange={event => setItemTags(event.target.value)}
                      />
                      <select
                        className="projects-input"
                        multiple
                        value={itemAssignedTeamIds}
                        onChange={event =>
                          setItemAssignedTeamIds(Array.from(event.target.selectedOptions, option => option.value))
                        }
                      >
                        {seedTeams.map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`projects-workitem-section${expandedSections.notes ? ' expanded' : ' collapsed'}`}>
                  <button
                    className="projects-workitem-section-head"
                    type="button"
                    onClick={() => toggleSection('notes')}
                  >
                    <h5>Notes & Comments</h5>
                    <span className="projects-muted">Context for the team</span>
                    <span className="projects-section-toggle">
                      {expandedSections.notes ? 'Collapse' : 'Expand'}
                    </span>
                  </button>
                  <div className="projects-workitem-section-body">
                    <div className="projects-form-grid two">
                      <textarea
                        className="projects-input projects-textarea"
                        placeholder="Notes"
                        value={itemNotes}
                        onChange={event => setItemNotes(event.target.value)}
                      />
                      <textarea
                        className="projects-input projects-textarea"
                        placeholder="Comments (one per line)"
                        value={itemComments}
                        onChange={event => setItemComments(event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={`projects-workitem-section${expandedSections.attachments ? ' expanded' : ' collapsed'}`}>
                  <button
                    className="projects-workitem-section-head"
                    type="button"
                    onClick={() => toggleSection('attachments')}
                  >
                    <h5>Attachments</h5>
                    <span className="projects-muted">Links and files</span>
                    <span className="projects-section-toggle">
                      {expandedSections.attachments ? 'Collapse' : 'Expand'}
                    </span>
                  </button>
                  <div className="projects-workitem-section-body">
                    <div className="projects-form-grid two">
                      <textarea
                        className="projects-input projects-textarea full"
                        placeholder="Attachments (one URL or file path per line)"
                        value={itemAttachments}
                        onChange={event => setItemAttachments(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="projects-dialog-actions">
              <button className="projects-dialog-close" type="button" onClick={handleCloseWorkItemDialog}>
                Cancel
              </button>
              <button
                className="projects-primary-btn"
                onClick={handleSubmitWorkItem}
                disabled={!itemTitle.trim() || !itemStartDate || !itemEtaDate}
              >
                {editingWorkItemId ? 'Save Changes' : 'Save Work Item'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDialogOpen && isWorkItemDialogOpen && isAssigneeDialogOpen ? (
        <div className="projects-subdialog-backdrop" onClick={handleCloseAssigneeDialog}>
          <div className="projects-subdialog projects-assign-dialog" onClick={event => event.stopPropagation()}>
            <div className="projects-subdialog-header">
              <div>
                <h4>Assign users</h4>
                <p className="projects-muted">Search and select multiple assignees.</p>
              </div>
              <button className="projects-dialog-close" type="button" onClick={handleCloseAssigneeDialog}>
                Close
              </button>
            </div>

            <input
              className="projects-input"
              placeholder="Search users by name or ID"
              value={assigneeSearch}
              onChange={event => setAssigneeSearch(event.target.value)}
            />

            <div className="projects-assign-list">
              {filteredUsers.map(user => {
                const isSelected = itemAssignedUserIds.includes(user.userId);
                return (
                  <label key={`assign-${user.userId}`} className="projects-assign-row">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAssignee(user.userId)}
                    />
                    <span className="projects-assign-name">
                      {`${user.firstName} ${user.lastName}`.trim()}
                      <span className="projects-muted"> ({user.userId})</span>
                    </span>
                    <span className="projects-count-badge">
                      {userTaskCounts[user.userId] ?? 0}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="projects-dialog-actions">
              <button className="projects-dialog-close" type="button" onClick={handleCloseAssigneeDialog}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDialogOpen && selectedWorkItem ? (
        <div className="projects-subdialog-backdrop" onClick={handleCloseWorkItemDetail}>
          <div className="projects-subdialog" onClick={event => event.stopPropagation()}>
            <div className="projects-subdialog-header">
              <div>
                <h4>{selectedWorkItem.title}</h4>
                <p className="projects-item-dates">
                  {selectedWorkItem.startDate} → ETA {selectedWorkItem.etaDate}
                  {selectedWorkItem.completedDate ? ` → Done ${selectedWorkItem.completedDate}` : ''}
                </p>
              </div>
              <div className="projects-dialog-actions">
                <button className="projects-dialog-close" type="button" onClick={() => handleEditWorkItem(selectedWorkItem)}>
                  Edit
                </button>
                <button
                  className="projects-dialog-close"
                  type="button"
                  onClick={() => handleToggleHidden(selectedWorkItem, Boolean(selectedWorkItem.deletedAt))}
                >
                  {selectedWorkItem.deletedAt ? 'Restore' : 'Hide'}
                </button>
                <button className="projects-dialog-close" type="button" onClick={handleCloseWorkItemDetail}>
                  Close
                </button>
              </div>
            </div>

            <p className="projects-item-description">
              {selectedWorkItem.description || 'No description.'}
            </p>
            <p className="projects-item-line"><strong>Assigned:</strong> {renderAssigneeNames(selectedWorkItem)}</p>
            <p className="projects-item-line"><strong>Notes:</strong> {selectedWorkItem.notes || 'None'}</p>

            <div className="projects-item-block">
              <strong>Tags:</strong>
              <div className="projects-tag-row">
                {selectedWorkItem.tags.length > 0
                  ? selectedWorkItem.tags.map(tag => (
                      <span key={`${selectedWorkItem.id}-${tag}`} className="projects-tag">
                        {tag}
                      </span>
                    ))
                  : <span className="projects-muted">No tags</span>}
              </div>
            </div>

            <div className="projects-item-block">
              <strong>Comments:</strong>
              {selectedWorkItem.comments.length > 0 ? (
                <ul className="projects-list">
                  {selectedWorkItem.comments.map(comment => (
                    <li key={comment.id}>{comment.text} <span className="projects-muted">({comment.createdAt})</span></li>
                  ))}
                </ul>
              ) : (
                <p className="projects-muted">No comments</p>
              )}
            </div>

            <div className="projects-item-block">
              <strong>Attachments:</strong>
              {selectedWorkItem.attachments.length > 0 ? (
                <ul className="projects-list">
                  {selectedWorkItem.attachments.map(attachment => (
                    <li key={`${selectedWorkItem.id}-${attachment}`}>{attachment}</li>
                  ))}
                </ul>
              ) : (
                <p className="projects-muted">No attachments</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Projects;