import React from 'react';
import { AlertTriangle, Power, SkipForward } from 'lucide-react';

export const BreakMode = ({
    currentCard,
    onComplete,
    onSkip,
    onIgnore
}) => {
    return (
        <div className="fixed inset-0 bg-black z-50 p-6 font-mono flex flex-col items-center justify-center text-green-500 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl border-2 border-green-500 bg-black shadow-[0_0_80px_rgba(34,197,94,0.15)] relative flex flex-col max-h-[90vh]">
                {/* 警告头部 */}
                <div className="bg-red-900/20 border-b border-red-900/50 p-4 flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="text-red-500 w-8 h-8" />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-red-500 tracking-wider">SYSTEM INTERRUPT</h1>
                        <p className="text-xs text-red-400">SESSION EXPIRED: IMMEDIATE ACTION REQUIRED</p>
                    </div>
                </div>

                {/* 健康卡片内容 */}
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

                    {/* 操作按钮 */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onComplete}
                            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group"
                        >
                            <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            [ EXECUTE RECOVERY & FINISH ]
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onSkip}
                                className="border border-green-800 text-green-700 hover:border-green-500 hover:text-green-500 py-3 text-xs uppercase flex items-center justify-center gap-2"
                            >
                                <SkipForward className="w-4 h-4" /> Try Different Action
                            </button>
                            <button
                                onClick={onIgnore}
                                className="border border-green-800 text-green-700 hover:border-red-500 hover:text-red-500 py-3 text-xs uppercase"
                            >
                                &lt; Ignore (Risk High) /&gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
