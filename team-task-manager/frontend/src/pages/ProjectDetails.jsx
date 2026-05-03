import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Plus, UserPlus, Clock } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Forms
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found</div>;

  const isAdmin = project.admin._id === user._id;

  const TaskColumn = ({ title, status }) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="glass" style={{ flex: 1, padding: '1rem', minWidth: '300px' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title} <span className="badge badge-todo" style={{ background: 'var(--bg-dark)' }}>{columnTasks.length}</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {columnTasks.map(task => (
            <div key={task._id} className="glass" style={{ padding: '1rem', backgroundColor: 'rgba(15,23,42,0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                <span className={`badge ${task.priority === 'High' ? 'badge-todo' : 'badge-progress'}`} 
                      style={{ color: task.priority === 'High' ? 'var(--danger)' : '' }}>
                  {task.priority}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{task.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {task.dueDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </span>
                )}
                <select 
                  value={task.status} 
                  onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                  style={{ padding: '0.25rem', width: 'auto', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}
                  disabled={!isAdmin && (!task.assignedTo || task.assignedTo._id !== user._id)}
                >
                  <option value="To Do" style={{color:'black'}}>To Do</option>
                  <option value="In Progress" style={{color:'black'}}>In Progress</option>
                  <option value="Done" style={{color:'black'}}>Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <>
              <button onClick={() => setShowMemberModal(true)} className="btn btn-outline">
                <UserPlus size={18} /> Add Member
              </button>
              <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
                <Plus size={18} /> Create Task
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        <TaskColumn title="To Do" status="To Do" />
        <TaskColumn title="In Progress" status="In Progress" />
        <TaskColumn title="Done" status="Done" />
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>User Email</label>
                <input type="email" required value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                <textarea rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
