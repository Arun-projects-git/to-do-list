import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

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
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('zentodo_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Load tasks dynamically based on currentUser
  const [tasks, setTasks] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zentodo_theme') || 'light';
  });

  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('zentodo_streak')) || 0; // starts at 0 for new accounts
  });

  const [lastStreakUpdateDate, setLastStreakUpdateDate] = useState(() => {
    return localStorage.getItem('zentodo_last_streak_date') || '';
  });

  // State to hold pending carryover tasks detected upon startup
  const [carryoverTasks, setCarryoverTasks] = useState([]);
  const [hasPromptedCarryover, setHasPromptedCarryover] = useState(false);

  // Dynamic tasks loader when user changes
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`zentodo_tasks_${currentUser.email}`);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      
      const savedUserStreak = localStorage.getItem(`zentodo_streak_${currentUser.email}`);
      setStreak(savedUserStreak ? parseInt(savedUserStreak) : 0);
      
      const savedUserStreakDate = localStorage.getItem(`zentodo_last_streak_date_${currentUser.email}`);
      setLastStreakUpdateDate(savedUserStreakDate || '');
      
      setHasPromptedCarryover(false);
    } else {
      setTasks([]);
      setStreak(0);
      setLastStreakUpdateDate('');
    }
  }, [currentUser]);

  // Sync tasks to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`zentodo_tasks_${currentUser.email}`, JSON.stringify(tasks));
      calculateStreak();
    }
  }, [tasks, currentUser]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zentodo_theme', theme);
  }, [theme]);

  // Check for carryover tasks from previous days on mount/task change
  useEffect(() => {
    if (currentUser && tasks.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const pendingFromPast = tasks.filter(t => !t.completed && t.dueDate < todayStr);
      if (pendingFromPast.length > 0 && !hasPromptedCarryover) {
        setCarryoverTasks(pendingFromPast);
      } else if (pendingFromPast.length === 0) {
        setCarryoverTasks([]);
      }
    } else {
      setCarryoverTasks([]);
    }
  }, [tasks, currentUser, hasPromptedCarryover]);

  // Google Sign-In Simulation
  const loginWithGoogle = (email, name) => {
    const user = { email, name };
    setCurrentUser(user);
    localStorage.setItem('zentodo_user', JSON.stringify(user));
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zentodo_user');
  };

  // Toggle theme (Fixed Double Toggle Bug)
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Streak Tracker logic
  const calculateStreak = () => {
    if (!currentUser || tasks.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Group completed tasks by date
    const tasksByDate = {};

    tasks.forEach(t => {
      if (!tasksByDate[t.dueDate]) {
        tasksByDate[t.dueDate] = { total: 0, completed: 0 };
      }
      tasksByDate[t.dueDate].total += 1;
      if (t.completed) {
        tasksByDate[t.dueDate].completed += 1;
      }
    });

    const todayTasks = tasksByDate[todayStr] || { total: 0, completed: 0 };

    // A streak triggers if today is fully completed and has at least one task
    const isTodayCompleted = todayTasks.total > 0 && todayTasks.completed === todayTasks.total;
    
    if (isTodayCompleted && lastStreakUpdateDate !== todayStr) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastStreakUpdateDate(todayStr);
      localStorage.setItem(`zentodo_streak_${currentUser.email}`, newStreak.toString());
      localStorage.setItem(`zentodo_last_streak_date_${currentUser.email}`, todayStr);
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

    const index = new Date().getDate() % pool.length;
    return pool[index];
  };

  const getSuggestedTask = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => !t.completed && t.dueDate <= todayStr);
    
    if (pendingTasks.length === 0) return null;

    const currentHour = new Date().getHours();

    const ranked = [...pendingTasks].sort((a, b) => {
      const pMap = { High: 3, Medium: 2, Low: 1 };
      const pDiff = pMap[b.priority] - pMap[a.priority];
      if (pDiff !== 0) return pDiff;

      const aIsOverdue = a.dueDate < todayStr ? 1 : 0;
      const bIsOverdue = b.dueDate < todayStr ? 1 : 0;
      const overdueDiff = bIsOverdue - aIsOverdue;
      if (overdueDiff !== 0) return overdueDiff;

      const aTimeRelevance = getCategoryTimeScore(a.category, currentHour);
      const bTimeRelevance = getCategoryTimeScore(b.category, currentHour);
      const timeDiff = bTimeRelevance - aTimeRelevance;
      if (timeDiff !== 0) return timeDiff;

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
      currentUser,
      loginWithGoogle,
      logout,
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
