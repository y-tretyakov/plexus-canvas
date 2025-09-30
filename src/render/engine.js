/**
 * Render engine for Plexus Canvas
 * Handles RAF loop, DPI scaling, and frame timing
 */

import { startAnimation, stopAnimation, setFPSCap, getFPS, onFPSUpdate } from '../utils/raf.js';
import { $ } from '../utils/dom.js';

/**
 * Main render engine class
 */
class RenderEngine {
    constructor(canvasId = 'plexusCanvas') {
        this.canvas = $(canvasId);
        this.ctx = null;
        this.isRunning = false;
        this.isPaused = false;
        
        // Canvas properties
        this.pixelRatio = 1;
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        
        // Render callbacks
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        this.preRenderCallbacks = [];
        this.postRenderCallbacks = [];
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 60;
        this.deltaTime = 0;
        this.lastFrameTime = 0;
        
        // Quality settings
        this.qualityLevel = 1; // 0.5 = half quality, 1 = full quality
        this.adaptiveQuality = false;
        this.fpsThreshold = 45;
        this.qualityAdjustmentDelay = 2000; // 2 seconds
        this.lastQualityAdjustment = 0;
        
        // Background settings
        this.clearMode = 'full'; // 'full', 'trail', 'none'
        this.trailOpacity = 0.1;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the render engine
     */
    init() {
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Get 2D context
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
            colorSpace: 'srgb'
        });

        if (!this.ctx) {
            throw new Error('Could not get 2D context');
        }

        // Setup canvas and DPI
        this.setupCanvas();
        this.setupEventListeners();
        this.setupFPSTracking();

        console.log('Render engine initialized');
    }

    /**
     * Setup canvas size and DPI scaling
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Store logical dimensions
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Set canvas display size
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        // Apply DPI scaling
        this.updatePixelRatio();
        this.resizeCanvas();
    }

    /**
     * Update pixel ratio based on device and settings
     * @param {string} mode - Pixel ratio mode ('auto', '1x', '2x')
     */
    updatePixelRatio(mode = 'auto') {
        switch (mode) {
            case '1x':
                this.pixelRatio = 1;
                break;
            case '2x':
                this.pixelRatio = 2;
                break;
            case 'auto':
            default:
                this.pixelRatio = window.devicePixelRatio || 1;
                // Cap at 2x for performance
                this.pixelRatio = Math.min(this.pixelRatio, 2);
                break;
        }

        this.resizeCanvas();
    }

    /**
     * Resize canvas with proper DPI scaling
     */
    resizeCanvas() {
        const scaledWidth = this.width * this.pixelRatio * this.qualityLevel;
        const scaledHeight = this.height * this.pixelRatio * this.qualityLevel;

        // Set actual canvas size
        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight;

        // Scale context for DPI
        this.ctx.scale(this.pixelRatio * this.qualityLevel, this.pixelRatio * this.qualityLevel);

        // Apply image smoothing settings
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = this.qualityLevel >= 1 ? 'high' : 'medium';

        console.log(`Canvas resized: ${this.width}x${this.height} (${scaledWidth}x${scaledHeight}) @ ${this.pixelRatio}x DPI, quality: ${this.qualityLevel}`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility change (pause when hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else if (this.isRunning) {
                this.resume();
            }
        });

        // Handle focus/blur for performance
        window.addEventListener('blur', () => {
            if (this.adaptiveQuality) {
                this.adjustQuality(0.5);
            }
        });

        window.addEventListener('focus', () => {
            if (this.adaptiveQuality) {
                this.adjustQuality(1);
            }
        });
    }

    /**
     * Setup FPS tracking
     */
    setupFPSTracking() {
        onFPSUpdate((fps, deltaTime) => {
            this.currentFPS = fps;
            this.deltaTime = deltaTime;
            
            // Update FPS display
            this.updateFPSDisplay();
            
            // Adaptive quality adjustment
            if (this.adaptiveQuality) {
                this.checkPerformance();
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.setupCanvas();
            
            // Notify callbacks about resize
            this.emit('resize', {
                width: this.width,
                height: this.height,
                centerX: this.centerX,
                centerY: this.centerY
            });
        }, 100);
    }

    /**
     * Check performance and adjust quality if needed
     */
    checkPerformance() {
        const now = performance.now();
        if (now - this.lastQualityAdjustment < this.qualityAdjustmentDelay) {
            return;
        }

        if (this.currentFPS < this.fpsThreshold && this.qualityLevel > 0.5) {
            this.adjustQuality(this.qualityLevel - 0.25);
            this.lastQualityAdjustment = now;
            console.log(`Quality reduced to ${this.qualityLevel} due to low FPS (${this.currentFPS})`);
        } else if (this.currentFPS > this.fpsThreshold + 10 && this.qualityLevel < 1) {
            this.adjustQuality(this.qualityLevel + 0.25);
            this.lastQualityAdjustment = now;
            console.log(`Quality increased to ${this.qualityLevel} due to good FPS (${this.currentFPS})`);
        }
    }

    /**
     * Adjust rendering quality
     * @param {number} quality - Quality level (0.5 to 1)
     */
    adjustQuality(quality) {
        this.qualityLevel = Math.max(0.5, Math.min(1, quality));
        this.resizeCanvas();
        
        this.emit('quality-change', {
            quality: this.qualityLevel,
            fps: this.currentFPS
        });
    }

    /**
     * Update FPS display
     */
    updateFPSDisplay() {
        const fpsDisplay = $('#fpsValue');
        if (fpsDisplay) {
            fpsDisplay.textContent = this.currentFPS.toString();
            
            // Color coding based on performance
            const fpsElement = $('#fpsDisplay');
            if (fpsElement) {
                fpsElement.className = 'fps-display';
                if (this.currentFPS < 30) {
                    fpsElement.classList.add('fps-low');
                } else if (this.currentFPS < 50) {
                    fpsElement.classList.add('fps-medium');
                } else {
                    fpsElement.classList.add('fps-high');
                }
            }
        }
    }

    /**
     * Start the render loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();

        // Start RAF loop
        startAnimation((deltaTime, currentTime) => {
            this.renderFrame(deltaTime, currentTime);
        }, 0); // Highest priority

        this.emit('start');
        console.log('Render engine started');
    }

    /**
     * Stop the render loop
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = false;

        // Stop RAF loop
        stopAnimation();

        this.emit('stop');
        console.log('Render engine stopped');
    }

    /**
     * Pause the render loop
     */
    pause() {
        if (!this.isRunning || this.isPaused) return;

        this.isPaused = true;
        stopAnimation();

        this.emit('pause');
        console.log('Render engine paused');
    }

    /**
     * Resume the render loop
     */
    resume() {
        if (!this.isRunning || !this.isPaused) return;

        this.isPaused = false;
        this.lastFrameTime = performance.now();

        startAnimation((deltaTime, currentTime) => {
            this.renderFrame(deltaTime, currentTime);
        }, 0);

        this.emit('resume');
        console.log('Render engine resumed');
    }

    /**
     * Toggle pause/resume
     */
    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * Main render frame function
     * @param {number} deltaTime - Time since last frame
     * @param {number} currentTime - Current timestamp
     */
    renderFrame(deltaTime, currentTime) {
        if (this.isPaused) return;

        this.frameCount++;
        this.deltaTime = deltaTime;

        try {
            // Pre-render callbacks
            this.executeCallbacks(this.preRenderCallbacks, deltaTime, currentTime);

            // Clear canvas
            this.clearCanvas();

            // Update callbacks (physics, etc.)
            this.executeCallbacks(this.updateCallbacks, deltaTime, currentTime);

            // Render callbacks (drawing)
            this.executeCallbacks(this.renderCallbacks, deltaTime, currentTime);

            // Post-render callbacks
            this.executeCallbacks(this.postRenderCallbacks, deltaTime, currentTime);

        } catch (error) {
            console.error('Render frame error:', error);
            this.emit('error', { error, deltaTime, currentTime });
        }

        this.lastFrameTime = currentTime;
    }

    /**
     * Execute callback array
     * @param {Array} callbacks - Array of callback functions
     * @param {number} deltaTime - Delta time
     * @param {number} currentTime - Current time
     */
    executeCallbacks(callbacks, deltaTime, currentTime) {
        callbacks.forEach(callback => {
            try {
                callback(deltaTime, currentTime, this.ctx, this);
            } catch (error) {
                console.error('Callback execution error:', error);
            }
        });
    }

    /**
     * Clear canvas based on clear mode
     */
    clearCanvas() {
        switch (this.clearMode) {
            case 'full':
                this.ctx.clearRect(0, 0, this.width, this.height);
                break;
                
            case 'trail':
                this.ctx.fillStyle = `rgba(0, 0, 0, ${this.trailOpacity})`;
                this.ctx.fillRect(0, 0, this.width, this.height);
                break;
                
            case 'none':
                // Don't clear
                break;
        }
    }

    /**
     * Set clear mode
     * @param {string} mode - Clear mode ('full', 'trail', 'none')
     * @param {number} trailOpacity - Trail opacity for trail mode
     */
    setClearMode(mode, trailOpacity = 0.1) {
        this.clearMode = mode;
        this.trailOpacity = trailOpacity;
    }

    /**
     * Add update callback
     * @param {Function} callback - Update callback function
     */
    addUpdateCallback(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * Add render callback
     * @param {Function} callback - Render callback function
     */
    addRenderCallback(callback) {
        this.renderCallbacks.push(callback);
    }

    /**
     * Add pre-render callback
     * @param {Function} callback - Pre-render callback function
     */
    addPreRenderCallback(callback) {
        this.preRenderCallbacks.push(callback);
    }

    /**
     * Add post-render callback
     * @param {Function} callback - Post-render callback function
     */
    addPostRenderCallback(callback) {
        this.postRenderCallbacks.push(callback);
    }

    /**
     * Remove callback from specific array
     * @param {Array} callbackArray - Callback array
     * @param {Function} callback - Callback to remove
     */
    removeCallback(callbackArray, callback) {
        const index = callbackArray.indexOf(callback);
        if (index > -1) {
            callbackArray.splice(index, 1);
        }
    }

    /**
     * Remove update callback
     * @param {Function} callback - Callback to remove
     */
    removeUpdateCallback(callback) {
        this.removeCallback(this.updateCallbacks, callback);
    }

    /**
     * Remove render callback
     * @param {Function} callback - Callback to remove
     */
    removeRenderCallback(callback) {
        this.removeCallback(this.renderCallbacks, callback);
    }

    /**
     * Remove pre-render callback
     * @param {Function} callback - Callback to remove
     */
    removePreRenderCallback(callback) {
        this.removeCallback(this.preRenderCallbacks, callback);
    }

    /**
     * Remove post-render callback
     * @param {Function} callback - Callback to remove
     */
    removePostRenderCallback(callback) {
        this.removeCallback(this.postRenderCallbacks, callback);
    }

    /**
     * Clear all callbacks
     */
    clearCallbacks() {
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        this.preRenderCallbacks = [];
        this.postRenderCallbacks = [];
    }

    /**
     * Set FPS cap
     * @param {number} fps - Target FPS (0 for no cap)
     */
    setFPSCap(fps) {
        setFPSCap(fps === 0 ? null : fps);
    }

    /**
     * Enable/disable adaptive quality
     * @param {boolean} enabled - Enable adaptive quality
     * @param {number} threshold - FPS threshold for quality adjustment
     */
    setAdaptiveQuality(enabled, threshold = 45) {
        this.adaptiveQuality = enabled;
        this.fpsThreshold = threshold;
        
        if (!enabled) {
            this.adjustQuality(1); // Reset to full quality
        }
    }

    /**
     * Get current render statistics
     * @returns {Object} Render statistics
     */
    getStats() {
        return {
            fps: this.currentFPS,
            frameCount: this.frameCount,
            deltaTime: this.deltaTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            pixelRatio: this.pixelRatio,
            qualityLevel: this.qualityLevel,
            width: this.width,
            height: this.height,
            adaptiveQuality: this.adaptiveQuality
        };
    }

    /**
     * Capture canvas as image
     * @param {string} format - Image format ('png', 'jpeg', 'webp')
     * @param {number} quality - Image quality (0-1) for lossy formats
     * @returns {string} Data URL
     */
    captureFrame(format = 'png', quality = 1) {
        try {
            if (format === 'png') {
                return this.canvas.toDataURL('image/png');
            } else if (format === 'jpeg') {
                return this.canvas.toDataURL('image/jpeg', quality);
            } else if (format === 'webp') {
                return this.canvas.toDataURL('image/webp', quality);
            } else {
                return this.canvas.toDataURL();
            }
        } catch (error) {
            console.error('Failed to capture frame:', error);
            return null;
        }
    }

    /**
     * Emit custom event
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     */
    emit(eventName, data) {
        const event = new CustomEvent(`render-${eventName}`, {
            detail: data,
            bubbles: true
        });
        this.canvas.dispatchEvent(event);
    }

    /**
     * Add event listener
     * @param {string} eventName - Event name (without 'render-' prefix)
     * @param {Function} callback - Event callback
     */
    on(eventName, callback) {
        this.canvas.addEventListener(`render-${eventName}`, callback);
    }

    /**
     * Remove event listener
     * @param {string} eventName - Event name (without 'render-' prefix)
     * @param {Function} callback - Event callback
     */
    off(eventName, callback) {
        this.canvas.removeEventListener(`render-${eventName}`, callback);
    }

    /**
     * Get canvas context
     * @returns {CanvasRenderingContext2D} Canvas context
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Get canvas element
     * @returns {HTMLCanvasElement} Canvas element
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * Destroy the render engine
     */
    destroy() {
        this.stop();
        this.clearCallbacks();
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        // Clear references
        this.canvas = null;
        this.ctx = null;
        
        console.log('Render engine destroyed');
    }
}

// Export singleton instance creator
export function createRenderEngine(canvasId) {
    return new RenderEngine(canvasId);
}

// Export class for advanced usage
export { RenderEngine };

export default RenderEngine;