// 配置常量
export const STORAGE_KEYS = {
    TASKS: 'timer_tasks',
    ACTIVE_ID: 'timer_active_id',
    DURATION: 'timer_duration',
    TIME_LEFT: 'timer_time_left',
    PREFERRED_DURATION: 'timer_preferred_duration',
};

export const HEALTH_CARDS = [
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

export const TAGS = {
    Q1: { code: 'CRIT', label: 'Critical (Do Now)', color: 'text-red-500 border-red-900 bg-red-900/10' },
    Q2: { code: 'PLAN', label: 'Plan (Schedule)', color: 'text-green-500 border-green-800 bg-green-900/10' },
    Q3: { code: 'INT', label: 'Interrupt (Delegate)', color: 'text-yellow-500 border-yellow-900 bg-yellow-900/10' },
    Q4: { code: 'TRIV', label: 'Trivial (Later)', color: 'text-slate-500 border-slate-800 bg-slate-900/10' },
};

export const FOCUS_TIME_OPTIONS = [
    { label: "25M", value: 25 * 60 },
    { label: "30M", value: 30 * 60 },
    { label: "45M", value: 45 * 60 },
];

export const DEFAULT_DURATION = 45 * 60;

export const THEME = {
    bg: "bg-black",
    text: "text-green-500",
    textDim: "text-green-900",
    border: "border-green-800",
    input: "bg-black border border-green-800 text-green-500 font-mono focus:border-green-500 focus:outline-none placeholder-green-900",
};
