/**
 * Interaction system for Plexus Canvas
 * Handles mouse interaction, keyboard shortcuts, and touch events
 */

import { on, off, $ } from '/src/utils/dom.js';
import { clamp } from '/src/utils/math.js';

/**
 * Interaction manager class
 */
class InteractionManager {
    constructor(config, renderEngine, plexusSystem, exportManager) {
        this.config = config;
        this.renderEngine = renderEngine;
        this.plexusSystem = plexusSystem;
        this.exportManager = exportManager;
        
        // Canvas and container elements
        this.canvas = null;
        this.canvasContainer = null;
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            isOver: false,
            lastX: 0,
            lastY: 0,
            velocity: { x: 0, y: 0 }
        };
        
        // Touch state
        this.touches = new Map();
        this.lastTouchTime = 0;
        
        // Keyboard state
        this.keys = new Set();
        this.keyboardShortcuts = this.getKeyboardShortcuts();
        
        // Event listeners storage
        this.eventListeners = [];
        
        // Interaction settings
        this.isMouseInteractionEnabled = true;
        this.isTouchInteractionEnabled = true;
        this.isKeyboardInteractionEnabled = true;
        
        // Performance throttling
        this.mouseMoveThrottle = 16; // ~60fps
        this.lastMouseMoveTime = 0;
        
        this.init();
    }

    /**
     * Initialize interaction system
     */
    init() {
        this.canvas = this.renderEngine.getCanvas();
        this.canvasContainer = this.canvas.parentElement;
        
        this.setupMouseEvents();
        this.setupTouchEvents();
        this.setupKeyboardEvents();
        this.setupConfigEvents();
        
        console.log('Interaction system initialized');
    }

    /**
     * Get keyboard shortcuts configuration
     * @returns {Object} Keyboard shortcuts
     */
    getKeyboardShortcuts() {
        return {
            // Animation control
            'Space': () => this.toggleAnimation(),
            
            // Reset functions
            'KeyR': () => this.softReset(),
            'KeyR+Shift': () => this.hardReset(),
            
            // Export functions
            'KeyS': () => this.savePNG(),
            'KeyE': () => this.exportJSON(),
            'KeyC': () => this.copyJSON(),
            
            // Particle count adjustment
            'BracketLeft': () => this.adjustParticleCount(-50),
            'BracketRight': () => this.adjustParticleCount(50),
            
            // Quick presets
            'Digit1': () => this.loadPreset('neon-breeze'),
            'Digit2': () => this.loadPreset('cosmic-web'),
            'Digit3': () => this.loadPreset('wireframe'),
            
            // Help
            'Slash+Shift': () => this.toggleKeyboardHelp(),
            
            // Panel toggle (mobile)
            'KeyP': () => this.togglePanel()
        };
    }

    /**
     * Setup mouse event listeners
     */
    setupMouseEvents() {
        if (!this.isMouseInteractionEnabled) return;

        // Mouse movement
        this.addEventListener(this.canvas, 'mousemove', (event) => {
            this.handleMouseMove(event);
        });

        // Mouse enter/leave
        this.addEventListener(this.canvas, 'mouseenter', (event) => {
            this.handleMouseEnter(event);
        });

        this.addEventListener(this.canvas, 'mouseleave', (event) => {
            this.handleMouseLeave(event);
        });

        // Mouse down/up
        this.addEventListener(this.canvas, 'mousedown', (event) => {
            this.handleMouseDown(event);
        });

        this.addEventListener(this.canvas, 'mouseup', (event) => {
            this.handleMouseUp(event);
        });

        // Mouse wheel (for parameter adjustment)
        this.addEventListener(this.canvas, 'wheel', (event) => {
            this.handleMouseWheel(event);
        }, { passive: false });

        // Context menu (prevent)
        this.addEventListener(this.canvas, 'contextmenu', (event) => {
            event.preventDefault();
        });
    }

    /**
     * Setup touch event listeners
     */
    setupTouchEvents() {
        if (!this.isTouchInteractionEnabled) return;

        this.addEventListener(this.canvas, 'touchstart', (event) => {
            this.handleTouchStart(event);
        }, { passive: false });

        this.addEventListener(this.canvas, 'touchmove', (event) => {
            this.handleTouchMove(event);
        }, { passive: false });

        this.addEventListener(this.canvas, 'touchend', (event) => {
            this.handleTouchEnd(event);
        }, { passive: false });

        this.addEventListener(this.canvas, 'touchcancel', (event) => {
            this.handleTouchCancel(event);
        }, { passive: false });
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardEvents() {
        if (!this.isKeyboardInteractionEnabled) return;

        this.addEventListener(document, 'keydown', (event) => {
            this.handleKeyDown(event);
        });

        this.addEventListener(document, 'keyup', (event) => {
            this.handleKeyUp(event);
        });

        // Focus/blur for canvas
        this.addEventListener(this.canvas, 'focus', () => {
            this.canvas.style.outline = '2px solid var(--color-primary)';
        });

        this.addEventListener(this.canvas, 'blur', () => {
            this.canvas.style.outline = 'none';
        });
    }

    /**
     * Setup configuration event listeners
     */
    setupConfigEvents() {
        this.config.on('change:interaction.mouseRepel', (data) => {
            // Mouse repel strength changed - no immediate action needed
        });

        this.config.on('change:interaction.mouseRadius', (data) => {
            // Mouse radius changed - no immediate action needed
        });

        this.config.on('change:interaction.hoverHighlight', (data) => {
            // Hover highlight changed - could update cursor style
            this.updateCursorStyle();
        });

        this.config.on('change:interaction.clickSpawn', (data) => {
            // Click spawn changed - could update cursor style
            this.updateCursorStyle();
        });
    }

    /**
     * Handle mouse movement
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        const now = performance.now();
        if (now - this.lastMouseMoveTime < this.mouseMoveThrottle) return;
        this.lastMouseMoveTime = now;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate velocity
        this.mouse.velocity.x = x - this.mouse.x;
        this.mouse.velocity.y = y - this.mouse.y;

        // Update position
        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;

        // Update plexus system
        if (this.plexusSystem) {
            this.plexusSystem.setMousePosition(x, y);
            
            const mouseRepel = this.config.get('interaction.mouseRepel');
            this.plexusSystem.setMouseInfluence(mouseRepel);
        }

        // Handle hover highlight
        if (this.config.get('interaction.hoverHighlight')) {
            this.handleHoverHighlight(x, y);
        }
    }

    /**
     * Handle mouse enter
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseEnter(event) {
        this.mouse.isOver = true;
        this.updateCursorStyle();
    }

    /**
     * Handle mouse leave
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseLeave(event) {
        this.mouse.isOver = false;
        
        // Reset mouse influence
        if (this.plexusSystem) {
            this.plexusSystem.setMouseInfluence(0);
        }
    }

    /**
     * Handle mouse down
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseDown(event) {
        this.mouse.isDown = true;
        
        // Focus canvas for keyboard events
        this.canvas.focus();
        
        // Handle click spawn
        if (this.config.get('interaction.clickSpawn')) {
            this.spawnParticlesAtMouse();
        }
    }

    /**
     * Handle mouse up
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseUp(event) {
        this.mouse.isDown = false;
    }

    /**
     * Handle mouse wheel
     * @param {WheelEvent} event - Wheel event
     */
    handleMouseWheel(event) {
        event.preventDefault();
        
        // Adjust particle count with mouse wheel
        const delta = event.deltaY > 0 ? -25 : 25;
        this.adjustParticleCount(delta);
    }

    /**
     * Handle touch start
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        
        Array.from(event.changedTouches).forEach(touch => {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.touches.set(touch.identifier, {
                x, y,
                startX: x,
                startY: y,
                startTime: performance.now()
            });
            
            // Update mouse position for single touch
            if (this.touches.size === 1) {
                this.mouse.x = x;
                this.mouse.y = y;
                
                if (this.plexusSystem) {
                    this.plexusSystem.setMousePosition(x, y);
                    const mouseRepel = this.config.get('interaction.mouseRepel');
                    this.plexusSystem.setMouseInfluence(mouseRepel);
                }
            }
        });
    }

    /**
     * Handle touch move
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        
        Array.from(event.changedTouches).forEach(touch => {
            const touchData = this.touches.get(touch.identifier);
            if (!touchData) return;
            
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            touchData.x = x;
            touchData.y = y;
            
            // Update mouse position for single touch
            if (this.touches.size === 1) {
                this.mouse.x = x;
                this.mouse.y = y;
                
                if (this.plexusSystem) {
                    this.plexusSystem.setMousePosition(x, y);
                }
            }
        });
    }

    /**
     * Handle touch end
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        Array.from(event.changedTouches).forEach(touch => {
            const touchData = this.touches.get(touch.identifier);
            if (!touchData) return;
            
            const touchDuration = performance.now() - touchData.startTime;
            const touchDistance = Math.sqrt(
                Math.pow(touch.clientX - touchData.startX, 2) + 
                Math.pow(touch.clientY - touchData.startY, 2)
            );
            
            // Detect tap (short duration, small movement)
            if (touchDuration < 300 && touchDistance < 10) {
                this.handleTouchTap(touchData.x, touchData.y);
            }
            
            this.touches.delete(touch.identifier);
        });
        
        // Reset mouse influence when no touches
        if (this.touches.size === 0 && this.plexusSystem) {
            this.plexusSystem.setMouseInfluence(0);
        }
    }

    /**
     * Handle touch cancel
     * @param {TouchEvent} event - Touch event
     */
    handleTouchCancel(event) {
        Array.from(event.changedTouches).forEach(touch => {
            this.touches.delete(touch.identifier);
        });
        
        if (this.touches.size === 0 && this.plexusSystem) {
            this.plexusSystem.setMouseInfluence(0);
        }
    }

    /**
     * Handle touch tap
     * @param {number} x - Touch x coordinate
     * @param {number} y - Touch y coordinate
     */
    handleTouchTap(x, y) {
        if (this.config.get('interaction.clickSpawn')) {
            this.spawnParticlesAtPosition(x, y);
        }
    }

    /**
     * Handle key down
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        // Don't handle if typing in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        this.keys.add(event.code);
        
        // Build shortcut key
        let shortcutKey = event.code;
        if (event.shiftKey) shortcutKey += '+Shift';
        if (event.ctrlKey) shortcutKey += '+Ctrl';
        if (event.altKey) shortcutKey += '+Alt';
        
        // Execute shortcut
        const shortcutHandler = this.keyboardShortcuts[shortcutKey];
        if (shortcutHandler) {
            event.preventDefault();
            shortcutHandler();
        }
    }

    /**
     * Handle key up
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    /**
     * Handle hover highlight
     * @param {number} x - Mouse x coordinate
     * @param {number} y - Mouse y coordinate
     */
    handleHoverHighlight(x, y) {
        // This could be used to highlight nearby particles
        // For now, we'll just update the cursor style
        this.updateCursorStyle();
    }

    /**
     * Update cursor style based on interaction mode
     */
    updateCursorStyle() {
        if (!this.canvas) return;

        const mouseRepel = this.config.get('interaction.mouseRepel');
        const clickSpawn = this.config.get('interaction.clickSpawn');
        const hoverHighlight = this.config.get('interaction.hoverHighlight');

        if (clickSpawn) {
            this.canvas.style.cursor = 'crosshair';
        } else if (mouseRepel > 0) {
            this.canvas.style.cursor = 'none'; // Custom cursor could be added
        } else if (hoverHighlight) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * Spawn particles at mouse position
     */
    spawnParticlesAtMouse() {
        this.spawnParticlesAtPosition(this.mouse.x, this.mouse.y);
    }

    /**
     * Spawn particles at specific position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    spawnParticlesAtPosition(x, y) {
        if (this.plexusSystem) {
            this.plexusSystem.addParticlesAtPosition(x, y, 5);
        }
    }

    /**
     * Toggle animation play/pause
     */
    toggleAnimation() {
        if (this.renderEngine) {
            this.renderEngine.toggle();
            this.showToast(this.renderEngine.isPaused ? 'Animation Paused' : 'Animation Resumed');
        }
    }

    /**
     * Perform soft reset
     */
    softReset() {
        if (this.plexusSystem) {
            this.plexusSystem.reset(false);
            this.showToast('Soft Reset Complete');
        }
    }

    /**
     * Perform hard reset
     */
    hardReset() {
        if (this.plexusSystem) {
            this.plexusSystem.reset(true);
            this.showToast('Hard Reset Complete');
        }
    }

    /**
     * Save PNG image
     */
    async savePNG() {
        try {
            if (this.exportManager) {
                await this.exportManager.exportCanvasPNG({ download: true });
                this.showToast('PNG Saved Successfully', 'success');
            }
        } catch (error) {
            this.showToast('Failed to Save PNG', 'error');
            console.error('PNG save error:', error);
        }
    }

    /**
     * Export JSON configuration
     */
    exportJSON() {
        try {
            if (this.exportManager) {
                this.exportManager.exportConfigJSON(true, true);
                this.showToast('JSON Exported Successfully', 'success');
            }
        } catch (error) {
            this.showToast('Failed to Export JSON', 'error');
            console.error('JSON export error:', error);
        }
    }

    /**
     * Copy JSON configuration to clipboard
     */
    async copyJSON() {
        try {
            if (this.exportManager) {
                const jsonString = this.exportManager.exportConfigJSON(true, false);
                const success = await navigator.clipboard.writeText(jsonString);
                this.showToast('JSON Copied to Clipboard', 'success');
            }
        } catch (error) {
            this.showToast('Failed to Copy JSON', 'error');
            console.error('JSON copy error:', error);
        }
    }

    /**
     * Adjust particle count
     * @param {number} delta - Change in particle count
     */
    adjustParticleCount(delta) {
        const currentCount = this.config.get('particles.count');
        const newCount = clamp(currentCount + delta, 50, 3000);
        
        if (newCount !== currentCount) {
            this.config.set('particles.count', newCount);
            this.showToast(`Particle Count: ${newCount}`);
        }
    }

    /**
     * Load preset by ID
     * @param {string} presetId - Preset identifier
     */
    loadPreset(presetId) {
        // This would need access to preset manager
        this.showToast(`Preset: ${presetId}`);
    }

    /**
     * Toggle keyboard help
     */
    toggleKeyboardHelp() {
        const helpElement = $('#keyboardHelp');
        if (helpElement) {
            helpElement.classList.toggle('visible');
        }
    }

    /**
     * Toggle control panel (mobile)
     */
    togglePanel() {
        const panel = $('#controlPanel');
        if (panel) {
            panel.classList.toggle('open');
        }
    }

    /**
     * Show toast message
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        const container = $('#toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 3000);
    }

    /**
     * Add event listener and store for cleanup
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(element, event, handler, options = {}) {
        on(element, event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }

    /**
     * Get interaction statistics
     * @returns {Object} Interaction statistics
     */
    getStats() {
        return {
            mousePosition: { x: this.mouse.x, y: this.mouse.y },
            mouseIsOver: this.mouse.isOver,
            activeKeys: Array.from(this.keys),
            activeTouches: this.touches.size,
            eventListeners: this.eventListeners.length,
            interactionEnabled: {
                mouse: this.isMouseInteractionEnabled,
                touch: this.isTouchInteractionEnabled,
                keyboard: this.isKeyboardInteractionEnabled
            }
        };
    }

    /**
     * Enable/disable specific interaction types
     * @param {Object} options - Interaction options
     */
    setInteractionEnabled(options = {}) {
        const { mouse, touch, keyboard } = options;
        
        if (mouse !== undefined) {
            this.isMouseInteractionEnabled = mouse;
        }
        if (touch !== undefined) {
            this.isTouchInteractionEnabled = touch;
        }
        if (keyboard !== undefined) {
            this.isKeyboardInteractionEnabled = keyboard;
        }
    }

    /**
     * Destroy interaction system
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            off(element, event, handler, options);
        });

        // Clear state
        this.eventListeners = [];
        this.keys.clear();
        this.touches.clear();

        console.log('Interaction system destroyed');
    }
}

// Export the interaction manager
export { InteractionManager };
export default InteractionManager;