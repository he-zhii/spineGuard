import React from 'react';
import { RotateCcw, Skull, AlertOctagon, Monitor, ChevronRight } from 'lucide-react';
import { TAGS, FOCUS_TIME_OPTIONS } from '../constants/config';
import { playSound } from '../utils/sound';

export const Dashboard = ({
    activeTask,
    timer,
    deleteConfirmId,
    onDelete,
    setCurrentView,
    soundEnabled
}) => {
    const {
        timerDuration,
        timeLeft,
        isRunning,
        isRecovered,
        startTimer,
        pauseTimer,
        resetTimer,
        setDuration,
        formatTime,
        renderProgressBar,
        progressPercent,
    } = timer;

    // 空状态 - 无激活任务
    if (!activeTask) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in zoom-in-95 duration-300">
                <div className="w-full max-w-xl border border-green-900/30 bg-black/50 p-12 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

                    <Monitor className="w-16 h-16 text-green-900 mx-auto mb-6 group-hover:text-green-500 transition-colors duration-500" />
                    <h2 className="text-xl font-bold mb-2 text-green-600 tracking-widest">SYSTEM STANDBY</h2>
                    <p className="text-xs text-green-800 mb-8 font-mono">
                        AWAITING COMMAND INPUT...<br />
                        NO ACTIVE PROCESS DETECTED.
                    </p>

                    <button
                        onClick={() => setCurrentView('tasks')}
                        className="inline-flex items-center gap-2 border border-green-800 text-green-500 px-8 py-3 hover:bg-green-500 hover:text-black transition-all uppercase tracking-widest font-bold text-xs"
                    >
                        Select / Create Task <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    }

    const handleCustomDuration = (e, isBlur = false) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            // 限制最大 180 分钟
            const validVal = Math.min(val, 180);
            setDuration(validVal * 60);
            if (!isBlur) e.target.blur();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in zoom-in-95 duration-300">
            <div className="w-full max-w-xl border-2 border-green-800 bg-black relative shadow-[0_0_30px_rgba(22,163,74,0.1)]">
                {/* 状态栏 */}
                <div className="bg-green-900/10 p-2 flex justify-between text-[10px] text-green-600 border-b border-green-900">
                    <span>PID: {activeTask.id.slice(-6)}</span>
                    <span>PRIORITY: {TAGS[activeTask.tag || 'Q2'].code}</span>
                    <span className={isRunning ? "text-green-400 animate-pulse" : ""}>
                        {isRunning ? "STATE: EXEC" : "STATE: SUSPEND"}
                    </span>
                </div>

                {/* 主内容 */}
                <div className="p-8 sm:p-12 text-center">
                    <div className="text-xs text-green-800 uppercase tracking-[0.4em] mb-4">Target Process</div>
                    <h1 className="text-2xl sm:text-3xl font-bold break-words mb-10 text-white">{activeTask.title}</h1>

                    {/* 恢复提示 */}
                    {isRecovered && !isRunning && (
                        <div className="mb-6 p-3 border border-yellow-800 bg-yellow-900/10 text-yellow-500 text-xs">
                            ⚠️ RECOVERED SESSION: Timer was paused at {formatTime(timeLeft)}. Press EXECUTE to continue.
                        </div>
                    )}

                    {/* 时间显示 */}
                    <div className="relative mb-10">
                        <div className="text-[5rem] sm:text-[7rem] leading-none font-bold tracking-tighter tabular-nums font-mono text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* 进度条 */}
                    <div className="font-mono text-[10px] sm:text-xs text-green-700 whitespace-pre overflow-hidden text-center mb-8">
                        {renderProgressBar()}
                        <div className="mt-1 text-green-900">{progressPercent}% COMPLETE</div>
                    </div>

                    {/* 控制按钮 */}
                    <div className="flex justify-center gap-4">
                        {!isRunning ? (
                            <button
                                onClick={startTimer}
                                className="px-8 py-4 bg-green-600 text-black font-bold hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all uppercase tracking-wider"
                            >
                                [ EXECUTE ]
                            </button>
                        ) : (
                            <button
                                onClick={pauseTimer}
                                className="px-8 py-4 bg-black border border-green-600 text-green-500 font-bold hover:bg-green-900/20 animate-pulse uppercase tracking-wider"
                            >
                                [ PAUSE ]
                            </button>
                        )}
                        <button
                            onClick={resetTimer}
                            className="px-4 border border-green-900 text-green-800 hover:text-green-500 hover:border-green-500 transition-colors"
                            title="Reset Counter"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 删除按钮 */}
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={(e) => onDelete(activeTask.id, e)}
                            className={`p-2 transition-colors hover:bg-red-900/20 rounded-full ${deleteConfirmId === activeTask.id ? 'text-red-500 bg-red-900/20' : 'text-green-900 hover:text-red-500'}`}
                            title="TERMINATE PROCESS (DELETE)"
                        >
                            {deleteConfirmId === activeTask.id ? <AlertOctagon className="w-4 h-4 animate-pulse" /> : <Skull className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* 时长选择器 - 仅在暂停且未开始时显示 */}
                {!isRunning && timeLeft === timerDuration && (
                    <div className="flex justify-center items-center gap-2 border-t border-green-900/30 p-2 bg-green-900/5 flex-wrap">
                        {FOCUS_TIME_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setDuration(opt.value)}
                                className={`text-[10px] px-3 py-1 border border-transparent ${timerDuration === opt.value ? 'bg-green-900 text-green-300 border-green-800' : 'text-green-900 hover:text-green-600 hover:border-green-900'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                        <div className="flex items-center gap-1 border-l border-green-900/30 pl-2 ml-1">
                            <span className="text-[10px] text-green-900">CUSTOM:</span>
                            <input
                                type="number"
                                min="1"
                                max="180"
                                placeholder="MIN"
                                className="w-12 bg-black border border-green-900 text-[10px] text-green-500 text-center focus:border-green-500 focus:outline-none py-1 placeholder-green-900"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCustomDuration(e, false);
                                    }
                                }}
                                onBlur={(e) => handleCustomDuration(e, true)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
