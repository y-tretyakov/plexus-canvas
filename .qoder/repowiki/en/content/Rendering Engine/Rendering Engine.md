# Rendering Engine

<cite>
**Referenced Files in This Document**
- [tasks.md](file://aicontext/tasks.md)
- [README.md](file://README.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Animation Loop Implementation](#animation-loop-implementation)
4. [Time-Step Management](#time-step-management)
5. [HiDPI Support](#hidpi-support)
6. [Canvas Management](#canvas-management)
7. [Rendering Optimization](#rendering-optimization)
8. [Plexus Module Coordination](#plexus-module-coordination)
9. [Performance Monitoring](#performance-monitoring)
10. [Configuration Options](#configuration-options)
11. [Conclusion](#conclusion)

## Introduction

The Plexus Canvas rendering engine is a sophisticated web-based animation system designed to visualize dynamic particle networks with smooth motion and optimal performance. Built using vanilla JavaScript (ES2020+) and modern web technologies, the engine implements advanced rendering techniques including requestAnimationFrame-based animation loops, HiDPI support, and intelligent performance monitoring.

The rendering subsystem consists of two primary components: the `render/engine.js` responsible for managing the animation loop, time-step calculations, and canvas operations, and the `render/plexus.js` handling particle physics, edge calculations, and spatial indexing. Together, these components create a seamless visual experience with configurable performance characteristics suitable for various hardware configurations.

## Architecture Overview

The rendering engine follows a modular architecture with clear separation of concerns between animation management and particle simulation. The system is designed around the concept of coordinated updates where the engine drives the animation loop while delegating computational intensive tasks to the plexus module.

```mermaid
graph TB
subgraph "Rendering Engine Architecture"
subgraph "Engine Layer"
AnimationLoop["Animation Loop<br/>(requestAnimationFrame)"]
TimeStep["Time Step Manager"]
HiDPISupport["HiDPI Support"]
CanvasManager["Canvas Manager"]
PerformanceMonitor["Performance Monitor"]
end
subgraph "Plexus Layer"
ParticleSystem["Particle System"]
EdgeCalculation["Edge Calculation"]
SpatialIndex["Spatial Index<br/>(Grid/Quadtree)"]
BatchRenderer["Batch Renderer"]
end
subgraph "External Systems"
ConfigSystem["Config System"]
UIControls["UI Controls"]
ExportSystem["Export System"]
end
end
AnimationLoop --> TimeStep
AnimationLoop --> HiDPISupport
AnimationLoop --> CanvasManager
AnimationLoop --> PerformanceMonitor
TimeStep --> ParticleSystem
ParticleSystem --> EdgeCalculation
EdgeCalculation --> SpatialIndex
SpatialIndex --> BatchRenderer
ConfigSystem --> AnimationLoop
UIControls --> ConfigSystem
ExportSystem --> CanvasManager
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L14-L22)

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L4-L22)

## Animation Loop Implementation

The core of the rendering engine is built around the `requestAnimationFrame` API, which provides optimal timing for browser-based animations. The implementation features a sophisticated "soft" FPS capping mechanism that intelligently manages frame rate while maintaining smooth motion.

```mermaid
sequenceDiagram
participant RAF as "requestAnimationFrame"
participant Engine as "Render Engine"
participant Timer as "Frame Timer"
participant Performance as "Performance Monitor"
participant Canvas as "Canvas Context"
RAF->>Engine : Animation Frame Callback
Engine->>Timer : Record Current Time
Timer->>Timer : Calculate Delta Time
Timer->>Performance : Check Target FPS
alt FPS Cap Active
Performance->>Timer : Compare Delta vs Target
alt Frame Skipped
Timer-->>Engine : Skip Frame
Note over Engine : No rendering this frame
else Frame Rendered
Timer-->>Engine : Continue Rendering
Engine->>Canvas : Clear Background
Engine->>Canvas : Draw Scene
Engine->>Performance : Update Metrics
end
else No FPS Cap
Engine->>Canvas : Clear Background
Engine->>Canvas : Draw Scene
Engine->>Performance : Update Metrics
end
Engine->>RAF : Schedule Next Frame
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L193-L196)

The animation loop implements several key features:

### Soft FPS Capping Mechanism
The engine supports multiple FPS capping modes (30, 60, 120, Off) that dynamically adjust frame rendering based on performance metrics. When FPS capping is enabled, the system accumulates time deltas and only renders frames when sufficient time has passed to meet the target frame rate.

### Delta Time Handling
Accurate time-step management ensures consistent motion regardless of frame rate fluctuations. The engine calculates precise delta times between frames and applies them to particle physics calculations, resulting in smooth and predictable animations.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L193-L196)

## Time-Step Management

The time-step management system is crucial for maintaining consistent physics behavior across varying frame rates. The engine implements adaptive time-stepping that balances performance with visual quality.

```mermaid
flowchart TD
Start([Frame Start]) --> GetTime["Get Current Timestamp"]
GetTime --> CalcDelta["Calculate Delta Time"]
CalcDelta --> CheckFPS{"FPS Cap Enabled?"}
CheckFPS --> |Yes| CheckTarget{"Delta >= Target?"}
CheckFPS --> |No| ApplyPhysics["Apply Physics Updates"]
CheckTarget --> |Yes| ApplyPhysics
CheckTarget --> |No| SkipFrame["Skip Frame"]
ApplyPhysics --> UpdateParticles["Update Particles<br/>(dt applied)"]
UpdateParticles --> UpdateEdges["Update Edges"]
UpdateEdges --> RenderScene["Render Scene"]
SkipFrame --> End([Frame End])
RenderScene --> End
style CheckFPS fill:#e1f5fe
style ApplyPhysics fill:#c8e6c9
style SkipFrame fill:#ffcdd2
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L193-L196)

The time-step system handles several scenarios:

### Variable Frame Rate
When no FPS cap is set, the engine renders every available frame, applying the exact delta time to physics calculations. This provides maximum visual fidelity but may impact performance on lower-end hardware.

### Fixed Frame Rate
With FPS caps enabled, the system accumulates time and only renders when the accumulated time meets or exceeds the target frame duration. This creates smoother motion at the cost of occasional skipped frames.

### Adaptive Time-Stepping
The engine automatically adjusts time steps for physics calculations to prevent instability during frame rate variations, ensuring consistent particle behavior.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L193-L196)

## HiDPI Support

High-DPI display support is essential for crisp visuals on modern devices. The rendering engine implements automatic detection of device pixel ratios combined with manual override capabilities.

```mermaid
classDiagram
class HiDPISystem {
+number devicePixelRatio
+string pixelRatioMode
+boolean autoDetect
+number canvasWidth
+number canvasHeight
+number scaledWidth
+number scaledHeight
+detectDevicePixelRatio() number
+setPixelRatioMode(mode) void
+calculateScaledDimensions() void
+applyHiDPIScaling() void
}
class CanvasManager {
+HTMLCanvasElement canvas
+CanvasRenderingContext2D context
+resizeCanvas() void
+clearBackground() void
+setupHiDPIContext() void
}
class PerformanceMonitor {
+number currentFPS
+number averageFPS
+number minFPS
+checkPerformance() boolean
+adjustSettings() void
}
HiDPISystem --> CanvasManager : "configures"
CanvasManager --> PerformanceMonitor : "monitors"
HiDPISystem --> PerformanceMonitor : "influences"
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L196-L197)

### Automatic Detection
The system automatically detects the device's pixel ratio using `window.devicePixelRatio` and scales the canvas accordingly. This ensures sharp rendering on Retina displays and other high-density screens.

### Manual Override
Users can manually set the pixel ratio mode to force lower resolutions for performance optimization. The available modes include automatic detection, manual scaling, and forced low-DPI rendering.

### Scaling Strategies
The engine employs different scaling approaches depending on the target resolution and performance requirements. Higher pixel ratios improve visual quality but increase rendering overhead.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L196-L197)

## Canvas Management

Canvas management encompasses resizing behavior, background clearing strategies, and context configuration. The system is designed to handle dynamic window resizing while maintaining optimal performance.

```mermaid
stateDiagram-v2
[*] --> Initialized
Initialized --> Resizing : Window Resize
Resizing --> Calculating : Calculate New Dimensions
Calculating --> BufferRecreation : Create Back Buffer
BufferRecreation --> CenterRecalculation : Recalculate Center
CenterRecalculation --> Ready : Setup Complete
Ready --> FullClear : Normal Frame
Ready --> GhostTrail : Ghost Trail Mode
FullClear --> Rendering : Clear Background
GhostTrail --> Rendering : Semi-transparent Fill
Rendering --> Ready : Frame Complete
Ready --> SoftReset : Soft Reset Trigger
SoftReset --> Ready : Reset Complete
note right of Resizing
Dynamic canvas sizing
maintains aspect ratio
end note
note right of GhostTrail
Optional semi-transparent
background clearing
end note
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L197-L199)

### Dynamic Resizing
The canvas automatically resizes to match container dimensions while preserving the aspect ratio. This ensures the visualization adapts to different screen sizes and layout configurations.

### Background Clearing Strategies
The engine supports two background clearing approaches:

1. **Full Clear Mode**: Completely clears the canvas before each frame, providing clean slate rendering
2. **Ghost Trail Mode**: Uses semi-transparent background fills to create motion blur effects, enhancing visual appeal

### Back Buffer Management
During resize operations, the system recreates back buffers to accommodate new dimensions while preserving existing particle data and maintaining continuity.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L197-L199)

## Rendering Optimization

The rendering engine implements several optimization techniques to maximize performance while maintaining visual quality. These optimizations are particularly important for handling large numbers of particles efficiently.

```mermaid
graph LR
subgraph "Optimization Techniques"
subgraph "Memory Optimization"
SoAArrays["SoA Arrays<br/>(Structure of Arrays)<br/>Float32Array"]
Float32Array["Optimized Data Types"]
end
subgraph "Rendering Optimization"
BatchDrawing["Batched Edge Drawing<br/>Single beginPath/stroke"]
SingleStroke["Single Stroke Call<br/>Multiple moveTo/lineTo"]
BlendModes["Blend Mode Optimization"]
end
subgraph "Performance Control"
FpsCap["FPS Cap<br/>30/60/120/Off"]
QualityToggle["Quality Toggle<br/>Shadows/Gradients"]
DpiControl["DPI Control<br/>Manual Scaling"]
end
end
SoAArrays --> BatchDrawing
Float32Array --> SingleStroke
BatchDrawing --> BlendModes
SingleStroke --> BlendModes
FpsCap --> QualityToggle
QualityToggle --> DpiControl
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L8-L12)

### Structure of Arrays (SoA)
The engine uses SoA data structures for particle storage, organizing data into separate arrays for position, velocity, and color components. This memory layout improves cache locality and enables efficient SIMD operations.

### Batched Edge Drawing
Instead of individual stroke calls for each edge, the system performs batched drawing using a single `beginPath()` call followed by multiple `moveTo()` and `lineTo()` operations, then a single `stroke()` call. This significantly reduces GPU state changes and improves rendering performance.

### Memory Efficiency
All numerical data uses `Float32Array` for optimal memory usage and performance. The SoA structure minimizes memory fragmentation and improves cache hit rates during particle updates.

### Quality vs Performance Trade-offs
The engine provides runtime controls for adjusting rendering quality based on performance requirements. Features like shadows and gradients can be disabled when FPS drops below target thresholds.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L8-L12)

## Plexus Module Coordination

The rendering engine coordinates closely with the plexus module to manage particle updates and drawing operations. This coordination ensures that physics calculations and rendering occur in sync while maintaining optimal performance.

```mermaid
sequenceDiagram
participant Engine as "Render Engine"
participant Plexus as "Plexus Module"
participant Config as "Config System"
participant Panel as "UI Panel"
Engine->>Plexus : Initialize Particles
Plexus->>Plexus : Setup SoA Arrays
Plexus->>Plexus : Build Spatial Index
loop Animation Frame
Engine->>Config : Check for Updates
Config->>Panel : Notify UI Changes
Panel->>Config : Update Parameters
Engine->>Plexus : Update Particles(dt)
Plexus->>Plexus : Apply Forces
Plexus->>Plexus : Update Positions
Plexus->>Plexus : Build Edges
Engine->>Plexus : Draw Scene
Plexus->>Plexus : Batch Render Edges
Plexus->>Plexus : Render Particles
Plexus-->>Engine : Drawing Complete
Engine->>Engine : Composite to Canvas
end
Note over Engine,Plexus : Coordinated update cycle
Note over Config,Panel : Real-time parameter changes
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L14-L15)

### Update Coordination
The engine passes time deltas to the plexus module for physics calculations, ensuring consistent temporal behavior across all particle operations. This coordination happens every frame during the animation loop.

### Parameter Synchronization
UI controls modify configuration parameters that trigger immediate updates to the plexus module. The system debounces heavy operations like spatial index rebuilding to prevent performance degradation.

### Event-Driven Updates
Changes to configuration parameters trigger events that propagate through the system, ensuring all components remain synchronized while minimizing unnecessary computations.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L14-L15)

## Performance Monitoring

The rendering engine includes comprehensive performance monitoring capabilities that track frame rates, detect performance degradation, and automatically adjust settings to maintain target frame rates.

```mermaid
flowchart TD
Start([Performance Check]) --> GetCurrentFPS["Get Current FPS"]
GetCurrentFPS --> CheckTarget{"Current >= Target?"}
CheckTarget --> |Yes| EnableFeatures["Enable All Features"]
CheckTarget --> |No| DisableFeatures["Disable Non-Essential Features"]
DisableFeatures --> ReduceQuality["Reduce Quality Settings"]
ReduceQuality --> LowerDPI["Lower DPI Scaling"]
LowerDPI --> IncreaseFpsCap["Increase FPS Cap"]
EnableFeatures --> Monitor["Continue Monitoring"]
IncreaseFpsCap --> Monitor
Monitor --> CheckTarget
style CheckTarget fill:#e1f5fe
style DisableFeatures fill:#ffcdd2
style EnableFeatures fill:#c8e6c9
```

**Diagram sources**
- [tasks.md](file://aicontext/tasks.md#L8-L12)

### Real-time FPS Tracking
The engine continuously monitors actual frame rates and compares them against target performance goals. This data informs automatic quality adjustments and user feedback mechanisms.

### Soft-Cap Mechanism
When performance drops below target levels, the system automatically increases the FPS cap threshold to allow more frequent rendering attempts, helping recover lost performance.

### Quality Adjustment
The engine can dynamically disable non-essential rendering features like shadows, gradients, and complex blend modes when performance pressure mounts.

### Performance Thresholds
Predefined performance targets guide automatic adjustments. The system aims for 60 FPS with 1000-1500 particles and maxDistance=140 on mid-range laptops.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L8-L12)

## Configuration Options

The rendering engine provides extensive configuration options that allow users to customize performance characteristics and visual appearance according to their needs and hardware capabilities.

### FPS Control Options
- **30 FPS**: Conservative setting for maximum compatibility
- **60 FPS**: Standard target for smooth motion
- **120 FPS**: High-performance mode for capable hardware
- **Off**: Unrestricted frame rate with minimal latency

### HiDPI Configuration
- **Auto-detect**: Automatically use device pixel ratio
- **Manual**: Allow user-controlled scaling
- **Low-DPI**: Force 1x scaling for performance

### Background Clearing Modes
- **Full Clear**: Complete background reset each frame
- **Ghost Trail**: Semi-transparent background for motion blur
- **Custom**: User-defined clearing behavior

### Performance Tuning
- **Spatial Index Type**: Grid vs Quadtree selection
- **Quality Levels**: Feature enable/disable toggles
- **Memory Limits**: Maximum particle count restrictions

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L8-L12)

## Conclusion

The Plexus Canvas rendering engine represents a sophisticated approach to real-time particle visualization that balances performance, visual quality, and user experience. Through its modular architecture, intelligent optimization techniques, and adaptive performance monitoring, the engine delivers smooth animations suitable for a wide range of hardware configurations.

Key strengths of the system include:

- **Adaptive Performance**: Automatic quality adjustment based on actual performance metrics
- **Efficient Rendering**: Optimized SoA data structures and batched drawing operations  
- **Flexible Configuration**: Extensive options for customizing behavior and appearance
- **Robust Architecture**: Clean separation of concerns between animation and physics
- **Modern Standards**: Built using vanilla JavaScript with ES2020+ features

The engine's design philosophy emphasizes maintainability and extensibility while delivering professional-grade rendering capabilities. Its modular structure allows for easy modification and enhancement while maintaining backward compatibility and performance stability.

Future enhancements could include WebGL acceleration for larger particle counts, advanced lighting effects, and additional spatial indexing algorithms for improved performance with extreme particle densities.