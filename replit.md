# Overview

This is a full-stack expense tracking web application built with React and Node.js. The app allows users to scan receipts using OCR technology, manage their expenses, and view analytics. It features a modern UI with ShadCN components, authentication, file uploads, and data export capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Client-side application built with React 18 and TypeScript
- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Styling**: Tailwind CSS with ShadCN/ui component library for consistent design
- **Authentication**: Context-based auth provider with protected routes
- **OCR Integration**: Tesseract.js for client-side optical character recognition of receipt images

## Backend Architecture
- **Node.js/Express**: RESTful API server with TypeScript support
- **Authentication**: Passport.js with local strategy using session-based authentication
- **File Handling**: Multer middleware for receipt image uploads with file type and size validation
- **Session Management**: Express sessions with PostgreSQL session store
- **Security**: Password hashing using Node.js scrypt with salt

## Database Design
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Structure**:
  - Users table with authentication credentials
  - Expenses table with vendor, amount, date, category, and receipt image URL
  - Expense items table for detailed line items per expense
  - Proper foreign key relationships with cascade deletes

## API Structure
- RESTful endpoints for CRUD operations on expenses
- Authentication endpoints for login/logout/register
- File upload handling for receipt images
- Analytics endpoints for expense statistics
- Query parameter support for filtering by date ranges and categories
- Excel export functionality for expense data

## Development Tooling
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Full type safety across client, server, and shared code
- **ESBuild**: Production bundling for server code
- **Development Features**: Replit-specific plugins for cartographer and dev banner

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI/UX Libraries
- **Radix UI**: Headless component primitives for accessible UI components
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework with custom design tokens

## File Processing
- **Multer**: Multipart form data handling for file uploads
- **Tesseract.js**: Client-side OCR library for receipt text extraction
- **ExcelJS**: Excel file generation for data exports

## Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with secure cookies
- **Crypto**: Node.js built-in for password hashing and security

## Data Management
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect
- **Zod**: Runtime type validation for API inputs and form data
- **React Hook Form**: Form state management with validation

## Development Tools
- **Vite Plugins**: Runtime error overlay, cartographer, and dev banner for Replit
- **TSX**: TypeScript execution for development server
- **PostCSS**: CSS processing with Tailwind and Autoprefixer