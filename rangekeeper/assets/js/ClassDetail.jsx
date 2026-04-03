/**
 * RangeKeeper Class Detail Page
 * Displays assignments, grades, and messages for a specific class
 */

import React, { useState, useEffect } from 'react';

const ClassDetail = ({ courseId, onBack }) => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAssignment, setExpandedAssignment] = useState(null);

  useEffect(() => {
    fetchClassData();
  }, [courseId]);

  async function fetchClassData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/class/${courseId}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setClassData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('[ClassDetail] Error fetching class data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="class-detail loading">
        <p>Loading class details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-detail error">
        <button onClick={onBack}>← Back to Classes</button>
        <p>Error: {error}</p>
        <button onClick={fetchClassData}>Retry</button>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="class-detail">
        <button onClick={onBack}>← Back</button>
        <p>No data found for {courseId}</p>
      </div>
    );
  }

  const { assignments, grades, messages } = classData;

  return (
    <div className="class-detail">
      {/* Header */}
      <div className="class-header">
        <button onClick={onBack} className="back-button">← Back to Classes</button>
        <h1>{courseId}</h1>
        <a
          href={`https://ualearn.blackboard.com/ultra/courses/${courseId.split('-')[0]}/outline`}
          target="_blank"
          rel="noopener noreferrer"
          className="blackboard-link-header"
        >
          Open in Blackboard →
        </a>
      </div>

      {/* Overall Grade */}
      {grades.overall && (
        <div className="section grade-summary">
          <h2>📊 Overall Grade</h2>
          <div className="grade-card">
            <div className="grade-value">
              {grades.overall.letter_grade && (
                <span className="letter-grade">{grades.overall.letter_grade}</span>
              )}
              {grades.overall.percentage && (
                <span className="percentage">{grades.overall.percentage}%</span>
              )}
            </div>
            {grades.overall.score && (
              <div className="score-detail">
                {grades.overall.score} / {grades.overall.possible}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignments */}
      <div className="section assignments">
        <h2>📝 Assignments ({assignments.length})</h2>
        {assignments.length === 0 ? (
          <p className="empty">No assignments found</p>
        ) : (
          <div className="assignment-list">
            {assignments.map((a) => (
              <div
                key={a.id}
                className={`assignment-card priority-${a.priority}`}
                style={{ borderLeftColor: a.priorityColor }}
              >
                <div className="assignment-header">
                  <div className="assignment-title">
                    {a.priority === 'urgent' && <span className="pulse-dot"></span>}
                    {a.title || a.assignment_name || 'Untitled'}
                  </div>
                  <span className={`priority-badge priority-${a.priority}`}>
                    {a.priorityLabel}
                  </span>
                </div>

                {/* Assignment Details */}
                <div className="assignment-details">
                  {a.due_date && (
                    <div className="detail">
                      <span className="label">Due:</span>
                      <span className="value">{new Date(a.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {a.status && (
                    <div className="detail">
                      <span className="label">Status:</span>
                      <span className="value">{a.status}</span>
                    </div>
                  )}
                  {a.score && a.possible && (
                    <div className="detail">
                      <span className="label">Grade:</span>
                      <span className="value grade">
                        {a.score}/{a.possible}
                        {a.percentage && ` (${a.percentage}%)`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Blackboard Link */}
                {a.blackboard_url && (
                  <a
                    href={a.blackboard_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blackboard-link-small"
                  >
                    View in Blackboard
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grades Breakdown */}
      {grades.all && grades.all.length > 1 && (
        <div className="section grades-breakdown">
          <h2>📈 Recent Grades</h2>
          <div className="grades-list">
            {grades.all.slice(0, 5).map((g, idx) => (
              <div key={idx} className="grade-item">
                <span className="name">{g.assignment_name}</span>
                {g.percentage && <span className="pct">{g.percentage}%</span>}
                {g.score && g.possible && (
                  <span className="score">{g.score}/{g.possible}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages && messages.length > 0 && (
        <div className="section messages">
          <h2>💬 Recent Messages ({messages.length})</h2>
          <div className="messages-list">
            {messages.map((m) => (
              <div key={m.id} className={`message-card ${m.isUnread ? 'unread' : ''}`}>
                <div className="message-header">
                  <span className="sender">{m.sender || 'Unknown'}</span>
                  {m.isUnread && <span className="unread-badge">New</span>}
                </div>
                <div className="message-subject">{m.subject || 'No subject'}</div>
                {m.preview && <div className="message-preview">{m.preview}</div>}
                <div className="message-date">
                  {new Date(m.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Synced */}
      <div className="last-synced">
        Last synced: {new Date(classData.lastSyncedAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ClassDetail;

/* ============================================================================
   STYLES
   ============================================================================ */

const styles = `
.class-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.class-detail.loading,
.class-detail.error {
  text-align: center;
  padding: 3rem;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #9E1B32;
  padding-bottom: 1rem;
}

.class-header h1 {
  flex: 1;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #9E1B32;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.back-button:hover {
  background: #f0f0f0;
}

.blackboard-link-header {
  background: #9E1B32;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.blackboard-link-header:hover {
  background: #7a1526;
}

.section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

/* Grade Summary */
.grade-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  border-top: 4px solid #9E1B32;
}

.grade-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.grade-value {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.letter-grade {
  font-size: 3rem;
  font-weight: 700;
  color: #9E1B32;
}

.percentage {
  font-size: 1.5rem;
  color: #666;
}

.score-detail {
  font-size: 1.1rem;
  color: #666;
}

/* Assignments */
.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-card {
  border-left: 4px solid #ddd;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  transition: all 0.2s;
}

.assignment-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateX(4px);
}

.assignment-card.priority-urgent {
  background: #fef2f2;
  border-left-color: #dc2626;
}

.assignment-card.priority-soon {
  background: #fef3c7;
  border-left-color: #f59e0b;
}

.assignment-card.priority-later {
  background: #f0fdf4;
  border-left-color: #10b981;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.assignment-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #dc2626;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-urgent {
  background: #dc2626;
  color: white;
}

.priority-soon {
  background: #f59e0b;
  color: white;
}

.priority-later {
  background: #10b981;
  color: white;
}

.assignment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.detail {
  display: flex;
  gap: 0.5rem;
}

.detail .label {
  font-weight: 600;
  color: #666;
}

.detail .value {
  color: #1a1a1a;
}

.detail .grade {
  color: #9E1B32;
  font-weight: 600;
}

.blackboard-link-small {
  display: inline-block;
  background: #9E1B32;
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.2s;
}

.blackboard-link-small:hover {
  background: #7a1526;
}

/* Grades Breakdown */
.grades-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 0.95rem;
}

.grade-item .name {
  flex: 1;
}

.grade-item .pct {
  font-weight: 600;
  color: #9E1B32;
  min-width: 50px;
  text-align: right;
}

.grade-item .score {
  color: #666;
  font-size: 0.85rem;
  min-width: 60px;
  text-align: right;
}

/* Messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-card {
  border-left: 4px solid #ddd;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.message-card.unread {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-header .sender {
  font-weight: 600;
  color: #1a1a1a;
}

.unread-badge {
  background: #f59e0b;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
}

.message-subject {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.message-preview {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.message-date {
  color: #999;
  font-size: 0.85rem;
}

/* Last Synced */
.last-synced {
  text-align: center;
  color: #999;
  font-size: 0.85rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.empty {
  text-align: center;
  color: #999;
  padding: 2rem;
}

@media (max-width: 768px) {
  .class-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .class-header h1 {
    font-size: 1.5rem;
  }

  .assignment-details {
    grid-template-columns: 1fr;
  }

  .grade-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

// Export styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}
