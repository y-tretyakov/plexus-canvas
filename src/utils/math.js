/**
 * Math utility functions for Plexus Canvas
 */

/**
 * Clamp a number between min and max values
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param {number} value - Input value
 * @param {number} fromMin - Input range minimum
 * @param {number} fromMax - Input range maximum
 * @param {number} toMin - Output range minimum
 * @param {number} toMax - Output range maximum
 * @returns {number} Mapped value
 */
export function map(value, fromMin, fromMax, toMin, toMax) {
    return toMin + (value - fromMin) * (toMax - toMin) / (fromMax - fromMin);
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Distance
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance between two points (faster than distance)
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Squared distance
 */
export function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Normalize vector
 * @param {number} x - Vector x component
 * @param {number} y - Vector y component
 * @returns {{x: number, y: number}} Normalized vector
 */
export function normalize(x, y) {
    const length = Math.sqrt(x * x + y * y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
}

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Simple pseudo-random noise function (Perlin-like)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} time - Time value
 * @returns {number} Noise value (-1 to 1)
 */
export function noise(x, y, time = 0) {
    const frequency = 0.005;
    const amplitude = 1.0;
    
    // Simple sine-based noise
    const n1 = Math.sin(x * frequency + time * 0.001) * amplitude;
    const n2 = Math.cos(y * frequency + time * 0.001) * amplitude;
    const n3 = Math.sin((x + y) * frequency * 0.5 + time * 0.0008) * amplitude * 0.5;
    
    return (n1 + n2 + n3) / 2.5;
}

/**
 * Smooth step function for easing
 * @param {number} t - Input value (0-1)
 * @returns {number} Smoothed value (0-1)
 */
export function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Check if point is inside circle
 * @param {number} px - Point x
 * @param {number} py - Point y
 * @param {number} cx - Circle center x
 * @param {number} cy - Circle center y
 * @param {number} radius - Circle radius
 * @returns {boolean} True if point is inside circle
 */
export function pointInCircle(px, py, cx, cy, radius) {
    return distanceSquared(px, py, cx, cy) <= radius * radius;
}

/**
 * Wrap angle to -PI to PI range
 * @param {number} angle - Angle in radians
 * @returns {number} Wrapped angle
 */
export function wrapAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

/**
 * Fractional part of a number
 * @param {number} x - Input number
 * @returns {number} Fractional part
 */
export function fract(x) {
    return x - Math.floor(x);
}

/**
 * Calculate vector magnitude
 * @param {number} x - Vector x component
 * @param {number} y - Vector y component
 * @returns {number} Vector magnitude
 */
export function magnitude(x, y) {
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculate dot product of two vectors
 * @param {number} x1 - First vector x
 * @param {number} y1 - First vector y
 * @param {number} x2 - Second vector x
 * @param {number} y2 - Second vector y
 * @returns {number} Dot product
 */
export function dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
}

/**
 * Calculate cross product of two vectors (returns scalar for 2D)
 * @param {number} x1 - First vector x
 * @param {number} y1 - First vector y
 * @param {number} x2 - Second vector x
 * @param {number} y2 - Second vector y
 * @returns {number} Cross product
 */
export function cross(x1, y1, x2, y2) {
    return x1 * y2 - y1 * x2;
}