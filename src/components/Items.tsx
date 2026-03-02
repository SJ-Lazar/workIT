import React, { useCallback, useMemo, useState } from 'react';
import { users as seedUsers } from '../data/users';
import { seedTeams } from '../data/teams';
import { type Project, type WorkItem } from '../data/projects';
import './items.css';

interface ItemsProps {
  projects: Project[];
}

type FlattenedItem = {
  projectId: string;
  projectName: string;
  item: WorkItem;
};

const Items: React.FC<ItemsProps> = ({ projects }) => {
  const [searchText, setSearchText] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const allItems = useMemo<FlattenedItem[]>(() => {
    return projects.flatMap(project =>
      project.workItems.map(item => ({
        projectId: project.id,
        projectName: project.name,
        item,
      }))
    );
  }, [projects]);

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
            <section key={lane.id} className="items-lane">
              <div className="items-lane-head">
                <h3>{lane.label}</h3>
                <span>{lane.items.length}</span>
              </div>

              {lane.items.length > 0 ? (
                <div className="items-list">
                  {lane.items.map(({ projectId, projectName, item }) => (
                    <article key={`${projectId}-${item.id}`} className="items-card">
                      <div className="items-card-head">
                        <h4>{item.title}</h4>
                        <span className={`items-status ${item.completedDate ? 'done' : 'open'}`}>
                          {item.completedDate ? 'Completed' : 'Open'}
                        </span>
                      </div>

                      <p className="items-project">Project: {projectName}</p>
                      <p className="items-line">{item.description || 'No description.'}</p>
                      <p className="items-line">
                        Timeline: {item.startDate} → ETA {item.etaDate}
                        {item.completedDate ? ` → Done ${item.completedDate}` : ''}
                      </p>
                      <p className="items-line">
                        Assigned: {getAssigneeNames(item).join(', ') || 'Unassigned'}
                      </p>
                      <p className="items-line">Notes: {item.notes || 'None'}</p>

                      <div className="items-block">
                        <strong>Tags:</strong>
                        <div className="items-tag-row">
                          {item.tags.length > 0 ? (
                            item.tags.map(tag => (
                              <span key={`${item.id}-${tag}`} className="items-tag">{tag}</span>
                            ))
                          ) : (
                            <span className="items-muted">No tags</span>
                          )}
                        </div>
                      </div>

                      <div className="items-block">
                        <strong>Comments:</strong>
                        {item.comments.length > 0 ? (
                          <ul className="items-ul">
                            {item.comments.map(comment => (
                              <li key={comment.id}>{comment.text} <span className="items-muted">({comment.createdAt})</span></li>
                            ))}
                          </ul>
                        ) : (
                          <p className="items-muted">No comments</p>
                        )}
                      </div>

                      <div className="items-block">
                        <strong>Attachments:</strong>
                        {item.attachments.length > 0 ? (
                          <ul className="items-ul">
                            {item.attachments.map(attachment => (
                              <li key={`${item.id}-${attachment}`}>{attachment}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="items-muted">No attachments</p>
                        )}
                      </div>
                    </article>
                  ))}
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
    </div>
  );
};

export default Items;
