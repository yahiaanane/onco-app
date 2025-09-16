# Overview

This is a Cancer Patient Management Web Application built with React and Express.js. The application provides healthcare professionals with a comprehensive platform to manage cancer patients, track treatment protocols, monitor lab results, and generate reports. The system features a modern interface with dedicated sections for patient management, protocol tracking, lab test monitoring, and adherence reporting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React using TypeScript and follows a component-based architecture:

- **UI Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

The frontend is organized into:
- Pages for main routes (Dashboard, Patients, Protocols, Labs, Reports)
- Reusable UI components following shadcn/ui patterns
- Feature-specific components organized by domain (patients, protocols, labs, reports)
- Shared hooks and utilities

## Backend Architecture
The server follows a RESTful API design using Express.js:

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js for HTTP server and API routes
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between client and server
- **Development**: Vite integration for hot module replacement

API endpoints are organized by resource type with full CRUD operations for:
- Patients (creation, search, profile management)
- Protocol templates and patient-specific protocols
- Lab tests and results tracking
- Adherence records and statistics

## Database Design
PostgreSQL database with the following core entities:

- **Users**: Healthcare provider accounts
- **Patients**: Complete patient profiles with cancer-specific information
- **Protocol Templates**: Reusable treatment templates
- **Protocol Items**: Individual treatments within protocols
- **Patient Protocols**: Instance of protocols assigned to patients
- **Adherence Records**: Daily tracking of protocol compliance
- **Lab Tests**: Test results with timeline tracking
- **Timeline Entries**: Activity and event logging

The schema supports:
- Flexible metastasis location tracking (JSON arrays)
- Rich protocol definitions with dosage, frequency, and rationale
- Comprehensive adherence tracking with daily checkoffs
- Lab result trends and reference ranges

## Authentication & Authorization
- Session-based authentication using PostgreSQL session store
- User management with encrypted passwords
- Role-based access (designed for healthcare providers)

## Development Workflow
- **Development**: Vite dev server with Express API proxy
- **Build**: Vite builds client, esbuild bundles server
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: Shared TypeScript types between client/server

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: PostgreSQL session store

## UI/UX
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **Recharts**: Chart and data visualization library

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation
- **TanStack Query**: Server state management

## Hosting & Runtime
- **Replit**: Development and hosting platform
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework