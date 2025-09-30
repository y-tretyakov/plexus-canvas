/**
 * Export and import system for Plexus Canvas
 * Handles JSON export/import, PNG export, and share URL generation
 */

import { downloadBlob, copyToClipboard } from '../utils/dom.js';

/**
 * Export/Import manager class
 */
class ExportImportManager {
    constructor(config, renderEngine) {
        this.config = config;
        this.renderEngine = renderEngine;
        this.exportHistory = [];
        this.maxHistoryEntries = 10;
    }

    /**
     * Export configuration as JSON
     * @param {boolean} prettify - Format JSON for readability
     * @param {boolean} download - Automatically download the file
     * @returns {string} JSON string
     */
    exportConfigJSON(prettify = true, download = false) {
        try {
            const configData = this.config.getAll();
            const exportData = {
                ...configData,
                meta: {
                    ...configData.meta,
                    exportedAt: new Date().toISOString(),
                    exportVersion: '1.0.0',
                    application: 'Plexus Canvas'
                }
            };

            const jsonString = prettify ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
            
            // Add to export history
            this.addToExportHistory('json', exportData.meta.name || 'Configuration');

            if (download) {
                this.downloadJSON(jsonString, this.generateFilename('config', 'json'));
            }

            return jsonString;
        } catch (error) {
            console.error('Failed to export configuration:', error);
            throw new Error('Configuration export failed');
        }
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonString - JSON configuration string
     * @param {boolean} merge - Merge with current config instead of replacing
     * @returns {Promise<boolean>} Success status
     */
    async importConfigJSON(jsonString, merge = false) {
        try {
            const importData = JSON.parse(jsonString);
            
            // Validate imported data
            if (!this.validateImportedConfig(importData)) {
                throw new Error('Invalid configuration format');
            }

            // Apply configuration
            if (merge) {
                // Merge configurations
                const currentConfig = this.config.getAll();
                const mergedConfig = this.mergeConfigurations(currentConfig, importData);
                this.config.setAll(mergedConfig, true);
            } else {
                // Replace configuration
                this.config.setAll(importData, true);
            }

            // Add to import history
            this.addToExportHistory('import', importData.meta?.name || 'Imported Configuration');

            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            throw new Error(`Configuration import failed: ${error.message}`);
        }
    }

    /**
     * Import configuration from file
     * @param {File} file - JSON file
     * @param {boolean} merge - Merge with current config
     * @returns {Promise<boolean>} Success status
     */
    async importConfigFromFile(file, merge = false) {
        return new Promise((resolve, reject) => {
            if (!file || file.type !== 'application/json') {
                reject(new Error('Please select a valid JSON file'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const jsonString = event.target.result;
                    const success = await this.importConfigJSON(jsonString, merge);
                    resolve(success);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Export current canvas frame as PNG
     * @param {Object} options - Export options
     * @returns {Promise<string>} Data URL of the exported image
     */
    async exportCanvasPNG(options = {}) {
        const {
            format = 'png',
            quality = 1,
            scale = 1,
            download = false,
            filename
        } = options;

        try {
            if (!this.renderEngine) {
                throw new Error('Render engine not available');
            }

            // Capture frame from render engine
            const dataURL = this.renderEngine.captureFrame(format, quality);
            
            if (!dataURL) {
                throw new Error('Failed to capture canvas frame');
            }

            // Scale image if requested
            let finalDataURL = dataURL;
            if (scale !== 1) {
                finalDataURL = await this.scaleImage(dataURL, scale);
            }

            // Add to export history
            this.addToExportHistory('png', filename || 'Canvas Export');

            if (download) {
                this.downloadImage(finalDataURL, filename || this.generateFilename('plexus-canvas', format));
            }

            return finalDataURL;
        } catch (error) {
            console.error('Failed to export PNG:', error);
            throw new Error(`PNG export failed: ${error.message}`);
        }
    }

    /**
     * Generate shareable URL with current configuration
     * @param {boolean} copyToClip - Copy URL to clipboard
     * @returns {Promise<string>} Shareable URL
     */
    async generateShareURL(copyToClip = false) {
        try {
            const configData = this.config.getAll();
            
            // Compress configuration for URL
            const compressedData = this.compressConfigForURL(configData);
            
            // Generate URL
            const baseURL = window.location.origin + window.location.pathname;
            const shareURL = `${baseURL}#config=${compressedData}`;

            // Validate URL length (most browsers support ~2000 chars)
            if (shareURL.length > 2000) {
                console.warn('Share URL is very long and may not work in all browsers');
            }

            // Add to export history
            this.addToExportHistory('url', 'Share URL');

            if (copyToClip) {
                const success = await copyToClipboard(shareURL);
                if (!success) {
                    throw new Error('Failed to copy URL to clipboard');
                }
            }

            return shareURL;
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            throw new Error(`Share URL generation failed: ${error.message}`);
        }
    }

    /**
     * Load configuration from share URL
     * @param {string} url - Share URL or just the hash fragment
     * @returns {Promise<boolean>} Success status
     */
    async loadFromShareURL(url = window.location.hash) {
        try {
            let configData;
            
            if (url.includes('#config=')) {
                const configParam = url.split('#config=')[1];
                configData = this.decompressConfigFromURL(configParam);
            } else if (url.startsWith('config=')) {
                configData = this.decompressConfigFromURL(url.slice(7));
            } else {
                return false; // No config in URL
            }

            if (!configData) {
                throw new Error('Failed to decode configuration from URL');
            }

            // Validate and apply configuration
            if (!this.validateImportedConfig(configData)) {
                throw new Error('Invalid configuration in URL');
            }

            this.config.setAll(configData, true);
            
            // Add to import history
            this.addToExportHistory('url-import', 'URL Configuration');

            return true;
        } catch (error) {
            console.error('Failed to load from share URL:', error);
            throw new Error(`URL configuration loading failed: ${error.message}`);
        }
    }

    /**
     * Validate imported configuration structure
     * @param {Object} config - Configuration to validate
     * @returns {boolean} True if valid
     */
    validateImportedConfig(config) {
        try {
            // Check required sections
            const requiredSections = ['particles', 'edges', 'forces', 'style', 'interaction', 'performance'];
            
            for (const section of requiredSections) {
                if (!config[section] || typeof config[section] !== 'object') {
                    console.error(`Missing or invalid section: ${section}`);
                    return false;
                }
            }

            // Basic type checking for critical parameters
            const criticalParams = {
                'particles.count': 'number',
                'edges.maxDistance': 'number',
                'style.bg': 'object'
            };

            for (const [path, expectedType] of Object.entries(criticalParams)) {
                const value = this.getNestedValue(config, path);
                if (typeof value !== expectedType) {
                    console.error(`Invalid type for ${path}: expected ${expectedType}, got ${typeof value}`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Configuration validation error:', error);
            return false;
        }
    }

    /**
     * Get nested value from object using dot notation
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
     * Merge two configurations deeply
     * @param {Object} base - Base configuration
     * @param {Object} override - Override configuration
     * @returns {Object} Merged configuration
     */
    mergeConfigurations(base, override) {
        const result = JSON.parse(JSON.stringify(base)); // Deep clone
        
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
     * Compress configuration for URL transmission
     * @param {Object} config - Configuration to compress
     * @returns {string} Compressed string
     */
    compressConfigForURL(config) {
        try {
            // Remove unnecessary metadata for URL sharing
            const cleanConfig = {
                particles: config.particles,
                edges: config.edges,
                forces: config.forces,
                style: config.style,
                interaction: config.interaction,
                performance: config.performance
            };

            const jsonString = JSON.stringify(cleanConfig);
            
            // Base64 encode for URL safety
            const encoded = btoa(unescape(encodeURIComponent(jsonString)));
            
            return encoded;
        } catch (error) {
            console.error('Failed to compress config for URL:', error);
            return '';
        }
    }

    /**
     * Decompress configuration from URL
     * @param {string} compressed - Compressed configuration string
     * @returns {Object|null} Decompressed configuration
     */
    decompressConfigFromURL(compressed) {
        try {
            // Base64 decode
            const jsonString = decodeURIComponent(escape(atob(compressed)));
            
            // Parse JSON
            const config = JSON.parse(jsonString);
            
            // Add default metadata
            config.meta = {
                name: 'Shared Configuration',
                version: 1,
                imported: new Date().toISOString(),
                source: 'url'
            };

            return config;
        } catch (error) {
            console.error('Failed to decompress config from URL:', error);
            return null;
        }
    }

    /**
     * Scale image to different resolution
     * @param {string} dataURL - Source image data URL
     * @param {number} scale - Scale factor
     * @returns {Promise<string>} Scaled image data URL
     */
    async scaleImage(dataURL, scale) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                // Enable image smoothing for better quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                resolve(canvas.toDataURL('image/png'));
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image for scaling'));
            };
            
            img.src = dataURL;
        });
    }

    /**
     * Download JSON data as file
     * @param {string} jsonString - JSON data
     * @param {string} filename - File name
     */
    downloadJSON(jsonString, filename) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        downloadBlob(blob, filename);
    }

    /**
     * Download image data as file
     * @param {string} dataURL - Image data URL
     * @param {string} filename - File name
     */
    downloadImage(dataURL, filename) {
        // Convert data URL to blob
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        downloadBlob(blob, filename);
    }

    /**
     * Generate filename with timestamp
     * @param {string} base - Base filename
     * @param {string} extension - File extension
     * @returns {string} Generated filename
     */
    generateFilename(base, extension) {
        const timestamp = new Date().toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '');
        return `${base}-${timestamp}.${extension}`;
    }

    /**
     * Add entry to export history
     * @param {string} type - Export type
     * @param {string} name - Export name
     */
    addToExportHistory(type, name) {
        const entry = {
            type,
            name,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };

        this.exportHistory.unshift(entry);
        
        // Limit history size
        if (this.exportHistory.length > this.maxHistoryEntries) {
            this.exportHistory = this.exportHistory.slice(0, this.maxHistoryEntries);
        }

        // Save to localStorage
        this.saveHistoryToStorage();
    }

    /**
     * Get export history
     * @returns {Array} Export history entries
     */
    getExportHistory() {
        return [...this.exportHistory];
    }

    /**
     * Clear export history
     */
    clearExportHistory() {
        this.exportHistory = [];
        this.saveHistoryToStorage();
    }

    /**
     * Save history to localStorage
     */
    saveHistoryToStorage() {
        try {
            localStorage.setItem('plexus-canvas-export-history', JSON.stringify(this.exportHistory));
        } catch (error) {
            console.error('Failed to save export history:', error);
        }
    }

    /**
     * Load history from localStorage
     */
    loadHistoryFromStorage() {
        try {
            const saved = localStorage.getItem('plexus-canvas-export-history');
            if (saved) {
                this.exportHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load export history:', error);
            this.exportHistory = [];
        }
    }

    /**
     * Get supported export formats
     * @returns {Object} Supported formats
     */
    getSupportedFormats() {
        return {
            config: {
                json: {
                    name: 'JSON Configuration',
                    extension: 'json',
                    mimeType: 'application/json',
                    description: 'Complete configuration data'
                }
            },
            image: {
                png: {
                    name: 'PNG Image',
                    extension: 'png',
                    mimeType: 'image/png',
                    description: 'High quality lossless image'
                },
                jpeg: {
                    name: 'JPEG Image',
                    extension: 'jpg',
                    mimeType: 'image/jpeg',
                    description: 'Compressed image format'
                },
                webp: {
                    name: 'WebP Image',
                    extension: 'webp',
                    mimeType: 'image/webp',
                    description: 'Modern efficient image format'
                }
            }
        };
    }

    /**
     * Initialize the export/import system
     */
    init() {
        this.loadHistoryFromStorage();
        
        // Try to load configuration from URL on startup
        if (window.location.hash.includes('#config=')) {
            this.loadFromShareURL().catch(error => {
                console.warn('Failed to load configuration from URL:', error.message);
            });
        }
    }

    /**
     * Destroy the export/import system
     */
    destroy() {
        this.saveHistoryToStorage();
        this.config = null;
        this.renderEngine = null;
        this.exportHistory = [];
    }
}

// Export the manager class
export { ExportImportManager };
export default ExportImportManager;