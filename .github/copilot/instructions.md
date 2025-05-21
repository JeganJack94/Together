# Copilot Instructions for Trip Planner & Expense Tracker

## Project Overview

This is a mobile-first React application for trip planning and expense tracking. The app uses TypeScript, Tailwind CSS for styling, and Font Awesome for icons.

## Key Components & Features

### Navigation

- Tab-based navigation with Home, Expenses, Add Trip, Reports, and Profile sections
- Consistent header with user info and notifications
- Bottom tab bar with active state indicators

### Data Structure

- Trips (Active, Upcoming, History)
- Expenses (Categories, Recent transactions)
- User profile and settings

### UI Components

- Cards with rounded corners (rounded-xl)
- Gradient buttons (from-blue-500 to-indigo-600)
- Progress bars for budget tracking
- Shadow styling (shadow-sm, shadow-md)
- Icon integrations with Font Awesome

### Style Guidelines

- Color Scheme:
  - Primary: Blue (blue-600)
  - Secondary: Indigo (indigo-600)
  - Background: Gray (gray-50)
  - Cards: White
- Typography:
  - Headings: font-semibold, text-lg
  - Body: text-sm
  - Metadata: text-xs, text-gray-500

## File Organization

- /src/components/: Reusable UI components
- /src/pages/: Main page components
- /src/data/: Data management
- /src/assets/: Images and static resources

## Best Practices

1. Use TypeScript interfaces for type definitions
2. Implement responsive design with Tailwind classes
3. Maintain consistent spacing with Tailwind's spacing scale
4. Use semantic HTML elements
5. Follow React best practices for state management

## Special Instructions

1, App should be PWA installable (Vite-Plugin-PWA)
2, Always refer Doc for code - Trip-Planner-&-Expense-Tracker.tsx
3, Backend use Firebase for auth and DB.
4, Mobile first UI/UX

## Requirement Docs:

1. Bottom Navigation Structure

The app features a modern, floating bottom navigation bar with 5 key sections:

Home (Trip Overview)
Expenses
Add Trip/Expense
Reports
ProfileEach tab has a clean icon with a subtle animation on selection. 2. Home Screen Layout

Top section contains a greeting and profile picture
Search bar with filter options
Active Trips horizontal scrollable cards showing:
Trip name, date range
Total budget vs spent amount
Progress bar for budget utilization
Number of members
Upcoming Trips section below
Trip History section at the bottom
AI Trip Planner chat button (floating action button) 3. Expense Management Features

Add expense button with quick-add functionality
Expense categorization with colorful icons
Split expense options:
Equal split
Custom split
Percentage based
Real-time budget tracking
Category-wise expense breakdown
Receipt scanner integration
Currency converter 4. Reports & Analytics

Visual charts and graphs showing:
Spending patterns
Category-wise breakdown
Budget vs actual comparison
Monthly/trip-wise comparison
Export report functionality
Spending insights and recommendations 5. Trip Planning & Management

AI chat interface for trip planning
Trip creation form with:
Date selection
Budget allocation
Member addition
Category budget setting
Trip status toggles (Active/History)
Share trip details functionality
Trip completion checklist 6. Visual Elements

Modern gradient color scheme
Rounded corners for cards and buttons
Shadow effects for depth
Animated transitions
Clear typography hierarchy
Interactive graphs and charts
Status indicators using colors
Progress circles and bars 7. Additional Features

Offline functionality
Multi-currency support
Push notifications for budget alerts
Cloud sync for data backup
Member expense sharing
Quick actions through floating buttons
Dark mode support
