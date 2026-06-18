import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit2, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  Bell,
  BellOff,
  FolderMinus,
  CheckCircle,
  Trash
} from 'lucide-react';

export default function TaskList() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [prioFilter, setPrioFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Pending'); // Pending, Completed, All
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Study');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const categories = ['Study', 'Personal', 'Health', 'Work', 'Leisure', 'Finance', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];

  // Open modal for creating new task
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('Study');
    setPriority('Medium');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('12:00');
    setReminderEnabled(false);
    setIsModalOpen(true);
  };

  // Open modal for editing existing task
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime);
    setReminderEnabled(task.reminderEnabled);
    setIsModalOpen(true);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title,
      description,
      category,
      priority,
      dueDate,
      dueTime,
      reminderEnabled
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    setIsModalOpen(false);
  };

  // Mark task completed (with confetti)
  const handleToggleComplete = (id, currentlyCompleted) => {
    const nextVal = !currentlyCompleted;
    updateTask(id, { completed: nextVal });

    if (nextVal) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.7 }
        });
      });

      // Browser Notification if enabled
      if (Notification.permission === 'granted') {
        new Notification("Task Completed! 🎉", {
          body: `Well done on completing: "${tasks.find(t => t.id === id)?.title}"`,
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>'
        });
      }
    }
  };

  // Request browser notification permissions on Bell click
  const toggleReminderPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setReminderEnabled(true);
        }
      });
    } else if (Notification.permission === 'granted') {
      setReminderEnabled(!reminderEnabled);
    } else {
      alert("Please enable notification permissions in your browser settings to receive alerts.");
    }
  };

  // Filter & Search tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = catFilter === 'All' || t.category === catFilter;
    const matchesPrio = prioFilter === 'All' || t.priority === prioFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'Pending') matchesStatus = !t.completed;
    if (statusFilter === 'Completed') matchesStatus = t.completed;

    return matchesSearch && matchesCat && matchesPrio && matchesStatus;
  });

  // Group tasks for visual categorization
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const overdueTasks = filteredTasks.filter(t => !t.completed && t.dueDate < todayStr);
  const todayTasks = filteredTasks.filter(t => t.dueDate === todayStr);
  const tomorrowTasks = filteredTasks.filter(t => t.dueDate === tomorrowStr);
  const upcomingTasks = filteredTasks.filter(t => t.dueDate > tomorrowStr && t.dueDate > todayStr);
  const completedHistoryTasks = filteredTasks.filter(t => t.completed); // history view

  const renderTaskCard = (task) => {
    const isOverdue = !task.completed && task.dueDate < todayStr;
    return (
      <div 
        key={task.id} 
        className={`task-item-card ${task.completed ? 'task-completed' : ''} ${isOverdue ? 'task-overdue' : ''}`}
      >
        <div className="task-card-main">
          <input 
            type="checkbox"
            className="task-checkbox"
            checked={task.completed}
            onChange={() => handleToggleComplete(task.id, task.completed)}
          />
          <div className="task-card-content">
            <h4 className="task-card-title">{task.title}</h4>
            {task.description && <p className="task-card-desc">{task.description}</p>}
            
            <div className="task-card-meta">
              <span className={`cat-tag ${task.category}`}>{task.category}</span>
              <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              
              <div className="meta-time">
                <CalendarIcon size={12} />
                <span>{task.dueDate === todayStr ? 'Today' : task.dueDate === tomorrowStr ? 'Tomorrow' : task.dueDate}</span>
              </div>
              <div className="meta-time">
                <Clock size={12} />
                <span>{task.dueTime}</span>
              </div>
              {task.reminderEnabled && (
                <div className="meta-reminder tooltip" data-tooltip="Reminders Enabled">
                  <Bell size={12} color="var(--color-primary)" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="task-card-actions">
          <button 
            onClick={() => handleOpenEditModal(task)}
            className="card-action-btn tooltip"
            data-tooltip="Edit Task"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => deleteTask(task.id)}
            className="card-action-btn delete tooltip"
            data-tooltip="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="task-list-view animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks Manager</h1>
          <p className="page-subtitle">Track, filter, and plan your schedules easily.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-container glass-card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by task title or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-selectors">
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={catFilter} 
              onChange={(e) => setCatFilter(e.target.value)}
              className="select-filter"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select 
              value={prioFilter} 
              onChange={(e) => setPrioFilter(e.target.value)}
              className="select-filter"
            >
              <option value="All">All Priorities</option>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <div className="status-chips">
              {['Pending', 'Completed', 'All'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`status-chip ${statusFilter === s ? 'active' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Group Layout */}
      <div className="task-groups-container">
        {statusFilter !== 'Completed' && overdueTasks.length > 0 && (
          <div className="task-group-section">
            <h3 className="group-heading overdue">
              <AlertCircle size={18} />
              <span>Overdue Tasks</span>
              <span className="count-badge">{overdueTasks.length}</span>
            </h3>
            <div className="task-items-list">
              {overdueTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {statusFilter !== 'Completed' && (
          <>
            {/* Today */}
            <div className="task-group-section">
              <h3 className="group-heading">
                <span>Today</span>
                <span className="count-badge">{todayTasks.length}</span>
              </h3>
              {todayTasks.length > 0 ? (
                <div className="task-items-list">
                  {todayTasks.map(renderTaskCard)}
                </div>
              ) : (
                <p className="no-tasks-text">No tasks for today. Add one or take a break!</p>
              )}
            </div>

            {/* Tomorrow */}
            <div className="task-group-section">
              <h3 className="group-heading">
                <span>Tomorrow</span>
                <span className="count-badge">{tomorrowTasks.length}</span>
              </h3>
              {tomorrowTasks.length > 0 ? (
                <div className="task-items-list">
                  {tomorrowTasks.map(renderTaskCard)}
                </div>
              ) : (
                <p className="no-tasks-text">No tasks for tomorrow.</p>
              )}
            </div>

            {/* Upcoming */}
            <div className="task-group-section">
              <h3 className="group-heading">
                <span>Upcoming</span>
                <span className="count-badge">{upcomingTasks.length}</span>
              </h3>
              {upcomingTasks.length > 0 ? (
                <div className="task-items-list">
                  {upcomingTasks.map(renderTaskCard)}
                </div>
              ) : (
                <p className="no-tasks-text">No upcoming tasks scheduled.</p>
              )}
            </div>
          </>
        )}

        {statusFilter === 'Completed' && (
          <div className="task-group-section">
            <h3 className="group-heading completed">
              <span>Completed History</span>
              <span className="count-badge">{completedHistoryTasks.length}</span>
            </h3>
            {completedHistoryTasks.length > 0 ? (
              <div className="task-items-list">
                {completedHistoryTasks.map(renderTaskCard)}
              </div>
            ) : (
              <p className="no-tasks-text">No completed tasks yet.</p>
            )}
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="empty-state-large glass-card">
            <FolderMinus size={48} className="empty-icon" />
            <h3>No tasks found</h3>
            <p>Try clearing your filters or create a new task to get started.</p>
            <button onClick={handleOpenCreateModal} className="btn btn-primary">
              Create a Task
            </button>
          </div>
        )}
      </div>

      {/* Task Creation / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-text"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title*</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="e.g. Study Discrete Math"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="input-field text-area"
                    placeholder="Add details, notes, or subtasks..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="input-field"
                    >
                      {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input 
                      type="date" 
                      className="input-field"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Time</label>
                    <input 
                      type="time" 
                      className="input-field"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group-row">
                  <button 
                    type="button"
                    onClick={toggleReminderPermission}
                    className={`reminder-opt-btn ${reminderEnabled ? 'active' : ''}`}
                  >
                    {reminderEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                    <span>{reminderEnabled ? 'Reminder Enabled (System Alert)' : 'Enable Reminder Notification'}</span>
                  </button>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
