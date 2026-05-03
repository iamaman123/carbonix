import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' } : {};
  };

  return (
    <aside className="glass" style={{
      width: '250px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      borderRight: 'var(--glass-border)',
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRadius: '0'
    }}>
      <div style={{ paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ color: 'var(--primary)', textAlign: 'center', fontSize: '1.5rem' }}>TaskFlow</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
          borderRadius: '8px', color: 'var(--text-main)', ...isActive('/')
        }}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/projects" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
          borderRadius: '8px', color: 'var(--text-main)', ...isActive('/projects')
        }}>
          <FolderKanban size={20} />
          Projects
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
