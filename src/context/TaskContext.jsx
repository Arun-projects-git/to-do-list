import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

// Default task list for first-time users
const DEFAULT_TASKS = [
  {
    id: 'def-1',
    title: 'Review Lecture Notes on Operating Systems',
    description: 'Go through chapters 3 and 4. Focus on CPU scheduling algorithms.',
    category: 'Study',
    priority: 'High',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '10:00',
    completed: false,
    createdDate: new Date().toISOString().split('T')[0],
    reminderEnabled: true,
  },
  {
    id: 'def-2',
    title: 'Prep work for team weekly sync',
    description: 'Draft the project timeline slides and check team velocity metric.',
    category: 'Work',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '14:30',
    completed: true,
    completedAt: new Date().toISOString(),
    createdDate: new Date().toISOString().split('T')[0],
    reminderEnabled: false,
  },
  {
    id: 'def-3',
    title: '30-minute cardio workout',
    description: 'Morning run or HIIT session in the gym.',
    category: 'Health',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '08:00',
    completed: true,
    completedAt: new Date().toISOString(),
    createdDate: new Date().toISOString().split('T')[0],
    reminderEnabled: true,
  },
  {
    id: 'def-4',
    title: 'Organize work desk and room',
    description: 'Clean up notes, dust off monitor, file invoices.',
    category: 'Personal',
    priority: 'Low',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    completed: false,
    createdDate: new Date().toISOString().split('T')[0],
    reminderEnabled: false,
  },
  {
    id: 'def-5',
    title: 'Buy groceries for the week',
    description: 'Need eggs, milk, spinach, chicken breast, oats, and bananas.',
    category: 'Personal',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    dueTime: '17:00',
    completed: false,
    createdDate: new Date().toISOString().split('T')[0],
    reminderEnabled: false,
  },
  {
    id: 'def-6',
    title: 'Unfinished reading assignment',
    description: 'Chapters 1-2 of research methodology paper.',
    category: 'Study',
    priority: 'High',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
    dueTime: '16:00',
    completed: false,
    createdDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    reminderEnabled: false,
  }
];

const MOTIVATIONAL_MESSAGES = {
  zero: [
    "A journey of a thousand miles begins with a single step. Let's cross off that first task! 🚀",
    "Don't look at the whole list. Just focus on one small task right now. You got this! ✨",
    "Productivity is about taking the first step. Pick an easy task to build momentum! 💪"
  ],
  low: [
    "Nice start! You're making progress. Keep the momentum going! 🔥",
    "One task down, more to go. Step by step, you are getting closer. 📈",
    "Every completed task is a win. Keep pushing forward! 🌟"
  ],
  high: [
    "You are on fire today! Almost there. Finish strong! ⚡",
    "Outstanding progress! Just a few more items and you'll have a clean slate. 🏆",
    "You're doing amazing! Keep this focus up for the last stretch. 🎯"
  ],
  complete: [
    "Incredible job! 100% completion rate. You've conquered the day! 🎉🏆",
    "All done! Your future self is thanking you. Enjoy your well-deserved break! 🥳",
    "Perfect score today! You are building habits of excellence. See you tomorrow! 👑"
  ]
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('zentodo_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zentodo_theme') || 'light';
  });

  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('zentodo_streak')) || 3; // start with a nice default 3-day streak
  });

  const [lastStreakUpdateDate, setLastStreakUpdateDate] = useState(() => {
    return localStorage.getItem('zentodo_last_streak_date') || '';
  });

  // State to hold pending carryover tasks detected upon startup
  const [carryoverTasks, setCarryoverTasks] = useState([]);
  const [hasPromptedCarryover, setHasPromptedCarryover] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('zentodo_tasks', JSON.stringify(tasks));
    calculateStreak();
  }, [tasks]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zentodo_theme', theme);
  }, [theme]);

  // Check for carryover tasks from previous days on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pendingFromPast = tasks.filter(t => !t.completed && t.dueDate < todayStr);
    if (pendingFromPast.length > 0 && !hasPromptedCarryover) {
      setCarryoverTasks(pendingFromPast);
    }
  }, [tasks, hasPromptedCarryover]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'theme');
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Streak Tracker logic
  const calculateStreak = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Group completed tasks by date
    const completedDates = new Set();
    const tasksByDate = {};

    tasks.forEach(t => {
      if (!tasksByDate[t.dueDate]) {
        tasksByDate[t.dueDate] = { total: 0, completed: 0 };
      }
      tasksByDate[t.dueDate].total += 1;
      if (t.completed) {
        tasksByDate[t.dueDate].completed += 1;
        completedDates.add(t.dueDate);
      }
    });

    // Check if yesterday was completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayTasks = tasksByDate[todayStr] || { total: 0, completed: 0 };
    const yesterdayTasks = tasksByDate[yesterdayStr] || { total: 0, completed: 0 };

    // Simple streak logic:
    // If today is completed (at least 1 task, and completed = total)
    // and we haven't updated streak today, check if yesterday was completed.
    // To make it simple & responsive: we check if today is fully completed. If so, and last update wasn't today, increment streak.
    const isTodayCompleted = todayTasks.total > 0 && todayTasks.completed === todayTasks.total;
    
    if (isTodayCompleted && lastStreakUpdateDate !== todayStr) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastStreakUpdateDate(todayStr);
      localStorage.setItem('zentodo_streak', newStreak.toString());
      localStorage.setItem('zentodo_last_streak_date', todayStr);
    }
  };

  // Task CRUD operations
  const addTask = (taskData) => {
    const newTask = {
      id: 'task-' + Date.now(),
      createdDate: new Date().toISOString().split('T')[0],
      completed: false,
      ...taskData,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id, updatedFields) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updatedFields };
        if (updatedFields.completed !== undefined) {
          updated.completedAt = updatedFields.completed ? new Date().toISOString() : null;
        }
        return updated;
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Carryover operations
  const handleCarryover = (taskIds, targetDate) => {
    setTasks(prev => prev.map(t => {
      if (taskIds.includes(t.id)) {
        return { ...t, dueDate: targetDate };
      }
      return t;
    }));
    // Remove from the carryover notification list
    setCarryoverTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
    setHasPromptedCarryover(true);
  };

  const dismissCarryover = () => {
    setCarryoverTasks([]);
    setHasPromptedCarryover(true);
  };

  // AI suggestion logic
  const getMotivationalMessage = (completionRate) => {
    let pool = MOTIVATIONAL_MESSAGES.zero;
    if (completionRate === 100) pool = MOTIVATIONAL_MESSAGES.complete;
    else if (completionRate >= 70) pool = MOTIVATIONAL_MESSAGES.high;
    else if (completionRate > 0) pool = MOTIVATIONAL_MESSAGES.low;

    // Pick index based on current day of the month so it stays consistent for the day
    const index = new Date().getDate() % pool.length;
    return pool[index];
  };

  const getSuggestedTask = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => !t.completed && t.dueDate <= todayStr);
    
    if (pendingTasks.length === 0) return null;

    // Rank pending tasks:
    // 1. High priority due today or overdue
    // 2. Medium priority due today or overdue
    // 3. Low priority due today or overdue
    // 4. Time matching: if current hour is morning (before 12 PM) prefer Study/Work. 
    //    If afternoon (12-5 PM) prefer Work/Finance. 
    //    If evening (after 5 PM) prefer Health/Personal/Leisure.

    const currentHour = new Date().getHours();

    const ranked = [...pendingTasks].sort((a, b) => {
      // Priority weighting
      const pMap = { High: 3, Medium: 2, Low: 1 };
      const pDiff = pMap[b.priority] - pMap[a.priority];
      if (pDiff !== 0) return pDiff;

      // Overdue status weighting
      const aIsOverdue = a.dueDate < todayStr ? 1 : 0;
      const bIsOverdue = b.dueDate < todayStr ? 1 : 0;
      const overdueDiff = bIsOverdue - aIsOverdue;
      if (overdueDiff !== 0) return overdueDiff;

      // Time of day relevance
      const aTimeRelevance = getCategoryTimeScore(a.category, currentHour);
      const bTimeRelevance = getCategoryTimeScore(b.category, currentHour);
      const timeDiff = bTimeRelevance - aTimeRelevance;
      if (timeDiff !== 0) return timeDiff;

      // Fallback: earliest time
      return a.dueTime.localeCompare(b.dueTime);
    });

    return ranked[0];
  };

  const getCategoryTimeScore = (category, hour) => {
    if (hour < 12) {
      if (category === 'Study' || category === 'Work') return 3;
      if (category === 'Health') return 2;
    } else if (hour >= 12 && hour < 17) {
      if (category === 'Work' || category === 'Finance') return 3;
      if (category === 'Study') return 2;
    } else {
      if (category === 'Personal' || category === 'Leisure' || category === 'Health') return 3;
    }
    return 1;
  };

  // Statistics calculations
  const getTodayStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.dueDate === todayStr);
    const total = todayTasks.length;
    const completed = todayTasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const pending = total - completed;

    return { total, completed, percent, pending };
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      activeTab,
      setActiveTab,
      theme,
      toggleTheme,
      streak,
      setStreak,
      carryoverTasks,
      handleCarryover,
      dismissCarryover,
      addTask,
      updateTask,
      deleteTask,
      getTodayStats,
      getSuggestedTask,
      getMotivationalMessage,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
