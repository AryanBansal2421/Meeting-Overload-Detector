import React, { useState } from "react";

const teamMembers = [
  { initials: "PS", name: "Priya Sharma", role: "Engineering Manager" },
  { initials: "RM", name: "Rohan Mehta", role: "SDE" },
  { initials: "AS", name: "Anya Singh", role: "SDE2" },
  { initials: "VP", name: "Vikram Patel", role: "SDE" },
  { initials: "ZK", name: "Zara Khan", role: "PM" },
];

const heatmapRows = [
  { day: "Mon", blocks: ["free", "single", "orange", "red", "single", "free", "single", "free"] },
  { day: "Tue", blocks: ["single", "free", "single", "free", "orange", "single", "orange", "free"] },
  { day: "Wed", blocks: ["free", "single", "orange", "red", "single", "free", "free", "single"] },
  { day: "Thu", blocks: ["single", "orange", "free", "single", "free", "single", "red", "single"] },
  { day: "Fri", blocks: ["free", "single", "free", "single", "orange", "free", "single", "free"] },
];

const densityMembers = [
  { name: "Priya Sharma", percent: 48, atRisk: false },
  { name: "Rohan Mehta", percent: 62, atRisk: true },
  { name: "Anya Singh", percent: 54, atRisk: true },
  { name: "Vikram Patel", percent: 41, atRisk: false },
  { name: "Zara Khan", percent: 38, atRisk: false },
];

const atRiskMembers = [
  { initials: "PS", name: "Priya Sharma", role: "Engineering Manager", stat: "6h meetings / 2h focus", badge: "At Risk", badgeClass: "badge-warning" },
  { initials: "RM", name: "Rohan Mehta", role: "SDE", stat: "7h meetings / 1h focus", badge: "Overloaded", badgeClass: "badge-danger" },
  { initials: "AS", name: "Anya Singh", role: "SDE2", stat: "6h meetings / 2h focus", badge: "At Risk", badgeClass: "badge-warning" },
];

const suggestions = [
  { title: "Design sync", from: "11:00 AM", to: "1:00 PM", note: "Frees 2h focus block" },
  { title: "Roadmap review", from: "2:30 PM", to: "4:00 PM", note: "Frees 2h focus block" },
  { title: "Stakeholder check-in", from: "4:30 PM", to: "5:30 PM", note: "Frees 2h focus block" },
];

const focusBlocks = [
  { type: "focus", width: 18 },
  { type: "meeting", width: 12 },
  { type: "focus", width: 24 },
  { type: "meeting", width: 10 },
  { type: "focus", width: 22 },
];

export default function DashboardPage() {
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
  const focusRemaining = 6;
  const ratioValue = 0.8;

  const showTooltip = (event: React.MouseEvent<HTMLDivElement>, day: string, time: string, member: string) => {
    setTooltip({ visible: true, text: `${day} • ${time} • ${member}`, x: event.clientX, y: event.clientY });
  };

  const moveTooltip = (event: React.MouseEvent<HTMLDivElement>) => {
    if (tooltip.visible) {
      setTooltip((current) => ({ ...current, x: event.clientX, y: event.clientY }));
    }
  };

  const hideTooltip = () => {
    setTooltip((current) => ({ ...current, visible: false }));
  };

  return (
    <div className="dashboard-shell">
      <div className="top-nav">
        <div className="nav-left">
          <div className="logo-mark">◉</div>
          <div className="brand">MeetingGuard</div>
        </div>
        <div className="week-pill">← Week of June 23 →</div>
        <button className="primary-button" onClick={() => { window.location.href = "http://localhost:3001/auth/google"; }}>
          Connect Google Calendar
        </button>
      </div>

      <section className="stats-grid">
        <div className="metric-card">
          <div className="metric-label">Total meeting hours this week</div>
          <div className="metric-value">24h</div>
          <div className="metric-footnote">Across 18 meetings</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Focus time remaining</div>
          <div className="metric-value metric-danger">6h</div>
          <div className="metric-footnote">Below the 8h threshold</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Team members at risk</div>
          <div className="metric-value metric-warning">3</div>
          <div className="metric-footnote">Needs buffer this week</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg meeting-to-focus ratio</div>
          <div className={`metric-value ${ratioValue <= 0.8 ? "metric-success" : "metric-danger"}`}>{ratioValue}</div>
          <div className="metric-footnote">Healthy threshold</div>
        </div>
      </section>

      <section className="content-grid">
        <div className="column">
          <div className="card">
            <h3>Team Calendar Heatmap</h3>
            <div className="heatmap-legend">
              <span className="legend-item"><span className="legend-swatch free"></span> Free</span>
              <span className="legend-item"><span className="legend-swatch single"></span> 1 meeting</span>
              <span className="legend-item"><span className="legend-swatch orange"></span> 2 meetings</span>
              <span className="legend-item"><span className="legend-swatch red"></span> Back-to-back</span>
            </div>
            <div className="heatmap-grid">
              <div className="heatmap-head"></div>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="heatmap-head">{9 + index}am</div>
              ))}
              {heatmapRows.map((row) => (
                <React.Fragment key={row.day}>
                  <div className="heatmap-day">{row.day}</div>
                  {row.blocks.map((state, index) => {
                    const member = teamMembers[(index + row.day.length) % teamMembers.length];
                    return (
                      <div
                        key={`${row.day}-${index}`}
                        className={`heatmap-cell ${state}`}
                        onMouseEnter={(event) => showTooltip(event, row.day, `${9 + index}am`, member.name)}
                        onMouseMove={moveTooltip}
                        onMouseLeave={hideTooltip}
                      >
                        <span className="hover-avatar">{member.initials}</span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Meeting Density Timeline</h3>
            <div className="timeline-list">
              {densityMembers.map((member) => (
                <div key={member.name} className="bar-row">
                  <div className="bar-name">{member.name}</div>
                  <div className="bar-track">
                    <div className={`bar-fill ${member.atRisk ? "at-risk" : ""}`} style={{ width: `${member.percent}%` }} />
                  </div>
                  <div className="bar-value">{member.percent}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card">
            <h3>At Risk Members</h3>
            <div className="risk-list">
              {atRiskMembers.map((member) => (
                <div key={member.name} className="risk-item">
                  <div className="risk-main">
                    <div className="avatar">{member.initials}</div>
                    <div>
                      <div className="risk-name">{member.name}</div>
                      <div className="risk-role">{member.role}</div>
                    </div>
                  </div>
                  <div className="risk-right">
                    <div className="mini-stat">{member.stat}</div>
                    <div className={`badge ${member.badgeClass}`}>{member.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Suggested Reschedules</h3>
            <div className="suggestions-list">
              {suggestions.map((suggestion) => (
                <div key={suggestion.title} className="suggestion-card">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-time">
                    <span>{suggestion.from}</span>
                    <span className="arrow">→</span>
                    <span>{suggestion.to}</span>
                  </div>
                  <div className="suggestion-footer">
                    <span className="badge badge-success">{suggestion.note}</span>
                    <button className="ghost-button">Apply suggestion</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="focus-card">
        <h3>Focus Block Optimizer</h3>
        <div className="focus-description">Optimal schedule for Priya Sharma — maximum non-overlapping focus blocks</div>
        <div className="focus-timeline">
          {focusBlocks.map((slot, index) => (
            <div key={index} className={`timeline-slot ${slot.type}`} style={{ flex: slot.width }} />
          ))}
        </div>
        <div className="timeline-labels">
          <span>9am</span>
          <span>12pm</span>
          <span>3pm</span>
          <span>6pm</span>
        </div>
        <p className="focus-summary">Algorithm found 3 focus blocks totaling 4.5h (↑ from 1.5h)</p>
      </div>

      <div className={`tooltip ${tooltip.visible ? "visible" : ""}`} style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}>
        {tooltip.text}
      </div>
    </div>
  );
}
