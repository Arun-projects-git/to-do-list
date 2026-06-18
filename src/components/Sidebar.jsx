import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  BarChart2, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleMobileSidebar }) {
  const { activeTab, setActiveTab, theme, toggleTheme, streak } = useTasks();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'ai-assistant', label: 'AI Planner', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (isOpen) {
      toggleMobileSidebar();
    }
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={toggleMobileSidebar}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <CheckCircle2 size={24} color="var(--color-primary)" />
            </div>
            <span className="logo-text">ZenTodo</span>
          </div>
          <button 
            className="mobile-close-btn"
            onClick={toggleMobileSidebar}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Streak Counter Widget */}
        <div className="sidebar-streak-card">
          <div className="streak-icon-wrapper">
            <Flame size={24} className="streak-flame-icon animate-pulse" />
          </div>
          <div className="streak-details">
            <span className="streak-count">{streak} Day Streak</span>
            <span className="streak-subtext">Keep the flame burning!</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive && <div className="nav-active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon size={20} />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={20} />
                <span>Light Mode</span>
              </>
            )}
          </button>
          <div className="user-profile">
            <div className="user-avatar">U</div>
            <div className="user-info">
              <span className="user-name">Guest User</span>
              <span className="user-role">Student / Professional</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
