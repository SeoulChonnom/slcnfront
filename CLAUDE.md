# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `npm install`
- **Development server**: `npm run serve` (starts hot-reload dev server)
- **Build for production**: `npm run build` (outputs to `docs/` directory)
- **Lint code**: `npm run lint` (ESLint with Vue 3 rules)

## Project Architecture

This is a Vue 3 frontend application for "Seoul CHONNOM" - a travel and shoe recommendation platform.

### Tech Stack
- **Framework**: Vue 3 with Composition API
- **State Management**: Pinia stores with session persistence
- **Routing**: Vue Router 4 with authentication guards
- **UI Components**: TOAST UI Calendar for calendar functionality
- **HTTP Client**: Axios with token-based authentication
- **Build Tool**: Vue CLI 5

### Key Architecture Patterns

#### Authentication Flow
- Token-based auth with refresh token support in `src/store/useUserStore.js`
- Route guards check authentication and role-based permissions in `src/router/index.js`
- All API requests include `X-AUTH-TOKEN` header via stores

#### State Management
- **useUserStore**: Handles login, token management, user info persistence
- **useTripStore**: Manages trip data with caching logic for trip info by date

#### API Integration
- Centralized API configuration in `src/config/index.js`
- API base URL from `VUE_APP_API_URL` environment variable
- Structured endpoints for user, trip, and schedule operations
- Dedicated service layer in `src/service/` for schedule operations

#### Component Structure
- **Views**: Page-level components in `src/views/`
- **Components**: Reusable components organized by feature in `src/components/`
- **Utils**: Date and string utilities in `src/utils/`

### Key Features
- **Calendar**: Schedule management with TOAST UI Calendar
- **Trip Planning**: Trip registration with file uploads (logo, maps)
- **Shoe Recommendations**: Brand-based shoe catalog and reviews
- **Map Integration**: Location-based trip planning

### Build Configuration
- Custom output directory: `docs/` (configured in `vue.config.js`)
- Docker multi-stage build with nginx serving
- Path aliases: `@/*` maps to `src/*`

### Environment Variables
- `VUE_APP_API_URL`: Backend API base URL (required for all API calls)