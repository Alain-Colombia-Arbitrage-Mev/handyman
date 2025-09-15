# Frontend Documentation - Handyman Auction Mobile App

## Overview
A cross-platform mobile application built with **Expo** and **React Native**, featuring real-time communication, location services, and a comprehensive handyman marketplace interface.

## Architecture

### Technology Stack
- **Framework**: Expo ~51.0.28 with Expo Router
- **Runtime**: React Native 0.74.5
- **Navigation**: Expo Router with file-based routing
- **State Management**: React Hooks + Convex real-time subscriptions
- **UI Framework**: Custom components + Expo Vector Icons
- **Animation**: Framer Motion, Moti, React Native Reanimated
- **Real-time**: Socket.io Client + Convex real-time
- **Forms**: React Hook Form
- **Styling**: StyleSheet API with custom theming

### Project Structure

```
app/                          # Expo Router pages
├── _layout.tsx              # Root layout with providers
├── (tabs)/                  # Tab-based navigation
│   ├── _layout.tsx         # Tab layout configuration
│   ├── index.tsx           # Home tab
│   ├── radar.tsx           # Jobs radar view
│   ├── post.tsx            # Job posting
│   ├── messages.tsx        # Real-time messaging
│   └── profile.tsx         # User profile
├── profile/                 # Profile subpages
│   ├── edit.tsx            # Profile editing
│   └── verification.tsx    # Document verification
└── index.tsx               # App entry point

src/                         # Source code
├── components/             # Reusable UI components
├── providers/              # Context providers
├── services/               # API and external services
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript definitions
└── utils/                  # Helper utilities
```

## Key Features Implemented

### 1. Navigation & Layout
**Expo Router Implementation** (app/_layout.tsx)
- File-based routing system
- Provider hierarchy: ConvexProvider → LanguageProvider → SafeAreaProvider
- Global gesture handling and status bar configuration
- Screen options for headerless navigation

**Tab Navigation** (app/(tabs)/_layout.tsx)
- 5-tab bottom navigation: Home, Radar, Post, Messages, Profile
- Custom publishing button with modal options
- Multi-language tab titles
- Custom styling with brand colors (#21ABF6)

### 2. Real-time Communication
**Socket.io Integration** (src/services/socketService.ts)
- Complete real-time messaging infrastructure
- Features implemented:
  - Connection management with user authentication
  - Conversation joining/leaving
  - Message sending/receiving (text, image, location)
  - Typing indicators
  - Read receipts
  - Online/offline status tracking
  - Message history and persistence

**Message Types Supported:**
- Text messages
- Image attachments
- Location sharing
- System notifications

### 3. Backend Integration
**Convex Integration** (src/providers/ConvexProvider.tsx)
- Real-time database client setup
- Production environment: `terrific-starling-996.convex.cloud`
- Reactive data subscriptions
- Optimistic updates

**Custom Hooks:**
- `useConvex`: Convex operations wrapper
- `useSocket`: Real-time messaging
- `useGeolocation`: Location services
- `useNotifications`: Push notifications
- `useLanguage`: Internationalization

### 4. Internationalization
**Multi-language Support** (src/providers/LanguageProvider.tsx)
- Spanish/English language switching
- Context-based translation system
- Dynamic language selection
- Localized UI components

### 5. Location Services
**Geolocation Integration** (src/hooks/useGeolocation.ts)
- Device GPS access
- Address geocoding
- Location-based job matching
- Map integration support

### 6. UI Component System
**Custom Component Library** (src/components/)
- 40+ custom UI components including:
  - Form components (Input, Button, Select)
  - Layout components (Card, Modal, Tabs)
  - Data display (Avatar, Badge, Progress)
  - Navigation components (Breadcrumb, Pagination)
  - Feedback components (Alert, Toast, Skeleton)

**Brand Theming:**
- Primary color: #21ABF6 (Parkiing Blue)
- Consistent design language
- Responsive layouts
- Accessibility support

### 7. User Interface Screens

**Home Tab** (app/(tabs)/index.tsx)
- Job discovery interface
- Category-based browsing
- Featured handymen showcase
- Real-time job updates

**Radar Tab** (app/(tabs)/radar.tsx)
- Map-based job visualization
- Location-proximity filtering
- Real-time job notifications
- Interactive job markers

**Post Tab** (app/(tabs)/post.tsx)
- Job creation interface
- Multiple posting types:
  - Regular opportunities
  - Flash jobs (urgent)
  - Service offers
- Form validation and submission
- Image upload capabilities

**Messages Tab** (app/(tabs)/messages.tsx)
- Real-time chat interface
- Conversation list
- Message threading
- Typing indicators
- File sharing support

**Profile Tab** (app/(tabs)/profile.tsx)
- User profile management
- Settings and preferences
- Document verification access
- Rating and review display

### 8. Advanced Features

**Document Verification** (app/profile/verification.tsx)
- Identity document upload
- Professional certification management
- Verification status tracking
- Secure file handling

**Publishing Options Modal** (src/components/PublishOptionsModal.tsx)
- Multi-type job posting
- Service offering creation
- Quick publishing workflow

**Notification System** (src/components/NotificationCenter.tsx)
- Push notification handling
- In-app notification display
- Job match alerts
- Message notifications

## Development Features

### 1. TypeScript Integration
- Full type safety across components
- Custom type definitions for API responses
- Strict mode configuration
- Interface definitions for all major entities

### 2. Performance Optimizations
- React Native Reanimated for smooth animations
- Image optimization with Sharp
- Lazy loading for heavy components
- Efficient re-rendering with React.memo

### 3. Development Tools
- Expo Development Build support
- Hot reloading for rapid development
- TypeScript strict mode
- ESLint configuration

### 4. Build Configuration
**Android** (android/)
- Package: `com.parkiing.app`
- Adaptive icon support
- Build optimization

**iOS** (configured in app.json)
- Bundle ID: `com.parkiing.app`
- App Store Connect integration
- Tablet support

## Current Implementation Status

✅ **Completed Features:**
- Complete navigation system with Expo Router
- Real-time messaging infrastructure
- Convex backend integration
- Multi-language support
- Location services integration
- Custom UI component library
- Document verification system
- Job posting and discovery
- User profile management

🔄 **In Development:**
- Socket.io server deployment
- Advanced search filters
- Payment integration UI
- Push notification implementation
- Offline capability

⏳ **Planned Features:**
- Video call integration
- Advanced job matching algorithms
- Gamification elements
- Analytics dashboard

## Development Commands
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build
```

## Environment Configuration
- **Production Convex**: `https://terrific-starling-996.convex.cloud`
- **EAS Project ID**: `9d4febab-156f-418e-87df-e3ac718b6dc5`
- **Owner**: `guardcolombia`

## Dependencies Highlights
- **Core**: Expo, React Native, TypeScript
- **Navigation**: Expo Router, React Navigation
- **UI**: Lucide React Native, React Native SVG
- **Animation**: Framer Motion, Moti, Reanimated
- **Backend**: Convex, Socket.io Client
- **Forms**: React Hook Form
- **Utils**: Class Variance Authority, CLSX

This frontend provides a comprehensive mobile experience for the handyman marketplace, with real-time capabilities, professional UI/UX, and scalable architecture supporting both iOS and Android platforms.