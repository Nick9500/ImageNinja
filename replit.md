# Overview

This is an image resizing and editing web application built with a modern React frontend and Express.js backend. The application allows users to upload JPEG images (up to 30MB), resize them using various controls, crop them interactively, and download the processed results. The interface features a professional dark theme with comprehensive image manipulation tools including drag-and-drop upload, real-time preview, and quality control for downloads.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with a custom dark theme and CSS variables for theming
- **State Management**: React hooks for local state, TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **File Upload**: Uppy.js components for file handling with support for drag-and-drop and AWS S3 integration
- **Image Processing**: HTML5 Canvas API with custom ImageProcessor utility class for client-side image manipulation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development**: tsx for TypeScript execution, ESBuild for production bundling
- **Database**: Drizzle ORM configured for PostgreSQL with Neon Database serverless driver
- **Storage**: In-memory storage implementation with interface for easy database integration
- **File Storage**: Google Cloud Storage integration for handling uploaded files
- **Development Tools**: Vite integration for HMR in development mode

## Database Schema
- **Users Table**: Simple user management with id (UUID), username (unique), and password fields
- **Database Migration**: Drizzle Kit for schema management and migrations
- **Validation**: Zod schemas for type-safe data validation

## Component Structure
- **Modular Design**: Separate components for upload (UploadZone), editing (ImageEditor), resize controls (ResizeControls), crop controls (CropControls), and download (DownloadControls)
- **Canvas Integration**: Direct HTML5 Canvas manipulation for real-time image processing
- **Responsive Design**: Mobile-first design with adaptive layouts using Tailwind breakpoints

## File Processing Pipeline
- **Upload Validation**: Client-side file type and size validation (JPEG only, 30MB max)
- **Image Loading**: Asynchronous image loading with error handling
- **Real-time Processing**: Canvas-based resize and crop operations with immediate preview
- **Quality Control**: Adjustable compression quality for download optimization

# External Dependencies

## Core Technologies
- **React Ecosystem**: React, React DOM, React Hook Form with Zod validation
- **TypeScript**: Full TypeScript support across frontend and backend
- **Build Tools**: Vite for frontend bundling, ESBuild for backend production builds

## UI and Styling
- **Shadcn/ui**: Complete component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Lucide React**: Icon library for consistent iconography

## Backend Services
- **Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Cloud Storage**: Google Cloud Storage for file persistence
- **Development**: Replit-specific plugins for development environment integration

## File Handling
- **Uppy.js**: File upload library with AWS S3, drag-drop, and dashboard components
- **Image Processing**: Native HTML5 Canvas API for client-side image manipulation

## Development Tools
- **Query Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Development**: Various Replit plugins for enhanced development experience