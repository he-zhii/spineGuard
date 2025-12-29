import { STORAGE_KEYS, DEFAULT_DURATION } from '../constants/config';

// 节流函数
const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function (...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

// 加载任务列表
export const loadTasks = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        return saved ? JSON.parse(saved) : [
            { id: 'init_1', title: 'deploy_black_myth_wukong.exe', status: 'pending', tag: 'Q1' },
            { id: 'init_2', title: 'sys_check_cervical_spine', status: 'pending', tag: 'Q2' },
        ];
    } catch (e) {
        console.error('Failed to load tasks:', e);
        return [];
    }
};

// 保存任务列表
export const saveTasks = (tasks) => {
    try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
        console.error('Failed to save tasks:', e);
    }
};

// 加载计时器状态
export const loadTimerState = () => {
    try {
        const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID) || null;
        const duration = parseInt(localStorage.getItem(STORAGE_KEYS.DURATION)) || DEFAULT_DURATION;
        const timeLeft = parseInt(localStorage.getItem(STORAGE_KEYS.TIME_LEFT)) || DEFAULT_DURATION;
        const preferredDuration = parseInt(localStorage.getItem(STORAGE_KEYS.PREFERRED_DURATION)) || DEFAULT_DURATION;
        return { activeId, duration, timeLeft, preferredDuration };
    } catch (e) {
        console.error('Failed to load timer state:', e);
        return { activeId: null, duration: DEFAULT_DURATION, timeLeft: DEFAULT_DURATION, preferredDuration: DEFAULT_DURATION };
    }
};

// 保存计时器状态 (内部函数)
const _saveTimerState = (activeId, duration, timeLeft) => {
    try {
        if (activeId) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeId);
            localStorage.setItem(STORAGE_KEYS.DURATION, duration.toString());
            localStorage.setItem(STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
        } else {
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
            localStorage.removeItem(STORAGE_KEYS.DURATION);
            localStorage.removeItem(STORAGE_KEYS.TIME_LEFT);
        }
    } catch (e) {
        console.error('Failed to save timer state:', e);
    }
};

// 节流版保存计时器状态 (每5秒最多保存一次)
export const saveTimerState = throttle(_saveTimerState, 5000);

// 立即保存计时器状态 (用于暂停等关键时刻)
export const saveTimerStateImmediate = _saveTimerState;

// 保存用户偏好时长
export const savePreferredDuration = (duration) => {
    try {
        localStorage.setItem(STORAGE_KEYS.PREFERRED_DURATION, duration.toString());
    } catch (e) {
        console.error('Failed to save preferred duration:', e);
    }
};

// 清除计时器状态
export const clearTimerState = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
        localStorage.removeItem(STORAGE_KEYS.DURATION);
        localStorage.removeItem(STORAGE_KEYS.TIME_LEFT);
    } catch (e) {
        console.error('Failed to clear timer state:', e);
    }
};
