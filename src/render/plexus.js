/**
 * Plexus particle system with Structure of Arrays pattern and spatial indexing
 */

import * as math from '../utils/math.js';

/**
 * Spatial grid for efficient neighbor detection
 */
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = [];
        this.clear();
    }

    clear() {
        this.grid = new Array(this.cols * this.rows);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
    }

    getCellIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return -1;
        }
        
        return row * this.cols + col;
    }

    addParticle(particleIndex, x, y) {
        const cellIndex = this.getCellIndex(x, y);
        if (cellIndex >= 0) {
            this.grid[cellIndex].push(particleIndex);
        }
    }

    getNearbyParticles(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        const neighbors = [];

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkCol = col + dx;
                const checkRow = row + dy;
                
                if (checkCol >= 0 && checkCol < this.cols && 
                    checkRow >= 0 && checkRow < this.rows) {
                    const cellIndex = checkRow * this.cols + checkCol;
                    neighbors.push(...this.grid[cellIndex]);
                }
            }
        }

        return neighbors;
    }

    resize(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.clear();
    }
}

/**
 * Main plexus particle system
 */
class PlexusSystem {
    constructor(config) {
        this.config = config;
        
        // Canvas dimensions
        this.width = 800;
        this.height = 600;
        this.centerX = 400;
        this.centerY = 300;
        
        // Particle arrays (Structure of Arrays)
        this.particleCount = 0;
        this.maxParticles = 5000;
        this.positions = new Float32Array(this.maxParticles * 2);
        this.velocities = new Float32Array(this.maxParticles * 2);
        this.colors = new Uint32Array(this.maxParticles);
        this.ages = new Float32Array(this.maxParticles);
        
        // Edge arrays
        this.edges = [];
        this.edgeColors = [];
        
        // Spatial indexing
        this.spatialGrid = null;
        this.spatialIndexType = 'grid';
        this.gridCellSize = 140;
        
        // Physics time
        this.time = 0;
        this.noiseOffset = 0;
        
        // Mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseInfluence = 0;
        
        this.init();
    }

    init() {
        this.setupSpatialIndex();
        this.generateParticles();
    }

    setupSpatialIndex() {
        if (this.spatialIndexType === 'grid') {
            this.spatialGrid = new SpatialGrid(this.width, this.height, this.gridCellSize);
        }
    }

    setDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        
        if (this.spatialGrid) {
            this.spatialGrid.resize(width, height, this.gridCellSize);
        }
        
        this.generateParticles();
    }

    generateParticles() {
        const config = this.config.get('particles');
        this.particleCount = math.clamp(config.count, 0, this.maxParticles);
        
        for (let i = 0; i < this.particleCount; i++) {
            this.spawnParticle(i, config.spawnArea);
        }
    }

    spawnParticle(index, spawnArea = 'full') {
        let x, y;
        const margin = 50;
        
        switch (spawnArea) {
            case 'ellipse':
                {
                    const angle = math.random(0, Math.PI * 2);
                    const radius = math.random(0, Math.min(this.width, this.height) * 0.4);
                    x = this.centerX + Math.cos(angle) * radius;
                    y = this.centerY + Math.sin(angle) * radius;
                }
                break;
                
            case 'ring':
                {
                    const angle = math.random(0, Math.PI * 2);
                    const minRadius = Math.min(this.width, this.height) * 0.2;
                    const maxRadius = Math.min(this.width, this.height) * 0.4;
                    const radius = math.random(minRadius, maxRadius);
                    x = this.centerX + Math.cos(angle) * radius;
                    y = this.centerY + Math.sin(angle) * radius;
                }
                break;
                
            case 'rect':
                {
                    const rectWidth = this.width * 0.6;
                    const rectHeight = this.height * 0.6;
                    x = this.centerX - rectWidth/2 + math.random(0, rectWidth);
                    y = this.centerY - rectHeight/2 + math.random(0, rectHeight);
                }
                break;
                
            default:
                x = math.random(margin, this.width - margin);
                y = math.random(margin, this.height - margin);
                break;
        }
        
        this.positions[index * 2] = x;
        this.positions[index * 2 + 1] = y;
        
        const speed = this.config.get('particles.speed') || 0.35;
        const angle = math.random(0, Math.PI * 2);
        this.velocities[index * 2] = Math.cos(angle) * speed * math.random(0.5, 1.5);
        this.velocities[index * 2 + 1] = Math.sin(angle) * speed * math.random(0.5, 1.5);
        
        this.colors[index] = this.getParticleColor(index);
        this.ages[index] = 0;
    }

    getParticleColor(index) {
        return 0xFFE0F2FF; // Default light blue
    }

    setMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }

    setMouseInfluence(influence) {
        this.mouseInfluence = influence;
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.noiseOffset += deltaTime * 0.001;
        
        this.updatePhysics(deltaTime);
        this.updateSpatialIndex();
        this.calculateEdges();
    }

    updatePhysics(deltaTime) {
        const dt = deltaTime * 0.001;
        const config = this.config.get('forces');
        const particleConfig = this.config.get('particles');
        const interactionConfig = this.config.get('interaction');
        
        const noiseStrength = config.noiseStrength || 0;
        const gravity = config.gravity || 0;
        const drag = config.drag || 0;
        const jitter = particleConfig.jitter || 0;
        const mouseRepel = interactionConfig.mouseRepel || 0;
        const mouseRadius = interactionConfig.mouseRadius || 120;
        
        for (let i = 0; i < this.particleCount; i++) {
            const x = this.positions[i * 2];
            const y = this.positions[i * 2 + 1];
            let vx = this.velocities[i * 2];
            let vy = this.velocities[i * 2 + 1];
            
            // Apply noise
            if (noiseStrength > 0) {
                const noiseX = math.noise(x * 0.01, y * 0.01, this.noiseOffset) * noiseStrength;
                const noiseY = math.noise(y * 0.01, x * 0.01, this.noiseOffset + 100) * noiseStrength;
                vx += noiseX * dt;
                vy += noiseY * dt;
            }
            
            // Apply gravity
            if (gravity !== 0) {
                const dx = this.centerX - x;
                const dy = this.centerY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    const force = gravity * dt / distance;
                    vx += dx * force;
                    vy += dy * force;
                }
            }
            
            // Apply mouse repulsion
            if (mouseRepel > 0 && this.mouseInfluence > 0) {
                const dx = x - this.mouseX;
                const dy = y - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseRadius && distance > 0) {
                    const repelForce = mouseRepel * this.mouseInfluence * (1 - distance / mouseRadius);
                    const normalizedDx = dx / distance;
                    const normalizedDy = dy / distance;
                    vx += normalizedDx * repelForce * dt * 100;
                    vy += normalizedDy * repelForce * dt * 100;
                }
            }
            
            // Apply jitter
            if (jitter > 0) {
                vx += math.random(-jitter, jitter) * dt;
                vy += math.random(-jitter, jitter) * dt;
            }
            
            // Apply drag
            if (drag > 0) {
                vx *= Math.pow(1 - drag, dt * 60);
                vy *= Math.pow(1 - drag, dt * 60);
            }
            
            // Update position
            this.positions[i * 2] = x + vx * dt * 60;
            this.positions[i * 2 + 1] = y + vy * dt * 60;
            
            this.velocities[i * 2] = vx;
            this.velocities[i * 2 + 1] = vy;
            this.ages[i] += dt;
            
            this.handleBoundaries(i);
        }
    }

    handleBoundaries(index) {
        const margin = 10;
        let x = this.positions[index * 2];
        let y = this.positions[index * 2 + 1];
        let vx = this.velocities[index * 2];
        let vy = this.velocities[index * 2 + 1];
        
        if (x < margin) {
            x = margin;
            vx = Math.abs(vx) * 0.8;
        } else if (x > this.width - margin) {
            x = this.width - margin;
            vx = -Math.abs(vx) * 0.8;
        }
        
        if (y < margin) {
            y = margin;
            vy = Math.abs(vy) * 0.8;
        } else if (y > this.height - margin) {
            y = this.height - margin;
            vy = -Math.abs(vy) * 0.8;
        }
        
        this.positions[index * 2] = x;
        this.positions[index * 2 + 1] = y;
        this.velocities[index * 2] = vx;
        this.velocities[index * 2 + 1] = vy;
    }

    updateSpatialIndex() {
        if (this.spatialIndexType === 'grid' && this.spatialGrid) {
            this.spatialGrid.clear();
            
            for (let i = 0; i < this.particleCount; i++) {
                const x = this.positions[i * 2];
                const y = this.positions[i * 2 + 1];
                this.spatialGrid.addParticle(i, x, y);
            }
        }
    }

    calculateEdges() {
        const edgeConfig = this.config.get('edges');
        const maxDistance = edgeConfig.maxDistance || 140;
        const maxEdgesPerNode = edgeConfig.maxEdgesPerNode || 6;
        const maxDistanceSquared = maxDistance * maxDistance;
        
        this.edges = [];
        this.edgeColors = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            const x1 = this.positions[i * 2];
            const y1 = this.positions[i * 2 + 1];
            
            let edgeCount = 0;
            const nearbyParticles = this.getNearbyParticles(i, x1, y1);
            
            for (const j of nearbyParticles) {
                if (i >= j || edgeCount >= maxEdgesPerNode) continue;
                
                const x2 = this.positions[j * 2];
                const y2 = this.positions[j * 2 + 1];
                const distanceSquared = math.distanceSquared(x1, y1, x2, y2);
                
                if (distanceSquared <= maxDistanceSquared) {
                    this.edges.push(i, j);
                    this.edgeColors.push(edgeConfig.staticColor || '#88ccff');
                    edgeCount++;
                }
            }
        }
    }

    getNearbyParticles(particleIndex, x, y) {
        if (this.spatialIndexType === 'grid' && this.spatialGrid) {
            return this.spatialGrid.getNearbyParticles(x, y);
        } else {
            const nearby = [];
            for (let i = 0; i < this.particleCount; i++) {
                if (i !== particleIndex) {
                    nearby.push(i);
                }
            }
            return nearby;
        }
    }

    renderParticles(ctx) {
        const particleConfig = this.config.get('particles');
        const size = particleConfig.size || 2;
        const particleColor = this.config.get('style.particleColor') || '#e0f2ff';
        
        ctx.save();
        ctx.fillStyle = particleColor;
        
        for (let i = 0; i < this.particleCount; i++) {
            const x = this.positions[i * 2];
            const y = this.positions[i * 2 + 1];
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    renderEdges(ctx) {
        const edgeConfig = this.config.get('edges');
        const lineWidth = edgeConfig.lineWidth || 1;
        const lineOpacity = edgeConfig.lineOpacity || 0.6;
        const blendMode = edgeConfig.blendMode || 'normal';
        const staticColor = edgeConfig.staticColor || '#88ccff';
        
        if (this.edges.length === 0) return;
        
        ctx.save();
        ctx.globalCompositeOperation = blendMode;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = `${staticColor}${Math.round(lineOpacity * 255).toString(16).padStart(2, '0')}`;
        
        ctx.beginPath();
        for (let i = 0; i < this.edges.length; i += 2) {
            const idx1 = this.edges[i];
            const idx2 = this.edges[i + 1];
            
            const x1 = this.positions[idx1 * 2];
            const y1 = this.positions[idx1 * 2 + 1];
            const x2 = this.positions[idx2 * 2];
            const y2 = this.positions[idx2 * 2 + 1];
            
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        
        ctx.restore();
    }

    renderBackground(ctx) {
        const bgConfig = this.config.get('style.bg');
        
        if (bgConfig) {
            ctx.save();
            ctx.fillStyle = bgConfig.color || '#0b1020';
            ctx.globalAlpha = bgConfig.opacity !== undefined ? bgConfig.opacity : 1;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.restore();
        }
    }

    getStats() {
        return {
            particleCount: this.particleCount,
            edgeCount: this.edges.length / 2,
            spatialIndexType: this.spatialIndexType,
            time: this.time
        };
    }

    reset(hard = false) {
        if (hard) {
            this.generateParticles();
        } else {
            for (let i = 0; i < this.particleCount; i++) {
                this.spawnParticle(i, this.config.get('particles.spawnArea'));
                this.ages[i] = 0;
            }
        }
        
        this.time = 0;
        this.noiseOffset = 0;
    }
}

export { PlexusSystem, SpatialGrid };
export default PlexusSystem;