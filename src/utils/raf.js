/**
 * RequestAnimationFrame utilities for Plexus Canvas
 */

let rafId = null;
let lastTime = 0;
let frameCount = 0;
let fpsArray = [];
let currentFPS = 60;

/**
 * Enhanced RAF manager with FPS tracking and capping
 */
class RAFManager {
    constructor() {
        this.isRunning = false;
        this.callbacks = [];
        this.fpsCap = null;
        this.lastFrameTime = 0;
        this.frameInterval = 0;
        this.fpsHistory = [];
        this.fpsHistorySize = 60; // Track last 60 frames
        this.onFPSUpdate = null;
    }

    /**
     * Set FPS cap
     * @param {number|null} fps - Target FPS (null for no cap)
     */
    setFPSCap(fps) {
        this.fpsCap = fps;
        this.frameInterval = fps ? 1000 / fps : 0;
    }

    /**
     * Add callback to RAF loop
     * @param {Function} callback - Callback function
     * @param {number} priority - Priority (lower = earlier execution)
     */
    addCallback(callback, priority = 0) {
        this.callbacks.push({ callback, priority });
        this.callbacks.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Remove callback from RAF loop
     * @param {Function} callback - Callback function to remove
     */
    removeCallback(callback) {
        this.callbacks = this.callbacks.filter(item => item.callback !== callback);
    }

    /**
     * Start the RAF loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.loop();
    }

    /**
     * Stop the RAF loop
     */
    stop() {
        this.isRunning = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    /**
     * Toggle RAF loop
     */
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Main RAF loop
     */
    loop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        // FPS capping
        if (this.fpsCap && deltaTime < this.frameInterval) {
            rafId = requestAnimationFrame(() => this.loop());
            return;
        }

        // Calculate FPS
        this.updateFPS(deltaTime);

        // Execute callbacks
        this.callbacks.forEach(({ callback }) => {
            try {
                callback(deltaTime, currentTime);
            } catch (error) {
                console.error('RAF callback error:', error);
            }
        });

        this.lastFrameTime = currentTime;
        rafId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Update FPS calculation
     * @param {number} deltaTime - Time since last frame
     */
    updateFPS(deltaTime) {
        if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            this.fpsHistory.push(fps);
            
            if (this.fpsHistory.length > this.fpsHistorySize) {
                this.fpsHistory.shift();
            }

            // Calculate average FPS
            const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
            currentFPS = Math.round(avgFPS);

            if (this.onFPSUpdate) {
                this.onFPSUpdate(currentFPS, deltaTime);
            }
        }
    }

    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    getFPS() {
        return currentFPS;
    }

    /**
     * Get delta time for smooth animations
     * @returns {number} Delta time in milliseconds
     */
    getDeltaTime() {
        return performance.now() - this.lastFrameTime;
    }

    /**
     * Clear all callbacks
     */
    clearCallbacks() {
        this.callbacks = [];
    }
}

// Create singleton instance
const rafManager = new RAFManager();

/**
 * Start animation loop
 * @param {Function} callback - Animation callback
 * @param {number} priority - Callback priority
 */
export function startAnimation(callback, priority = 0) {
    rafManager.addCallback(callback, priority);
    rafManager.start();
}

/**
 * Stop animation loop
 * @param {Function} callback - Callback to remove (optional)
 */
export function stopAnimation(callback = null) {
    if (callback) {
        rafManager.removeCallback(callback);
        if (rafManager.callbacks.length === 0) {
            rafManager.stop();
        }
    } else {
        rafManager.stop();
    }
}

/**
 * Set FPS cap
 * @param {number|null} fps - Target FPS
 */
export function setFPSCap(fps) {
    rafManager.setFPSCap(fps);
}

/**
 * Get current FPS
 * @returns {number} Current FPS
 */
export function getFPS() {
    return rafManager.getFPS();
}

/**
 * Toggle animation loop
 */
export function toggleAnimation() {
    rafManager.toggle();
}

/**
 * Check if animation is running
 * @returns {boolean} True if running
 */
export function isAnimationRunning() {
    return rafManager.isRunning;
}

/**
 * Set FPS update callback
 * @param {Function} callback - Callback function (fps, deltaTime) => void
 */
export function onFPSUpdate(callback) {
    rafManager.onFPSUpdate = callback;
}

/**
 * Simple RAF wrapper for one-time animations
 * @param {Function} callback - Animation callback
 * @returns {number} RAF ID
 */
export function raf(callback) {
    return requestAnimationFrame(callback);
}

/**
 * Cancel RAF
 * @param {number} id - RAF ID to cancel
 */
export function cancelRAF(id) {
    cancelAnimationFrame(id);
}

/**
 * Wait for next frame
 * @returns {Promise} Promise that resolves on next frame
 */
export function nextFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(resolve);
    });
}

/**
 * Wait for multiple frames
 * @param {number} frames - Number of frames to wait
 * @returns {Promise} Promise that resolves after specified frames
 */
export async function waitFrames(frames) {
    for (let i = 0; i < frames; i++) {
        await nextFrame();
    }
}

/**
 * Execute callback on idle time
 * @param {Function} callback - Callback to execute
 * @param {Object} options - RequestIdleCallback options
 * @returns {number} Idle callback ID
 */
export function onIdle(callback, options = {}) {
    if (window.requestIdleCallback) {
        return window.requestIdleCallback(callback, options);
    } else {
        // Fallback for browsers without requestIdleCallback
        return setTimeout(callback, 1);
    }
}

/**
 * Cancel idle callback
 * @param {number} id - Idle callback ID
 */
export function cancelIdle(id) {
    if (window.cancelIdleCallback) {
        window.cancelIdleCallback(id);
    } else {
        clearTimeout(id);
    }
}

/**
 * Smooth animation helper with easing
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration in ms
 * @param {Function} options.easing - Easing function (t) => easedT
 * @param {Function} options.onUpdate - Update callback (progress, easedProgress) => void
 * @param {Function} options.onComplete - Complete callback
 * @returns {Function} Cancel function
 */
export function animate({
    duration = 1000,
    easing = t => t,
    onUpdate = () => {},
    onComplete = () => {}
}) {
    const startTime = performance.now();
    let cancelled = false;

    function update() {
        if (cancelled) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        onUpdate(progress, easedProgress);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            onComplete();
        }
    }

    requestAnimationFrame(update);

    return () => {
        cancelled = true;
    };
}

/**
 * Common easing functions
 */
export const easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: t => Math.sin(t * Math.PI / 2),
    easeInOutSine: t => (1 - Math.cos(Math.PI * t)) / 2,
    easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: t => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
        return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    easeInCirc: t => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: t => Math.sqrt(1 - (t - 1) * (t - 1)),
    easeInOutCirc: t => {
        if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
        return (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
    },
    easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
    easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    easeInOutBack: t => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        if (t < 0.5) {
            return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
        }
        return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    easeInElastic: t => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c4 = (2 * Math.PI) / 3;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: t => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: t => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c5 = (2 * Math.PI) / 4.5;
        if (t < 0.5) {
            return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
        }
        return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },
    easeInBounce: t => 1 - easing.easeOutBounce(1 - t),
    easeOutBounce: t => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    },
    easeInOutBounce: t => {
        if (t < 0.5) return easing.easeInBounce(t * 2) / 2;
        return (easing.easeOutBounce(t * 2 - 1) + 1) / 2;
    }
};

// Export the RAF manager instance for advanced usage
export { rafManager };

// Export singleton instance
export default rafManager;