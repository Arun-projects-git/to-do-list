import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Calendar,
  Smile,
  AlertCircle,
  HelpCircle,
  Zap,
  Coffee,
  CheckCircle,
  MessageSquare,
  ArrowRightLeft
} from 'lucide-react';

export default function AIAssistant() {
  const { 
    tasks, 
    carryoverTasks, 
    handleCarryover, 
    dismissCarryover, 
    getSuggestedTask,
    updateTask
  } = useTasks();

  const [currentVibe, setCurrentVibe] = useState('focus'); // focus, quick, clean
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Zen AI Productivity Assistant. I analyze your tasks, streaks, and habits to guide your workflow. What's your focus level right now?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // AI vibe suggestion logic
  const getVibeSuggestion = () => {
    const pending = tasks.filter(t => !t.completed && t.dueDate <= todayStr);
    if (pending.length === 0) return null;

    if (currentVibe === 'focus') {
      // Suggest high-priority Study/Work tasks
      const focusTasks = pending.filter(t => t.priority === 'High' && (t.category === 'Study' || t.category === 'Work'));
      if (focusTasks.length > 0) return focusTasks[0];
      
      const highPrio = pending.filter(t => t.priority === 'High');
      if (highPrio.length > 0) return highPrio[0];
    } else if (currentVibe === 'quick') {
      // Suggest low-priority or personal/leisure tasks
      const quickTasks = pending.filter(t => t.priority === 'Low' || t.category === 'Personal' || t.category === 'Leisure');
      if (quickTasks.length > 0) return quickTasks[0];
    } else if (currentVibe === 'clean') {
      // Suggest overdue tasks first
      const overdue = pending.filter(t => t.dueDate < todayStr);
      if (overdue.length > 0) return overdue[0];
    }
    
    // Fallback to general suggestion
    return getSuggestedTask();
  };

  const activeSuggestion = getVibeSuggestion();

  const handleCarryoverAll = () => {
    const ids = carryoverTasks.map(t => t.id);
    handleCarryover(ids, todayStr);
    
    // Add AI message confirm
    addAIMessage(`Success! I have carried over ${ids.length} pending tasks to your schedule for today.`);
  };

  const handleCarryoverSingle = (id, title) => {
    handleCarryover([id], todayStr);
    addAIMessage(`Carried over "${title}" to today.`);
  };

  const handleStartTask = (task) => {
    updateTask(task.id, { completed: true });
    
    import('canvas-confetti').then((confetti) => {
      confetti.default({ particleCount: 100, spread: 60 });
    });
    
    addAIMessage(`Awesome job completing: "${task.title}"! Keep up the momentum! ✨`);
  };

  // Conversational response logic
  const addAIMessage = (text) => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputText('');

    // AI thinking transition
    setTimeout(() => {
      processUserMessage(userMsg);
    }, 600);
  };

  const processUserMessage = (query) => {
    const q = query.toLowerCase();
    const pending = tasks.filter(t => !t.completed);
    const todayTasks = tasks.filter(t => t.dueDate === todayStr);

    if (q.includes('next') || q.includes('suggest') || q.includes('do now')) {
      const sug = getSuggestedTask();
      if (sug) {
        addAIMessage(`Based on your deadline, priorities, and the time of day, I suggest you work on: "${sug.title}" (${sug.category}). It is a ${sug.priority} priority task. Let's do this! 💪`);
      } else {
        addAIMessage("You have no pending tasks! You're completely free. How about taking some rest or planning for tomorrow?");
      }
    } else if (q.includes('motivation') || q.includes('quote') || q.includes('inspire')) {
      const quotes = [
        "Believe you can and you're halfway there. — Theodore Roosevelt",
        "The secret of getting ahead is getting started. — Mark Twain",
        "It always seems impossible until it's done. — Nelson Mandela",
        "Focus on being productive instead of busy. — Tim Ferriss",
        "Your future self is created by what you do today, not tomorrow."
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      addAIMessage(`Here is your quote of the moment:\n\n"${randomQuote}"`);
    } else if (q.includes('status') || q.includes('how many') || q.includes('how am i')) {
      const completedToday = todayTasks.filter(t => t.completed).length;
      const totalToday = todayTasks.length;
      addAIMessage(`Today, you've completed ${completedToday} out of ${totalToday} tasks. Across all time, you have ${pending.length} pending tasks remaining. Keep working step-by-step!`);
    } else if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
      addAIMessage("Hello! How can I help you organize your day? You can ask me what to do next, for status statistics, or for a motivational quote!");
    } else {
      addAIMessage("I'm not sure I understand that query completely. Try asking 'What should I do next?', 'Show status', or 'Give me motivation'!");
    }
  };

  return (
    <div className="ai-assistant-view animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={24} color="var(--color-primary)" />
            <span>Zen AI Planner</span>
          </h1>
          <p className="page-subtitle">Automatic carryover, workflow suggestions, and dynamic focus vibes.</p>
        </div>
      </div>

      {/* Smart Carryover Notification Banner */}
      {carryoverTasks.length > 0 && (
        <div className="carryover-banner-card glass-card">
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
            {carryoverTasks.map(task => (
              <div key={task.id} className="carryover-item">
                <div className="item-details">
                  <span className="item-title">{task.title}</span>
                  <span className="item-meta">Originally due: {task.dueDate} • {task.category}</span>
                </div>
                <button 
                  onClick={() => handleCarryoverSingle(task.id, task.title)}
                  className="btn-carryover-single"
                  title="Move to Today"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ai-layout-grid">
        {/* Vibe Suggestions Side Panel */}
        <div className="glass-card vibe-panel">
          <h3>Set Your Focus Vibe</h3>
          <p className="vibe-subtext">Pick a vibe and let AI organize the perfect task selection.</p>

          <div className="vibe-buttons-grid">
            <button 
              onClick={() => setCurrentVibe('focus')} 
              className={`vibe-btn ${currentVibe === 'focus' ? 'active focus' : ''}`}
            >
              <Zap size={20} />
              <span>Deep Focus Mode</span>
            </button>
            
            <button 
              onClick={() => setCurrentVibe('quick')} 
              className={`vibe-btn ${currentVibe === 'quick' ? 'active quick' : ''}`}
            >
              <Coffee size={20} />
              <span>Quick Wins Mode</span>
            </button>
            
            <button 
              onClick={() => setCurrentVibe('clean')} 
              className={`vibe-btn ${currentVibe === 'clean' ? 'active clean' : ''}`}
            >
              <Trash2 size={20} />
              <span>Clean Up Mode</span>
            </button>
          </div>

          <hr className="vibe-separator" />

          {/* Vibe Suggested Output */}
          <div className="vibe-suggestion-output">
            <h4>Suggested Target Task</h4>
            {activeSuggestion ? (
              <div className="suggested-vibe-card">
                <span className={`cat-tag ${activeSuggestion.category}`}>{activeSuggestion.category}</span>
                <h5>{activeSuggestion.title}</h5>
                {activeSuggestion.description && <p>{activeSuggestion.description}</p>}
                
                <div className="vibe-card-footer">
                  <div className="vibe-badge-info">
                    <AlertCircle size={12} className={`prio-${activeSuggestion.priority.toLowerCase()}`} />
                    <span>{activeSuggestion.priority} Priority</span>
                  </div>
                  <button 
                    onClick={() => handleStartTask(activeSuggestion)}
                    className="btn btn-primary btn-sm btn-start-vibe"
                  >
                    <CheckCircle size={14} />
                    <span>Complete Now</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="vibe-no-suggestions">
                <Smile size={32} className="vibe-smile-icon" />
                <p>No tasks match this vibe right now. Excellent job!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Conversational Chat Panel */}
        <div className="glass-card chat-panel">
          <div className="chat-header">
            <MessageSquare size={18} color="var(--color-primary)" />
            <h3>Ask Zen AI Assistant</h3>
          </div>

          <div className="chat-messages-container">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-message ${m.sender}`}>
                <div className="message-bubble">{m.text}</div>
                <div className="message-time">{m.time}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input 
              type="text" 
              placeholder="Ask me 'What should I do next?' or for 'Motivation'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field chat-input"
            />
            <button type="submit" className="btn btn-primary chat-send-btn">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
