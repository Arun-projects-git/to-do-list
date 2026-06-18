import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  CheckCircle,
  Circle,
  Sparkles,
  Clock
} from 'lucide-react';

export default function CalendarView() {
  const { tasks, addTask, updateTask } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  
  // Quick task creation in calendar
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('Study');
  const [quickPriority, setQuickPriority] = useState('Medium');

  const categories = ['Study', 'Personal', 'Health', 'Work', 'Leisure', 'Finance', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];

  // Month details
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month calculation
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get tasks due on a specific date string (YYYY-MM-DD)
  const getTasksForDate = (dateStr) => {
    return tasks.filter(t => t.dueDate === dateStr);
  };

  // Build calendar matrix
  const calendarCells = [];
  
  // Padding for empty cells of previous month
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }

  // Populate cells of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNum: d,
      dateStr: dStr,
      tasks: getTasksForDate(dStr)
    });
  }

  const selectedDateTasks = getTasksForDate(selectedDateStr);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle,
      description: 'Quickly scheduled from Calendar View.',
      category: quickCategory,
      priority: quickPriority,
      dueDate: selectedDateStr,
      dueTime: '12:00',
      reminderEnabled: false
    });

    setQuickTitle('');
    setShowQuickAdd(false);
  };

  const handleToggleComplete = (id, currentlyCompleted) => {
    updateTask(id, { completed: !currentlyCompleted });
    if (!currentlyCompleted) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({ particleCount: 80, spread: 50 });
      });
    }
  };

  return (
    <div className="calendar-view animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Planner Calendar</h1>
          <p className="page-subtitle">Schedule and analyze your monthly task flow.</p>
        </div>
      </div>

      <div className="calendar-grid-layout">
        {/* Monthly Calendar Card */}
        <div className="glass-card calendar-card">
          <div className="calendar-nav-header">
            <h2>{monthNames[month]} {year}</h2>
            <div className="nav-buttons">
              <button onClick={prevMonth} className="btn-icon-nav" aria-label="Previous month">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="btn-icon-nav" aria-label="Next month">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {/* Weekdays */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
              <div key={w} className="weekday-header">{w}</div>
            ))}

            {/* Cells */}
            {calendarCells.map((cell, idx) => {
              if (cell === null) {
                return <div key={`empty-${idx}`} className="calendar-cell empty"></div>;
              }

              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
              const completedCount = cell.tasks.filter(t => t.completed).length;
              const pendingCount = cell.tasks.length - completedCount;

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`calendar-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                >
                  <span className="cell-day-num">{cell.dayNum}</span>
                  
                  {/* Task Indicators */}
                  {cell.tasks.length > 0 && (
                    <div className="cell-dots-wrapper">
                      {pendingCount > 0 && (
                        <div className="cell-dot pending" title={`${pendingCount} pending`} />
                      )}
                      {completedCount > 0 && (
                        <div className="cell-dot completed" title={`${completedCount} completed`} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Side Panel */}
        <div className="glass-card agenda-panel">
          <div className="agenda-header">
            <div className="agenda-date">
              <CalendarIcon size={20} color="var(--color-primary)" />
              <h3>
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
            </div>
            {!showQuickAdd && (
              <button 
                onClick={() => setShowQuickAdd(true)}
                className="btn-quick-add-toggle"
                title="Quick Add Task to this day"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {/* Quick Add Form inside agenda */}
          {showQuickAdd && (
            <form onSubmit={handleQuickAdd} className="quick-add-form animate-slide-up">
              <input 
                type="text" 
                placeholder="Task title..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="input-field quick-input"
                required
                autoFocus
              />
              <div className="quick-form-row">
                <select 
                  value={quickCategory} 
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="input-field select-quick"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  value={quickPriority} 
                  onChange={(e) => setQuickPriority(e.target.value)}
                  className="input-field select-quick"
                >
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="quick-form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowQuickAdd(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add
                </button>
              </div>
            </form>
          )}

          {/* Agenda task list */}
          <div className="agenda-task-list">
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map(task => (
                <div key={task.id} className="agenda-task-item">
                  <button 
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className="agenda-checkbox-btn"
                  >
                    {task.completed ? (
                      <CheckCircle size={18} color="var(--color-success)" />
                    ) : (
                      <Circle size={18} color="var(--text-tertiary)" />
                    )}
                  </button>
                  <div className="agenda-task-details">
                    <span className={`agenda-task-title ${task.completed ? 'completed' : ''}`}>
                      {task.title}
                    </span>
                    <div className="agenda-task-meta">
                      <span className={`cat-tag ${task.category}`}>{task.category}</span>
                      <span className="agenda-time">
                        <Clock size={10} />
                        <span>{task.dueTime}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="agenda-empty-state">
                <Sparkles size={32} className="empty-sparkle-icon" />
                <p>No tasks scheduled for this day.</p>
                <button 
                  onClick={() => setShowQuickAdd(true)} 
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.75rem' }}
                >
                  Schedule First Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
