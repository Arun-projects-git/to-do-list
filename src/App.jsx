import React, { useState } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import AIAssistant from './components/AIAssistant';
import Analytics from './components/Analytics';
import { Menu, Sparkles, Flame, CheckSquare } from 'lucide-react';

function AppContent() {
  const { activeTab, streak } = useTasks();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskList />;
      case 'calendar':
        return <CalendarView />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-top-header">
        <button 
          onClick={toggleMobileSidebar}
          className="mobile-menu-toggle-btn"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
        <div className="mobile-logo-text">ZenTodo</div>
        <div className="mobile-header-actions">
          <div className="mobile-streak-badge">
            <Flame size={18} className="streak-flame-icon animate-pulse" />
            <span>{streak}</span>
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        toggleMobileSidebar={toggleMobileSidebar} 
      />

      {/* Main Panel Content Area */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
