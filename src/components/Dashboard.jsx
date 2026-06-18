import React from 'react';
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
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const { 
    tasks, 
    getTodayStats, 
    getSuggestedTask, 
    getMotivationalMessage, 
    updateTask,
    setActiveTab
  } = useTasks();

  const todayStats = getTodayStats();
  const suggestedTask = getSuggestedTask();
  const motivation = getMotivationalMessage(todayStats.percent);

  // Group tasks by category to show counts
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

  // Get high priority tasks for today
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentTodayTasks = tasks.filter(
    t => !t.completed && t.dueDate === todayStr && t.priority === 'High'
  );

  // SVG Progress Ring calculations
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayStats.percent / 100) * circumference;

  const handleStartTask = (task) => {
    // If completing the task, trigger update
    updateTask(task.id, { completed: true });
    
    // Confetti effect!
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    });
  };

  return (
    <div className="dashboard-view animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back!</h1>
          <p className="page-subtitle">Here is your productivity overview for today.</p>
        </div>
        <button 
          onClick={() => setActiveTab('tasks')}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add New Task</span>
        </button>
      </div>

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
                  onClick={() => handleStartTask(suggestedTask)}
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
              🎉 All caught up! You have no pending tasks left for today. Keep up the excellent work!
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

      {/* Main Grid: Urgent Tasks + Category Breakdown */}
      <div className="dashboard-grid">
        {/* Urgent Tasks */}
        <div className="glass-card dashboard-main-panel">
          <h2 className="section-title">
            <AlertCircle size={20} color="var(--priority-high)" />
            <span>Urgent Tasks Today</span>
          </h2>
          {urgentTodayTasks.length > 0 ? (
            <div className="urgent-task-list">
              {urgentTodayTasks.map(task => (
                <div key={task.id} className="urgent-task-card">
                  <div className="urgent-card-left">
                    <input 
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => handleStartTask(task)}
                    />
                    <div className="urgent-task-info">
                      <div className="urgent-task-name">{task.title}</div>
                      <div className="urgent-task-time">{task.dueTime}</div>
                    </div>
                  </div>
                  <span className={`cat-tag ${task.category}`}>{task.category}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={40} className="empty-icon" />
              <p>No urgent tasks left for today! You're in a safe zone.</p>
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
