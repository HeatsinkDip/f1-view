"use client"

export function F1Loader() {
    return (
        <div className="flex flex-col items-center justify-center gap-12">
            {/* Starting Lights Animation */}
            <div className="flex gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                        {[0, 1, 2, 3, 4].map((j) => (
                            <div
                                key={j}
                                className="w-3 h-3 rounded-full bg-zinc-800 transition-all duration-300"
                                style={{
                                    animation: `lightUp 3s ease-in-out infinite`,
                                    animationDelay: `${i * 0.6}s`,
                                    boxShadow: '0 0 0 rgba(220, 38, 38, 0)'
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* F1 Car with Tire Spinner */}
            <div className="relative flex items-center gap-8">
                {/* Spinning Tire */}
                <div className="relative w-24 h-24">
                    {/* Outer Tire */}
                    <div className="absolute inset-0 rounded-full border-8 border-zinc-800 animate-spin-slow" />

                    {/* Tire Tread Pattern */}
                    <div className="absolute inset-2 rounded-full border-4 border-dashed border-red-600 animate-spin"
                        style={{ animationDuration: '1s' }} />

                    {/* Inner Hub */}
                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center shadow-inner">
                        <div className="w-6 h-6 rounded-full bg-zinc-950 border-2 border-red-600 animate-pulse" />
                    </div>

                    {/* Speed Lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-6 bg-red-600 opacity-30"
                                style={{
                                    transform: `rotate(${i * 90}deg) translateY(-45px)`,
                                    animation: 'fadeInOut 1s ease-in-out infinite',
                                    animationDelay: `${i * 0.25}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* F1 Car SVG */}
                <div className="relative">
                    <svg width="120" height="60" viewBox="0 0 120 60" className="drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                        {/* Car Body - Main Chassis */}
                        <path
                            d="M 25 35 L 35 28 L 55 25 L 75 28 L 95 35 L 90 40 L 30 40 Z"
                            fill="#dc2626"
                            stroke="#fff"
                            strokeWidth="1"
                        />

                        {/* Cockpit */}
                        <path
                            d="M 52 25 L 62 25 L 65 32 L 49 32 Z"
                            fill="#18181b"
                            stroke="#fff"
                            strokeWidth="0.8"
                        />

                        {/* Front Wing */}
                        <rect x="18" y="33" width="12" height="3" fill="#18181b" stroke="#fff" strokeWidth="0.5" rx="1" />
                        <rect x="18" y="30" width="10" height="1.5" fill="#dc2626" opacity="0.6" />

                        {/* Rear Wing */}
                        <rect x="90" y="25" width="10" height="4" fill="#18181b" stroke="#fff" strokeWidth="0.5" rx="0.5" />
                        <rect x="90" y="22" width="10" height="1.5" fill="#dc2626" opacity="0.6" />

                        {/* Engine Cover Details */}
                        <line x1="70" y1="28" x2="85" y2="33" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
                        <line x1="70" y1="31" x2="85" y2="36" stroke="#fff" strokeWidth="0.5" opacity="0.3" />

                        {/* Front Wheels */}
                        <ellipse cx="35" cy="40" rx="5" ry="6" fill="#18181b" stroke="#fff" strokeWidth="0.8" />
                        <ellipse cx="35" cy="40" rx="3" ry="4" fill="#3f3f46" />

                        {/* Rear Wheels */}
                        <ellipse cx="80" cy="40" rx="5" ry="6" fill="#18181b" stroke="#fff" strokeWidth="0.8" />
                        <ellipse cx="80" cy="40" rx="3" ry="4" fill="#3f3f46" />

                        {/* Wheel Highlights */}
                        <ellipse cx="35" cy="39" rx="1.5" ry="2" fill="#71717a" opacity="0.6" />
                        <ellipse cx="80" cy="39" rx="1.5" ry="2" fill="#71717a" opacity="0.6" />

                        {/* Speed Effect Lines */}
                        <line x1="10" y1="30" x2="20" y2="30" stroke="#dc2626" strokeWidth="1.5" opacity="0.4" className="animate-speed-blur" />
                        <line x1="8" y1="35" x2="18" y2="35" stroke="#dc2626" strokeWidth="1.5" opacity="0.3" className="animate-speed-blur" style={{ animationDelay: '0.1s' }} />
                        <line x1="12" y1="40" x2="22" y2="40" stroke="#dc2626" strokeWidth="1.5" opacity="0.4" className="animate-speed-blur" style={{ animationDelay: '0.2s' }} />
                    </svg>
                </div>

                {/* Lap Timer Clock */}
                <div className="relative w-24 h-24 rounded-full border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    {/* Clock Face Markers */}
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-3 bg-zinc-700"
                            style={{
                                transform: `rotate(${i * 90}deg) translateY(-36px)`,
                            }}
                        />
                    ))}

                    {/* Animated Clock Hands */}
                    <div className="absolute w-1 h-8 bg-red-600 rounded-full origin-bottom animate-spin-slow"
                        style={{ bottom: '50%', transformOrigin: 'bottom center' }} />
                    <div className="absolute w-0.5 h-10 bg-white rounded-full origin-bottom animate-spin"
                        style={{ bottom: '50%', transformOrigin: 'bottom center', animationDuration: '2s' }} />

                    {/* Center Dot */}
                    <div className="absolute w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(220,38,38,0.8)]" />

                    {/* Digital Time Display */}
                    <div className="absolute -bottom-8 text-xs font-mono text-red-500 font-bold tracking-wider animate-pulse">
                        00:00.000
                    </div>
                </div>
            </div>

            {/* Loading Text with DRS Effect */}
            <div className="relative">
                <div className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2 flex items-center gap-3">
                    <span className="animate-pulse">Loading</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-8 bg-red-600 animate-pulse" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-8 bg-red-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-8 bg-red-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>

                {/* Speed Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span>System Initializing</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-80 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-progress" />
            </div>
        </div>
    )
}
