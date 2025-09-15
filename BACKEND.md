# Backend Documentation - Handyman Auction App

## Overview
The backend is built using **Convex** as the database and serverless functions platform, providing real-time capabilities and strong type safety.

## Architecture

### Database Schema (convex/schema.ts)
The application uses a comprehensive schema with the following main tables:

#### Core Tables

**users**
- Supports three user types: `handyman`, `client`, `business`
- Contains profile information: name, email, phone, avatar, location
- Includes handyman-specific fields: skills, categories, rating, hourlyRate, bio
- Verification status and completion metrics
- Indexed by email, role, and verification status

**jobs**
- Complete job lifecycle management
- Budget range with currency support
- Location-based with coordinates and address
- Status tracking: draft → open → assigned → in_progress → completed/cancelled
- Urgent priority support and deadline management
- Indexed by status, client, handyman, category, and location

**jobProposals**
- Handyman proposals for jobs
- Price negotiation with estimated duration
- Status tracking: pending → accepted/rejected/withdrawn
- Message support for proposal details

**reviews**
- Bidirectional rating system (client ↔ handyman)
- 1-5 star rating with optional comments
- Linked to specific jobs for context
- Separate review types for each direction

#### Supporting Tables

**userDocuments**
- Document verification system
- Support for multiple document types: profile photos, IDs, certifications, business licenses
- Verification workflow with status tracking
- File storage integration with metadata

**notifications**
- Real-time notification system
- Multiple notification types: job matches, proposals, assignments, messages
- Read/unread status tracking
- Custom data payload support

**messages & conversations**
- Real-time messaging system
- Support for text, image, file, and system messages
- Conversation management with participant tracking
- Job-linked conversations for context

**favorites**
- User favoriting system
- Support for favoriting both handymen and jobs
- Quick access to preferred providers/opportunities

**Payment System**
- **paymentMethods**: Multiple payment method support (cards, bank accounts, digital wallets)
- **payments**: Complete transaction tracking with gateway integration
- Status management: pending → processing → completed/failed/refunded

**Support System**
- **helpArticles**: Knowledge base with categorization and tagging
- **supportTickets**: Customer support with priority levels and assignment

### API Functions

#### User Management (convex/users.ts)
- `createUser`: Create new user accounts with role assignment
- `getUser`: Retrieve user by ID
- `getUserByEmail`: Email-based user lookup

#### Job Management (convex/jobs.ts)
- `createJob`: Create new job postings with location and budget
- `getJobs`: Query jobs with filtering by status, category, and limits
- `getJob`: Retrieve specific job details

#### Additional Modules
- `convex/auth.ts`: Authentication and authorization logic
- `convex/storage.ts`: File storage and management
- `convex/profiles.ts`: Extended profile management
- `convex/reviews.ts`: Review and rating system
- `convex/payments.ts`: Payment processing
- `convex/help.ts`: Support and help system

## Features Implemented

### 1. User Management
- Multi-role user system (handyman/client/business)
- Profile management with location and skills
- Document verification workflow
- Rating and reputation system

### 2. Job Marketplace
- Job posting with detailed requirements
- Location-based job discovery
- Budget range specification
- Urgent job prioritization
- Category-based organization

### 3. Proposal System
- Handyman bidding on jobs
- Price negotiation capabilities
- Proposal status management
- Message integration for communication

### 4. Real-time Communication
- Socket.io integration for live chat
- In-app messaging system
- Notification system for important events
- Job-linked conversations

### 5. Payment Processing
- Multiple payment method support
- Secure transaction processing
- Payment status tracking
- Refund capability

### 6. Review & Rating
- Bidirectional rating system
- Job-specific reviews
- Reputation building for quality assurance

### 7. Document Verification
- Identity verification workflow
- Professional certification uploads
- Business license verification
- Insurance documentation

### 8. Support System
- Help article knowledge base
- Customer support ticketing
- Priority-based support routing

## Database Indexes
Comprehensive indexing strategy for performance:
- User lookups by email, role, verification status
- Job queries by status, location, category, participants
- Message retrieval by conversation and participants
- Review queries by user relationships
- Payment tracking by job and participants

## Security Features
- Strong typing with Convex schema validation
- Role-based access control
- Secure file storage with metadata
- Transaction integrity for payments
- Document verification workflow

## Deployment
- Production deployment key configured
- Environment: `prod:terrific-starling-996`
- Convex CLI integration for data management
- Real-time sync capabilities

## Current Status
✅ **Completed Features:**
- Complete database schema design
- User and job management APIs
- Authentication system
- File storage integration
- Payment system foundation
- Support system structure

🔄 **In Development:**
- Advanced search and filtering
- Real-time notification delivery
- Payment gateway integration
- Advanced verification workflows

This backend provides a solid foundation for a comprehensive handyman marketplace with real-time capabilities, secure transactions, and scalable architecture.