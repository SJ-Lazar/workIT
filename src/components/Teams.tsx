import React, { useMemo, useState } from 'react';
import { users as seedUsers } from '../data/users';
import { seedTeams, type Team } from '../data/teams';
import './teams.css';

const makeTeamId = (name: string, existingIds: string[]) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!base) {
    return '';
  }

  if (!existingIds.includes(base)) {
    return base;
  }

  let suffix = 2;
  while (existingIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
};

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>(seedTeams);
  const [selectedTeamId, setSelectedTeamId] = useState(seedTeams[0]?.id ?? '');

  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  const [availableSearch, setAvailableSearch] = useState('');
  const [membersSearch, setMembersSearch] = useState('');

  const [selectedAvailableUserIds, setSelectedAvailableUserIds] = useState<string[]>([]);
  const [selectedMemberUserIds, setSelectedMemberUserIds] = useState<string[]>([]);

  const selectedTeam = useMemo(
    () => teams.find(team => team.id === selectedTeamId) ?? null,
    [teams, selectedTeamId]
  );

  const memberUsers = useMemo(() => {
    if (!selectedTeam) {
      return [];
    }
    const memberSet = new Set(selectedTeam.memberUserIds);
    return seedUsers.filter(user => memberSet.has(user.userId));
  }, [selectedTeam]);

  const availableUsers = useMemo(() => {
    if (!selectedTeam) {
      return [];
    }
    const memberSet = new Set(selectedTeam.memberUserIds);
    return seedUsers.filter(user => !memberSet.has(user.userId));
  }, [selectedTeam]);

  const filteredAvailableUsers = useMemo(() => {
    const term = availableSearch.toLowerCase().trim();
    if (!term) {
      return availableUsers;
    }

    return availableUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        user.userId.toLowerCase().includes(term) ||
        user.emailAddress.toLowerCase().includes(term) ||
        fullName.includes(term)
      );
    });
  }, [availableUsers, availableSearch]);

  const filteredMemberUsers = useMemo(() => {
    const term = membersSearch.toLowerCase().trim();
    if (!term) {
      return memberUsers;
    }

    return memberUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        user.userId.toLowerCase().includes(term) ||
        user.emailAddress.toLowerCase().includes(term) ||
        fullName.includes(term)
      );
    });
  }, [memberUsers, membersSearch]);

  const clearSelection = () => {
    setSelectedAvailableUserIds([]);
    setSelectedMemberUserIds([]);
  };

  const handleCreateTeam = () => {
    const cleanName = teamName.trim();
    if (!cleanName) {
      return;
    }

    const newId = makeTeamId(cleanName, teams.map(team => team.id));
    if (!newId) {
      return;
    }

    const newTeam: Team = {
      id: newId,
      name: cleanName,
      description: teamDescription.trim() || 'No description provided.',
      memberUserIds: [],
    };

    setTeams(prev => [newTeam, ...prev]);
    setSelectedTeamId(newId);
    setTeamName('');
    setTeamDescription('');
    clearSelection();
  };

  const handleAddSelected = () => {
    if (!selectedTeam || selectedAvailableUserIds.length === 0) {
      return;
    }

    const selectedSet = new Set(selectedAvailableUserIds);
    setTeams(prev =>
      prev.map(team =>
        team.id === selectedTeam.id
          ? {
              ...team,
              memberUserIds: Array.from(new Set([...team.memberUserIds, ...selectedSet])),
            }
          : team
      )
    );
    setSelectedAvailableUserIds([]);
  };

  const handleRemoveSelected = () => {
    if (!selectedTeam || selectedMemberUserIds.length === 0) {
      return;
    }

    const selectedSet = new Set(selectedMemberUserIds);
    setTeams(prev =>
      prev.map(team =>
        team.id === selectedTeam.id
          ? {
              ...team,
              memberUserIds: team.memberUserIds.filter(userId => !selectedSet.has(userId)),
            }
          : team
      )
    );
    setSelectedMemberUserIds([]);
  };

  const handleToggleAvailable = (userId: string) => {
    setSelectedAvailableUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleMember = (userId: string) => {
    setSelectedMemberUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectedTeamCount = selectedTeam?.memberUserIds.length ?? 0;

  return (
    <div className="teams-container">
      <div className="teams-header-row">
        <h2>Teams</h2>
        <span className="teams-meta">Create teams and assign users</span>
      </div>

      <div className="teams-create-card">
        <div className="teams-create-fields">
          <input
            className="teams-input"
            placeholder="Team name"
            value={teamName}
            onChange={event => setTeamName(event.target.value)}
          />
          <input
            className="teams-input"
            placeholder="Description"
            value={teamDescription}
            onChange={event => setTeamDescription(event.target.value)}
          />
        </div>
        <button
          className="teams-primary-btn"
          onClick={handleCreateTeam}
          disabled={!teamName.trim()}
        >
          Create Team
        </button>
      </div>

      <div className="teams-selector-row">
        {teams.map(team => (
          <button
            key={team.id}
            className={`teams-chip${selectedTeamId === team.id ? ' active' : ''}`}
            onClick={() => {
              setSelectedTeamId(team.id);
              clearSelection();
            }}
          >
            <span>{team.name}</span>
            <small>{team.memberUserIds.length}</small>
          </button>
        ))}
      </div>

      {selectedTeam ? (
        <div className="teams-assignment-card">
          <div className="teams-selected-title">
            <div>
              <h3>{selectedTeam.name}</h3>
              <p>{selectedTeam.description}</p>
            </div>
            <div className="teams-pill">{selectedTeamCount} members</div>
          </div>

          <div className="teams-assignment-grid">
            <div className="teams-list-panel">
              <div className="teams-panel-header">
                <strong>Available users</strong>
                <span>{filteredAvailableUsers.length}</span>
              </div>
              <input
                className="teams-input"
                placeholder="Search available users"
                value={availableSearch}
                onChange={event => setAvailableSearch(event.target.value)}
              />
              <div className="teams-list">
                {filteredAvailableUsers.map(user => {
                  const checked = selectedAvailableUserIds.includes(user.userId);
                  return (
                    <label key={user.userId} className="teams-user-row">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAvailable(user.userId)}
                      />
                      <div>
                        <div className="teams-user-name">{user.firstName} {user.lastName}</div>
                        <div className="teams-user-meta">{user.userId} • {user.emailAddress}</div>
                      </div>
                    </label>
                  );
                })}
                {filteredAvailableUsers.length === 0 && <div className="teams-empty">No users found</div>}
              </div>
            </div>

            <div className="teams-actions-col">
              <button
                className="teams-primary-btn"
                onClick={handleAddSelected}
                disabled={selectedAvailableUserIds.length === 0}
              >
                Add selected →
              </button>
              <button
                className="teams-secondary-btn"
                onClick={handleRemoveSelected}
                disabled={selectedMemberUserIds.length === 0}
              >
                ← Remove selected
              </button>
            </div>

            <div className="teams-list-panel">
              <div className="teams-panel-header">
                <strong>Team members</strong>
                <span>{filteredMemberUsers.length}</span>
              </div>
              <input
                className="teams-input"
                placeholder="Search team members"
                value={membersSearch}
                onChange={event => setMembersSearch(event.target.value)}
              />
              <div className="teams-list">
                {filteredMemberUsers.map(user => {
                  const checked = selectedMemberUserIds.includes(user.userId);
                  return (
                    <label key={user.userId} className="teams-user-row">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleMember(user.userId)}
                      />
                      <div>
                        <div className="teams-user-name">{user.firstName} {user.lastName}</div>
                        <div className="teams-user-meta">{user.userId} • {user.emailAddress}</div>
                      </div>
                    </label>
                  );
                })}
                {filteredMemberUsers.length === 0 && <div className="teams-empty">No members found</div>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="teams-empty">Create a team to start assigning users.</div>
      )}
    </div>
  );
};

export default Teams;