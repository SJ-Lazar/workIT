import React, { useEffect, useMemo, useState } from 'react';
import { users as seedUsers } from '../data/users';
import { seedTeams } from '../data/teams';
import { type Project, type WorkItem } from '../data/projects';
import './projects.css';

interface ProjectsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
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

const Projects: React.FC<ProjectsProps> = ({ projects, setProjects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '');

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

  const selectedProject = useMemo(
    () => projects.find(project => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (!projects.some(project => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id ?? '');
    }
  }, [projects, selectedProjectId]);

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
      startDate: projectStartDate,
      endDate: projectEndDate,
      workItems: [],
    };

    setProjects(prev => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setProjectName('');
    setProjectStartDate('');
    setProjectEndDate('');
  };

  const handleCreateWorkItem = () => {
    if (!selectedProject || !itemTitle.trim() || !itemStartDate || !itemEtaDate) {
      return;
    }

    const existingItemIds = selectedProject.workItems.map(item => item.id);
    const itemId = makeUniqueId(itemTitle, existingItemIds);
    if (!itemId) {
      return;
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

    const newItem: WorkItem = {
      id: itemId,
      title: itemTitle.trim(),
      description: itemDescription.trim(),
      startDate: itemStartDate,
      etaDate: itemEtaDate,
      completedDate: itemCompleteDate,
      assignedUserIds: itemAssignedUserIds,
      assignedTeamIds: itemAssignedTeamIds,
      notes: itemNotes.trim(),
      comments,
      attachments,
      tags,
    };

    setProjects(prev =>
      prev.map(project =>
        project.id === selectedProject.id
          ? { ...project, workItems: [newItem, ...project.workItems] }
          : project
      )
    );

    clearWorkItemForm();
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

      <div className="projects-selector-row">
        {projects.map(project => (
          <button
            key={project.id}
            className={`projects-chip${selectedProjectId === project.id ? ' active' : ''}`}
            onClick={() => setSelectedProjectId(project.id)}
          >
            <div className="projects-chip-title">{project.name}</div>
            <small>
              {project.startDate} → {project.endDate}
            </small>
          </button>
        ))}
      </div>

      {selectedProject ? (
        <>
          <div className="projects-card">
            <div className="projects-selected-title">
              <div>
                <h3>{selectedProject.name}</h3>
                <p>Timeline: {selectedProject.startDate} → {selectedProject.endDate}</p>
              </div>
              <div className="projects-pill">{selectedProject.workItems.length} work items</div>
            </div>

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
              <input
                className="projects-input"
                placeholder="Tags (comma separated)"
                value={itemTags}
                onChange={event => setItemTags(event.target.value)}
              />
            </div>

            <div className="projects-form-grid two compact">
              <select
                className="projects-input"
                multiple
                value={itemAssignedUserIds}
                onChange={event =>
                  setItemAssignedUserIds(Array.from(event.target.selectedOptions, option => option.value))
                }
              >
                {seedUsers.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {`${user.firstName} ${user.lastName}`.trim()} ({user.userId})
                  </option>
                ))}
              </select>

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
              <textarea
                className="projects-input projects-textarea full"
                placeholder="Attachments (one URL or file path per line)"
                value={itemAttachments}
                onChange={event => setItemAttachments(event.target.value)}
              />
            </div>

            <button
              className="projects-primary-btn"
              onClick={handleCreateWorkItem}
              disabled={!itemTitle.trim() || !itemStartDate || !itemEtaDate}
            >
              Add Work Item
            </button>
          </div>

          <div className="projects-items-list">
            {selectedProject.workItems.map(workItem => (
              <article key={workItem.id} className="projects-item-card">
                <div className="projects-item-head">
                  <h4>{workItem.title}</h4>
                  <span className="projects-item-dates">
                    {workItem.startDate} → ETA {workItem.etaDate}
                    {workItem.completedDate ? ` → Done ${workItem.completedDate}` : ''}
                  </span>
                </div>

                <p className="projects-item-description">{workItem.description || 'No description.'}</p>
                <p className="projects-item-line"><strong>Assigned:</strong> {renderAssigneeNames(workItem)}</p>
                <p className="projects-item-line"><strong>Notes:</strong> {workItem.notes || 'None'}</p>

                <div className="projects-item-block">
                  <strong>Tags:</strong>
                  <div className="projects-tag-row">
                    {workItem.tags.length > 0
                      ? workItem.tags.map(tag => (
                          <span key={`${workItem.id}-${tag}`} className="projects-tag">
                            {tag}
                          </span>
                        ))
                      : <span className="projects-muted">No tags</span>}
                  </div>
                </div>

                <div className="projects-item-block">
                  <strong>Comments:</strong>
                  {workItem.comments.length > 0 ? (
                    <ul className="projects-list">
                      {workItem.comments.map(comment => (
                        <li key={comment.id}>{comment.text} <span className="projects-muted">({comment.createdAt})</span></li>
                      ))}
                    </ul>
                  ) : (
                    <p className="projects-muted">No comments</p>
                  )}
                </div>

                <div className="projects-item-block">
                  <strong>Attachments:</strong>
                  {workItem.attachments.length > 0 ? (
                    <ul className="projects-list">
                      {workItem.attachments.map(attachment => (
                        <li key={`${workItem.id}-${attachment}`}>{attachment}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="projects-muted">No attachments</p>
                  )}
                </div>
              </article>
            ))}
            {selectedProject.workItems.length === 0 && (
              <div className="projects-empty">No work items yet for this project.</div>
            )}
          </div>
        </>
      ) : (
        <div className="projects-empty">Create a project to get started.</div>
      )}
    </div>
  );
};

export default Projects;