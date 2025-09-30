/**
 * Control panel UI generation for Plexus Canvas
 * Dynamically generates controls for all parameter groups
 */

import { createElement, $, on, off } from '../utils/dom.js';
import { clamp } from '../utils/math.js';

/**
 * Control panel manager class
 */
class ControlPanelManager {
    constructor(config, presetManager) {
        this.config = config;
        this.presetManager = presetManager;
        this.controls = new Map();
        this.panelElement = $('#controlPanel');
        this.isInitialized = false;
        
        // Control definitions
        this.controlDefinitions = this.getControlDefinitions();
        
        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Get control definitions for all parameter groups
     * @returns {Object} Control definitions
     */
    getControlDefinitions() {
        return {
            particles: {
                title: 'Particles',
                controls: {
                    count: {
                        type: 'range',
                        label: 'Count',
                        min: 50,
                        max: 3000,
                        step: 50,
                        path: 'particles.count'
                    },
                    spawnArea: {
                        type: 'select',
                        label: 'Spawn Area',
                        options: [
                            { value: 'full', text: 'Full Canvas' },
                            { value: 'ellipse', text: 'Ellipse' },
                            { value: 'ring', text: 'Ring' },
                            { value: 'rect', text: 'Rectangle' }
                        ],
                        path: 'particles.spawnArea'
                    },
                    speed: {
                        type: 'range',
                        label: 'Speed',
                        min: 0,
                        max: 2,
                        step: 0.05,
                        path: 'particles.speed'
                    },
                    size: {
                        type: 'range',
                        label: 'Size',
                        min: 0.5,
                        max: 6,
                        step: 0.1,
                        path: 'particles.size'
                    },
                    jitter: {
                        type: 'range',
                        label: 'Jitter',
                        min: 0,
                        max: 1,
                        step: 0.05,
                        path: 'particles.jitter'
                    }
                }
            },
            edges: {
                title: 'Edges',
                controls: {
                    maxDistance: {
                        type: 'range',
                        label: 'Max Distance',
                        min: 30,
                        max: 400,
                        step: 10,
                        path: 'edges.maxDistance'
                    },
                    maxEdgesPerNode: {
                        type: 'range',
                        label: 'Max Edges Per Node',
                        min: 0,
                        max: 12,
                        step: 1,
                        path: 'edges.maxEdgesPerNode'
                    },
                    lineWidth: {
                        type: 'range',
                        label: 'Line Width',
                        min: 0.2,
                        max: 3,
                        step: 0.1,
                        path: 'edges.lineWidth'
                    },
                    lineOpacity: {
                        type: 'range',
                        label: 'Line Opacity',
                        min: 0,
                        max: 1,
                        step: 0.05,
                        path: 'edges.lineOpacity'
                    },
                    blendMode: {
                        type: 'select',
                        label: 'Blend Mode',
                        options: [
                            { value: 'normal', text: 'Normal' },
                            { value: 'lighten', text: 'Lighten' },
                            { value: 'screen', text: 'Screen' },
                            { value: 'overlay', text: 'Overlay' },
                            { value: 'multiply', text: 'Multiply' }
                        ],
                        path: 'edges.blendMode'
                    },
                    colorMode: {
                        type: 'select',
                        label: 'Color Mode',
                        options: [
                            { value: 'static', text: 'Static Color' },
                            { value: 'byDistance', text: 'By Distance' },
                            { value: 'byVelocity', text: 'By Velocity' }
                        ],
                        path: 'edges.colorMode'
                    },
                    staticColor: {
                        type: 'color',
                        label: 'Static Color',
                        path: 'edges.staticColor',
                        condition: 'edges.colorMode=static'
                    }
                }
            },
            forces: {
                title: 'Forces & Motion',
                controls: {
                    noiseStrength: {
                        type: 'range',
                        label: 'Noise Strength',
                        min: 0,
                        max: 1,
                        step: 0.05,
                        path: 'forces.noiseStrength'
                    },
                    gravity: {
                        type: 'range',
                        label: 'Gravity',
                        min: -1,
                        max: 1,
                        step: 0.05,
                        path: 'forces.gravity'
                    },
                    drag: {
                        type: 'range',
                        label: 'Drag',
                        min: 0,
                        max: 0.1,
                        step: 0.005,
                        path: 'forces.drag'
                    }
                }
            },
            style: {
                title: 'Colors & Style',
                controls: {
                    bgColor: {
                        type: 'color',
                        label: 'Background Color',
                        path: 'style.bg.color'
                    },
                    bgOpacity: {
                        type: 'range',
                        label: 'Background Opacity',
                        min: 0,
                        max: 1,
                        step: 0.05,
                        path: 'style.bg.opacity'
                    },
                    particleColor: {
                        type: 'color',
                        label: 'Particle Color',
                        path: 'style.particleColor'
                    }
                }
            },
            interaction: {
                title: 'Interaction',
                controls: {
                    mouseRepel: {
                        type: 'range',
                        label: 'Mouse Repel',
                        min: 0,
                        max: 1,
                        step: 0.05,
                        path: 'interaction.mouseRepel'
                    },
                    mouseRadius: {
                        type: 'range',
                        label: 'Mouse Radius',
                        min: 0,
                        max: 300,
                        step: 10,
                        path: 'interaction.mouseRadius'
                    },
                    hoverHighlight: {
                        type: 'checkbox',
                        label: 'Hover Highlight',
                        path: 'interaction.hoverHighlight'
                    },
                    clickSpawn: {
                        type: 'checkbox',
                        label: 'Click to Spawn',
                        path: 'interaction.clickSpawn'
                    }
                }
            },
            performance: {
                title: 'Performance',
                controls: {
                    fpsCap: {
                        type: 'select',
                        label: 'FPS Cap',
                        options: [
                            { value: 30, text: '30 FPS' },
                            { value: 60, text: '60 FPS' },
                            { value: 120, text: '120 FPS' },
                            { value: 0, text: 'Unlimited' }
                        ],
                        path: 'performance.fpsCap'
                    },
                    pixelRatioMode: {
                        type: 'select',
                        label: 'Pixel Ratio',
                        options: [
                            { value: 'auto', text: 'Auto' },
                            { value: '1x', text: '1x' },
                            { value: '2x', text: '2x' }
                        ],
                        path: 'performance.pixelRatioMode'
                    },
                    spatialIndex: {
                        type: 'select',
                        label: 'Spatial Index',
                        options: [
                            { value: 'none', text: 'None' },
                            { value: 'grid', text: 'Grid' },
                            { value: 'quadtree', text: 'Quadtree' }
                        ],
                        path: 'performance.spatialIndex'
                    },
                    batchEdges: {
                        type: 'checkbox',
                        label: 'Batch Edge Rendering',
                        path: 'performance.batchEdges'
                    }
                }
            }
        };
    }

    /**
     * Initialize the control panel
     */
    init() {
        if (this.isInitialized) return;

        this.createControlGroups();
        this.setupPresetControls();
        this.bindConfigEvents();
        this.updateAllControls();

        this.isInitialized = true;
        console.log('Control panel initialized');
    }

    /**
     * Create control groups and controls
     */
    createControlGroups() {
        Object.entries(this.controlDefinitions).forEach(([groupKey, groupDef]) => {
            const groupElement = $(`#${groupKey}Group`);
            if (!groupElement) return;

            const container = groupElement.querySelector('.controls-container');
            if (!container) return;

            // Clear existing controls
            container.innerHTML = '';

            // Create controls for this group
            Object.entries(groupDef.controls).forEach(([controlKey, controlDef]) => {
                const controlElement = this.createControl(controlKey, controlDef);
                if (controlElement) {
                    container.appendChild(controlElement);
                    this.controls.set(controlDef.path, {
                        element: controlElement,
                        definition: controlDef
                    });
                }
            });
        });
    }

    /**
     * Create a single control element
     * @param {string} key - Control key
     * @param {Object} definition - Control definition
     * @returns {Element} Control element
     */
    createControl(key, definition) {
        const { type, label, path } = definition;
        
        const wrapper = createElement('div', { className: 'control-item' });
        
        // Create label
        const labelElement = createElement('label', {
            htmlFor: `control-${key}`,
            className: 'control-label'
        }, label);
        
        wrapper.appendChild(labelElement);

        // Create control based on type
        let controlElement;
        
        switch (type) {
            case 'range':
                controlElement = this.createRangeControl(key, definition);
                break;
            case 'select':
                controlElement = this.createSelectControl(key, definition);
                break;
            case 'color':
                controlElement = this.createColorControl(key, definition);
                break;
            case 'checkbox':
                controlElement = this.createCheckboxControl(key, definition);
                break;
            default:
                console.warn(`Unknown control type: ${type}`);
                return null;
        }

        if (controlElement) {
            wrapper.appendChild(controlElement);
            
            // Add event listener
            this.addControlEventListener(controlElement, definition);
        }

        return wrapper;
    }

    /**
     * Create range slider control
     * @param {string} key - Control key
     * @param {Object} definition - Control definition
     * @returns {Element} Range control element
     */
    createRangeControl(key, definition) {
        const { min, max, step, path } = definition;
        
        const wrapper = createElement('div', { className: 'range-input-group' });
        
        const input = createElement('input', {
            type: 'range',
            id: `control-${key}`,
            min: min.toString(),
            max: max.toString(),
            step: step.toString(),
            className: 'range-input'
        });
        
        const valueDisplay = createElement('span', {
            className: 'range-value',
            id: `value-${key}`
        });
        
        wrapper.appendChild(input);
        wrapper.appendChild(valueDisplay);
        
        return wrapper;
    }

    /**
     * Create select dropdown control
     * @param {string} key - Control key
     * @param {Object} definition - Control definition
     * @returns {Element} Select control element
     */
    createSelectControl(key, definition) {
        const { options } = definition;
        
        const select = createElement('select', {
            id: `control-${key}`,
            className: 'select-input'
        });
        
        options.forEach(option => {
            const optionElement = createElement('option', {
                value: option.value.toString()
            }, option.text);
            
            select.appendChild(optionElement);
        });
        
        return select;
    }

    /**
     * Create color picker control
     * @param {string} key - Control key
     * @param {Object} definition - Control definition
     * @returns {Element} Color control element
     */
    createColorControl(key, definition) {
        const input = createElement('input', {
            type: 'color',
            id: `control-${key}`,
            className: 'color-input'
        });
        
        return input;
    }

    /**
     * Create checkbox control
     * @param {string} key - Control key
     * @param {Object} definition - Control definition
     * @returns {Element} Checkbox control element
     */
    createCheckboxControl(key, definition) {
        const wrapper = createElement('div', { className: 'checkbox-wrapper' });
        
        const input = createElement('input', {
            type: 'checkbox',
            id: `control-${key}`,
            className: 'checkbox-input'
        });
        
        wrapper.appendChild(input);
        
        return wrapper;
    }

    /**
     * Add event listener to control
     * @param {Element} controlElement - Control element
     * @param {Object} definition - Control definition
     */
    addControlEventListener(controlElement, definition) {
        const { type, path } = definition;
        let input;
        
        if (type === 'range') {
            input = controlElement.querySelector('input[type="range"]');
        } else if (type === 'checkbox') {
            input = controlElement.querySelector('input[type="checkbox"]');
        } else {
            input = controlElement.querySelector('input, select');
        }
        
        if (!input) return;
        
        const eventType = type === 'range' ? 'input' : 'change';
        
        const handler = (event) => {
            let value = event.target.value;
            
            // Convert value based on type
            if (type === 'range') {
                value = parseFloat(value);
                // Update value display
                const valueDisplay = controlElement.querySelector('.range-value');
                if (valueDisplay) {
                    valueDisplay.textContent = this.formatValue(value, definition);
                }
            } else if (type === 'checkbox') {
                value = event.target.checked;
            } else if (type === 'select') {
                // Convert numeric options
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    value = numValue;
                }
            }
            
            // Update configuration
            this.config.set(path, value);
        };
        
        on(input, eventType, handler);
        
        // Store event listener for cleanup
        this.eventListeners.set(path, { element: input, event: eventType, handler });
    }

    /**
     * Format value for display
     * @param {number} value - Value to format
     * @param {Object} definition - Control definition
     * @returns {string} Formatted value
     */
    formatValue(value, definition) {
        const { step } = definition;
        
        if (step < 1) {
            const decimals = step.toString().split('.')[1]?.length || 2;
            return value.toFixed(decimals);
        } else {
            return Math.round(value).toString();
        }
    }

    /**
     * Setup preset controls
     */
    setupPresetControls() {
        const presetSelect = $('#presetSelect');
        if (!presetSelect) return;

        // Clear existing options
        presetSelect.innerHTML = '<option value="">Select Preset...</option>';

        // Add preset options
        const presets = this.presetManager.getPresetOptions();
        presets.forEach(preset => {
            const option = createElement('option', {
                value: preset.id
            }, `${preset.name}${preset.custom ? ' (Custom)' : ''}`);
            
            presetSelect.appendChild(option);
        });

        // Add event listener
        on(presetSelect, 'change', (event) => {
            const presetId = event.target.value;
            if (presetId) {
                const preset = this.presetManager.getPreset(presetId);
                if (preset) {
                    this.config.applyPreset(preset);
                    this.presetManager.addToRecent(presetId);
                }
            }
        });
    }

    /**
     * Bind configuration change events
     */
    bindConfigEvents() {
        this.config.on('change', (data) => {
            this.updateControl(data.path);
        });

        this.config.on('preset-applied', () => {
            this.updateAllControls();
        });

        this.config.on('config-replaced', () => {
            this.updateAllControls();
        });

        this.config.on('reset', () => {
            this.updateAllControls();
        });
    }

    /**
     * Update a specific control
     * @param {string} path - Configuration path
     */
    updateControl(path) {
        const controlData = this.controls.get(path);
        if (!controlData) return;

        const { element, definition } = controlData;
        const { type } = definition;
        const value = this.config.get(path);

        let input;
        
        if (type === 'range') {
            input = element.querySelector('input[type="range"]');
            const valueDisplay = element.querySelector('.range-value');
            
            if (input) {
                input.value = value;
            }
            if (valueDisplay) {
                valueDisplay.textContent = this.formatValue(value, definition);
            }
        } else if (type === 'checkbox') {
            input = element.querySelector('input[type="checkbox"]');
            if (input) {
                input.checked = value;
            }
        } else {
            input = element.querySelector('input, select');
            if (input) {
                input.value = value;
            }
        }
    }

    /**
     * Update all controls
     */
    updateAllControls() {
        this.controls.forEach((controlData, path) => {
            this.updateControl(path);
        });
    }

    /**
     * Show/hide controls based on conditions
     */
    updateControlVisibility() {
        this.controls.forEach((controlData, path) => {
            const { element, definition } = controlData;
            const { condition } = definition;
            
            if (condition) {
                const [conditionPath, conditionValue] = condition.split('=');
                const currentValue = this.config.get(conditionPath);
                const shouldShow = currentValue === conditionValue;
                
                element.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }

    /**
     * Get control value
     * @param {string} path - Configuration path
     * @returns {*} Control value
     */
    getControlValue(path) {
        const controlData = this.controls.get(path);
        if (!controlData) return undefined;

        const { element, definition } = controlData;
        const { type } = definition;

        let input;
        
        if (type === 'range') {
            input = element.querySelector('input[type="range"]');
        } else if (type === 'checkbox') {
            input = element.querySelector('input[type="checkbox"]');
            return input ? input.checked : undefined;
        } else {
            input = element.querySelector('input, select');
        }

        if (!input) return undefined;

        let value = input.value;
        
        if (type === 'range' || (type === 'select' && !isNaN(parseFloat(value)))) {
            value = parseFloat(value);
        }

        return value;
    }

    /**
     * Validate control values
     * @returns {Object} Validation results
     */
    validateControls() {
        const errors = [];
        const warnings = [];

        this.controls.forEach((controlData, path) => {
            const { definition } = controlData;
            const value = this.getControlValue(path);
            const rule = this.config.getValidationRule(path);

            if (rule && !this.config.validateValue(path, value)) {
                errors.push({
                    path,
                    value,
                    message: `Invalid value for ${definition.label}: ${value}`
                });
            }

            // Check for warnings (like high particle count)
            if (path === 'particles.count' && value > 2000) {
                warnings.push({
                    path,
                    value,
                    message: `High particle count (${value}) may affect performance`
                });
            }
        });

        return { errors, warnings };
    }

    /**
     * Reset controls to default values
     */
    resetControls() {
        this.config.reset();
    }

    /**
     * Enable/disable all controls
     * @param {boolean} enabled - Enable state
     */
    setControlsEnabled(enabled) {
        this.controls.forEach((controlData) => {
            const { element } = controlData;
            const inputs = element.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                input.disabled = !enabled;
            });
        });
    }

    /**
     * Get panel statistics
     * @returns {Object} Panel statistics
     */
    getStats() {
        return {
            totalControls: this.controls.size,
            visibleControls: Array.from(this.controls.values())
                .filter(data => data.element.style.display !== 'none').length,
            eventListeners: this.eventListeners.size,
            isInitialized: this.isInitialized
        };
    }

    /**
     * Destroy the control panel
     */
    destroy() {
        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            off(element, event, handler);
        });

        // Clear controls
        this.controls.clear();
        this.eventListeners.clear();

        this.isInitialized = false;
        console.log('Control panel destroyed');
    }
}

// Export the control panel manager
export { ControlPanelManager };
export default ControlPanelManager;