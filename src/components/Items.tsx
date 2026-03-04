import React, { useCallback, useMemo, useState } from 'react';
import { users as seedUsers } from '../data/users';
import { seedTeams } from '../data/teams';
import { type Project, type WorkItem } from '../data/projects';
import './items.css';
import './projects.css';

interface ItemsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  showHiddenItems: boolean;
}

type FlattenedItem = {
  projectId: string;
  projectName: string;
  item: WorkItem;
};

const Items: React.FC<ItemsProps> = ({ projects, setProjects, showHiddenItems }) => {
  const [searchText, setSearchText] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorkItem, setSelectedWorkItem] = useState<FlattenedItem | null>(null);
  const [editingWorkItem, setEditingWorkItem] = useState<FlattenedItem | null>(null);
  const [isWorkItemDialogOpen, setIsWorkItemDialogOpen] = useState(false);
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [inlineEditKey, setInlineEditKey] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineEta, setInlineEta] = useState('');
  const [draggingItem, setDraggingItem] = useState<FlattenedItem | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    details: false,
    schedule: false,
    tags: false,
    notes: false,
    attachments: false,
  });

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
  const allItems = useMemo<FlattenedItem[]>(() => {
    return projects.flatMap(project =>
      project.workItems
        .filter(item => showHiddenItems || !item.deletedAt)
        .map(item => ({
          projectId: project.id,
          projectName: project.name,
          item,
        }))
    );
  }, [projects, showHiddenItems]);

  const completedCount = allItems.filter(({ item }) => Boolean(item.completedDate)).length;

  const getAssigneeNames = useCallback((workItem: WorkItem) => {
    const userNames = workItem.assignedUserIds
      .map(userId => {
        const user = seedUsers.find(candidate => candidate.userId === userId);
        return user ? `${user.firstName} ${user.lastName}`.trim() : userId;
      })
      .filter(Boolean);

    const teamNames = workItem.assignedTeamIds
      .map(teamId => seedTeams.find(team => team.id === teamId)?.name ?? teamId)
      .filter(Boolean);

    return [...userNames, ...teamNames];
  }, []);

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

  const filterOptions = useMemo(() => {
    const projectsSet = new Set<string>();
    const assigneesSet = new Set<string>();
    const tagsSet = new Set<string>();

    allItems.forEach(({ projectName, item }) => {
      projectsSet.add(projectName);
      getAssigneeNames(item).forEach(name => assigneesSet.add(name));
      item.tags.forEach(tag => tagsSet.add(tag));
    });

    return {
      projects: Array.from(projectsSet).sort(),
      assignees: Array.from(assigneesSet).sort(),
      tags: Array.from(tagsSet).sort(),
    };
  }, [allItems, getAssigneeNames]);

  const userTaskCounts = useMemo(() => {
    return allItems.reduce<Record<string, number>>((counts, { item }) => {
      item.assignedUserIds.forEach(userId => {
        counts[userId] = (counts[userId] ?? 0) + 1;
      });
      return counts;
    }, {});
  }, [allItems]);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return allItems.filter(({ projectName, item }) => {
      const assignees = getAssigneeNames(item);
      const searchHaystack = [
        item.title,
        item.description,
        item.notes,
        projectName,
        assignees.join(' '),
        item.tags.join(' '),
        item.comments.map(comment => comment.text).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = normalizedSearch.length === 0 || searchHaystack.includes(normalizedSearch);
      const matchesProject = projectFilter === 'all' || projectName === projectFilter;
      const matchesAssignee = assigneeFilter === 'all' || assignees.includes(assigneeFilter);
      const matchesTag = tagFilter === 'all' || item.tags.includes(tagFilter);
      const isCompleted = Boolean(item.completedDate);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'open' ? !isCompleted : isCompleted);

      return matchesSearch && matchesProject && matchesAssignee && matchesTag && matchesStatus;
    });
  }, [allItems, normalizedSearch, projectFilter, assigneeFilter, tagFilter, statusFilter, getAssigneeNames]);

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

  const handleOpenWorkItemDetail = (workItem: FlattenedItem) => {
    setSelectedWorkItem(workItem);
  };

  const handleCloseWorkItemDetail = () => {
    setSelectedWorkItem(null);
  };

  const handleOpenAssigneeDialog = () => {
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

  const handleStartInlineEdit = (workItem: FlattenedItem) => {
    setInlineEditKey(`${workItem.projectId}-${workItem.item.id}`);
    setInlineTitle(workItem.item.title);
    setInlineEta(workItem.item.etaDate);
  };

  const handleCancelInlineEdit = () => {
    setInlineEditKey(null);
    setInlineTitle('');
    setInlineEta('');
  };

  const handleSaveInlineEdit = (workItem: FlattenedItem) => {
    if (!inlineTitle.trim() || !inlineEta) {
      return;
    }
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== workItem.projectId) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item =>
            item.id === workItem.item.id
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

  const handleToggleHidden = (workItem: FlattenedItem, restore = false) => {
    const nextDeletedAt = restore ? '' : new Date().toISOString().slice(0, 10);
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== workItem.projectId) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item =>
            item.id === workItem.item.id
              ? {
                  ...item,
                  deletedAt: nextDeletedAt,
                }
              : item
          ),
        };
      })
    );
    if (!restore && selectedWorkItem?.item.id === workItem.item.id) {
      setSelectedWorkItem(null);
    }
    if (!restore && inlineEditKey === `${workItem.projectId}-${workItem.item.id}`) {
      handleCancelInlineEdit();
    }
  };

  const handleEditWorkItem = (workItem: FlattenedItem) => {
    populateWorkItemForm(workItem.item);
    setEditingWorkItem(workItem);
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

  const handleCloseWorkItemDialog = () => {
    setIsWorkItemDialogOpen(false);
    setEditingWorkItem(null);
    setIsAssigneeDialogOpen(false);
  };

  const handleUpdateWorkItem = () => {
    if (!editingWorkItem || !itemTitle.trim() || !itemStartDate || !itemEtaDate) {
      return false;
    }

    const comments = itemComments
      .split('\n')
      .map(comment => comment.trim())
      .filter(Boolean)
      .map((text, index) => ({
        id: `${editingWorkItem.item.id}-comment-${index + 1}`,
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
        if (project.id !== editingWorkItem.projectId) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item =>
            item.id === editingWorkItem.item.id
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
    setEditingWorkItem(null);
    return true;
  };

  const handleSubmitWorkItem = () => {
    const didSave = handleUpdateWorkItem();
    if (didSave) {
      setIsAssigneeDialogOpen(false);
      setIsWorkItemDialogOpen(false);
    }
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

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>, workItem: FlattenedItem) => {
    event.dataTransfer.setData('text/plain', workItem.item.id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingItem(workItem);
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const handleDropOnLane = (laneId: 'open' | 'completed') => {
    if (!draggingItem) {
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== draggingItem.projectId) {
          return project;
        }
        return {
          ...project,
          workItems: project.workItems.map(item => {
            if (item.id !== draggingItem.item.id) {
              return item;
            }
            const completedDate = laneId === 'completed' ? item.completedDate || today : '';
            return {
              ...item,
              status: laneId === 'completed' ? 'done' : 'inProgress',
              completedDate,
            };
          }),
        };
      })
    );
    setDraggingItem(null);
  };

  const lanes = useMemo(() => {
    const openItems = filteredItems.filter(({ item }) => !item.completedDate);
    const completedItems = filteredItems.filter(({ item }) => Boolean(item.completedDate));

    return [
      { id: 'open', label: 'Open', items: openItems },
      { id: 'completed', label: 'Completed', items: completedItems },
    ];
  }, [filteredItems]);

  return (
    <div className="items-container">
      <div className="items-header-row">
        <h2>Items Backlog</h2>
        <span className="items-meta">
          {allItems.length} total • {completedCount} completed • {allItems.length - completedCount} open
        </span>
      </div>

      <div className="items-controls">
        <label className="items-search">
          <span className="items-control-label">Search</span>
          <input
            type="search"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            placeholder="Search titles, notes, tags, comments..."
          />
        </label>

        <label className="items-control">
          <span className="items-control-label">Project</span>
          <select value={projectFilter} onChange={event => setProjectFilter(event.target.value)}>
            <option value="all">All projects</option>
            {filterOptions.projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </label>

        <label className="items-control">
          <span className="items-control-label">Assignee</span>
          <select value={assigneeFilter} onChange={event => setAssigneeFilter(event.target.value)}>
            <option value="all">All assignees</option>
            {filterOptions.assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </label>

        <label className="items-control">
          <span className="items-control-label">Tag</span>
          <select value={tagFilter} onChange={event => setTagFilter(event.target.value)}>
            <option value="all">All tags</option>
            {filterOptions.tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </label>

        <label className="items-control">
          <span className="items-control-label">Status</span>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="open">Open only</option>
            <option value="completed">Completed only</option>
          </select>
        </label>
      </div>

      {allItems.length > 0 ? (
        <div className="items-lanes">
          {lanes.map(lane => (
            <section
              key={lane.id}
              className="items-lane"
              onDragOver={event => event.preventDefault()}
              onDrop={() => handleDropOnLane(lane.id as 'open' | 'completed')}
            >
              <div className="items-lane-head">
                <h3>{lane.label}</h3>
                <span>{lane.items.length}</span>
              </div>

              {lane.items.length > 0 ? (
                <div className="items-list">
                  {lane.items.map(workItem => {
                    const itemKey = `${workItem.projectId}-${workItem.item.id}`;
                    const isEditing = inlineEditKey === itemKey;
                    const isHidden = Boolean(workItem.item.deletedAt);
                    const isDragging = draggingItem?.projectId === workItem.projectId
                      && draggingItem.item.id === workItem.item.id;
                    return (
                      <button
                        key={itemKey}
                        className={`projects-item-card projects-item-mini${isDragging ? ' dragging' : ''}${isHidden ? ' hidden' : ''}`}
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
                            <h6>{workItem.item.title}</h6>
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
                              ETA {workItem.item.etaDate}
                            </span>
                          )}
                        </div>
                        <div className="projects-item-mini-meta">
                          <span className="projects-muted">
                            {workItem.item.description || 'No description.'}
                          </span>
                          <span className="projects-muted">Project · {workItem.projectName}</span>
                          {isHidden ? (
                            <span className="projects-item-hidden">Hidden</span>
                          ) : null}
                          <div className="projects-badge-row">
                            {workItem.item.assignedUserIds.length > 0 ? (
                              workItem.item.assignedUserIds.slice(0, 3).map(userId => (
                                <span key={`${workItem.item.id}-${userId}`} className="projects-user-badge">
                                  {getUserInitials(userId)}
                                </span>
                              ))
                            ) : (
                              <span className="projects-muted">Unassigned</span>
                            )}
                            {workItem.item.assignedUserIds.length > 3 ? (
                              <span className="projects-user-badge">
                                +{workItem.item.assignedUserIds.length - 3}
                              </span>
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
                                  onClick={() => handleSaveInlineEdit(workItem)}
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
                  })}
                </div>
              ) : (
                <div className="items-empty">No items match the current filters.</div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="items-empty">No work items yet. Add items in Projects to populate this backlog.</div>
      )}

      {isWorkItemDialogOpen ? (
        <div className="projects-subdialog-backdrop" onClick={handleCloseWorkItemDialog}>
          <div className="projects-subdialog" onClick={event => event.stopPropagation()}>
            <div className="projects-subdialog-header">
              <h4>Edit work item</h4>
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isWorkItemDialogOpen && isAssigneeDialogOpen ? (
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

      {selectedWorkItem ? (
        <div className="projects-subdialog-backdrop" onClick={handleCloseWorkItemDetail}>
          <div className="projects-subdialog" onClick={event => event.stopPropagation()}>
            <div className="projects-subdialog-header">
              <div>
                <h4>{selectedWorkItem.item.title}</h4>
                <p className="projects-item-dates">
                  {selectedWorkItem.item.startDate} → ETA {selectedWorkItem.item.etaDate}
                  {selectedWorkItem.item.completedDate ? ` → Done ${selectedWorkItem.item.completedDate}` : ''}
                </p>
                <p className="projects-muted">Project · {selectedWorkItem.projectName}</p>
              </div>
              <div className="projects-dialog-actions">
                <button className="projects-dialog-close" type="button" onClick={() => handleEditWorkItem(selectedWorkItem)}>
                  Edit
                </button>
                <button
                  className="projects-dialog-close"
                  type="button"
                  onClick={() => handleToggleHidden(selectedWorkItem, Boolean(selectedWorkItem.item.deletedAt))}
                >
                  {selectedWorkItem.item.deletedAt ? 'Restore' : 'Hide'}
                </button>
                <button className="projects-dialog-close" type="button" onClick={handleCloseWorkItemDetail}>
                  Close
                </button>
              </div>
            </div>

            <p className="projects-item-description">
              {selectedWorkItem.item.description || 'No description.'}
            </p>
            <p className="projects-item-line"><strong>Assigned:</strong> {getAssigneeNames(selectedWorkItem.item).join(', ') || 'Unassigned'}</p>
            <p className="projects-item-line"><strong>Notes:</strong> {selectedWorkItem.item.notes || 'None'}</p>

            <div className="projects-item-block">
              <strong>Tags:</strong>
              <div className="projects-tag-row">
                {selectedWorkItem.item.tags.length > 0
                  ? selectedWorkItem.item.tags.map(tag => (
                      <span key={`${selectedWorkItem.item.id}-${tag}`} className="projects-tag">
                        {tag}
                      </span>
                    ))
                  : <span className="projects-muted">No tags</span>}
              </div>
            </div>

            <div className="projects-item-block">
              <strong>Comments:</strong>
              {selectedWorkItem.item.comments.length > 0 ? (
                <ul className="projects-list">
                  {selectedWorkItem.item.comments.map(comment => (
                    <li key={comment.id}>{comment.text} <span className="projects-muted">({comment.createdAt})</span></li>
                  ))}
                </ul>
              ) : (
                <p className="projects-muted">No comments</p>
              )}
            </div>

            <div className="projects-item-block">
              <strong>Attachments:</strong>
              {selectedWorkItem.item.attachments.length > 0 ? (
                <ul className="projects-list">
                  {selectedWorkItem.item.attachments.map(attachment => (
                    <li key={`${selectedWorkItem.item.id}-${attachment}`}>{attachment}</li>
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

export default Items;
