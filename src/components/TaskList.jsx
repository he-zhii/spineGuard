import React, { useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { TAGS, THEME } from '../constants/config';
import { playSound } from '../utils/sound';
import { TaskItem } from './TaskItem';

export const TaskList = ({
    tasks,
    setTasks,
    activeTaskId,
    setActiveTaskId,
    deleteConfirmId,
    setDeleteConfirmId,
    soundEnabled,
    onLoadTask,
    onGoToDashboard
}) => {
    const [newTaskInput, setNewTaskInput] = React.useState('');
    const [newTaskTag, setNewTaskTag] = React.useState('Q2');
    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskInput.trim()) return;
        const newTask = {
            id: Date.now().toString(),
            title: newTaskInput,
            status: 'pending',
            tag: newTaskTag
        };
        setTasks([newTask, ...tasks]);
        setNewTaskInput('');
        if (soundEnabled) playSound('click');
    };

    const cycleTag = (e) => {
        e.preventDefault();
        const tagKeys = ['Q1', 'Q2', 'Q3', 'Q4'];
        const currentIndex = tagKeys.indexOf(newTaskTag);
        const nextIndex = (currentIndex + 1) % tagKeys.length;
        setNewTaskTag(tagKeys[nextIndex]);
        if (soundEnabled) playSound('click');
    };

    const handleDeleteClick = (taskId, e) => {
        e.stopPropagation();
        if (deleteConfirmId === taskId) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            if (activeTaskId === taskId) {
                setActiveTaskId(null);
            }
            setDeleteConfirmId(null);
            if (soundEnabled) playSound('delete');
        } else {
            setDeleteConfirmId(taskId);
            if (soundEnabled) playSound('arm');
        }
    };

    const clearHistory = (e) => {
        e.stopPropagation();
        if (window.confirm('Execute history -c (Clear all completed)?')) {
            setTasks(prev => prev.filter(t => t.status !== 'done'));
            if (soundEnabled) playSound('delete');
        }
    };

    const handleSort = () => {
        let _tasks = [...tasks];
        const draggedItemContent = _tasks.splice(dragItem.current, 1)[0];
        _tasks.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setTasks(_tasks);
    };

    const handleDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        handleSort();
    };

    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="animate-in slide-in-from-left-4 fade-in duration-300">
            {/* 添加任务表单 */}
            <div className="mb-8">
                <label className="text-[10px] text-green-800 mb-1 block uppercase tracking-widest">
          // Initialize New Process
                </label>
                <form onSubmit={handleAddTask} className="flex relative group items-stretch">
                    <button
                        type="button"
                        onClick={cycleTag}
                        className={`px-3 border border-green-800 border-r-0 flex items-center gap-1 text-xs font-bold transition-colors w-24 justify-center ${TAGS[newTaskTag].color.split(' ')[0]} hover:bg-green-900/20`}
                    >
                        [{TAGS[newTaskTag].code}]
                    </button>
                    <input
                        type="text"
                        value={newTaskInput}
                        onChange={e => setNewTaskInput(e.target.value)}
                        className={`flex-1 ${THEME.input} p-3 text-sm sm:text-base rounded-none transition-all group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.1)]`}
                        placeholder="Enter task name..."
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="border border-green-800 border-l-0 px-4 sm:px-6 hover:bg-green-900/30 text-xs font-bold transition-colors"
                    >
                        ENTER
                    </button>
                </form>
                <div className="text-[10px] text-green-900 mt-2 flex gap-4">
                    <span>* Tip: Drag handle [::] to reorder.</span>
                </div>
            </div>

            {/* 任务列表 */}
            <div className="border border-green-800 bg-black">
                <div className="grid grid-cols-12 gap-2 p-2 border-b border-green-900 text-[10px] text-green-800 uppercase font-bold tracking-wider bg-green-900/5">
                    <div className="col-span-1 text-center">DRAG</div>
                    <div className="col-span-2 text-center">TAG</div>
                    <div className="col-span-7 sm:col-span-7">COMMAND</div>
                    <div className="col-span-2 text-right">OP</div>
                </div>
                <div className="divide-y divide-green-900/30">
                    {pendingTasks.length === 0 && (
                        <div className="p-8 text-center text-green-900 text-xs font-mono">
                            [NULL] No active processes. Input command above.
                        </div>
                    )}
                    {tasks.map((task, idx) => {
                        if (task.status === 'done') return null;
                        return (
                            <TaskItem
                                key={task.id}
                                task={task}
                                index={idx}
                                isActive={activeTaskId === task.id}
                                isConfirming={deleteConfirmId === task.id}
                                onDragStart={handleDragStart}
                                onDragEnter={handleDragEnter}
                                onDragEnd={handleDragEnd}
                                onDelete={handleDeleteClick}
                                onLoad={onLoadTask}
                                onGoToDashboard={onGoToDashboard}
                            />
                        );
                    })}
                </div>
            </div>

            {/* 历史记录 */}
            {doneTasks.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-end mb-2 border-b border-green-900/30 pb-1">
                        <h3 className="text-[10px] text-green-800 uppercase tracking-widest">// Execution Log</h3>
                        <button
                            onClick={clearHistory}
                            className="text-[10px] text-green-800 hover:text-red-500 flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" /> CLEAR_ALL
                        </button>
                    </div>
                    <div className="space-y-1">
                        {doneTasks.map(t => (
                            <TaskItem
                                key={t.id}
                                task={t}
                                isDone={true}
                                isConfirming={deleteConfirmId === t.id}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
