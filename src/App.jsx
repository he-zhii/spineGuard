import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, List, AlertTriangle, Trash2, RotateCcw, Volume2, VolumeX, SkipForward, Power, GripVertical, XCircle, Skull, AlertOctagon, Clock, Monitor, ChevronRight } from 'lucide-react';

// --- 配置常量 ---
const HEALTH_CARDS = [
  {
    id: 1,
    title: "SYSTEM_ALERT: ORTHOSTATIC_RISK",
    cmd: "sudo run ankle_pump.exe",
    duration: "60s",
    logs: [
      "> WARNING: Blood pooling detected in lower limbs.",
      "> ACTION: Sit down. Do not stand up yet.",
      "> EXECUTE: Dorsiflex ankles (hook toes) x15.",
      "> EXECUTE: Stomp feet firmly x15.",
      "> STATUS: Repumping blood to cerebral cortex..."
    ]
  },
  {
    id: 2,
    title: "SYSTEM_ALERT: CERVICAL_STRAIN",
    cmd: "sudo run neck_retraction.sh",
    duration: "90s",
    logs: [
      "> ERROR: Cervical spine curvature critical.",
      "> ACTION: Chin tuck maneuver required.",
      "> EXECUTE: Retract chin horizontally (make double chin).",
      "> HOLD: 5000ms per repetition.",
      "> LOOP: 10 times.",
      "> RESULT: Decompressing posterior nerve roots..."
    ]
  },
  {
    id: 3,
    title: "SYSTEM_ALERT: OCULAR_FATIGUE",
    cmd: "sudo run gaze_reset.py",
    duration: "45s",
    logs: [
      "> WARNING: Ciliary muscle spasm detected.",
      "> ACTION: Look at distance object (5m+ away).",
      "> EXECUTE: Trace an imaginary '8' with eyes.",
      "> EXECUTE: Blink rapidly for 10 seconds.",
      "> STATUS: Refocusing optical sensors..."
    ]
  }
];

const TAGS = {
  Q1: { code: 'CRIT', label: 'Critical (Do Now)', color: 'text-red-500 border-red-900 bg-red-900/10' },
  Q2: { code: 'PLAN', label: 'Plan (Schedule)', color: 'text-green-500 border-green-800 bg-green-900/10' },
  Q3: { code: 'INT',  label: 'Interrupt (Delegate)', color: 'text-yellow-500 border-yellow-900 bg-yellow-900/10' },
  Q4: { code: 'TRIV', label: 'Trivial (Later)', color: 'text-slate-500 border-slate-800 bg-slate-900/10' },
};

const FOCUS_TIME_OPTIONS = [
  { label: "25M", value: 25 * 60 },
  { label: "30M", value: 30 * 60 },
  { label: "45M", value: 45 * 60 },
];

const THEME = {
  bg: "bg-black",
  text: "text-green-500",
  textDim: "text-green-900",
  border: "border-green-800",
  input: "bg-black border border-green-800 text-green-500 font-mono focus:border-green-500 focus:outline-none placeholder-green-900",
};

const playSound = (type = 'beep') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'alarm') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'delete') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'arm') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) { console.error(e); }
};

export default function SpineGuardCLI() {
  // --- 状态初始化 (从 LocalStorage 读取) ---
  
  // 1. 读取任务列表
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('spineguard_tasks');
    return saved ? JSON.parse(saved) : [
        { id: 'init_1', title: 'deploy_black_myth_wukong.exe', status: 'pending', tag: 'Q1' },
        { id: 'init_2', title: 'sys_check_cervical_spine', status: 'pending', tag: 'Q2' },
    ];
  });

  // 2. 读取当前激活的任务 ID
  const [activeTaskId, setActiveTaskId] = useState(() => {
    return localStorage.getItem('spineguard_active_id') || null;
  });

  // 3. 读取视图状态 (如果有 activeTask，刷新后直接进 dashboard)
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('spineguard_active_id') ? 'dashboard' : 'tasks';
  });

  // 4. 读取计时器状态
  const [timerDuration, setTimerDuration] = useState(() => {
    return parseInt(localStorage.getItem('spineguard_duration')) || 45 * 60;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    return parseInt(localStorage.getItem('spineguard_time_left')) || 45 * 60;
  });

  // 其他 UI 状态
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('Q2'); 
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [isRunning, setIsRunning] = useState(false); // 刷新后默认为暂停，防止时间跑乱
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  // --- 持久化存储 Effect ---
  
  // 保存任务列表
  useEffect(() => {
    localStorage.setItem('spineguard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // 保存当前任务状态 (核心修复)
  useEffect(() => {
    if (activeTaskId) {
        localStorage.setItem('spineguard_active_id', activeTaskId);
        localStorage.setItem('spineguard_duration', timerDuration.toString());
        localStorage.setItem('spineguard_time_left', timeLeft.toString());
    } else {
        // 如果没有任务，清除状态
        localStorage.removeItem('spineguard_active_id');
        localStorage.removeItem('spineguard_duration');
        localStorage.removeItem('spineguard_time_left');
    }
  }, [activeTaskId, timerDuration, timeLeft]);

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

  // Title 更新
  useEffect(() => {
    if (isRunning) {
      const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const sec = (timeLeft % 60).toString().padStart(2, '0');
      document.title = `[${min}:${sec}] RUNNING...`;
    } else if (isBreakMode) {
      document.title = "!!! SYSTEM ALERT !!!";
    } else {
      document.title = "SpineGuard CLI";
    }
  }, [timeLeft, isRunning, isBreakMode]);

  // 倒计时逻辑
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // --- 业务逻辑 ---

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
    if(soundEnabled) playSound('click');
  };

  const cycleTag = (e) => {
    e.preventDefault();
    const tags = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentIndex = tags.indexOf(newTaskTag);
    const nextIndex = (currentIndex + 1) % tags.length;
    setNewTaskTag(tags[nextIndex]);
    if(soundEnabled) playSound('click');
  };

  const handleDeleteClick = (taskId, e) => {
    e.stopPropagation();
    if (deleteConfirmId === taskId) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        if (activeTaskId === taskId) {
            setActiveTaskId(null);
            setIsRunning(false);
            setCurrentView('tasks');
        }
        setDeleteConfirmId(null);
        if(soundEnabled) playSound('delete');
    } else {
        setDeleteConfirmId(taskId);
        if(soundEnabled) playSound('arm');
    }
  };

  const clearHistory = (e) => {
      e.stopPropagation();
      if(window.confirm('Execute history -c (Clear all completed)?')) {
          setTasks(prev => prev.filter(t => t.status !== 'done'));
          if(soundEnabled) playSound('delete');
      }
  };

  const loadTask = (taskId, e) => {
    e.stopPropagation();
    setActiveTaskId(taskId);
    setTasks(prev => prev.map(t => ({
      ...t, 
      status: t.id === taskId ? 'active' : (t.status === 'active' ? 'pending' : t.status)
    })));
    // 重置时间为默认，或者如果你想保留之前的剩余时间逻辑，这里可以调整
    // 此处逻辑：新加载任务重置时间
    setTimerDuration(45 * 60);
    setTimeLeft(45 * 60);
    
    setCurrentView('dashboard');
    setIsRunning(false); // 刚加载不自动开始，等待用户指令
    if(soundEnabled) playSound('start');
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
  const handleDragEnter = (e, index) => { dragOverItem.current = index; };
  const handleDragEnd = () => { handleSort(); };

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsBreakMode(true);
    setActiveCardIndex(Math.floor(Math.random() * HEALTH_CARDS.length));
    if (soundEnabled) {
        let count = 0;
        const alarmInterval = setInterval(() => {
            playSound('alarm');
            count++;
            if (count > 2) clearInterval(alarmInterval);
        }, 800);
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("SYSTEM ALERT: TIME UP", {
        body: "Please stand up immediately. Muscle ischemia detected.",
        icon: "/favicon.ico"
      });
    }
  };

  const completeActiveTask = () => {
    if (activeTaskId) {
      setTasks(tasks.map(t => t.id === activeTaskId ? { ...t, status: 'done' } : t));
      setActiveTaskId(null);
    }
    setIsBreakMode(false);
    // 重置时间
    setTimerDuration(45*60);
    setTimeLeft(45*60);
    setCurrentView('tasks');
    if(soundEnabled) playSound('start');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerDuration);
  };

  const skipHealthCard = () => {
      setActiveCardIndex((prev) => (prev + 1) % HEALTH_CARDS.length);
      if(soundEnabled) playSound('click');
  };

  const renderProgressBar = () => {
    const totalBars = 30; 
    const progress = (timerDuration - timeLeft) / timerDuration;
    const filledBars = Math.floor(progress * totalBars);
    const emptyBars = totalBars - filledBars;
    return `[${'#'.repeat(filledBars)}${'-'.repeat(emptyBars)}]`;
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const currentCard = HEALTH_CARDS[activeCardIndex];

  // --- View: Break Mode ---
  if (isBreakMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 p-6 font-mono flex flex-col items-center justify-center text-green-500 animate-in fade-in duration-200">
        <div className="w-full max-w-2xl border-2 border-green-500 bg-black shadow-[0_0_80px_rgba(34,197,94,0.15)] relative flex flex-col max-h-[90vh]">
            <div className="bg-red-900/20 border-b border-red-900/50 p-4 flex items-center gap-3 animate-pulse">
                <AlertTriangle className="text-red-500 w-8 h-8" />
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-red-500 tracking-wider">SYSTEM INTERRUPT</h1>
                    <p className="text-xs text-red-400">SESSION EXPIRED: IMMEDIATE ACTION REQUIRED</p>
                </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
                <h2 className="text-xl font-bold mb-4 text-green-400">
                    &gt; {currentCard.title}
                </h2>
                <div className="font-mono text-sm border border-green-900 p-4 bg-green-900/10 mb-6 rounded">
                    <p className="mb-3 text-green-300 font-bold">$ {currentCard.cmd}</p>
                    {currentCard.logs.map((log, i) => (
                        <p key={i} className="mb-1 opacity-80 leading-relaxed hover:text-white transition-colors">
                            {log}
                        </p>
                    ))}
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={completeActiveTask} className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group">
                        <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        [ EXECUTE RECOVERY & FINISH ]
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={skipHealthCard} className="border border-green-800 text-green-700 hover:border-green-500 hover:text-green-500 py-3 text-xs uppercase flex items-center justify-center gap-2">
                            <SkipForward className="w-4 h-4" /> Try Different Action
                        </button>
                        <button onClick={() => { setIsBreakMode(false); resetTimer(); }} className="border border-green-800 text-green-700 hover:border-red-500 hover:text-red-500 py-3 text-xs uppercase">
                            &lt; Ignore (Risk High) /&gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- View: Main Application ---
  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.text} font-mono selection:bg-green-500 selection:text-black flex flex-col`}>
      
      {/* Top Status Bar */}
      <header className={`border-b ${THEME.border} p-3 flex justify-between items-center bg-black sticky top-0 z-10`}>
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5" />
          <span className="font-bold tracking-wider hidden sm:inline">SPINE_GUARD_V3.6</span>
          <span className="font-bold tracking-wider sm:hidden">SG_V3.6</span>
          <span className="animate-pulse">{cursorVisible ? '█' : ' '}</span>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="hover:text-white transition-colors">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
            <div className="text-[10px] sm:text-xs flex gap-3 text-green-800 font-bold">
                <span className="hidden sm:inline">MEM: OK</span>
                <span>UPTIME: {formatTime(Math.floor(performance.now()/1000))}</span>
            </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`grid grid-cols-2 border-b ${THEME.border}`}>
        <button 
            onClick={() => { setCurrentView('tasks'); if(soundEnabled) playSound(); }}
            className={`py-3 text-center border-r ${THEME.border} hover:bg-green-900/10 transition-colors flex items-center justify-center gap-2 text-sm ${currentView === 'tasks' ? 'bg-green-900/20 text-green-400' : 'text-green-800'}`}
        >
            <List className="w-4 h-4" /> TASKS
        </button>
        <button 
            onClick={() => { 
                // 修复：不再报错，直接允许进入 Dashboard，显示空状态
                setCurrentView('dashboard'); 
                if(soundEnabled) playSound(); 
            }}
            className={`py-3 text-center hover:bg-green-900/10 transition-colors flex items-center justify-center gap-2 text-sm ${currentView === 'dashboard' ? 'bg-green-900/20 text-green-400' : 'text-green-800'}`}
        >
            <Activity className="w-4 h-4" /> MONITOR
        </button>
      </nav>

      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        
        {/* VIEW: TASK MANAGER */}
        {currentView === 'tasks' && (
            <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                <div className="mb-8">
                    <label className="text-[10px] text-green-800 mb-1 block uppercase tracking-widest">// Initialize New Process</label>
                    <form onSubmit={handleAddTask} className="flex relative group items-stretch">
                        <button type="button" onClick={cycleTag} className={`px-3 border border-green-800 border-r-0 flex items-center gap-1 text-xs font-bold transition-colors w-24 justify-center ${TAGS[newTaskTag].color.split(' ')[0]} hover:bg-green-900/20`}>
                            [{TAGS[newTaskTag].code}]
                        </button>
                        <input type="text" value={newTaskInput} onChange={e => setNewTaskInput(e.target.value)} className={`flex-1 ${THEME.input} p-3 text-sm sm:text-base rounded-none transition-all group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.1)]`} placeholder="Enter task name..." autoFocus />
                        <button type="submit" className="border border-green-800 border-l-0 px-4 sm:px-6 hover:bg-green-900/30 text-xs font-bold transition-colors">ENTER</button>
                    </form>
                    <div className="text-[10px] text-green-900 mt-2 flex gap-4"><span>* Tip: Drag handle [::] to reorder.</span></div>
                </div>

                <div className="border border-green-800 bg-black">
                    <div className="grid grid-cols-12 gap-2 p-2 border-b border-green-900 text-[10px] text-green-800 uppercase font-bold tracking-wider bg-green-900/5">
                        <div className="col-span-1 text-center">DRAG</div>
                        <div className="col-span-2 text-center">TAG</div>
                        <div className="col-span-7 sm:col-span-7">COMMAND</div>
                        <div className="col-span-2 text-right">OP</div>
                    </div>
                    <div className="divide-y divide-green-900/30">
                        {tasks.filter(t => t.status !== 'done').length === 0 && (
                            <div className="p-8 text-center text-green-900 text-xs font-mono">[NULL] No active processes. Input command above.</div>
                        )}
                        {tasks.map((task, idx) => {
                            if (task.status === 'done') return null;
                            const isConfirming = deleteConfirmId === task.id;
                            const isActive = activeTaskId === task.id;
                            return (
                                <div key={task.id} className={`grid grid-cols-12 gap-2 p-3 items-center hover:bg-green-900/10 transition-colors group relative ${isActive ? 'bg-green-900/10' : ''}`} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}>
                                    <div className="col-span-1 flex justify-center cursor-grab active:cursor-grabbing text-green-900 hover:text-green-500" draggable onDragStart={(e) => handleDragStart(e, idx)}>
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                         <span className={`text-[10px] px-1.5 py-0.5 border ${TAGS[task.tag || 'Q2'].color} font-bold rounded-sm w-12 text-center`}>{TAGS[task.tag || 'Q2'].code}</span>
                                    </div>
                                    <div className="col-span-7 sm:col-span-7 font-bold text-sm truncate pr-2 flex items-center gap-2">
                                        {task.title}
                                        {isActive && <span className="text-[9px] bg-green-500 text-black px-1 animate-pulse">RUNNING</span>}
                                    </div>
                                    <div className="col-span-2 text-right flex justify-end gap-2">
                                        <button onClick={(e) => handleDeleteClick(task.id, e)} className={`transition-all duration-200 p-1 flex items-center ${isConfirming ? 'bg-red-900/30 text-red-500 border border-red-800 rounded px-2 w-auto' : 'text-green-700 hover:text-red-500'}`} title="Kill Process">
                                            {isConfirming ? <span className="text-[9px] font-bold whitespace-nowrap animate-pulse flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> CONFIRM?</span> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                        {!isConfirming && (
                                            isActive ? (
                                                <button onClick={() => setCurrentView('dashboard')} className="text-green-500 hover:text-white p-1"><Activity className="w-4 h-4" /></button>
                                            ) : (
                                                <button onClick={(e) => loadTask(task.id, e)} className="text-green-700 hover:text-green-400 group-hover:scale-110 transition-transform p-1" title="Execute"><Terminal className="w-4 h-4" /></button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* History Log */}
                {tasks.some(t => t.status === 'done') && (
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-2 border-b border-green-900/30 pb-1">
                            <h3 className="text-[10px] text-green-800 uppercase tracking-widest">// Execution Log</h3>
                            <button onClick={clearHistory} className="text-[10px] text-green-800 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3 h-3" /> CLEAR_ALL</button>
                        </div>
                        <div className="space-y-1">
                            {tasks.filter(t => t.status === 'done').map(t => {
                                const isConfirming = deleteConfirmId === t.id;
                                return (
                                <div key={t.id} className="flex gap-2 items-center text-xs text-green-900 hover:text-green-700 group">
                                    <span>[OK]</span>
                                    <span className={`text-[9px] border px-1 ${TAGS[t.tag || 'Q2'].color} opacity-50`}>{TAGS[t.tag || 'Q2'].code}</span>
                                    <span className="line-through flex-1">{t.title}</span>
                                    <button onClick={(e) => handleDeleteClick(t.id, e)} className={`transition-opacity ${isConfirming ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500'}`} title="Remove Log">
                                        {isConfirming ? "CONFIRM" : <XCircle className="w-3 h-3" />}
                                    </button>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* VIEW: DASHBOARD (Updated Logic) */}
        {currentView === 'dashboard' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in zoom-in-95 duration-300">
                {activeTask ? (
                    // 1. 正常运行状态 (Active State)
                    <div className="w-full max-w-xl border-2 border-green-800 bg-black relative shadow-[0_0_30px_rgba(22,163,74,0.1)]">
                        <div className="bg-green-900/10 p-2 flex justify-between text-[10px] text-green-600 border-b border-green-900">
                                <span>PID: {activeTask.id.slice(-6)}</span>
                                <span>PRIORITY: {TAGS[activeTask.tag || 'Q2'].code}</span>
                                <span className={isRunning ? "text-green-400 animate-pulse" : ""}>{isRunning ? "STATE: EXEC" : "STATE: SUSPEND"}</span>
                        </div>
                        <div className="p-8 sm:p-12 text-center">
                            <div className="text-xs text-green-800 uppercase tracking-[0.4em] mb-4">Target Process</div>
                            <h1 className="text-2xl sm:text-3xl font-bold break-words mb-10 text-white glow-text">{activeTask.title}</h1>
                            <div className="relative mb-10">
                                <div className="text-[5rem] sm:text-[7rem] leading-none font-bold tracking-tighter tabular-nums font-mono text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                            <div className="font-mono text-[10px] sm:text-xs text-green-700 whitespace-pre overflow-hidden text-center mb-8">
                                    {renderProgressBar()}
                                    <div className="mt-1 text-green-900">{(100 - (timeLeft/timerDuration)*100).toFixed(1)}% COMPLETE</div>
                            </div>
                            <div className="flex justify-center gap-4">
                                {!isRunning ? (
                                    <button onClick={() => { setIsRunning(true); if(soundEnabled) playSound('start'); }} className="px-8 py-4 bg-green-600 text-black font-bold hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all uppercase tracking-wider">
                                        [ EXECUTE ]
                                    </button>
                                ) : (
                                    <button onClick={() => setIsRunning(false)} className="px-8 py-4 bg-black border border-green-600 text-green-500 font-bold hover:bg-green-900/20 animate-pulse uppercase tracking-wider">
                                        [ PAUSE ]
                                    </button>
                                )}
                                <button onClick={() => { setIsRunning(false); setTimeLeft(timerDuration); if(soundEnabled) playSound(); }} className="px-4 border border-green-900 text-green-800 hover:text-green-500 hover:border-green-500 transition-colors" title="Reset Counter">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute top-2 right-2">
                                 <button onClick={(e) => handleDeleteClick(activeTask.id, e)} className={`p-2 transition-colors hover:bg-red-900/20 rounded-full ${deleteConfirmId === activeTask.id ? 'text-red-500 bg-red-900/20' : 'text-green-900 hover:text-red-500'}`} title="TERMINATE PROCESS (DELETE)">
                                    {deleteConfirmId === activeTask.id ? <AlertOctagon className="w-4 h-4 animate-pulse" /> : <Skull className="w-4 h-4" />}
                                 </button>
                            </div>
                        </div>
                        {!isRunning && timeLeft === timerDuration && (
                            <div className="flex justify-center items-center gap-2 border-t border-green-900/30 p-2 bg-green-900/5 flex-wrap">
                                {FOCUS_TIME_OPTIONS.map(opt => (
                                    <button key={opt.value} onClick={() => { setTimerDuration(opt.value); setTimeLeft(opt.value); if(soundEnabled) playSound(); }} className={`text-[10px] px-3 py-1 border border-transparent ${timerDuration === opt.value ? 'bg-green-900 text-green-300 border-green-800' : 'text-green-900 hover:text-green-600 hover:border-green-900'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                                 <div className="flex items-center gap-1 border-l border-green-900/30 pl-2 ml-1">
                                     <span className="text-[10px] text-green-900">CUSTOM:</span>
                                     <input type="number" min="1" max="180" placeholder="MIN" className="w-12 bg-black border border-green-900 text-[10px] text-green-500 text-center focus:border-green-500 focus:outline-none py-1 placeholder-green-900"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = parseInt(e.currentTarget.value);
                                                if (!isNaN(val) && val > 0) {
                                                    setTimerDuration(val * 60); setTimeLeft(val * 60); if(soundEnabled) playSound('click'); e.currentTarget.blur();
                                                }
                                            }
                                        }}
                                        onBlur={(e) => {
                                             const val = parseInt(e.target.value);
                                             if (!isNaN(val) && val > 0) {
                                                setTimerDuration(val * 60); setTimeLeft(val * 60); if(soundEnabled) playSound('click');
                                             }
                                        }}
                                     />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // 2. 空状态 (Idle State) - 修复了无任务报错的问题
                    <div className="w-full max-w-xl border border-green-900/30 bg-black/50 p-12 text-center relative overflow-hidden group">
                        {/* 扫描线动画背景 */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                        
                        <Monitor className="w-16 h-16 text-green-900 mx-auto mb-6 group-hover:text-green-500 transition-colors duration-500" />
                        <h2 className="text-xl font-bold mb-2 text-green-600 tracking-widest">SYSTEM STANDBY</h2>
                        <p className="text-xs text-green-800 mb-8 font-mono">
                            AWAITING COMMAND INPUT...<br/>
                            NO ACTIVE PROCESS DETECTED.
                        </p>
                        
                        <button 
                            onClick={() => setCurrentView('tasks')}
                            className="inline-flex items-center gap-2 border border-green-800 text-green-500 px-8 py-3 hover:bg-green-500 hover:text-black transition-all uppercase tracking-widest font-bold text-xs"
                        >
                            Select / Create Task <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}
