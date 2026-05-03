import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem',
      marginBottom: '2rem',
      borderRadius: '12px'
    }} className="glass">
      <div>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Team Task Manager</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-muted)' }}>{user?.name}</span>
        </div>
        <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
