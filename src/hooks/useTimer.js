import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_DURATION, HEALTH_CARDS } from '../constants/config';
import {
    loadTimerState,
    saveTimerState,
    saveTimerStateImmediate,
    savePreferredDuration,
    clearTimerState
} from '../utils/storage';
import { playSound } from '../utils/sound';

export const useTimer = (activeTaskId, soundEnabled) => {
    // 从 localStorage 加载初始状态
    const initialState = loadTimerState();

    const [timerDuration, setTimerDuration] = useState(
        activeTaskId ? initialState.duration : initialState.preferredDuration
    );
    const [timeLeft, setTimeLeft] = useState(
        activeTaskId ? initialState.timeLeft : initialState.preferredDuration
    );
    const [isRunning, setIsRunning] = useState(false);
    const [isBreakMode, setIsBreakMode] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    // 用于跟踪是否从页面刷新恢复
    const [isRecovered, setIsRecovered] = useState(
        activeTaskId && initialState.timeLeft < initialState.duration
    );

    // 使用 ref 来避免闭包问题
    const soundEnabledRef = useRef(soundEnabled);
    useEffect(() => {
        soundEnabledRef.current = soundEnabled;
    }, [soundEnabled]);

    // 计时器完成回调
    const handleTimerComplete = useCallback(() => {
        setIsRunning(false);
        setIsBreakMode(true);
        setActiveCardIndex(Math.floor(Math.random() * HEALTH_CARDS.length));

        if (soundEnabledRef.current) {
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
    }, []);

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
    }, [isRunning, timeLeft, handleTimerComplete]);

    // 持久化计时器状态 (使用节流)
    useEffect(() => {
        if (activeTaskId) {
            saveTimerState(activeTaskId, timerDuration, timeLeft);
        }
    }, [activeTaskId, timerDuration, timeLeft]);

    // 更新页面标题
    useEffect(() => {
        if (isRunning) {
            const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const sec = (timeLeft % 60).toString().padStart(2, '0');
            document.title = `[${min}:${sec}] RUNNING...`;
        } else if (isBreakMode) {
            document.title = "!!! SYSTEM ALERT !!!";
        } else {
            document.title = "Timer";
        }
    }, [timeLeft, isRunning, isBreakMode]);

    // 开始计时
    const startTimer = useCallback(() => {
        setIsRunning(true);
        setIsRecovered(false);
        if (soundEnabledRef.current) playSound('start');
    }, []);

    // 暂停计时
    const pauseTimer = useCallback(() => {
        setIsRunning(false);
        // 暂停时立即保存
        if (activeTaskId) {
            saveTimerStateImmediate(activeTaskId, timerDuration, timeLeft);
        }
    }, [activeTaskId, timerDuration, timeLeft]);

    // 重置计时
    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(timerDuration);
        setIsRecovered(false);
        if (soundEnabledRef.current) playSound('beep');
    }, [timerDuration]);

    // 设置时长
    const setDuration = useCallback((newDuration) => {
        // 限制最大 180 分钟
        const validDuration = Math.min(Math.max(newDuration, 60), 180 * 60);
        setTimerDuration(validDuration);
        setTimeLeft(validDuration);
        savePreferredDuration(validDuration);
        if (soundEnabledRef.current) playSound('beep');
    }, []);

    // 加载新任务
    const loadNewTask = useCallback(() => {
        const preferredDuration = loadTimerState().preferredDuration;
        setTimerDuration(preferredDuration);
        setTimeLeft(preferredDuration);
        setIsRunning(false);
        setIsBreakMode(false);
        setIsRecovered(false);
    }, []);

    // 完成任务并退出休息模式
    const completeBreak = useCallback(() => {
        setIsBreakMode(false);
        const preferredDuration = loadTimerState().preferredDuration;
        setTimerDuration(preferredDuration);
        setTimeLeft(preferredDuration);
        clearTimerState();
        if (soundEnabledRef.current) playSound('start');
    }, []);

    // 跳过健康卡片
    const skipHealthCard = useCallback(() => {
        setActiveCardIndex((prev) => (prev + 1) % HEALTH_CARDS.length);
        if (soundEnabledRef.current) playSound('beep');
    }, []);

    // 忽略休息并重置
    const ignoreBreak = useCallback(() => {
        setIsBreakMode(false);
        resetTimer();
    }, [resetTimer]);

    // 格式化时间
    const formatTime = useCallback((seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, []);

    // 渲染进度条
    const renderProgressBar = useCallback(() => {
        const totalBars = 30;
        const progress = (timerDuration - timeLeft) / timerDuration;
        const filledBars = Math.floor(progress * totalBars);
        const emptyBars = totalBars - filledBars;
        return `[${'#'.repeat(filledBars)}${'-'.repeat(emptyBars)}]`;
    }, [timerDuration, timeLeft]);

    const progressPercent = ((timerDuration - timeLeft) / timerDuration * 100).toFixed(1);

    return {
        timerDuration,
        timeLeft,
        isRunning,
        isBreakMode,
        isRecovered,
        activeCardIndex,
        currentCard: HEALTH_CARDS[activeCardIndex],
        startTimer,
        pauseTimer,
        resetTimer,
        setDuration,
        loadNewTask,
        completeBreak,
        skipHealthCard,
        ignoreBreak,
        formatTime,
        renderProgressBar,
        progressPercent,
    };
};
