import React, { useState, useEffect } from 'react';
import { THEME } from './constants/config';
import { loadTasks, saveTasks, loadTimerState, clearTimerState } from './utils/storage';
import { playSound } from './utils/sound';
import { useTimer } from './hooks/useTimer';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TaskList } from './components/TaskList';
import { Dashboard } from './components/Dashboard';
import { BreakMode } from './components/BreakMode';

export default function Timer() {
  // 任务状态
  const [tasks, setTasks] = useState(loadTasks);
  const [activeTaskId, setActiveTaskId] = useState(() => loadTimerState().activeId);

  // UI 状态
  const [currentView, setCurrentView] = useState(() =>
    loadTimerState().activeId ? 'dashboard' : 'tasks'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  // 计时器 Hook
  const timer = useTimer(activeTaskId, soundEnabled);

  // 保存任务列表
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // 光标闪烁
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // 点击外部取消删除确认
  useEffect(() => {
    const handleClickOutside = () => setDeleteConfirmId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 获取当前激活的任务
  const activeTask = tasks.find(t => t.id === activeTaskId);

  // 加载任务
  const handleLoadTask = (taskId, e) => {
    e.stopPropagation();
    setActiveTaskId(taskId);
    setTasks(prev => prev.map(t => ({
      ...t,
      status: t.id === taskId ? 'active' : (t.status === 'active' ? 'pending' : t.status)
    })));
    timer.loadNewTask();
    setCurrentView('dashboard');
    if (soundEnabled) playSound('start');
  };

  // 删除任务
  const handleDeleteClick = (taskId, e) => {
    e.stopPropagation();
    if (deleteConfirmId === taskId) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (activeTaskId === taskId) {
        setActiveTaskId(null);
        clearTimerState();
        setCurrentView('tasks');
      }
      setDeleteConfirmId(null);
      if (soundEnabled) playSound('delete');
    } else {
      setDeleteConfirmId(taskId);
      if (soundEnabled) playSound('arm');
    }
  };

  // 完成任务 (从休息模式)
  const handleCompleteTask = () => {
    if (activeTaskId) {
      setTasks(tasks.map(t => t.id === activeTaskId ? { ...t, status: 'done' } : t));
      setActiveTaskId(null);
    }
    timer.completeBreak();
    setCurrentView('tasks');
  };

  // 格式化时间 (用于 Header)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 休息模式
  if (timer.isBreakMode) {
    return (
      <BreakMode
        currentCard={timer.currentCard}
        onComplete={handleCompleteTask}
        onSkip={timer.skipHealthCard}
        onIgnore={timer.ignoreBreak}
      />
    );
  }

  // 主界面
  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.text} font-mono selection:bg-green-500 selection:text-black flex flex-col`}>
      <Header
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        cursorVisible={cursorVisible}
        formatTime={formatTime}
      />

      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        soundEnabled={soundEnabled}
      />

      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {currentView === 'tasks' && (
          <TaskList
            tasks={tasks}
            setTasks={setTasks}
            activeTaskId={activeTaskId}
            setActiveTaskId={setActiveTaskId}
            deleteConfirmId={deleteConfirmId}
            setDeleteConfirmId={setDeleteConfirmId}
            soundEnabled={soundEnabled}
            onLoadTask={handleLoadTask}
            onGoToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            activeTask={activeTask}
            timer={timer}
            deleteConfirmId={deleteConfirmId}
            onDelete={handleDeleteClick}
            setCurrentView={setCurrentView}
            soundEnabled={soundEnabled}
          />
        )}
      </main>
    </div>
  );
}
