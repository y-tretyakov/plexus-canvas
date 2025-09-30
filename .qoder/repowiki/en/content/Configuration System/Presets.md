# Presets

<cite>
**Referenced Files in This Document**   
- [tasks.md](file://aicontext/tasks.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Built-in Presets Overview](#built-in-presets-overview)
3. [Preset Structure and Configuration](#preset-structure-and-configuration)
4. [getByName Function Interface](#getbyname-function-interface)
5. [Programmatic Preset Usage](#programmatic-preset-usage)
6. [Presets and Configuration System Integration](#presets-and-configuration-system-integration)
7. [Common Usage Patterns](#common-usage-patterns)
8. [Potential Issues and Extensions](#potential-issues-and-extensions)

## Introduction
The Presets system in Plexus Canvas provides predefined configuration templates that serve as starting points for visualization settings. These presets allow users to quickly apply cohesive sets of parameters that produce distinct visual effects, eliminating the need for manual configuration of individual settings. The system is designed to work seamlessly with the main configuration system, enabling dynamic updates and real-time visualization changes.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L0-L2)
- [tasks.md](file://aicontext/tasks.md#L232-L266)

## Built-in Presets Overview
The system includes five built-in presets, each designed to create a unique visual aesthetic by combining specific parameter values across particles, edges, forces, and styling:

- **Neon Breeze**: The default preset featuring a soft gradient with `blendMode=lighten`, creating an ethereal glow effect
- **Cosmic Web**: Characterized by large `maxDistance` values, low particle speed, and a dark background for a deep-space feel
- **Wireframe**: Features thin white lines, minimal particle size (`size=0.5`), and low line opacity (`lineOpacity=0.25`) for a technical blueprint appearance
- **Storm**: Implements high `noiseStrength` and elevated `mouseRepel` values to create turbulent, reactive motion
- **Minimal**: Uses fewer particles, thicker lines, and pastel colors for a clean, modern aesthetic

These presets are accessible through the UI dropdown and can be quickly selected using keyboard shortcuts (1, 2, 3 for the first three presets).

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L232-L266)
- [tasks.md](file://aicontext/tasks.md#L89-L149)

## Preset Structure and Configuration
Presets are structured as JSON objects that override default settings in the main configuration. Each preset contains a complete configuration object that follows the same schema as the main Config JSON, including sections for particles, edges, forces, style, interaction, and performance parameters.

The preset system works by merging the preset's JSON configuration with the default configuration, with preset values taking precedence. This allows presets to modify only the parameters relevant to their visual style while inheriting sensible defaults for others. Each preset includes a metadata object with a name and version number, enabling version tracking and future updates.

When a preset is applied, its configuration values completely replace the corresponding values in the current configuration, triggering immediate visual updates.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L42-L87)
- [tasks.md](file://aicontext/tasks.md#L89-L149)

## getByName Function Interface
The `getByName(name)` function serves as the primary interface for accessing preset configurations programmatically. This function takes a preset name as a string parameter and returns the corresponding preset configuration object if found.

The function is designed to handle case-insensitive lookups and supports both full names and abbreviated references. It includes validation to ensure the requested preset exists, returning null or a default configuration if an invalid name is provided. This interface enables both UI components and external scripts to retrieve preset configurations dynamically.

The function is expected to be implemented in the `/src/state/presets.js` module, which houses the collection of all available presets.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L286)
- [tasks.md](file://aicontext/tasks.md#L284)

## Programmatic Preset Usage
Presets can be retrieved and applied programmatically through the `getByName` function. To use a preset, call the function with the desired preset name:

```javascript
// Retrieve a preset configuration
const neonBreezeConfig = Presets.getByName('Neon Breeze');

// Apply the preset to the current configuration
if (neonBreezeConfig) {
    configManager.applyConfiguration(neonBreezeConfig);
}
```

This approach allows for dynamic preset application based on user actions, URL parameters, or automated sequences. The configuration system ensures that all change events are properly triggered when preset values are applied, maintaining consistency across the application.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L286)
- [tasks.md](file://aicontext/tasks.md#L292-L297)

## Presets and Configuration System Integration
Presets are tightly integrated with the main configuration system, where preset values trigger change events that propagate through the application. When a preset is applied, each modified configuration parameter generates its respective change event, ensuring that all dependent components update accordingly.

The integration follows a hierarchical override pattern:
1. Default configuration provides baseline values
2. Preset configuration overrides specific defaults
3. User modifications override preset values

This cascade ensures that users can start with a preset and make custom adjustments without losing the ability to revert to the preset's original settings. The system maintains the relationship between the current configuration and its source preset, enabling features like "reset to preset" functionality.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L42-L87)
- [tasks.md](file://aicontext/tasks.md#L89-L149)

## Common Usage Patterns
The Presets system supports several common usage patterns:

- **Quick Start**: Users select a preset as a starting point and make minor adjustments
- **Keyboard Navigation**: Using shortcuts 1, 2, 3 to cycle through the first three presets
- **URL Sharing**: Preset configurations can be encoded in URLs for sharing
- **Progressive Customization**: Starting with a preset and gradually modifying parameters
- **A/B Comparison**: Quickly switching between presets to compare visual effects

The system also supports programmatic patterns such as conditional preset application based on device capabilities or user preferences.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L89-L149)
- [tasks.md](file://aicontext/tasks.md#L232-L266)

## Potential Issues and Extensions
When extending or modifying the preset system, several potential issues should be considered:

- **Version Compatibility**: Changes to the configuration schema may break existing presets
- **Parameter Drift**: Over time, new parameters may not be included in older presets
- **Performance Impact**: Some preset configurations may exceed performance thresholds on lower-end devices
- **Validation Requirements**: Preset values should be validated against parameter ranges

Potential extensions to the system could include:
- User-defined presets
- Preset categories or tags
- Smooth transitions between presets
- Preset import/export functionality
- Community preset sharing

The system should maintain backward compatibility when adding new presets or modifying existing ones, using version numbers in the metadata to track changes.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L12)
- [tasks.md](file://aicontext/tasks.md#L232-L266)