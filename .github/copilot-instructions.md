# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React TypeScript photobooth application built with Vite. The project aims to recreate and modernize a PHP-based photobooth with the following features:

### Core Features
- **Photo Capture**: Real-time camera preview and photo capture functionality
- **Gallery**: Display and manage captured photos with PhotoSwipe-like interface
- **Filters**: Apply various image filters and effects
- **Admin Panel**: Configuration and management interface
- **Print Integration**: Photo printing capabilities
- **Real-time Preview**: Live camera feed for photo composition

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules / Styled Components
- **State Management**: React Context + Hooks
- **Camera API**: MediaDevices API for web camera access
- **Image Processing**: Canvas API for filters and effects
- **Build Tool**: Vite for fast development and optimized builds

### Code Guidelines
- Use functional components with React hooks
- Implement TypeScript strictly with proper type definitions
- Follow React best practices for state management
- Use modern ES6+ features
- Implement responsive design principles
- Ensure accessibility compliance
- Use meaningful component and variable names
- Add proper error handling for camera and API operations

### Project Structure
- `/src/components` - Reusable UI components
- `/src/pages` - Main application pages/views
- `/src/hooks` - Custom React hooks
- `/src/services` - API and external service integrations
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions
- `/src/styles` - Global styles and theme configuration
