import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass animate-fade-in" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: `rgba(${color}, 0.2)`, color: `rgb(${color})` }}>
      <Icon size={24} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>{value}</h3>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'var(--danger)', padding: '2rem' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={ClipboardList} color="59, 130, 246" />
        <StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle} color="16, 185, 129" />
        <StatCard title="In Progress" value={stats.inProgressTasks} icon={Clock} color="245, 158, 11" />
        <StatCard title="Overdue" value={stats.overdueTasks} icon={AlertTriangle} color="239, 68, 68" />
      </div>

      <div className="glass" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h3>Your Focus</h3>
        <p style={{ marginTop: '1rem' }}>You have <strong>{stats.myTasksCount}</strong> tasks currently assigned to you across all projects.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Head over to the Projects tab to view and manage your team's workflow.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
