/**
 * Preset system for Plexus Canvas
 * Contains built-in configurations and preset management
 */

/**
 * Built-in presets collection
 */
export const BUILT_IN_PRESETS = {
    'neon-breeze': {
        particles: {
            count: 800,
            size: 2,
            speed: 0.35,
            jitter: 0.2,
            spawnArea: 'full'
        },
        edges: {
            maxDistance: 140,
            maxEdgesPerNode: 6,
            lineWidth: 1,
            lineOpacity: 0.6,
            blendMode: 'lighten',
            colorMode: 'byDistance',
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
            pixelRatioMode: 'auto',
            spatialIndex: 'grid',
            batchEdges: true
        },
        meta: {
            name: 'Neon Breeze',
            description: 'Soft gradient visualization with neon blue-purple colors and gentle motion',
            tags: ['default', 'colorful', 'smooth'],
            author: 'Plexus Canvas',
            version: 1
        }
    },

    'cosmic-web': {
        particles: {
            count: 600,
            size: 1.5,
            speed: 0.1,
            jitter: 0.05,
            spawnArea: 'ellipse'
        },
        edges: {
            maxDistance: 220,
            maxEdgesPerNode: 8,
            lineWidth: 0.8,
            lineOpacity: 0.4,
            blendMode: 'screen',
            colorMode: 'byDistance',
            staticColor: '#ffffff'
        },
        forces: {
            noiseStrength: 0.08,
            gravity: 0.02,
            drag: 0.01
        },
        style: {
            bg: { 
                color: '#020411', 
                opacity: 1 
            },
            particleColor: '#ffffff',
            gradient: [
                { stop: 0.0, color: '#4a148c' },
                { stop: 0.5, color: '#7b1fa2' },
                { stop: 1.0, color: '#ffffff' }
            ]
        },
        interaction: {
            mouseRepel: 0.15,
            mouseRadius: 180,
            hoverHighlight: true,
            clickSpawn: false
        },
        performance: {
            fpsCap: 60,
            pixelRatioMode: 'auto',
            spatialIndex: 'grid',
            batchEdges: true
        },
        meta: {
            name: 'Cosmic Web',
            description: 'Deep space visualization with large connections and slow, ethereal movement',
            tags: ['space', 'slow', 'ethereal'],
            author: 'Plexus Canvas',
            version: 1
        }
    },

    'wireframe': {
        particles: {
            count: 300,
            size: 0.5,
            speed: 0.25,
            jitter: 0.1,
            spawnArea: 'rect'
        },
        edges: {
            maxDistance: 160,
            maxEdgesPerNode: 4,
            lineWidth: 0.5,
            lineOpacity: 0.25,
            blendMode: 'normal',
            colorMode: 'static',
            staticColor: '#ffffff'
        },
        forces: {
            noiseStrength: 0.05,
            gravity: 0,
            drag: 0.015
        },
        style: {
            bg: { 
                color: '#000000', 
                opacity: 1 
            },
            particleColor: '#ffffff',
            gradient: [
                { stop: 0.0, color: '#ffffff' },
                { stop: 1.0, color: '#cccccc' }
            ]
        },
        interaction: {
            mouseRepel: 0.2,
            mouseRadius: 100,
            hoverHighlight: false,
            clickSpawn: true
        },
        performance: {
            fpsCap: 60,
            pixelRatioMode: 'auto',
            spatialIndex: 'grid',
            batchEdges: true
        },
        meta: {
            name: 'Wireframe',
            description: 'Minimal white lines on black background, resembling technical wireframe drawings',
            tags: ['minimal', 'wireframe', 'monochrome'],
            author: 'Plexus Canvas',
            version: 1
        }
    },

    'storm': {
        particles: {
            count: 1200,
            size: 1.8,
            speed: 0.8,
            jitter: 0.6,
            spawnArea: 'full'
        },
        edges: {
            maxDistance: 120,
            maxEdgesPerNode: 5,
            lineWidth: 1.2,
            lineOpacity: 0.7,
            blendMode: 'overlay',
            colorMode: 'byVelocity',
            staticColor: '#ffaa00'
        },
        forces: {
            noiseStrength: 0.8,
            gravity: 0.1,
            drag: 0.03
        },
        style: {
            bg: { 
                color: '#1a0f0f', 
                opacity: 1 
            },
            particleColor: '#ff6b35',
            gradient: [
                { stop: 0.0, color: '#ff6b35' },
                { stop: 0.5, color: '#f7931e' },
                { stop: 1.0, color: '#ffdd00' }
            ]
        },
        interaction: {
            mouseRepel: 0.7,
            mouseRadius: 200,
            hoverHighlight: true,
            clickSpawn: true
        },
        performance: {
            fpsCap: 60,
            pixelRatioMode: 'auto',
            spatialIndex: 'grid',
            batchEdges: true
        },
        meta: {
            name: 'Storm',
            description: 'High energy visualization with strong noise and intense mouse interaction',
            tags: ['energetic', 'chaotic', 'interactive'],
            author: 'Plexus Canvas',
            version: 1
        }
    },

    'minimal': {
        particles: {
            count: 200,
            size: 3,
            speed: 0.15,
            jitter: 0.05,
            spawnArea: 'ellipse'
        },
        edges: {
            maxDistance: 180,
            maxEdgesPerNode: 3,
            lineWidth: 2.5,
            lineOpacity: 0.8,
            blendMode: 'normal',
            colorMode: 'static',
            staticColor: '#e8e3d3'
        },
        forces: {
            noiseStrength: 0.03,
            gravity: 0.01,
            drag: 0.008
        },
        style: {
            bg: { 
                color: '#f5f5dc', 
                opacity: 1 
            },
            particleColor: '#8b7355',
            gradient: [
                { stop: 0.0, color: '#d2b48c' },
                { stop: 1.0, color: '#8b7355' }
            ]
        },
        interaction: {
            mouseRepel: 0.1,
            mouseRadius: 150,
            hoverHighlight: true,
            clickSpawn: false
        },
        performance: {
            fpsCap: 30,
            pixelRatioMode: 'auto',
            spatialIndex: 'grid',
            batchEdges: true
        },
        meta: {
            name: 'Minimal',
            description: 'Clean, minimal design with few particles and thick connections in warm earth tones',
            tags: ['minimal', 'clean', 'warm'],
            author: 'Plexus Canvas',
            version: 1
        }
    }
};

/**
 * Preset categories for organization
 */
export const PRESET_CATEGORIES = {
    'built-in': {
        name: 'Built-in Presets',
        description: 'Default presets included with Plexus Canvas',
        presets: Object.keys(BUILT_IN_PRESETS)
    },
    'custom': {
        name: 'Custom Presets',
        description: 'User-created custom presets',
        presets: []
    }
};

/**
 * Preset manager class
 */
class PresetManager {
    constructor() {
        this.customPresets = new Map();
        this.favoritePresets = new Set();
        this.recentPresets = [];
        this.maxRecentPresets = 10;
        
        // Load custom presets from localStorage
        this.loadCustomPresets();
    }

    /**
     * Get all available presets
     * @returns {Object} All presets organized by category
     */
    getAllPresets() {
        const customPresetsObj = {};
        this.customPresets.forEach((preset, key) => {
            customPresetsObj[key] = preset;
        });

        return {
            'built-in': BUILT_IN_PRESETS,
            'custom': customPresetsObj
        };
    }

    /**
     * Get preset by ID
     * @param {string} presetId - Preset identifier
     * @returns {Object|null} Preset configuration or null
     */
    getPreset(presetId) {
        // Check built-in presets first
        if (BUILT_IN_PRESETS[presetId]) {
            return { ...BUILT_IN_PRESETS[presetId] };
        }
        
        // Check custom presets
        if (this.customPresets.has(presetId)) {
            return { ...this.customPresets.get(presetId) };
        }
        
        return null;
    }

    /**
     * Get preset list for UI dropdown
     * @returns {Array} Array of preset options
     */
    getPresetOptions() {
        const options = [];
        
        // Add built-in presets
        Object.entries(BUILT_IN_PRESETS).forEach(([id, preset]) => {
            options.push({
                id,
                name: preset.meta.name,
                description: preset.meta.description,
                category: 'built-in',
                tags: preset.meta.tags || []
            });
        });
        
        // Add custom presets
        this.customPresets.forEach((preset, id) => {
            options.push({
                id,
                name: preset.meta.name,
                description: preset.meta.description,
                category: 'custom',
                tags: preset.meta.tags || [],
                custom: true
            });
        });
        
        return options;
    }

    /**
     * Save custom preset
     * @param {string} id - Preset identifier
     * @param {Object} config - Configuration object
     * @param {Object} metadata - Additional metadata
     * @returns {boolean} Success status
     */
    saveCustomPreset(id, config, metadata = {}) {
        try {
            const preset = {
                ...config,
                meta: {
                    ...config.meta,
                    ...metadata,
                    id,
                    custom: true,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                }
            };
            
            this.customPresets.set(id, preset);
            this.saveCustomPresetsToStorage();
            
            return true;
        } catch (error) {
            console.error('Failed to save custom preset:', error);
            return false;
        }
    }

    /**
     * Delete custom preset
     * @param {string} id - Preset identifier
     * @returns {boolean} Success status
     */
    deleteCustomPreset(id) {
        if (this.customPresets.has(id)) {
            this.customPresets.delete(id);
            this.favoritePresets.delete(id);
            this.recentPresets = this.recentPresets.filter(presetId => presetId !== id);
            this.saveCustomPresetsToStorage();
            return true;
        }
        return false;
    }

    /**
     * Update custom preset
     * @param {string} id - Preset identifier
     * @param {Object} config - Updated configuration
     * @param {Object} metadata - Updated metadata
     * @returns {boolean} Success status
     */
    updateCustomPreset(id, config, metadata = {}) {
        if (this.customPresets.has(id)) {
            const existingPreset = this.customPresets.get(id);
            const updatedPreset = {
                ...config,
                meta: {
                    ...existingPreset.meta,
                    ...metadata,
                    modified: new Date().toISOString()
                }
            };
            
            this.customPresets.set(id, updatedPreset);
            this.saveCustomPresetsToStorage();
            return true;
        }
        return false;
    }

    /**
     * Add preset to favorites
     * @param {string} presetId - Preset identifier
     */
    addToFavorites(presetId) {
        this.favoritePresets.add(presetId);
        this.saveCustomPresetsToStorage();
    }

    /**
     * Remove preset from favorites
     * @param {string} presetId - Preset identifier
     */
    removeFromFavorites(presetId) {
        this.favoritePresets.delete(presetId);
        this.saveCustomPresetsToStorage();
    }

    /**
     * Check if preset is favorited
     * @param {string} presetId - Preset identifier
     * @returns {boolean} True if favorited
     */
    isFavorite(presetId) {
        return this.favoritePresets.has(presetId);
    }

    /**
     * Get favorite presets
     * @returns {Array} Array of favorite preset IDs
     */
    getFavorites() {
        return Array.from(this.favoritePresets);
    }

    /**
     * Add preset to recent list
     * @param {string} presetId - Preset identifier
     */
    addToRecent(presetId) {
        // Remove if already exists
        this.recentPresets = this.recentPresets.filter(id => id !== presetId);
        
        // Add to beginning
        this.recentPresets.unshift(presetId);
        
        // Limit size
        if (this.recentPresets.length > this.maxRecentPresets) {
            this.recentPresets = this.recentPresets.slice(0, this.maxRecentPresets);
        }
        
        this.saveCustomPresetsToStorage();
    }

    /**
     * Get recent presets
     * @returns {Array} Array of recent preset IDs
     */
    getRecent() {
        return [...this.recentPresets];
    }

    /**
     * Search presets by query
     * @param {string} query - Search query
     * @returns {Array} Array of matching presets
     */
    searchPresets(query) {
        const normalizedQuery = query.toLowerCase();
        const results = [];
        
        // Search built-in presets
        Object.entries(BUILT_IN_PRESETS).forEach(([id, preset]) => {
            if (this.matchesQuery(preset, normalizedQuery)) {
                results.push({
                    id,
                    preset,
                    category: 'built-in'
                });
            }
        });
        
        // Search custom presets
        this.customPresets.forEach((preset, id) => {
            if (this.matchesQuery(preset, normalizedQuery)) {
                results.push({
                    id,
                    preset,
                    category: 'custom'
                });
            }
        });
        
        return results;
    }

    /**
     * Check if preset matches search query
     * @param {Object} preset - Preset object
     * @param {string} query - Normalized search query
     * @returns {boolean} True if matches
     */
    matchesQuery(preset, query) {
        const meta = preset.meta || {};
        const searchText = [
            meta.name || '',
            meta.description || '',
            (meta.tags || []).join(' ')
        ].join(' ').toLowerCase();
        
        return searchText.includes(query);
    }

    /**
     * Export custom presets as JSON
     * @returns {string} JSON string of custom presets
     */
    exportCustomPresets() {
        const exportData = {
            presets: Object.fromEntries(this.customPresets),
            favorites: Array.from(this.favoritePresets),
            recent: this.recentPresets,
            exported: new Date().toISOString(),
            version: 1
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import custom presets from JSON
     * @param {string} jsonString - JSON string of presets
     * @returns {boolean} Success status
     */
    importCustomPresets(jsonString) {
        try {
            const importData = JSON.parse(jsonString);
            
            if (importData.presets) {
                Object.entries(importData.presets).forEach(([id, preset]) => {
                    this.customPresets.set(id, preset);
                });
            }
            
            if (importData.favorites) {
                importData.favorites.forEach(id => {
                    this.favoritePresets.add(id);
                });
            }
            
            if (importData.recent) {
                this.recentPresets = importData.recent.slice(0, this.maxRecentPresets);
            }
            
            this.saveCustomPresetsToStorage();
            return true;
        } catch (error) {
            console.error('Failed to import custom presets:', error);
            return false;
        }
    }

    /**
     * Generate preset ID from name
     * @param {string} name - Preset name
     * @returns {string} URL-safe preset ID
     */
    generatePresetId(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-') || 'custom-preset';
    }

    /**
     * Validate preset configuration
     * @param {Object} preset - Preset to validate
     * @returns {boolean} True if valid
     */
    validatePreset(preset) {
        try {
            // Check required structure
            const requiredSections = ['particles', 'edges', 'forces', 'style', 'interaction', 'performance'];
            return requiredSections.every(section => 
                preset[section] && typeof preset[section] === 'object'
            );
        } catch (error) {
            return false;
        }
    }

    /**
     * Create preset from current configuration
     * @param {Object} config - Current configuration
     * @param {string} name - Preset name
     * @param {string} description - Preset description
     * @param {Array} tags - Preset tags
     * @returns {string|null} Generated preset ID or null if failed
     */
    createPresetFromConfig(config, name, description = '', tags = []) {
        if (!this.validatePreset(config)) {
            return null;
        }
        
        const id = this.generatePresetId(name);
        const metadata = {
            name,
            description,
            tags,
            author: 'User',
            version: 1
        };
        
        if (this.saveCustomPreset(id, config, metadata)) {
            return id;
        }
        
        return null;
    }

    /**
     * Save custom presets to localStorage
     */
    saveCustomPresetsToStorage() {
        try {
            const saveData = {
                presets: Object.fromEntries(this.customPresets),
                favorites: Array.from(this.favoritePresets),
                recent: this.recentPresets,
                timestamp: Date.now()
            };
            
            localStorage.setItem('plexus-canvas-custom-presets', JSON.stringify(saveData));
        } catch (error) {
            console.error('Failed to save custom presets to localStorage:', error);
        }
    }

    /**
     * Load custom presets from localStorage
     */
    loadCustomPresets() {
        try {
            const saved = localStorage.getItem('plexus-canvas-custom-presets');
            if (saved) {
                const saveData = JSON.parse(saved);
                
                if (saveData.presets) {
                    this.customPresets = new Map(Object.entries(saveData.presets));
                }
                
                if (saveData.favorites) {
                    this.favoritePresets = new Set(saveData.favorites);
                }
                
                if (saveData.recent) {
                    this.recentPresets = saveData.recent;
                }
            }
        } catch (error) {
            console.error('Failed to load custom presets from localStorage:', error);
            // Reset to empty state if corrupted
            this.customPresets.clear();
            this.favoritePresets.clear();
            this.recentPresets = [];
        }
    }

    /**
     * Get preset statistics
     * @returns {Object} Statistics about presets
     */
    getStatistics() {
        return {
            builtInCount: Object.keys(BUILT_IN_PRESETS).length,
            customCount: this.customPresets.size,
            favoriteCount: this.favoritePresets.size,
            recentCount: this.recentPresets.length,
            totalCount: Object.keys(BUILT_IN_PRESETS).length + this.customPresets.size
        };
    }
}

// Create and export singleton instance
export const presetManager = new PresetManager();

// Export for advanced usage
export { PresetManager };

// Export default
export default presetManager;