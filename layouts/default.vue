<template>
    <div
        class="min-h-screen flex flex-col relative overflow-x-clip selection:bg-primary/30"
    >
        <div
            class="fixed inset-0 pointer-events-none z-0 opacity-70 dark:opacity-20"
        >
            <svg
                class="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <defs>
                    <pattern
                        id="gridPattern"
                        width="100"
                        height="100"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(45)"
                    >
                        <line
                            x1="0"
                            y1="50"
                            x2="100"
                            y2="50"
                            stroke="#b7eb8f"
                            stroke-width="1.5"
                            stroke-dasharray="4, 4"
                            opacity="0.6"
                        />
                        <line
                            x1="50"
                            y1="0"
                            x2="50"
                            y2="100"
                            stroke="#b7eb8f"
                            stroke-width="1.5"
                            stroke-dasharray="4, 4"
                            opacity="0.6"
                        />
                        <path
                            d="M47,50 L53,50 M50,47 L50,53"
                            stroke="#b7eb8f"
                            stroke-width="1.5"
                            opacity="0.8"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />

                <g class="wave-container">
                    <!-- Bottom Pair: Wave A -->
                    <path
                        fill="none"
                        stroke="#ffb6c1"
                        stroke-width="4"
                        stroke-dasharray="10, 8"
                        opacity="0.6"
                    >
                        <animate 
                            attributeName="d" 
                            dur="12s"
                            calcMode="spline"
                            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                            keyTimes="0; 0.5; 1"
                            repeatCount="indefinite"
                            values="
                                M-100,700 Q500,550 1100,700 T2300,700 T3500,700 T4700,700;
                                M-100,700 Q500,850 1100,700 T2300,700 T3500,700 T4700,700;
                                M-100,700 Q500,550 1100,700 T2300,700 T3500,700 T4700,700
                            "
                        />
                    </path>

                    <!-- Bottom Pair: Wave B -->
                    <path
                        fill="none"
                        stroke="#ffb6c1"
                        stroke-width="4"
                        stroke-dasharray="10, 8"
                        opacity="0.4"
                    >
                        <animate 
                            attributeName="d" 
                            dur="15s"
                            calcMode="spline"
                            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                            keyTimes="0; 0.5; 1"
                            repeatCount="indefinite"
                            values="
                                M-100,700 Q500,850 1100,700 T2300,700 T3500,700 T4700,700;
                                M-100,700 Q500,550 1100,700 T2300,700 T3500,700 T4700,700;
                                M-100,700 Q500,850 1100,700 T2300,700 T3500,700 T4700,700
                            "
                        />
                    </path>
                </g>
            </svg>

            <!-- Sakura / Flowers moving smoothly to top-right -->
            <div class="sakura-layer">
                <div class="sakura s1 text-primary opacity-60 text-2xl">✿</div>
                <div class="sakura s2 text-secondary opacity-60 text-3xl">✿</div>
                <div class="sakura s3 text-tertiary opacity-60 text-xl">✿</div>
                <div class="sakura s4 text-[#a3e4b7] opacity-60 text-4xl">✿</div>
                <div class="sakura s5 text-primary opacity-60 text-2xl">✿</div>
                <div class="sakura s6 text-secondary opacity-60 text-3xl">✿</div>
                <div class="sakura s7 text-tertiary opacity-60 text-xl">✿</div>
                <div class="sakura s8 text-[#a3e4b7] opacity-60 text-2xl">✿</div>
                <div class="sakura s9 text-primary opacity-60 text-3xl">✿</div>
                <div class="sakura s10 text-secondary opacity-60 text-2xl">✿</div>
                <div class="sakura s11 text-tertiary opacity-60 text-4xl">✿</div>
                <div class="sakura s12 text-[#a3e4b7] opacity-60 text-3xl">✿</div>
                <div class="sakura s13 text-primary opacity-60 text-2xl">✿</div>
                <div class="sakura s14 text-secondary opacity-60 text-xl">✿</div>
                <div class="sakura s15 text-tertiary opacity-60 text-3xl">✿</div>
            </div>
        </div>

        <Nav class="z-50" />

        <main
            class="grow flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-10"
        >
            <slot />
        </main>

        <Footer class="relative z-10" />
    </div>
</template>

<style scoped>
.sakura-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.sakura {
    position: absolute;
    will-change: transform, opacity;
    animation: sakura-fly linear infinite;
    /* Start positions effectively off-screen to the bottom-left */
    bottom: -20%;
    left: -20%;
}

/* Distribute sakura with different sizes, speeds, and starting horizontal offsets */
/* By setting varying left/bottom offsets and durations, they naturally spread out */
.s1 { left: -10%; bottom: 10%; animation-duration: 22s; animation-delay: 0s; }
.s2 { left: 10%; bottom: -10%; animation-duration: 26s; animation-delay: -5s; }
.s3 { left: 30%; bottom: -5%; animation-duration: 20s; animation-delay: -12s; }
.s4 { left: 50%; bottom: -15%; animation-duration: 30s; animation-delay: -8s; }
.s5 { left: 70%; bottom: -10%; animation-duration: 24s; animation-delay: -18s; }
.s6 { left: 90%; bottom: -20%; animation-duration: 28s; animation-delay: -3s; }
.s7 { left: -5%; bottom: 30%; animation-duration: 23s; animation-delay: -15s; }
.s8 { left: 15%; bottom: 40%; animation-duration: 27s; animation-delay: -9s; }
.s9 { left: 35%; bottom: 20%; animation-duration: 21s; animation-delay: -2s; }
.s10 { left: 55%; bottom: 50%; animation-duration: 29s; animation-delay: -21s; }
.s11 { left: 75%; bottom: 30%; animation-duration: 25s; animation-delay: -11s; }
.s12 { left: -15%; bottom: 60%; animation-duration: 26s; animation-delay: -7s; }
.s13 { left: 25%; bottom: 70%; animation-duration: 22s; animation-delay: -16s; }
.s14 { left: 45%; bottom: 80%; animation-duration: 19s; animation-delay: -4s; }
.s15 { left: 65%; bottom: 60%; animation-duration: 28s; animation-delay: -13s; }

/* Sakura fly from bottom-left to top-right smoothly */
@keyframes sakura-fly {
    0% {
        transform: translate3d(0, 0, 0) rotate(0deg);
        opacity: 0;
    }
    10% { opacity: 0.8; }
    90% { opacity: 0.8; }
    100% {
        /* Move right and up simultaneously */
        transform: translate3d(120vw, -120vh, 0) rotate(360deg);
        opacity: 0;
    }
}
</style>
