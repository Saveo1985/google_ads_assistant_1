import React, { useEffect, useState } from 'react';
import { subscribeToTasks } from '../../firebase';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const unsub = subscribeToTasks(setTasks);
        return () => unsub && unsub();
    }, []);

    return (
        <div className="fade-in">
            <h1>Tasks</h1>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                        <ListTodo size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <p>No tasks yet. Ask the Campaign Assistant to create one for you.</p>
                    </div>
                )}

                {tasks.map(task => (
                    <div key={task.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px' }}>
                        <button className="btn-text" style={{ color: task.status === 'done' ? 'var(--success)' : 'var(--text-secondary)' }}>
                            {task.status === 'done' ? <CheckCircle2 /> : <Circle />}
                        </button>
                        <span style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text-secondary)' : 'white' }}>
                            {task.description}
                        </span>
                        {task.campaignId !== 'general' && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                Campaign Related
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskList;
