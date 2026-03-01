import React, { useMemo } from 'react';
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

  const renderAssignees = (workItem: WorkItem) => {
    const userNames = workItem.assignedUserIds
      .map(userId => {
        const user = seedUsers.find(candidate => candidate.userId === userId);
        return user ? `${user.firstName} ${user.lastName}`.trim() : userId;
      })
      .filter(Boolean);

    const teamNames = workItem.assignedTeamIds
      .map(teamId => seedTeams.find(team => team.id === teamId)?.name ?? teamId)
      .filter(Boolean);

    const combined = [...userNames, ...teamNames];
    return combined.length > 0 ? combined.join(', ') : 'Unassigned';
  };

  return (
    <div className="items-container">
      <div className="items-header-row">
        <h2>Items Backlog</h2>
        <span className="items-meta">
          {allItems.length} total • {completedCount} completed • {allItems.length - completedCount} open
        </span>
      </div>

      {allItems.length > 0 ? (
        <div className="items-list">
          {allItems.map(({ projectId, projectName, item }) => (
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
              <p className="items-line">Assigned: {renderAssignees(item)}</p>
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
        <div className="items-empty">No work items yet. Add items in Projects to populate this backlog.</div>
      )}
    </div>
  );
};

export default Items;
