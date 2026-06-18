import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { CheckCircle2, Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle } = useTasks();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate a Google Authentication loading delay
    setTimeout(() => {
      const displayName = name.trim() || email.split('@')[0];
      loginWithGoogle(email.trim().toLowerCase(), displayName);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass-card animate-slide-up">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">
              <CheckCircle2 size={24} color="var(--color-primary)" />
            </div>
            <span className="logo-text">ZenTodo</span>
          </div>
          <h1>Plan, Focus, and Complete</h1>
          <p>Login to your secure account to manage your personalized daily routines and checklists.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="login-input-wrapper">
              <Mail size={18} className="login-input-icon" />
              <input 
                type="email" 
                placeholder="you@gmail.com" 
                className="input-field login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name (Optional)</label>
            <div className="login-input-wrapper">
              <User size={18} className="login-input-icon" />
              <input 
                type="text" 
                placeholder="Alex Mercer" 
                className="input-field login-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Connecting to Google...</span>
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="footer-secure">
            <Lock size={12} />
            <span>Simulated Local Authentication</span>
          </div>
          <p>Your tasks are saved securely inside your browser's local storage and can only be accessed using your credentials.</p>
        </div>
      </div>
    </div>
  );
}
