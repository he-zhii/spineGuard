import React from 'react';
import { List, Activity } from 'lucide-react';
import { THEME } from '../constants/config';
import { playSound } from '../utils/sound';

export const Navigation = ({ currentView, setCurrentView, soundEnabled }) => {
    const handleNavClick = (view) => {
        setCurrentView(view);
        if (soundEnabled) playSound();
    };

    return (
        <nav className={`grid grid-cols-2 border-b ${THEME.border}`}>
            <button
                onClick={() => handleNavClick('tasks')}
                className={`py-3 text-center border-r ${THEME.border} hover:bg-green-900/10 transition-colors flex items-center justify-center gap-2 text-sm ${currentView === 'tasks' ? 'bg-green-900/20 text-green-400' : 'text-green-800'}`}
            >
                <List className="w-4 h-4" /> TASKS
            </button>
            <button
                onClick={() => handleNavClick('dashboard')}
                className={`py-3 text-center hover:bg-green-900/10 transition-colors flex items-center justify-center gap-2 text-sm ${currentView === 'dashboard' ? 'bg-green-900/20 text-green-400' : 'text-green-800'}`}
            >
                <Activity className="w-4 h-4" /> MONITOR
            </button>
        </nav>
    );
};
