/**
 * DOM utility functions for Plexus Canvas
 */

/**
 * Create an element with optional attributes and children
 * @param {string} tagName - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {...(Element|string)} children - Child elements or text
 * @returns {Element} Created element
 */
export function createElement(tagName, attributes = {}, ...children) {
    const element = document.createElement(tagName);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
            element.appendChild(child);
        }
    });
    
    return element;
}

/**
 * Query selector with optional parent element
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element to search within
 * @returns {Element|null} Found element
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Query selector all with optional parent element
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element to search within
 * @returns {NodeList} Found elements
 */
export function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Add event listener with optional delegation
 * @param {Element|string} target - Target element or selector
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 */
export function on(target, event, handler, options = {}) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.addEventListener(event, handler, options);
    }
}

/**
 * Remove event listener
 * @param {Element|string} target - Target element or selector
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 */
export function off(target, event, handler, options = {}) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.removeEventListener(event, handler, options);
    }
}

/**
 * Add CSS class to element
 * @param {Element|string} target - Target element or selector
 * @param {...string} classes - CSS classes to add
 */
export function addClass(target, ...classes) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.classList.add(...classes);
    }
}

/**
 * Remove CSS class from element
 * @param {Element|string} target - Target element or selector
 * @param {...string} classes - CSS classes to remove
 */
export function removeClass(target, ...classes) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.classList.remove(...classes);
    }
}

/**
 * Toggle CSS class on element
 * @param {Element|string} target - Target element or selector
 * @param {string} className - CSS class to toggle
 * @param {boolean} force - Force add (true) or remove (false)
 * @returns {boolean} Whether class is present after toggle
 */
export function toggleClass(target, className, force) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        return element.classList.toggle(className, force);
    }
    return false;
}

/**
 * Check if element has CSS class
 * @param {Element|string} target - Target element or selector
 * @param {string} className - CSS class to check
 * @returns {boolean} Whether element has class
 */
export function hasClass(target, className) {
    const element = typeof target === 'string' ? $(target) : target;
    return element ? element.classList.contains(className) : false;
}

/**
 * Set element style properties
 * @param {Element|string} target - Target element or selector
 * @param {Object} styles - Style properties to set
 */
export function setStyle(target, styles) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }
}

/**
 * Get element's computed style value
 * @param {Element|string} target - Target element or selector
 * @param {string} property - CSS property name
 * @returns {string} Computed style value
 */
export function getStyle(target, property) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        return window.getComputedStyle(element)[property];
    }
    return '';
}

/**
 * Set element attributes
 * @param {Element|string} target - Target element or selector
 * @param {Object} attributes - Attributes to set
 */
export function setAttributes(target, attributes) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
}

/**
 * Get element attribute value
 * @param {Element|string} target - Target element or selector
 * @param {string} attribute - Attribute name
 * @returns {string|null} Attribute value
 */
export function getAttribute(target, attribute) {
    const element = typeof target === 'string' ? $(target) : target;
    return element ? element.getAttribute(attribute) : null;
}

/**
 * Show element (remove hidden class or set display)
 * @param {Element|string} target - Target element or selector
 * @param {string} display - Display value (default: 'block')
 */
export function show(target, display = 'block') {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        if (element.classList.contains('hidden')) {
            element.classList.remove('hidden');
        } else {
            element.style.display = display;
        }
    }
}

/**
 * Hide element (add hidden class or set display: none)
 * @param {Element|string} target - Target element or selector
 */
export function hide(target) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Toggle element visibility
 * @param {Element|string} target - Target element or selector
 * @param {boolean} force - Force show (true) or hide (false)
 */
export function toggle(target, force) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        const isHidden = element.classList.contains('hidden') || element.style.display === 'none';
        if (force !== undefined) {
            force ? show(element) : hide(element);
        } else {
            isHidden ? show(element) : hide(element);
        }
    }
}

/**
 * Get element's bounding rect
 * @param {Element|string} target - Target element or selector
 * @returns {DOMRect|null} Bounding rect
 */
export function getBounds(target) {
    const element = typeof target === 'string' ? $(target) : target;
    return element ? element.getBoundingClientRect() : null;
}

/**
 * Scroll element into view smoothly
 * @param {Element|string} target - Target element or selector
 * @param {Object} options - Scroll options
 */
export function scrollIntoView(target, options = { behavior: 'smooth', block: 'center' }) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.scrollIntoView(options);
    }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Wait for DOM to be ready
 * @param {Function} callback - Callback to execute when ready
 */
export function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

/**
 * Create and dispatch custom event
 * @param {string} type - Event type
 * @param {Object} detail - Event detail data
 * @param {Element} target - Target element (default: document)
 */
export function dispatchEvent(type, detail = {}, target = document) {
    const event = new CustomEvent(type, { detail, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
        return false;
    }
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Load image from URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}