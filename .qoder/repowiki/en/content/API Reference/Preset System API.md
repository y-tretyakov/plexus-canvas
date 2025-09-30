# Preset System API

<cite>
**Referenced Files in This Document**   
- [tasks.md](file://aicontext/tasks.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Preset Retrieval Function](#preset-retrieval-function)
3. [Built-in Presets](#built-in-presets)
4. [Programmatic Usage](#programmatic-usage)
5. [Extending the Preset Registry](#extending-the-preset-registry)
6. [Error Handling](#error-handling)
7. [Use Cases](#use-cases)

## Introduction
The visualization preset system in Plexus Canvas enables users and developers to quickly apply predefined configurations that control the appearance and behavior of the dynamic network visualization. These presets encapsulate comprehensive configuration settings, allowing for instant styling changes without manual parameter adjustment. The system supports both built-in presets and extensibility for custom configurations.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L0-L2)
- [tasks.md](file://aicontext/tasks.md#L232-L266)

## Preset Retrieval Function
The core functionality of the preset system is provided by the `getByName(name)` function, which retrieves a configuration object based on a string identifier. This function searches through the registered presets and returns the corresponding configuration if found.

- **Input**: A string representing the preset name (case-sensitive)
- **Return Value**: Configuration object matching the preset, or `null` if no matching preset is found
- **Behavior on Invalid Inputs**: Returns `null` for undefined or misspelled preset names; does not throw exceptions for invalid inputs

This design allows for safe integration in user interfaces where preset selection might be dynamic or user-driven.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L286)
- [tasks.md](file://aicontext/tasks.md#L17)

## Built-in Presets
The system includes several built-in presets, each designed to create a distinct visual experience. These presets are preconfigured with specific values for particles, edges, forces, colors, and interaction parameters.

### Neon Breeze (Default)
- Soft gradient background
- Blend mode set to "lighten"
- Balanced particle density and edge connectivity
- Gentle motion with moderate noise strength

### Cosmic Web
- Large maximum edge distance
- Low particle speed
- Dark background for cosmic effect
- High spatial coherence in particle distribution

### Wireframe
- Thin white lines with low opacity (0.25)
- Minimal particle size (0.5px)
- Focus on structural connectivity rather than particle presence
- Clean, architectural appearance

### Storm
- High noise strength for turbulent motion
- Strong mouse repulsion effect
- Dynamic, energetic particle behavior
- Intense visual response to user interaction

### Minimal
- Low particle count for sparse appearance
- Thick edges for emphasis on connections
- Pastel color palette
- Simplified aesthetic with reduced visual complexity

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L232-L242)

## Programmatic Usage
Developers can load and apply presets programmatically through the preset system API. The typical workflow involves retrieving a preset configuration and applying it to the visualization engine.

To load a preset:
1. Call `getByName("presetName")` with the desired preset identifier
2. Check if the return value is not null
3. Apply the returned configuration object to the visualization system

The system supports keyboard shortcuts for quick preset selection (keys 1, 2, 3 for the first three presets) and a dropdown interface for preset selection in the control panel.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L89-L94)
- [tasks.md](file://aicontext/tasks.md#L83)

## Extending the Preset Registry
Developers can extend the preset registry with custom configurations by adding new entries to the internal presets collection. Custom presets should follow the same configuration structure as defined in the Config JSON model.

To create a custom preset:
1. Define a configuration object with all relevant parameters
2. Register it with the preset system using the appropriate registration mechanism
3. Ensure the preset name is unique within the registry

Custom presets inherit all the functionality of built-in presets, including retrieval via `getByName()` and integration with the UI controls.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L17)
- [tasks.md](file://aicontext/tasks.md#L42-L87)

## Error Handling
The preset system implements graceful error handling for various scenarios:

- **Undefined Preset Names**: The `getByName()` function returns `null` when a requested preset name does not exist, allowing calling code to handle the absence gracefully
- **Version Compatibility**: Configuration objects include a version field in their metadata, enabling the system to detect and handle compatibility issues when presets evolve across versions
- **Invalid Configuration Data**: All configurations are validated against defined ranges and types before application

When a requested preset is not found, applications should either fall back to a default configuration or notify the user, depending on the context.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L12)
- [tasks.md](file://aicontext/tasks.md#L144-L149)

## Use Cases
The preset system supports several key use cases in application development and user experience design.

### Application Initialization
Applications can initialize with a specific preset by calling `getByName()` during startup with the desired preset name. This ensures consistent visual appearance across sessions and provides a curated starting point for users.

### Dynamic Style Switching
Users can switch between visual styles dynamically through the UI controls or keyboard shortcuts. The preset system enables instantaneous transitions between different visual configurations without requiring page reload or complex state management.

### User Customization and Sharing
The combination of presets with JSON import/export functionality allows users to save custom configurations as presets and share them with others. The share URL feature encodes the current configuration in base64 format within the URL fragment, enabling easy sharing of custom visual states.

**Section sources**
- [tasks.md](file://aicontext/tasks.md#L83)
- [tasks.md](file://aicontext/tasks.md#L144-L149)
- [tasks.md](file://aicontext/tasks.md#L284-L285)