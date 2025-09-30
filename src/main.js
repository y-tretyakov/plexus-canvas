/**
 * Main bootstrap for Plexus Canvas
 * Initializes and wires all components together
 */

import config from './state/config.js';
import presetManager from './state/presets.js';
import { createRenderEngine } from './render/engine.js';
import { PlexusSystem } from './render/plexus.js';
import { ControlPanelManager } from './ui/panel.js';
import { ExportImportManager } from './io/exporter.js';
import { InteractionManager } from './interaction.js';
import { $, hide, show, on } from '/src/utils/dom.js';

/**
 * Main application class
 */
class PlexusCanvasApp {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        
        // Core components
        this.config = config;
        this.presetManager = presetManager;
        this.renderEngine = null;
        this.plexusSystem = null;
        this.controlPanel = null;
        this.exportManager = null;
        this.interactionManager = null;
        
        // UI elements
        this.loadingIndicator = null;
        this.canvas = null;
        
        // Performance monitoring
        this.stats = {
            startTime: 0,
            frameCount: 0,
            lastStatsUpdate: 0
        };
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        console.log('Plexus Canvas App created');
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading('Initializing Plexus Canvas...');
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Initialize configuration system
            await this.initConfig();
            
            // Initialize render engine
            await this.initRenderEngine();
            
            // Initialize particle system
            await this.initPlexusSystem();
            
            // Initialize UI components
            await this.initUI();
            
            // Initialize interaction system
            await this.initInteraction();
            
            // Initialize export/import system
            await this.initExportImport();
            
            // Setup action button handlers
            this.setupActionButtons();
            
            // Start the application
            this.start();
            
            this.hideLoading();
            this.isInitialized = true;
            
            console.log('Plexus Canvas App initialized successfully');
            this.showToast('Plexus Canvas loaded successfully!', 'success');
            
        } catch (error) {
            this.handleInitError(error);
        }
    }

    /**
     * Initialize configuration system
     */
    async initConfig() {
        try {
            // Load configuration from URL if present
            const urlLoaded = await this.config.loadFromURL();
            if (urlLoaded) {
                console.log('Configuration loaded from URL');
            } else {
                // Load from localStorage or use defaults
                console.log('Using default/stored configuration');
            }
            
            // Setup configuration change handlers
            this.config.on('change', (data) => {
                this.handleConfigChange(data);
            });
            
            this.config.on('warning', (data) => {
                this.showToast(data.message, 'warning');
            });
            
        } catch (error) {
            console.error('Failed to initialize config:', error);
            throw new Error('Configuration initialization failed');
        }
    }

    /**
     * Initialize render engine
     */
    async initRenderEngine() {
        try {
            // Wait for DOM to be ready and check if canvas exists
            console.log('Looking for canvas element...');
            this.canvas = $('#plexusCanvas');
            
            if (!this.canvas) {
                console.error('Canvas element #plexusCanvas not found in DOM');
                console.log('Available elements:', document.querySelectorAll('canvas'));
                throw new Error('Canvas element not found');
            }
            
            console.log('Canvas element found:', this.canvas);
            this.renderEngine = createRenderEngine('plexusCanvas');
            
            // Setup render engine event handlers
            this.renderEngine.on('resize', (data) => {
                if (this.plexusSystem) {
                    this.plexusSystem.setDimensions(data.width, data.height);
                }
            });
            
            this.renderEngine.on('error', (data) => {
                console.error('Render engine error:', data.error);
                this.showToast('Rendering error occurred', 'error');
            });
            
            // Configure initial settings
            const performanceConfig = this.config.get('performance');
            this.renderEngine.setFPSCap(performanceConfig.fpsCap);
            this.renderEngine.updatePixelRatio(performanceConfig.pixelRatioMode);
            this.renderEngine.setAdaptiveQuality(true, 45);
            
        } catch (error) {
            console.error('Failed to initialize render engine:', error);
            throw new Error('Render engine initialization failed');
        }
    }

    /**
     * Initialize particle system
     */
    async initPlexusSystem() {
        try {
            this.plexusSystem = new PlexusSystem(this.config);
            
            // Set initial dimensions
            const { width, height } = this.renderEngine.getStats();
            this.plexusSystem.setDimensions(width, height);
            
            // Add render callbacks
            this.renderEngine.addUpdateCallback((deltaTime) => {
                this.plexusSystem.update(deltaTime);
            });
            
            this.renderEngine.addRenderCallback((deltaTime, currentTime, ctx) => {
                // Clear background
                this.plexusSystem.renderBackground(ctx);
                
                // Render edges first (behind particles)
                this.plexusSystem.renderEdges(ctx);
                
                // Render particles
                this.plexusSystem.renderParticles(ctx);
            });
            
        } catch (error) {
            console.error('Failed to initialize plexus system:', error);
            throw new Error('Particle system initialization failed');
        }
    }

    /**
     * Initialize UI components
     */
    async initUI() {
        try {
            // Initialize control panel
            this.controlPanel = new ControlPanelManager(this.config, this.presetManager);
            this.controlPanel.init();
            
            // Setup responsive panel toggle
            this.setupPanelToggle();
            
            // Setup keyboard help
            this.setupKeyboardHelp();
            
        } catch (error) {
            console.error('Failed to initialize UI:', error);
            throw new Error('UI initialization failed');
        }
    }

    /**
     * Initialize interaction system
     */
    async initInteraction() {
        try {
            this.interactionManager = new InteractionManager(
                this.config,
                this.renderEngine,
                this.plexusSystem,
                this.exportManager
            );
            
        } catch (error) {
            console.error('Failed to initialize interaction:', error);
            throw new Error('Interaction system initialization failed');
        }
    }

    /**
     * Initialize export/import system
     */
    async initExportImport() {
        try {
            this.exportManager = new ExportImportManager(this.config, this.renderEngine);
            this.exportManager.init();
            
        } catch (error) {
            console.error('Failed to initialize export/import:', error);
            throw new Error('Export/import system initialization failed');
        }
    }

    /**
     * Setup action button handlers
     */
    setupActionButtons() {
        // Reset buttons
        on('#resetBtn', 'click', () => {
            this.plexusSystem.reset(false);
            this.showToast('Particles reset');
        });
        
        on('#hardResetBtn', 'click', () => {
            this.plexusSystem.reset(true);
            this.showToast('System reset');
        });
        
        // Randomize button
        on('#randomizeBtn', 'click', () => {
            this.randomizeConfiguration();
        });
        
        // Play/pause button
        on('#playPauseBtn', 'click', () => {
            this.toggleAnimation();
        });
        
        // Export buttons
        on('#savePngBtn', 'click', async () => {
            try {
                await this.exportManager.exportCanvasPNG({ download: true });
                this.showToast('PNG saved successfully', 'success');
            } catch (error) {
                this.showToast('Failed to save PNG', 'error');
            }
        });
        
        on('#copyJsonBtn', 'click', async () => {
            try {
                const jsonString = this.exportManager.exportConfigJSON(true, false);
                await navigator.clipboard.writeText(jsonString);
                this.showToast('JSON copied to clipboard', 'success');
            } catch (error) {
                this.showToast('Failed to copy JSON', 'error');
            }
        });
        
        on('#exportJsonBtn', 'click', () => {
            try {
                this.exportManager.exportConfigJSON(true, true);
                this.showToast('JSON exported successfully', 'success');
            } catch (error) {
                this.showToast('Failed to export JSON', 'error');
            }
        });
        
        on('#importJsonBtn', 'click', () => {
            this.triggerFileImport();
        });
        
        on('#shareUrlBtn', 'click', async () => {
            try {
                await this.exportManager.generateShareURL(true);
                this.showToast('Share URL copied to clipboard', 'success');
            } catch (error) {
                this.showToast('Failed to generate share URL', 'error');
            }
        });
        
        // File input handler
        on('#fileInput', 'change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    await this.exportManager.importConfigFromFile(file);
                    this.showToast('Configuration imported successfully', 'success');
                } catch (error) {
                    this.showToast('Failed to import configuration', 'error');
                }
            }
            event.target.value = ''; // Reset file input
        });
    }

    /**
     * Setup panel toggle for mobile
     */
    setupPanelToggle() {
        const panelToggle = $('#panelToggle');
        const controlPanel = $('#controlPanel');
        
        if (panelToggle && controlPanel) {
            on(panelToggle, 'click', () => {
                controlPanel.classList.toggle('open');
            });
        }
    }

    /**
     * Setup keyboard help
     */
    setupKeyboardHelp() {
        const keyboardHelp = $('#keyboardHelp');
        const closeHelp = keyboardHelp?.querySelector('.close-help');
        
        if (closeHelp) {
            on(closeHelp, 'click', () => {
                keyboardHelp.classList.remove('visible');
            });
        }
        
        // Close on escape key
        on(document, 'keydown', (event) => {
            if (event.key === 'Escape' && keyboardHelp?.classList.contains('visible')) {
                keyboardHelp.classList.remove('visible');
            }
        });
        
        // Close on background click
        if (keyboardHelp) {
            on(keyboardHelp, 'click', (event) => {
                if (event.target === keyboardHelp) {
                    keyboardHelp.classList.remove('visible');
                }
            });
        }
    }

    /**
     * Handle configuration changes
     * @param {Object} data - Change data
     */
    handleConfigChange(data) {
        const { path, value } = data;
        
        // Update plexus system for relevant changes
        if (this.plexusSystem) {
            this.plexusSystem.updateConfig(path, value);
        }
        
        // Update render engine for performance changes
        if (path.startsWith('performance.')) {
            this.updateRenderEngineSettings();
        }
        
        // Auto-save configuration
        this.config.saveToStorage();
    }

    /**
     * Update render engine settings based on performance config
     */
    updateRenderEngineSettings() {
        if (!this.renderEngine) return;
        
        const performanceConfig = this.config.get('performance');
        
        this.renderEngine.setFPSCap(performanceConfig.fpsCap);
        this.renderEngine.updatePixelRatio(performanceConfig.pixelRatioMode);
        
        // Update spatial indexing
        if (this.plexusSystem) {
            this.plexusSystem.setSpatialIndexType(performanceConfig.spatialIndex);
        }
    }

    /**
     * Start the application
     */
    start() {
        if (this.isRunning) return;
        
        this.stats.startTime = performance.now();
        this.renderEngine.start();
        this.isRunning = true;
        
        console.log('Plexus Canvas App started');
    }

    /**
     * Stop the application
     */
    stop() {
        if (!this.isRunning) return;
        
        this.renderEngine.stop();
        this.isRunning = false;
        
        console.log('Plexus Canvas App stopped');
    }

    /**
     * Toggle animation
     */
    toggleAnimation() {
        if (this.renderEngine.isPaused) {
            this.renderEngine.resume();
            $('#playPauseText').textContent = 'Pause';
        } else {
            this.renderEngine.pause();
            $('#playPauseText').textContent = 'Play';
        }
    }

    /**
     * Randomize configuration
     */
    randomizeConfiguration() {
        // This could be enhanced to randomize specific parameters
        const randomPresets = ['neon-breeze', 'cosmic-web', 'wireframe', 'storm', 'minimal'];
        const randomPreset = randomPresets[Math.floor(Math.random() * randomPresets.length)];
        
        const preset = this.presetManager.getPreset(randomPreset);
        if (preset) {
            this.config.applyPreset(preset);
            this.showToast(`Applied preset: ${preset.meta.name}`);
        }
    }

    /**
     * Trigger file import
     */
    triggerFileImport() {
        const fileInput = $('#fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Show loading indicator
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        this.loadingIndicator = $('#loadingIndicator');
        if (this.loadingIndicator) {
            this.loadingIndicator.querySelector('span').textContent = message;
            show(this.loadingIndicator);
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        if (this.loadingIndicator) {
            hide(this.loadingIndicator);
        }
    }

    /**
     * Show toast message
     * @param {string} message - Message text
     * @param {string} type - Message type
     */
    showToast(message, type = 'info') {
        if (this.interactionManager) {
            this.interactionManager.showToast(message, type);
        }
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', this.errorHandler);
        window.addEventListener('unhandledrejection', this.errorHandler);
    }

    /**
     * Create error handler
     * @returns {Function} Error handler function
     */
    createErrorHandler() {
        return (event) => {
            console.error('Global error:', event.error || event.reason);
            this.showToast('An unexpected error occurred', 'error');
            
            // Don't let errors crash the application
            event.preventDefault();
        };
    }

    /**
     * Handle initialization errors
     * @param {Error} error - Initialization error
     */
    handleInitError(error) {
        console.error('Initialization error:', error);
        
        this.hideLoading();
        
        // Show error message
        const errorMessage = `Failed to initialize Plexus Canvas: ${error.message}`;
        this.showToast(errorMessage, 'error');
        
        // Try to show a basic error state
        const canvas = $('#plexusCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ff0000';
                ctx.font = '16px Arial';
                ctx.fillText('Initialization Error', 20, 50);
                ctx.fillText(error.message, 20, 80);
            }
        }
    }

    /**
     * Get application statistics
     * @returns {Object} Application statistics
     */
    getStats() {
        const baseStats = {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            uptime: this.isRunning ? performance.now() - this.stats.startTime : 0
        };
        
        if (this.renderEngine) {
            baseStats.renderEngine = this.renderEngine.getStats();
        }
        
        if (this.plexusSystem) {
            baseStats.plexusSystem = this.plexusSystem.getStats();
        }
        
        if (this.controlPanel) {
            baseStats.controlPanel = this.controlPanel.getStats();
        }
        
        if (this.interactionManager) {
            baseStats.interaction = this.interactionManager.getStats();
        }
        
        return baseStats;
    }

    /**
     * Destroy the application
     */
    destroy() {
        try {
            // Stop the application
            this.stop();
            
            // Destroy all components
            if (this.interactionManager) {
                this.interactionManager.destroy();
            }
            
            if (this.controlPanel) {
                this.controlPanel.destroy();
            }
            
            if (this.exportManager) {
                this.exportManager.destroy();
            }
            
            if (this.plexusSystem) {
                this.plexusSystem.destroy();
            }
            
            if (this.renderEngine) {
                this.renderEngine.destroy();
            }
            
            // Remove error handlers
            window.removeEventListener('error', this.errorHandler);
            window.removeEventListener('unhandledrejection', this.errorHandler);
            
            console.log('Plexus Canvas App destroyed');
            
        } catch (error) {
            console.error('Error during app destruction:', error);
        }
    }
}

/**
 * Initialize and start the application
 */
async function startApp() {
    try {
        console.log('Starting Plexus Canvas App...');
        console.log('Document ready state:', document.readyState);
        console.log('DOM elements check:', {
            canvas: document.getElementById('plexusCanvas'),
            controlPanel: document.getElementById('controlPanel'),
            loadingIndicator: document.getElementById('loadingIndicator')
        });
        
        const app = new PlexusCanvasApp();
        await app.init();
        
        // Make app globally available for debugging
        window.plexusApp = app;
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            app.destroy();
        });
        
    } catch (error) {
        console.error('Failed to start Plexus Canvas:', error);
    }
}

// Start the application when DOM is ready
function ensureDOMReady() {
    console.log('Checking DOM readiness...');
    
    if (document.readyState === 'loading') {
        console.log('DOM still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired, starting app...');
            startApp();
        });
    } else {
        console.log('DOM already ready, starting app immediately...');
        // Add small delay to ensure all elements are rendered
        setTimeout(startApp, 10);
    }
}

ensureDOMReady();

// Export for advanced usage
export { PlexusCanvasApp };
export default PlexusCanvasApp;