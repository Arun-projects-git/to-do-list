import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  BookOpen,
  Briefcase,
  Heart,
  User,
  Coffee,
  DollarSign,
  TrendingUp,
  Trash2,
  Calendar,
  CheckCircle,
  Circle,
  ArrowRightLeft
} from 'lucide-react';

export default function Dashboard() {
  const { 
    tasks, 
    addTask,
    updateTask,
    deleteTask,
    getTodayStats, 
    getSuggestedTask, 
    getMotivationalMessage,
    carryoverTasks,
    handleCarryover,
    dismissCarryover
  } = useTasks();

  // Quick Task Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('Study');
  const [quickPriority, setQuickPriority] = useState('Medium');
  const [quickTime, setQuickTime] = useState('12:00');

  const todayStats = getTodayStats();
  const suggestedTask = getSuggestedTask();
  const motivation = getMotivationalMessage(todayStats.percent);
  const todayStr = new Date().toISOString().split('T')[0];

  // Group all tasks by category to show counts
  const categoryCounts = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const categoryIcons = {
    Study: { icon: BookOpen, color: 'var(--cat-study)', bg: 'var(--cat-study-bg)' },
    Work: { icon: Briefcase, color: 'var(--cat-work)', bg: 'var(--cat-work-bg)' },
    Health: { icon: Heart, color: 'var(--cat-health)', bg: 'var(--cat-health-bg)' },
    Personal: { icon: User, color: 'var(--cat-personal)', bg: 'var(--cat-personal-bg)' },
    Leisure: { icon: Coffee, color: 'var(--cat-leisure)', bg: 'var(--cat-leisure-bg)' },
    Finance: { icon: DollarSign, color: 'var(--cat-finance)', bg: 'var(--cat-finance-bg)' },
  };

  const categories = Object.keys(categoryIcons);

  // All tasks for today (both completed & pending)
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const urgentTodayTasks = todayTasks.filter(t => !t.completed && t.priority === 'High');

  // SVG Progress Ring calculations
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayStats.percent / 100) * circumference;

  const handleToggleComplete = (id, currentlyCompleted) => {
    const nextVal = !currentlyCompleted;
    updateTask(id, { completed: nextVal });
    
    if (nextVal) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }
  };

  const handleQuickAddToday = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: 'Created directly from Dashboard.',
      category: quickCategory,
      priority: quickPriority,
      dueDate: todayStr,
      dueTime: quickTime,
      reminderEnabled: false
    });

    setQuickTitle('');
  };

  const handleCarryoverAll = () => {
    const ids = carryoverTasks.map(t => t.id);
    handleCarryover(ids, todayStr);
  };

  return (
    <div className="dashboard-view animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Your productivity hub and task manager.</p>
        </div>
      </div>

      {/* Overdue Carryover Panel directly on Dashboard */}
      {carryoverTasks.length > 0 && (
        <div className="carryover-banner-card glass-card" style={{ marginBottom: '1.5rem' }}>
          <div className="carryover-card-header">
            <div className="header-info">
              <AlertCircle size={20} color="var(--priority-high)" />
              <h3>Pending Tasks from Previous Days</h3>
            </div>
            <div className="header-actions">
              <button onClick={handleCarryoverAll} className="btn btn-primary btn-sm">
                <ArrowRightLeft size={14} />
                <span>Carry Over All to Today</span>
              </button>
              <button onClick={dismissCarryover} className="btn btn-secondary btn-sm">
                Dismiss
              </button>
            </div>
          </div>
          <div className="carryover-list">
            {carryoverTasks.slice(0, 3).map(task => (
              <div key={task.id} className="carryover-item">
                <span className="item-title">{task.title}</span>
                <button 
                  onClick={() => handleCarryover([task.id], todayStr)}
                  className="btn-carryover-single"
                  title="Move to Today"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
            {carryoverTasks.length > 3 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', padding: '0 0.5rem' }}>
                And {carryoverTasks.length - 3} more pending task(s)...
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Morning Brief */}
      <div className="ai-brief-card glass-card">
        <div className="ai-brief-header">
          <div className="ai-badge">
            <Sparkles size={16} />
            <span>Zen AI Planner</span>
          </div>
        </div>
        <div className="ai-brief-body">
          <p className="motivation-text">"{motivation}"</p>
          
          {suggestedTask ? (
            <div className="ai-suggestion-box">
              <div className="suggestion-label">Suggested Next Action</div>
              <div className="suggestion-task-row">
                <div className={`suggestion-cat-dot ${suggestedTask.category}`} />
                <div className="suggestion-task-details">
                  <div className="suggestion-task-title">{suggestedTask.title}</div>
                  <div className="suggestion-task-meta">
                    <span>{suggestedTask.category}</span>
                    <span>•</span>
                    <span className={`prio-${suggestedTask.priority.toLowerCase()}`}>{suggestedTask.priority} Priority</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleComplete(suggestedTask.id, suggestedTask.completed)}
                  className="btn-complete-suggested"
                  title="Mark as completed"
                >
                  <Play size={16} />
                  <span>Start Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="ai-no-suggestions">
              🎉 Update Soon !
            </div>
          )}
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid-3 stats-row">
        {/* Progress Card */}
        <div className="glass-card stat-card progress-card">
          <div className="progress-ring-wrapper">
            <svg className="progress-ring" width="140" height="140">
              <circle
                className="progress-ring-circle-bg"
                stroke="var(--bg-hover)"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx="70"
                cy="70"
              />
              <circle
                className="progress-ring-circle"
                stroke="var(--color-primary)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                fill="transparent"
                r={radius}
                cx="70"
                cy="70"
              />
            </svg>
            <div className="progress-percent">
              <span className="percent-val">{todayStats.percent}%</span>
              <span className="percent-label">Done</span>
            </div>
          </div>
          <div className="stat-card-details">
            <h3>Today's Progress</h3>
            <p className="stat-subtext">
              {todayStats.completed} of {todayStats.total} tasks completed
            </p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="glass-card stat-card info-card">
          <div className="stat-icon-box pending-box">
            <Clock size={24} color="var(--color-warning)" />
          </div>
          <div className="stat-card-details">
            <span className="stat-number">{todayStats.pending}</span>
            <h3>Pending Tasks</h3>
            <p className="stat-subtext">Due by the end of today</p>
          </div>
        </div>

        {/* High Priority Card */}
        <div className="glass-card stat-card info-card">
          <div className="stat-icon-box priority-box">
            <AlertCircle size={24} color="var(--priority-high)" />
          </div>
          <div className="stat-card-details">
            <span className="stat-number">{urgentTodayTasks.length}</span>
            <h3>Urgent Tasks</h3>
            <p className="stat-subtext">High priority tasks for today</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Task List + Category Breakdown */}
      <div className="dashboard-grid">
        {/* Interactive Today's Task Manager */}
        <div className="glass-card dashboard-main-panel">
          <h2 className="section-title">
            <CheckCircle2 size={20} color="var(--color-primary)" />
            <span>Today's Task Manager</span>
          </h2>

          {/* Quick Task Creation form */}
          <form onSubmit={handleQuickAddToday} className="quick-add-today-form">
            <input 
              type="text" 
              placeholder="+ Add a task for today..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="input-field quick-add-title-input"
              required
            />
            <div className="quick-add-params-row">
              <select 
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="select-filter"
              >
                {['Study', 'Personal', 'Health', 'Work', 'Leisure', 'Finance'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select 
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value)}
                className="select-filter"
              >
                {['High', 'Medium', 'Low'].map(p => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
              <input 
                type="time" 
                value={quickTime}
                onChange={(e) => setQuickTime(e.target.value)}
                className="select-filter"
                style={{ width: '100px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Add
              </button>
            </div>
          </form>

          {/* Today's Tasks Checklist */}
          {todayTasks.length > 0 ? (
            <div className="urgent-task-list" style={{ marginTop: '1.25rem' }}>
              {todayTasks.map(task => (
                <div key={task.id} className={`urgent-task-card ${task.completed ? 'task-completed' : ''}`}>
                  <div className="urgent-card-left">
                    <button 
                      onClick={() => handleToggleComplete(task.id, task.completed)}
                      className="agenda-checkbox-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem' }}
                    >
                      {task.completed ? (
                        <CheckCircle size={18} color="var(--color-success)" />
                      ) : (
                        <Circle size={18} color="var(--text-tertiary)" />
                      )}
                    </button>
                    <div className="urgent-task-info">
                      <span className="urgent-task-name" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                      <div className="urgent-task-time">
                        <Clock size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        <span style={{ verticalAlign: 'middle' }}>{task.dueTime}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className={`cat-tag ${task.category}`}>{task.category}</span>
                    <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '10px' }}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="card-action-btn delete tooltip"
                      data-tooltip="Delete Task"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={40} className="empty-icon" />
              <p>No tasks scheduled for today. Start by adding one above!</p>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card dashboard-side-panel">
          <h2 className="section-title">
            <TrendingUp size={20} color="var(--color-primary)" />
            <span>Category Breakdown</span>
          </h2>
          <div className="category-breakdown-list">
            {categories.map(cat => {
              const config = categoryIcons[cat];
              const Icon = config.icon;
              const count = categoryCounts[cat] || 0;
              return (
                <div key={cat} className="category-count-row">
                  <div className="category-info-left">
                    <div className="category-icon-wrapper" style={{ backgroundColor: config.bg }}>
                      <Icon size={18} color={config.color} />
                    </div>
                    <span className="category-name-label">{cat}</span>
                  </div>
                  <div className="category-badge-count">{count} {count === 1 ? 'task' : 'tasks'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
