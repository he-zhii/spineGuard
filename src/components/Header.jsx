import React from 'react';
import { Terminal, Volume2, VolumeX } from 'lucide-react';
import { THEME } from '../constants/config';

export const Header = ({ soundEnabled, setSoundEnabled, cursorVisible, formatTime }) => {
    return (
        <header className={`border-b ${THEME.border} p-3 flex justify-between items-center bg-black sticky top-0 z-10`}>
            <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5" />
                <span className="font-bold tracking-wider hidden sm:inline">TIMER_V1.0</span>
                <span className="font-bold tracking-wider sm:hidden">T_V1.0</span>
                <span className="animate-pulse">{cursorVisible ? '█' : ' '}</span>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="hover:text-white transition-colors"
                    aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
                >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
                </button>
                <div className="text-[10px] sm:text-xs flex gap-3 text-green-800 font-bold">
                    <span className="hidden sm:inline">MEM: OK</span>
                    <span>UPTIME: {formatTime(Math.floor(performance.now() / 1000))}</span>
                </div>
            </div>
        </header>
    );
};
