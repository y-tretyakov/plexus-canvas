/**
 * Configuration state management for Plexus Canvas
 * Handles validation, events, and persistence
 */

import { clamp } from '../utils/math.js';

/**
 * Default configuration object with all parameters
 */
const DEFAULT_CONFIG = {
    particles: {
        count: 800,
        size: 2,
        speed: 0.35,
        jitter: 0.2,
        spawnArea: 'full' // full, ellipse, ring, rect
    },
    edges: {
        maxDistance: 140,
        maxEdgesPerNode: 6,
        lineWidth: 1,
        lineOpacity: 0.6,
        blendMode: 'lighten', // normal, lighten, screen, overlay
        colorMode: 'byDistance', // static, byDistance, byVelocity
        staticColor: '#88ccff'
    },
    forces: {
        noiseStrength: 0.15,
        gravity: 0.05,
        drag: 0.02
    },
    style: {
        bg: { 
            color: '#0b1020', 
            opacity: 1 
        },
        particleColor: '#e0f2ff',
        gradient: [
            { stop: 0.0, color: '#00e5ff' },
            { stop: 1.0, color: '#7c4dff' }
        ]
    },
    interaction: {
        mouseRepel: 0.35,
        mouseRadius: 120,
        hoverHighlight: true,
        clickSpawn: false
    },
    performance: {
        fpsCap: 60,
        pixelRatioMode: 'auto', // auto, 1x, 2x
        spatialIndex: 'grid', // none, grid, quadtree
        batchEdges: true
    },
    meta: {
        name: 'Default Configuration',
        version: 1,
        created: new Date().toISOString()
    }
};

/**
 * Parameter validation rules
 */
const VALIDATION_RULES = {
    'particles.count': { min: 50, max: 5000, type: 'integer', warning: 2000 },
    'particles.size': { min: 0.5, max: 10, type: 'float' },
    'particles.speed': { min: 0, max: 5, type: 'float' },
    'particles.jitter': { min: 0, max: 1, type: 'float' },
    'particles.spawnArea': { values: ['full', 'ellipse', 'ring', 'rect'], type: 'enum' },
    
    'edges.maxDistance': { min: 30, max: 400, type: 'integer' },
    'edges.maxEdgesPerNode': { min: 0, max: 20, type: 'integer' },
    'edges.lineWidth': { min: 0.1, max: 5, type: 'float' },
    'edges.lineOpacity': { min: 0, max: 1, type: 'float' },
    'edges.blendMode': { values: ['normal', 'lighten', 'screen', 'overlay', 'multiply'], type: 'enum' },
    'edges.colorMode': { values: ['static', 'byDistance', 'byVelocity'], type: 'enum' },
    'edges.staticColor': { type: 'color' },
    
    'forces.noiseStrength': { min: 0, max: 2, type: 'float' },
    'forces.gravity': { min: -2, max: 2, type: 'float' },
    'forces.drag': { min: 0, max: 0.1, type: 'float' },
    
    'style.bg.opacity': { min: 0, max: 1, type: 'float' },
    'style.bg.color': { type: 'color' },
    'style.particleColor': { type: 'color' },
    
    'interaction.mouseRepel': { min: 0, max: 2, type: 'float' },
    'interaction.mouseRadius': { min: 0, max: 500, type: 'integer' },
    'interaction.hoverHighlight': { type: 'boolean' },
    'interaction.clickSpawn': { type: 'boolean' },
    
    'performance.fpsCap': { values: [30, 60, 120, 0], type: 'enum' },
    'performance.pixelRatioMode': { values: ['auto', '1x', '2x'], type: 'enum' },
    'performance.spatialIndex': { values: ['none', 'grid', 'quadtree'], type: 'enum' },
    'performance.batchEdges': { type: 'boolean' }
};

/**
 * Configuration manager class
 */
class ConfigManager {
    constructor() {
        this.config = this.deepClone(DEFAULT_CONFIG);
        this.listeners = new Map();
        this.version = 1;
        this.isDirty = false;
        this.lastSaved = null;
        
        // Load from localStorage if available
        this.loadFromStorage();
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }

    /**
     * Get nested property value using dot notation
     * @param {string} path - Property path (e.g., 'particles.count')
     * @returns {*} Property value
     */
    get(path) {
        const parts = path.split('.');
        let current = this.config;
        
        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            current = current[part];
        }
        
        return current;
    }

    /**
     * Set nested property value using dot notation
     * @param {string} path - Property path
     * @param {*} value - New value
     * @param {boolean} skipValidation - Skip validation
     * @returns {boolean} Success status
     */
    set(path, value, skipValidation = false) {
        // Validate value if rules exist
        if (!skipValidation && !this.validateValue(path, value)) {
            return false;
        }

        const parts = path.split('.');
        const lastPart = parts.pop();
        let current = this.config;
        
        // Navigate to parent object
        for (const part of parts) {
            if (!(part in current)) {
                current[part] = {};
            }
            current = current[part];
        }
        
        const oldValue = current[lastPart];
        current[lastPart] = value;
        
        // Mark as dirty
        this.isDirty = true;
        
        // Emit change event
        this.emit('change', {
            path,
            value,
            oldValue,
            config: this.deepClone(this.config)
        });
        
        // Emit specific path change event
        this.emit(`change:${path}`, {
            value,
            oldValue,
            config: this.deepClone(this.config)
        });
        
        return true;
    }

    /**
     * Validate value against rules
     * @param {string} path - Property path
     * @param {*} value - Value to validate
     * @returns {boolean} Validation result
     */
    validateValue(path, value) {
        const rule = VALIDATION_RULES[path];
        if (!rule) return true; // No validation rule = valid
        
        try {
            switch (rule.type) {
                case 'integer':
                    const intValue = parseInt(value);
                    if (isNaN(intValue)) return false;
                    if (rule.min !== undefined && intValue < rule.min) return false;
                    if (rule.max !== undefined && intValue > rule.max) return false;
                    // Check for warning threshold
                    if (rule.warning && intValue > rule.warning) {
                        this.emit('warning', {
                            path,
                            value: intValue,
                            message: `High value (${intValue}) may affect performance`
                        });
                    }
                    return true;
                    
                case 'float':
                    const floatValue = parseFloat(value);
                    if (isNaN(floatValue)) return false;
                    if (rule.min !== undefined && floatValue < rule.min) return false;
                    if (rule.max !== undefined && floatValue > rule.max) return false;
                    return true;
                    
                case 'enum':
                    return rule.values.includes(value);
                    
                case 'color':
                    return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value);
                    
                case 'boolean':
                    return typeof value === 'boolean';
                    
                default:
                    return true;
            }
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    /**
     * Get validation rule for a path
     * @param {string} path - Property path
     * @returns {Object|null} Validation rule
     */
    getValidationRule(path) {
        return VALIDATION_RULES[path] || null;
    }

    /**
     * Clamp value to valid range
     * @param {string} path - Property path
     * @param {*} value - Value to clamp
     * @returns {*} Clamped value
     */
    clampValue(path, value) {
        const rule = VALIDATION_RULES[path];
        if (!rule) return value;
        
        if (rule.type === 'integer' || rule.type === 'float') {
            if (rule.min !== undefined && rule.max !== undefined) {
                return clamp(value, rule.min, rule.max);
            }
        }
        
        return value;
    }

    /**
     * Update multiple properties at once
     * @param {Object} updates - Object with path-value pairs
     */
    update(updates) {
        const changes = [];
        let hasChanges = false;
        
        Object.entries(updates).forEach(([path, value]) => {
            const oldValue = this.get(path);
            if (this.set(path, value, false)) {
                changes.push({ path, value, oldValue });
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            this.emit('batch-change', {
                changes,
                config: this.deepClone(this.config)
            });
        }
    }

    /**
     * Reset to default configuration
     * @param {boolean} soft - Soft reset (keep meta data)
     */
    reset(soft = true) {
        const oldConfig = this.deepClone(this.config);
        this.config = this.deepClone(DEFAULT_CONFIG);
        
        if (soft) {
            // Preserve meta information
            this.config.meta = {
                ...this.config.meta,
                ...oldConfig.meta,
                modified: new Date().toISOString()
            };
        }
        
        this.isDirty = true;
        this.emit('reset', {
            config: this.deepClone(this.config),
            oldConfig,
            soft
        });
    }

    /**
     * Apply preset configuration
     * @param {Object} presetConfig - Preset configuration
     * @param {boolean} merge - Merge with current config or replace
     */
    applyPreset(presetConfig, merge = false) {
        const oldConfig = this.deepClone(this.config);
        
        if (merge) {
            this.config = this.mergeConfigs(this.config, presetConfig);
        } else {
            this.config = this.deepClone(presetConfig);
        }
        
        this.isDirty = true;
        this.emit('preset-applied', {
            config: this.deepClone(this.config),
            oldConfig,
            preset: presetConfig
        });
    }

    /**
     * Merge two configurations
     * @param {Object} base - Base configuration
     * @param {Object} override - Override configuration
     * @returns {Object} Merged configuration
     */
    mergeConfigs(base, override) {
        const result = this.deepClone(base);
        
        function merge(target, source) {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            });
        }
        
        merge(result, override);
        return result;
    }

    /**
     * Get full configuration
     * @returns {Object} Current configuration
     */
    getAll() {
        return this.deepClone(this.config);
    }

    /**
     * Set full configuration
     * @param {Object} newConfig - New configuration
     * @param {boolean} validate - Validate the configuration
     * @returns {boolean} Success status
     */
    setAll(newConfig, validate = true) {
        if (validate && !this.validateConfig(newConfig)) {
            return false;
        }
        
        const oldConfig = this.deepClone(this.config);
        this.config = this.deepClone(newConfig);
        this.isDirty = true;
        
        this.emit('config-replaced', {
            config: this.deepClone(this.config),
            oldConfig
        });
        
        return true;
    }

    /**
     * Validate entire configuration
     * @param {Object} config - Configuration to validate
     * @returns {boolean} Validation result
     */
    validateConfig(config) {
        try {
            // Check required structure
            const requiredSections = ['particles', 'edges', 'forces', 'style', 'interaction', 'performance'];
            for (const section of requiredSections) {
                if (!config[section] || typeof config[section] !== 'object') {
                    return false;
                }
            }
            
            // Validate individual properties
            for (const path of Object.keys(VALIDATION_RULES)) {
                const value = this.getNestedValue(config, path);
                if (value !== undefined && !this.validateValue(path, value)) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Config validation error:', error);
            return false;
        }
    }

    /**
     * Get nested value from object
     * @param {Object} obj - Object to search
     * @param {string} path - Dot notation path
     * @returns {*} Value or undefined
     */
    getNestedValue(obj, path) {
        const parts = path.split('.');
        let current = obj;
        
        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            current = current[part];
        }
        
        return current;
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Event listener error (${event}):`, error);
                }
            });
        }
    }

    /**
     * Save configuration to localStorage
     */
    saveToStorage() {
        try {
            const saveData = {
                config: this.config,
                version: this.version,
                timestamp: Date.now()
            };
            localStorage.setItem('plexus-canvas-config', JSON.stringify(saveData));
            this.isDirty = false;
            this.lastSaved = Date.now();
            this.emit('saved', { timestamp: this.lastSaved });
        } catch (error) {
            console.error('Failed to save config to localStorage:', error);
        }
    }

    /**
     * Load configuration from localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('plexus-canvas-config');
            if (saved) {
                const saveData = JSON.parse(saved);
                if (saveData.config && this.validateConfig(saveData.config)) {
                    this.config = saveData.config;
                    this.lastSaved = saveData.timestamp;
                    this.emit('loaded', { 
                        config: this.deepClone(this.config),
                        timestamp: this.lastSaved 
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load config from localStorage:', error);
            // Reset to default if corrupted
            this.config = this.deepClone(DEFAULT_CONFIG);
        }
    }

    /**
     * Export configuration as JSON string
     * @param {boolean} prettify - Format JSON for readability
     * @returns {string} JSON string
     */
    exportJSON(prettify = true) {
        const exportData = {
            ...this.deepClone(this.config),
            meta: {
                ...this.config.meta,
                exported: new Date().toISOString(),
                version: this.version
            }
        };
        
        return prettify ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
    }

    /**
     * Import configuration from JSON string
     * @param {string} jsonString - JSON configuration string
     * @returns {boolean} Success status
     */
    importJSON(jsonString) {
        try {
            const importedConfig = JSON.parse(jsonString);
            if (this.validateConfig(importedConfig)) {
                const oldConfig = this.deepClone(this.config);
                this.config = importedConfig;
                this.isDirty = true;
                
                this.emit('imported', {
                    config: this.deepClone(this.config),
                    oldConfig
                });
                
                return true;
            }
        } catch (error) {
            console.error('Failed to import config from JSON:', error);
            this.emit('import-error', { error: error.message });
        }
        return false;
    }

    /**
     * Generate shareable URL with configuration
     * @returns {string} Shareable URL
     */
    generateShareURL() {
        try {
            const configString = JSON.stringify(this.config);
            const encoded = btoa(configString);
            const baseURL = window.location.origin + window.location.pathname;
            return `${baseURL}#config=${encoded}`;
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            return window.location.href;
        }
    }

    /**
     * Load configuration from URL hash
     * @returns {boolean} Success status
     */
    loadFromURL() {
        try {
            const hash = window.location.hash;
            if (hash.startsWith('#config=')) {
                const encoded = hash.slice(8); // Remove '#config='
                const configString = atob(encoded);
                const config = JSON.parse(configString);
                
                if (this.validateConfig(config)) {
                    const oldConfig = this.deepClone(this.config);
                    this.config = config;
                    this.isDirty = true;
                    
                    this.emit('url-loaded', {
                        config: this.deepClone(this.config),
                        oldConfig
                    });
                    
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to load config from URL:', error);
        }
        return false;
    }

    /**
     * Get default configuration
     * @returns {Object} Default configuration
     */
    getDefaults() {
        return this.deepClone(DEFAULT_CONFIG);
    }

    /**
     * Check if configuration has unsaved changes
     * @returns {boolean} True if dirty
     */
    isDirtyState() {
        return this.isDirty;
    }

    /**
     * Mark configuration as clean (saved)
     */
    markClean() {
        this.isDirty = false;
    }
}

// Create and export singleton instance
export const config = new ConfigManager();

// Export default config for reference
export { DEFAULT_CONFIG };

// Export for advanced usage
export { ConfigManager };

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    if (config.isDirtyState()) {
        config.saveToStorage();
    }
});

// Load from URL on page load
document.addEventListener('DOMContentLoaded', () => {
    config.loadFromURL();
});

export default config;