import React from 'react';
import { GripVertical, Trash2, Terminal, Activity, AlertOctagon, XCircle } from 'lucide-react';
import { TAGS } from '../constants/config';

export const TaskItem = ({
    task,
    index,
    isActive,
    isConfirming,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onDelete,
    onLoad,
    onGoToDashboard,
    isDone = false
}) => {
    if (isDone) {
        // 已完成任务的简化显示
        return (
            <div className="flex gap-2 items-center text-xs text-green-900 hover:text-green-700 group">
                <span>[OK]</span>
                <span className={`text-[9px] border px-1 ${TAGS[task.tag || 'Q2'].color} opacity-50`}>
                    {TAGS[task.tag || 'Q2'].code}
                </span>
                <span className="line-through flex-1">{task.title}</span>
                <button
                    onClick={(e) => onDelete(task.id, e)}
                    className={`transition-opacity ${isConfirming ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500'}`}
                    title="Remove Log"
                >
                    {isConfirming ? "CONFIRM" : <XCircle className="w-3 h-3" />}
                </button>
            </div>
        );
    }

    return (
        <div
            className={`grid grid-cols-12 gap-2 p-3 items-center hover:bg-green-900/10 transition-colors group relative ${isActive ? 'bg-green-900/10' : ''}`}
            onDragEnter={(e) => onDragEnter(e, index)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
        >
            <div
                className="col-span-1 flex justify-center cursor-grab active:cursor-grabbing text-green-900 hover:text-green-500"
                draggable
                onDragStart={(e) => onDragStart(e, index)}
            >
                <GripVertical className="w-4 h-4" />
            </div>
            <div className="col-span-2 flex justify-center">
                <span className={`text-[10px] px-1.5 py-0.5 border ${TAGS[task.tag || 'Q2'].color} font-bold rounded-sm w-12 text-center`}>
                    {TAGS[task.tag || 'Q2'].code}
                </span>
            </div>
            <div className="col-span-7 sm:col-span-7 font-bold text-sm truncate pr-2 flex items-center gap-2">
                {task.title}
                {isActive && <span className="text-[9px] bg-green-500 text-black px-1 animate-pulse">RUNNING</span>}
            </div>
            <div className="col-span-2 text-right flex justify-end gap-2">
                <button
                    onClick={(e) => onDelete(task.id, e)}
                    className={`transition-all duration-200 p-1 flex items-center ${isConfirming ? 'bg-red-900/30 text-red-500 border border-red-800 rounded px-2 w-auto' : 'text-green-700 hover:text-red-500'}`}
                    title="Kill Process"
                >
                    {isConfirming ? (
                        <span className="text-[9px] font-bold whitespace-nowrap animate-pulse flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" /> CONFIRM?
                        </span>
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
                {!isConfirming && (
                    isActive ? (
                        <button onClick={onGoToDashboard} className="text-green-500 hover:text-white p-1">
                            <Activity className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => onLoad(task.id, e)}
                            className="text-green-700 hover:text-green-400 group-hover:scale-110 transition-transform p-1"
                            title="Execute"
                        >
                            <Terminal className="w-4 h-4" />
                        </button>
                    )
                )}
            </div>
        </div>
    );
};
