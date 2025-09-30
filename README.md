# Plexus Canvas

A modern, high-performance web application for interactive particle network visualization. Experience real-time parameter control, dynamic physics simulation, and stunning visual effects with zero dependencies.

## ✨ Features

### 🎨 Visual Excellence
- **Dynamic Particle Networks**: Real-time visualization with up to 5000 particles
- **Multiple Blend Modes**: Normal, lighten, screen, overlay, and multiply effects
- **Color Systems**: Static colors, distance-based gradients, and velocity-driven hues
- **Spatial Connections**: Intelligent edge detection with configurable distance and density

### ⚡ Performance Optimized
- **60 FPS Target**: Smooth animation with 1000+ particles on mid-range hardware
- **Structure of Arrays**: Cache-friendly memory layout for optimal performance
- **Spatial Indexing**: O(n) complexity edge detection using grid-based optimization
- **Adaptive Quality**: Automatic performance scaling to maintain smooth framerates

### 🎛️ Real-time Control
- **Live Parameter Updates**: Instant visual feedback without page reloads
- **5 Built-in Presets**: Neon Breeze, Cosmic Web, Wireframe, Storm, and Minimal
- **Custom Presets**: Save and share your own configurations
- **Advanced Physics**: Configurable noise, gravity, drag, and interaction forces

### 🖱️ Interactive Experience
- **Mouse Interaction**: Particle repulsion, hover effects, and click spawning
- **Touch Support**: Multi-touch interaction for tablets and phones
- **Keyboard Shortcuts**: Quick access to common functions and presets
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📤 Export & Share
- **PNG Export**: High-quality image export with configurable resolution
- **JSON Configuration**: Save and load complete system states
- **Shareable URLs**: Compress configurations into shareable links
- **Import/Export**: Seamless configuration exchange

### ♿ Accessibility First
- **Screen Reader Support**: Full ARIA labeling and semantic HTML
- **Keyboard Navigation**: Complete functionality without mouse input
- **High Contrast**: Support for accessibility color schemes
- **Reduced Motion**: Respects user motion preferences

## 🚀 Quick Start

### Zero-Setup Launch
No installation required! Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/y-tretyakov/plexus-canvas.git
cd plexus-canvas

# Open directly in browser
open index.html
# or
python -m http.server 8000  # Then visit http://localhost:8000
```

### Keyboard Shortcuts
- `Space` - Play/Pause animation
- `R` - Soft reset (reset positions)
- `Shift+R` - Hard reset (regenerate system)
- `S` - Save PNG image
- `[` / `]` - Decrease/increase particle count
- `1` / `2` / `3` - Load quick presets
- `?` - Show keyboard help

## 🏗️ Architecture

### Zero Dependencies
- **Pure Vanilla JavaScript**: ES2020+ modules with no external dependencies
- **Modern CSS**: CSS3 with custom properties and responsive design
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **Web Standards**: Built on stable, widely-supported browser APIs

### Modular Design
```
plexus-canvas/
├── index.html              # Main application entry
├── styles/
│   └── app.css            # Complete styling system
└── src/
    ├── main.js            # Application bootstrap
    ├── state/             # Configuration and presets
    ├── render/            # Rendering engine and particle system
    ├── ui/                # User interface components
    ├── io/                # Export/import functionality
    └── utils/             # Utility functions and helpers
```

### Performance Architecture
- **Structure of Arrays (SoA)**: Optimized memory layout for vector operations
- **Spatial Grid Indexing**: Efficient neighbor detection for edge calculation
- **Batch Rendering**: Minimized draw calls for optimal GPU utilization
- **RequestAnimationFrame**: Smooth, browser-synchronized animation loops

## 🎨 Built-in Presets

### Neon Breeze (Default)
Soft gradient visualization with blue-purple neon colors and gentle particle motion. Perfect for ambient displays and relaxed viewing.

### Cosmic Web
Deep space visualization with large connection distances and slow, ethereal movement. Mimics the structure of cosmic filaments.

### Wireframe
Minimal monochrome design with thin white lines on black background. Clean, technical aesthetic perfect for professional environments.

### Storm
High-energy visualization with strong noise forces and intense mouse interaction. Dynamic and chaotic particle behavior.

### Minimal
Clean design with few particles and thick connections in warm earth tones. Elegant simplicity with reduced visual complexity.

## 🛠️ Configuration

### Particle System
- **Count**: 50-5000 particles (performance warning above 2000)
- **Size**: 0.5-6px radius
- **Speed**: 0-2 units per frame
- **Spawn Areas**: Full canvas, ellipse, ring, or rectangle
- **Jitter**: Random motion intensity (0-1)

### Edge Rendering
- **Max Distance**: 30-400px connection range
- **Max Edges**: 0-12 connections per particle
- **Line Width**: 0.2-3px stroke width
- **Opacity**: 0-100% transparency
- **Color Modes**: Static, distance-based, or velocity-based

### Physics Forces
- **Noise Strength**: Perlin-style random motion (0-1)
- **Gravity**: Center attraction/repulsion (-1 to 1)
- **Drag**: Velocity damping (0-0.1)

### Interaction
- **Mouse Repel**: Repulsion force strength (0-1)
- **Mouse Radius**: Interaction area size (0-300px)
- **Hover Highlight**: Visual feedback on hover
- **Click Spawn**: Create particles on click

### Performance Tuning
- **FPS Cap**: 30/60/120 FPS or unlimited
- **Pixel Ratio**: Auto, 1x, or 2x for different quality levels
- **Spatial Index**: None, grid, or quadtree optimization
- **Batch Rendering**: Enable/disable batch edge rendering

## 🌐 Browser Support

### Recommended Browsers
- **Chrome 88+** - Full feature support with optimal performance
- **Firefox 85+** - Complete compatibility with all features
- **Safari 14+** - Full support including mobile Safari
- **Edge 88+** - Complete Chromium-based compatibility

### Required Features
- ES2020+ JavaScript modules
- HTML5 Canvas with 2D context
- CSS Custom Properties (CSS Variables)
- Web APIs: localStorage, clipboard, file system access

## 📱 Mobile Support

### Responsive Design
- **Tablet Layout**: Side panel converts to bottom drawer
- **Mobile Layout**: Overlay panel with touch gestures
- **Touch Interaction**: Full touch and gesture support
- **Performance Scaling**: Automatic quality adjustment on mobile

### Touch Features
- **Tap to Spawn**: Create particles with finger taps
- **Touch Repulsion**: Multi-finger particle interaction
- **Gesture Controls**: Swipe to open/close control panel
- **44px Touch Targets**: Accessibility-compliant touch areas

## 🔧 Development

### Local Development
```bash
# Serve locally (any static server works)
python -m http.server 8000
# or
npx serve
# or
php -S localhost:8000
```

### Code Organization
- **ES Modules**: Modern import/export syntax
- **Event-Driven**: Reactive configuration updates
- **Error Handling**: Comprehensive error boundaries
- **Performance Monitoring**: Built-in FPS and timing metrics

### Extending the System
- **Custom Presets**: Add new configurations in `src/state/presets.js`
- **New Blend Modes**: Extend rendering options in `src/render/plexus.js`
- **Additional Controls**: Add UI elements in `src/ui/panel.js`
- **Export Formats**: Extend export options in `src/io/exporter.js`

## 🎯 Performance Targets

### Benchmarks
- **1000 particles**: 60 FPS on mid-range laptops
- **1500 particles**: 45+ FPS with quality adaptation
- **3000+ particles**: Graceful degradation with warnings
- **Mobile devices**: Automatic quality scaling for smooth operation

### Optimization Features
- **Spatial Indexing**: O(n) neighbor detection vs O(n²) brute force
- **Batch Rendering**: Single draw call for all edges
- **Memory Efficiency**: Typed arrays for optimal cache utilization
- **Adaptive Quality**: Dynamic resolution scaling based on performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**y-tretyakov** - [GitHub Profile](https://github.com/y-tretyakov)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- [Live Demo](https://y-tretyakov.github.io/plexus-canvas/)
- [GitHub Repository](https://github.com/y-tretyakov/plexus-canvas)
- [Issue Tracker](https://github.com/y-tretyakov/plexus-canvas/issues)
- [Documentation](https://github.com/y-tretyakov/plexus-canvas/wiki)

---

**Built with ❤️ using pure web technologies. No frameworks, no build process, just modern web standards.**