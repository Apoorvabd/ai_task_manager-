import { useState, useEffect, useContext } from 'react';
import { taskAPI, aiAPI } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Trash2, Wand2, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [newTask, setNewTask] = useState({ title: '', description: '', endDate: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchTasks = async () => {
    try {
      const res = await taskAPI.getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  const fetchTotalTasks = async () => {
    try {
      const res = await taskAPI.getTasksCount();
      setTotalTasks(res.data.count);
    } catch (err) {
      console.error('Error fetching total tasks count', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTotalTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const res = await taskAPI.createTask(newTask);
      setTasks([...tasks, res.data]);
      setNewTask({ title: '', description: '', endDate: '' });
      fetchTotalTasks(); // Refetch count after adding a task
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await taskAPI.updateTask(id, { status: newStatus });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      fetchTotalTasks(); // Refetch count after deleting a task
    } catch (err) {
      console.error(err);
    }
  };

  const handleAIGenerate = async () => {
    if (!newTask.title) {
      alert("Please enter a title first to generate a description.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await aiAPI.generateDescription(newTask.title);
      setNewTask({ ...newTask, description: res.data.description });
    } catch (err) {
      console.error("AI Error:", err);
      alert("AI Generation failed. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTaskCreatedAt = (createdAt) => {
    if (!createdAt) return '';

    const createdDate = new Date(createdAt);
    return `${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatDaysRemaining = (endDate) => {
    if (!endDate) return 'No end date set';

    const targetDate = new Date(endDate);
    const today = new Date();
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffInMs = targetDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Due today';
    if (diffInDays > 0) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} remaining`;
    const overdueDays = Math.abs(diffInDays);
    return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
  };

  const renderColumn = (statusLabel) => {
    const filteredTasks = tasks.filter(t => t.status === statusLabel);
    
    return (
      <div className="task-column">
        <h3 className="column-title">{statusLabel} <span className="task-count">{filteredTasks.length}</span></h3>
        <div className="task-list">
          {filteredTasks.map(task => (
            <div key={task._id} className="task-card">
              <h4>{task.title}</h4>
              <div className="task-meta">
                <span className="task-created">Created: {formatTaskCreatedAt(task.createdAt)}</span>
                <span className="task-deadline">{formatDaysRemaining(task.endDate)}</span>
              </div>
              {task.description && <p>{task.description}</p>}
              <div className="task-actions">
                <select 
                  value={task.status} 
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <button onClick={() => handleDelete(task._id)} className="btn-icon delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="stats-bar">
        <div className="stat-card">
          <h3>Total Tasks Created</h3>
          <p>{totalTasks}</p>
        </div>
      </div>
      <div className="create-task-section">
        <form onSubmit={handleCreateTask} className="create-task-form">
          <input 
            type="text" 
            placeholder="Task Title..." 
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
            className="input-title"
          />
          <div className="desc-container">
            <textarea 
              placeholder="Task Description..." 
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="input-desc"
            />
            <button type="button" onClick={handleAIGenerate} disabled={isGenerating} className="ai-btn" title="Generate with AI">
              {isGenerating ? <RefreshCw size={20} className="spinner" /> : <Wand2 size={20} />}
            </button>
          </div>
          <div className="date-row">
            <label className="date-label">End Date</label>
            <input
              type="date"
              value={newTask.endDate}
              onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
              required
              className="input-date"
            />
          </div>
          <button type="submit" className="btn-primary add-btn">
            <PlusCircle size={20} /> Add Task
          </button>
        </form>
      </div>

      <div className="kanban-board">
        {renderColumn('Todo')}
        {renderColumn('In Progress')}
        {renderColumn('Done')}
      </div>
    </div>
  );
};

export default Dashboard;