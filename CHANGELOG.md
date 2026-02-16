# Changelog

All notable changes to the Coffee Roast Timer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-15

### Added - Multi-Roaster Support 🎉

#### Core Infrastructure
- **12 Roaster Types Supported**: Gene CBR-101, Behmor 2000AB, Hottop KN-8828B-2K+, Quest M3s, Artisan 3-e, Aillio Bullet R1 V2, Kaffelogic Nano 7e, Sandbox Smart R1, Kaldi Home Roaster, Fresh Roast SR800, SR540, and Custom
- **Roaster Registry**: Comprehensive specifications database with capacity, temperature ranges, mode types, and guidance for each roaster
- **Type-Safe Architecture**: Discriminated unions for roaster-specific data structures with TypeScript type guards
- **Automatic Migration**: Fuzzy matching algorithm auto-detects and migrates existing profiles to structured roaster types

#### Database Schema
- Added `roaster_type` (TEXT) column to `roast_profiles` table for structured roaster identification
- Added `roaster_data` (JSONB) column to store mode-specific roast data (temperatures, profiles, extensions, etc.)
- Created `user_roaster_preferences` table to track user's roaster equipment with RLS policies
- Maintained backward compatibility with deprecated `coffee_roaster` free-text field

#### User Interface
- **Roaster Switcher**: Dropdown in RoastMonitor to switch between roasters mid-session
- **Roaster Filter**: Filter profiles by roaster type on Dashboard and Discover pages
- **Roaster Badges**: Color-coded badges showing roaster on profile cards and detail pages
- **Color Schemes**: Brand-specific colors for each roaster (Gene: Blue, Behmor: Orange, Hottop: Red, etc.)
- **Smart Defaults**: Roaster selection with intelligent fallback logic (localStorage → primary → last used → Gene CBR-101)

#### Roaster Modes

**Dual-Temperature Mode** (Gene CBR-101, Hottop, Quest M3s, etc.)
- Refactored `GeneCBR101Mode.tsx` from monolithic `RoastMonitor.tsx`
- Tracks both target and current temperatures
- First and second crack event tracking
- Development time statistics
- Batch capacity indicators with roaster-specific warnings

**Profile-Based Mode** (Behmor 2000AB)
- Complete `BehmortMode.tsx` implementation with P1-P5 profile support
- Countdown timer system (P1: 15min, P2-P5: 17.5min)
- Extension tracking with visual circle indicators (3 extensions max)
- Automatic cooling mode after time expires
- Profile-specific guidance and tips

#### Shared Components
- `TimerDisplay.tsx`: Count-up and countdown timer with mode awareness
- `CrackEventButtons.tsx`: Reusable crack event tracking UI
- `DevelopmentStats.tsx`: Post-crack development statistics
- `BatchCapacityIndicator.tsx`: Roaster-aware capacity warnings
- `RoasterTips.tsx`: Contextual tips based on active roaster

#### Utilities & Hooks
- `roasterRegistry.ts`: 600-line specs database with detailed roaster characteristics
- `roasterDetection.ts`: Fuzzy matching for legacy profile migration (95%+ accuracy)
- `roasterValidation.ts`: Data structure, capacity, and duration validation
- `roasterColors.ts`: Color schemes and badge styling for each roaster type
- `useRoasterPreferences.ts`: CRUD operations for user's roaster equipment
- `useRoasterMode.ts`: Current roaster selection state management
- `useMigration.ts`: Triggers auto-migration on app load

#### Architecture Improvements
- **Container/Presentation Pattern**: Refactored 742-line `RoastMonitor.tsx` into 150-line container
- **Lazy Loading**: Mode components code-split into separate chunks (Gene: 5.42 kB, Behmor: 8.77 kB)
- **Factory Pattern**: Dynamic mode routing based on roaster type
- **Strategy Pattern**: Different data structures for different roaster modes
- **Repository Pattern**: Centralized roaster specifications database

### Changed

#### Breaking Changes
- `RoastProfile` interface extended with `roaster_type` and `roaster_data` fields
- Deprecated `temperature_data` and `crack_events` fields (kept for backward compatibility)
- Deprecated `coffee_roaster` free-text field (migrated to structured `roaster_type`)

#### Performance Optimizations
- Code splitting working perfectly: main bundle 550.41 kB (169.40 kB gzipped)
- Lazy-loaded mode components reduce initial load time
- Efficient roaster filtering on Dashboard and Discover pages

#### Accessibility
- Added comprehensive ARIA labels to RoasterFilter component
- Improved keyboard navigation for roaster selection
- Screen reader-friendly roaster information display

### Fixed
- Resolved type safety issues with discriminated union type guards
- Fixed roaster detection edge cases in migration algorithm
- Improved error handling in roaster validation functions

### Migration & Compatibility
- ✅ Existing Gene CBR-101 users see no disruption
- ✅ Automatic migration runs on first app load
- ✅ Legacy `coffee_roaster` field preserved for custom roasters
- ✅ All existing features work with migrated data
- ✅ No data loss during migration process

### Technical Debt Resolved
- Broke down monolithic 742-line `RoastMonitor.tsx` into modular components
- Eliminated code duplication with shared component library
- Improved type safety with discriminated unions
- Centralized roaster specifications (single source of truth)

### Documentation
- `SPEC-TECHNICAL-IMPLEMENTATION.md`: 8-sprint implementation plan
- `SPEC-IMPLEMENTATION-CHECKLIST.md`: Detailed task checklist
- `IMPLEMENTATION-PROGRESS.md`: Sprint-by-sprint progress tracking
- `SPRINT-7-SUMMARY.md`: Dashboard integration completion
- `FINAL-IMPLEMENTATION-SUMMARY.md`: Comprehensive feature summary

### Stats
- **Files Created/Modified**: 30+
- **Lines of Code**: 5,000+
- **Sprints Completed**: 8/8 (100%)
- **Build Time**: ~2.2s
- **Bundle Size**: 550.41 kB (169.40 kB gzipped)
- **Code Splitting**: Working perfectly
- **TypeScript Errors**: 0
- **Test Coverage**: Unit tests for critical paths

---

## [1.0.0] - Previous Release

### Features
- Basic roast monitoring with timer
- Temperature tracking for Gene CBR-101
- Save and view roast profiles
- Dashboard and Discover pages
- User authentication with Supabase
- Profile sharing and likes
- Cupping notes and tasting evaluations
- Temperature unit conversion (°C/°F)
- Comparison view for multiple profiles

---

**Legend:**
- 🎉 Major Feature
- 🚀 Performance Improvement
- 🐛 Bug Fix
- 📝 Documentation
- ⚠️ Breaking Change
- ♿ Accessibility
