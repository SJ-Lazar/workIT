import React, { useMemo } from 'react';
import type { Project } from '../data/projects';
import './timelines.css';

interface TimelinesProps {
  projects: Project[];
}

type TimelineProject = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  durationDays: number;
  leftPct: number;
  widthPct: number;
};

const dayMs = 24 * 60 * 60 * 1000;

const parseDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const Timelines: React.FC<TimelinesProps> = ({ projects }) => {
  const timelineData = useMemo(() => {
    const ranges = projects
      .map(project => {
        const start = parseDate(project.startDate);
        const end = parseDate(project.endDate);
        if (!start || !end) {
          return null;
        }
        return {
          id: project.id,
          name: project.name,
          start,
          end,
        };
      })
      .filter(Boolean) as Array<{ id: string; name: string; start: Date; end: Date }>;

    if (ranges.length === 0) {
      return { projects: [], min: null as Date | null, max: null as Date | null };
    }

    const min = ranges.reduce((acc, project) => (project.start < acc ? project.start : acc), ranges[0].start);
    const max = ranges.reduce((acc, project) => (project.end > acc ? project.end : acc), ranges[0].end);
    const totalDays = Math.max(1, Math.round((max.getTime() - min.getTime()) / dayMs));

    const mapped: TimelineProject[] = ranges.map(project => {
      const leftDays = Math.max(0, Math.round((project.start.getTime() - min.getTime()) / dayMs));
      const durationDays = Math.max(1, Math.round((project.end.getTime() - project.start.getTime()) / dayMs));
      return {
        id: project.id,
        name: project.name,
        start: project.start,
        end: project.end,
        durationDays,
        leftPct: (leftDays / totalDays) * 100,
        widthPct: (durationDays / totalDays) * 100,
      };
    });

    return { projects: mapped, min, max };
  }, [projects]);

  return (
    <div className="timelines">
      <div className="timelines-head">
        <h2>Project timelines</h2>
        <p>Schedule view based on project start and end dates.</p>
      </div>

      {timelineData.projects.length === 0 ? (
        <div className="timelines-empty">No project timelines available.</div>
      ) : (
        <div className="timelines-board">
          <div className="timelines-scale">
            <span>{timelineData.min?.toLocaleDateString()}</span>
            <span>{timelineData.max?.toLocaleDateString()}</span>
          </div>

          <div className="timelines-list">
            {timelineData.projects.map(project => (
              <div key={project.id} className="timelines-row">
                <div className="timelines-label">
                  <strong>{project.name}</strong>
                  <span>
                    {project.start.toLocaleDateString()} - {project.end.toLocaleDateString()}
                  </span>
                </div>
                <div className="timelines-track">
                  <div
                    className="timelines-bar"
                    style={{
                      marginLeft: `${project.leftPct}%`,
                      width: `${project.widthPct}%`,
                    }}
                  >
                    <span>{project.durationDays}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timelines;
