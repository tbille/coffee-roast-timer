# Coffee Roast Timer

A comprehensive coffee roasting monitoring and tracking application with multi-roaster support. Track temperature curves, crack events, and roast development for 12+ different coffee roasters.

## Features

### Multi-Roaster Support
Track roasts with any of 12 supported roasters, each with customized interfaces and guidance:

**Dual-Temperature Roasters:**
- Gene Cafe CBR-101
- Hottop KN-8828B-2K+
- Quest M3s
- Artisan 3-e
- Aillio Bullet R1 V2
- Kaffelogic Nano 7e
- Sandbox Smart R1
- Kaldi Home Roaster
- Fresh Roast SR800
- SR540

**Profile-Based Roasters:**
- Behmor 2000AB (P1-P5 profiles, extension tracking)

**Custom Roasters:**
- Add your own roaster specifications

### Core Features
- **Real-time Monitoring**: Track temperature, time, and development during roasting
- **Crack Event Tracking**: Record first and second crack times and temperatures
- **Roast Profiles**: Save and review detailed roast profiles
- **Temperature Conversion**: Switch between Celsius and Fahrenheit
- **Batch Capacity Warnings**: Roaster-specific capacity indicators
- **Development Statistics**: Calculate development time and ratios

### Community Features
- **Discover Profiles**: Browse roast profiles shared by other users
- **Profile Comparison**: Compare multiple roasts side-by-side
- **Like & Share**: Favorite profiles and share with the community
- **Cupping Notes**: Record tasting evaluations with SCA scoring

### Smart Features
- **Auto-Migration**: Existing profiles automatically upgraded to new roaster system
- **Smart Defaults**: Remembers your roaster preferences
- **Roaster Filtering**: Filter dashboard and discover by roaster type
- **Color-Coded Badges**: Visual identification of roaster types

## Technology Stack

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Recharts** - Temperature curve visualization

## Project Setup

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account and project

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd coffee-roast-timer

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Step 5: Run database migrations
# Apply migrations in supabase/migrations/ folder to your Supabase project

# Step 6: Start the development server
npm run dev
```

## Usage

### Starting a Roast

1. Navigate to the home page
2. Select your roaster from the dropdown (or let the app remember your preference)
3. Click "Start Roasting"
4. Monitor temperature and time in real-time
5. Record crack events as they occur
6. End the roast when complete

### Saving a Profile

1. After ending a roast, click "Save Roast"
2. Enter bean details (name, origin, farm, process)
3. Add initial/final weight for weight loss calculation
4. Add notes about the roast
5. Save to your dashboard

### Viewing & Managing Profiles

**Dashboard:**
- View all your saved profiles
- Filter by roaster type
- Compare multiple profiles
- Delete unwanted profiles

**Discover:**
- Browse community profiles
- Filter by roaster type
- Search by bean name, origin, or roaster
- Like profiles and use as reference

**Profile Details:**
- View temperature curves
- See crack events and development stats
- Edit notes and metadata
- Add cupping scores and tasting notes
- Share with community

## Architecture

### Component Structure

```
src/
├── components/
│   ├── roast/
│   │   ├── modes/           # Roaster-specific components
│   │   │   ├── GeneCBR101Mode.tsx
│   │   │   └── BehmortMode.tsx
│   │   ├── shared/          # Reusable roast components
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── CrackEventButtons.tsx
│   │   │   ├── DevelopmentStats.tsx
│   │   │   └── RoasterTips.tsx
│   │   └── behmor/          # Behmor-specific UI
│   │       ├── BehmortProfileDropdown.tsx
│   │       └── ExtensionTracker.tsx
│   ├── dashboard/           # Dashboard components
│   │   └── RoasterFilter.tsx
│   ├── RoastMonitor.tsx     # Main roast container
│   └── RoasterSwitcher.tsx  # Roaster selection
├── hooks/                   # Custom React hooks
│   ├── useRoasterPreferences.ts
│   ├── useRoasterMode.ts
│   └── useMigration.ts
├── lib/
│   └── migrations/          # Data migration logic
│       └── migrateToRoasterTypes.ts
├── types/                   # TypeScript type definitions
│   ├── roaster.types.ts
│   ├── roast-data.types.ts
│   └── roast.types.ts
└── utils/                   # Utility functions
    ├── roasterRegistry.ts
    ├── roasterDetection.ts
    ├── roasterValidation.ts
    └── roasterColors.ts
```

### Design Patterns

- **Container/Presentation**: Separates logic from UI
- **Factory Pattern**: Dynamic mode routing based on roaster
- **Strategy Pattern**: Different data structures per roaster mode
- **Repository Pattern**: Centralized roaster specifications
- **Lazy Loading**: Code-split mode components for performance

### Database Schema

**roast_profiles:**
- Core roast data and metadata
- `roaster_type`: Structured roaster identifier
- `roaster_data`: JSONB mode-specific data
- Backward compatible with legacy fields

**user_roaster_preferences:**
- Tracks user's roaster equipment
- Primary roaster selection
- RLS policies for user isolation

## Development

### Build Commands

```sh
# Development server with hot reload
npm run dev

# Generate sitemap (fetches profiles from Supabase)
npm run sitemap

# Production build (automatically generates sitemap before building)
npm run build

# Build includes prerendering for public marketing routes
# (via react-snap postbuild)

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Lint code
npm run lint
```

### Sitemap Generation

The project includes automatic sitemap generation that creates a static `sitemap.xml` file with all public routes and profile URLs:

- **Manual generation**: Run `npm run sitemap`
- **Automatic**: Runs automatically before every build via `prebuild` hook
- **Location**: Generated at `public/sitemap.xml` and copied to `dist/sitemap.xml`
- **Content**: Includes all static pages and dynamic profile URLs from Supabase

The script requires the following environment variables (already in `.env`):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase public key

If Supabase credentials are not available, the script gracefully falls back to generating a sitemap with static routes only.

### Code Quality

- **TypeScript**: 100% type coverage, no `any` types
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (if configured)
- **Type Guards**: Runtime type validation for discriminated unions

## Deployment

### Via Lovable

1. Open [Lovable Project](https://lovable.dev/projects/ca19079e-8524-4553-af99-ba4f827153e4)
2. Click Share → Publish
3. Your app will be deployed automatically

### Via Custom Hosting

```sh
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
# (Vercel, Netlify, Cloudflare Pages, etc.)
```

### Environment Variables

Required for production:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Optional SEO and analytics variables:
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GSC_SITE_VERIFICATION=google-site-verification-token
```

## Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the [custom domain setup guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Contributing

Contributions are welcome! Areas for contribution:

- **New Roaster Support**: Add specifications for additional roasters
- **UI Improvements**: Enhance user experience and design
- **Bug Fixes**: Report and fix issues
- **Documentation**: Improve docs and examples
- **Testing**: Add unit and integration tests

## Roadmap

### Future Enhancements
- [ ] Roaster images and photos
- [ ] Advanced analytics and insights
- [ ] Export profiles to PDF/CSV
- [ ] Mobile app (React Native)
- [ ] Bluetooth thermometer integration
- [ ] Roast planning and scheduling
- [ ] Community forums
- [ ] Roaster marketplace

## License

[Add your license here]

## Support

For questions, issues, or feedback:
- Open an issue on GitHub
- Contact via [your contact method]

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- Icons by [Lucide](https://lucide.dev)
- UI components by [shadcn/ui](https://ui.shadcn.com)

---

**Project URL**: https://lovable.dev/projects/ca19079e-8524-4553-af99-ba4f827153e4

**Version**: 2.0.0  
**Last Updated**: February 15, 2026
