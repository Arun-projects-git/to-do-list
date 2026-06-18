import React from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Download, 
  TrendingUp, 
  BarChart2, 
  Layers, 
  Flame, 
  CheckCircle2, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Analytics() {
  const { tasks, streak } = useTasks();

  // 1. Calculate past 7 days statistics
  const getPast7DaysData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayTasks = tasks.filter(t => t.dueDate === dateStr);
      const total = dayTasks.length;
      const completed = dayTasks.filter(t => t.completed).length;

      data.push({
        dateStr,
        dayName,
        total,
        completed
      });
    }
    return data;
  };

  const weeklyData = getPast7DaysData();
  const maxTasksVal = Math.max(...weeklyData.map(d => Math.max(d.total, 3))); // fallback min height is 3

  // SVG dimensions for weekly completion chart
  const width = 500;
  const height = 220;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 2. Priority statistics
  const getPriorityStats = () => {
    const prios = { High: { total: 0, completed: 0 }, Medium: { total: 0, completed: 0 }, Low: { total: 0, completed: 0 } };
    tasks.forEach(t => {
      if (prios[t.priority]) {
        prios[t.priority].total += 1;
        if (t.completed) prios[t.priority].completed += 1;
      }
    });
    return prios;
  };

  const prioStats = getPriorityStats();

  // 3. Category statistics
  const getCategoryStats = () => {
    const cats = {};
    tasks.forEach(t => {
      if (!cats[t.category]) {
        cats[t.category] = { total: 0, completed: 0 };
      }
      cats[t.category].total += 1;
      if (t.completed) cats[t.category].completed += 1;
    });
    return cats;
  };

  const categoryStats = getCategoryStats();

  // 4. Export CSV function
  const handleExportCSV = () => {
    const headers = [
      'Task ID', 'Title', 'Description', 'Category', 'Priority', 
      'Due Date', 'Due Time', 'Completed', 'Completed At', 'Created Date'
    ];

    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.dueDate,
      t.dueTime,
      t.completed ? 'YES' : 'NO',
      t.completedAt || 'N/A',
      t.createdDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zentodo_tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. Export PDF function (uses a print window styled to look clean and premium)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    
    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    const taskRowHtml = (t) => `
      <tr class="task-row ${t.completed ? 'completed-row' : ''}">
        <td>${t.completed ? '☑' : '☐'}</td>
        <td class="task-title"><strong>${t.title}</strong><div class="desc">${t.description || ''}</div></td>
        <td><span class="badge ${t.category}">${t.category}</span></td>
        <td><span class="badge ${t.priority.toLowerCase()}">${t.priority}</span></td>
        <td>${t.dueDate} @ ${t.dueTime}</td>
      </tr>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>ZenTodo - Productivity Task Report</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            h1 { font-size: 28px; margin-bottom: 5px; color: #4f46e5; }
            .subtitle { font-size: 14px; color: #64748b; margin-bottom: 30px; }
            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
            .card h3 { font-size: 14px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; }
            .card .value { font-size: 32px; font-weight: 700; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { border-bottom: 2px solid #e2e8f0; text-align: left; padding: 12px; color: #475569; font-weight: 600; font-size: 12px; text-transform: uppercase; }
            td { border-bottom: 1px solid #f1f5f9; padding: 12px; font-size: 14px; vertical-align: top; }
            .completed-row { color: #94a3b8; }
            .completed-row .task-title strong { text-decoration: line-through; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
            .badge.high { background: #fef2f2; color: #ef4444; }
            .badge.medium { background: #fffbeb; color: #d97706; }
            .badge.low { background: #eff6ff; color: #2563eb; }
            .badge.Study { background: #ecfeff; color: #0891b2; }
            .badge.Work { background: #e0e7ff; color: #4f46e5; }
            .badge.Health { background: #ecfdf5; color: #059669; }
            .badge.Personal { background: #f0fdf4; color: #16a34a; }
            .desc { font-size: 12px; color: #64748b; margin-top: 4px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>ZenTodo Tasks Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()} • Productivity Metrics & History</div>
          
          <div class="summary-cards">
            <div class="card">
              <h3>Total Tasks</h3>
              <div class="value">${tasks.length}</div>
            </div>
            <div class="card">
              <h3>Completed Tasks</h3>
              <div class="value">${completedTasks.length}</div>
            </div>
            <div class="card">
              <h3>Streak Count</h3>
              <div class="value">${streak} Days</div>
            </div>
          </div>

          <h2>Pending Tasks (${activeTasks.length})</h2>
          <table>
            <thead>
              <tr>
                <th width="40">Status</th>
                <th>Task Title</th>
                <th width="100">Category</th>
                <th width="100">Priority</th>
                <th width="150">Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${activeTasks.length > 0 ? activeTasks.map(taskRowHtml).join('') : '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No pending tasks.</td></tr>'}
            </tbody>
          </table>

          <h2 style="margin-top: 40px;">Completed Tasks (${completedTasks.length})</h2>
          <table>
            <thead>
              <tr>
                <th width="40">Status</th>
                <th>Task Title</th>
                <th width="100">Category</th>
                <th width="100">Priority</th>
                <th width="150">Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${completedTasks.length > 0 ? completedTasks.map(taskRowHtml).join('') : '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No completed tasks yet.</td></tr>'}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Helper values for SVGs
  const getX = (index) => padding + (index * chartWidth) / 6;
  const getY = (value) => height - padding - (value * chartHeight) / maxTasksVal;

  return (
    <div className="analytics-view animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Productivity & Analytics</h1>
          <p className="page-subtitle">Track your streaks, completion rates, and category statistics.</p>
        </div>
        <div className="export-buttons-group">
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button onClick={handleExportPDF} className="btn btn-primary">
            <Download size={16} />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      <div className="analytics-grid-main">
        {/* Weekly Progress Chart */}
        <div className="glass-card chart-card">
          <h3 className="card-section-title">
            <TrendingUp size={18} color="var(--color-primary)" />
            <span>Weekly Productivity Trend</span>
          </h3>

          <div className="svg-chart-container">
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const yVal = padding + ratio * chartHeight;
                return (
                  <g key={i}>
                    <line 
                      x1={padding} 
                      y1={yVal} 
                      x2={width - padding} 
                      y2={yVal} 
                      stroke="var(--border-color)" 
                      strokeDasharray="4 4" 
                      strokeWidth="1"
                    />
                    <text 
                      x={padding - 10} 
                      y={yVal + 4} 
                      fill="var(--text-tertiary)" 
                      fontSize="10" 
                      textAnchor="end"
                    >
                      {Math.round(maxTasksVal - ratio * maxTasksVal)}
                    </text>
                  </g>
                );
              })}

              {/* Weekly Data Points & Lines */}
              {/* Total Tasks Line (Dotted Slate) */}
              <path
                d={weeklyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.total)}`).join(' ')}
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Completed Tasks Line (Solid Indigo) */}
              <path
                d={weeklyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.completed)}`).join(' ')}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Circles and labels */}
              {weeklyData.map((d, i) => (
                <g key={i}>
                  {/* Tooltip background hover area */}
                  <circle 
                    cx={getX(i)} 
                    cy={getY(d.completed)} 
                    r="8" 
                    fill="var(--color-primary)" 
                    opacity="0.1" 
                  />
                  <circle 
                    cx={getX(i)} 
                    cy={getY(d.completed)} 
                    r="4" 
                    fill="var(--color-primary)" 
                    stroke="var(--bg-secondary)" 
                    strokeWidth="1.5" 
                  />
                  {/* Day Name */}
                  <text 
                    x={getX(i)} 
                    y={height - padding + 18} 
                    fill="var(--text-secondary)" 
                    fontSize="11" 
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {d.dayName}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot completed-dot"></span>
              <span>Completed Tasks</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot total-dot"></span>
              <span>Total Scheduled</span>
            </div>
          </div>
        </div>

        {/* Priority Stats Card */}
        <div className="glass-card stat-card-full">
          <h3 className="card-section-title">
            <Layers size={18} color="var(--color-primary)" />
            <span>Completion Rate by Priority</span>
          </h3>

          <div className="bar-stats-container">
            {Object.keys(prioStats).map(prio => {
              const stats = prioStats[prio];
              const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              const barClass = prio.toLowerCase();
              return (
                <div key={prio} className="bar-stat-row">
                  <div className="row-labels">
                    <span className="stat-label-name">{prio} Priority</span>
                    <span className="stat-label-values">{stats.completed}/{stats.total} ({percent}%)</span>
                  </div>
                  <div className="stat-bar-track">
                    <div 
                      className={`stat-bar-fill fill-${barClass}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Grid stats */}
      <div className="glass-card categories-analytics-card">
        <h3 className="card-section-title">
          <BarChart2 size={18} color="var(--color-primary)" />
          <span>Category Performance Metrics</span>
        </h3>
        {Object.keys(categoryStats).length > 0 ? (
          <div className="category-stats-grid">
            {Object.keys(categoryStats).map(cat => {
              const stats = categoryStats[cat];
              const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              return (
                <div key={cat} className="cat-analytics-cell">
                  <span className={`cat-tag ${cat}`}>{cat}</span>
                  <div className="cat-metric-values">
                    <span className="bold-percent">{percent}%</span>
                    <span className="details-txt">{stats.completed} of {stats.total} done</span>
                  </div>
                  <div className="cat-mini-bar">
                    <div 
                      className="cat-mini-fill" 
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: `var(--cat-${cat.toLowerCase()})`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-analytics-text">No category data. Start adding and completing tasks to see metrics!</p>
        )}
      </div>
    </div>
  );
}
