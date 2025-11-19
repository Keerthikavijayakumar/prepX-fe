# TalentFlow Frontend Architecture

This project follows a modular monolith (modulith) architecture to maintain clear separation between different functional domains.

## Directory Structure

```
src/
├── app/                  # Next.js app router pages (thin wrappers)
│   ├── candidate/        # Candidate-specific routes
│   ├── recruiter/        # Recruiter-specific routes
│   └── ...
├── components/           # Shared UI components (shadcn/ui)
│   └── ui/               # Base UI components
├── modules/              # Core business modules
│   ├── candidate/        # Candidate module
│   │   ├── components/   # Candidate-specific components
│   │   └── pages/        # Candidate page components
│   ├── recruiter/        # Recruiter module
│   │   ├── components/   # Recruiter-specific components
│   │   └── pages/        # Recruiter page components
│   └── home/             # Home/landing page module
│       └── components/   # Home page components
├── shared/               # Shared utilities and components
│   ├── components/       # Shared business components
│   └── layouts/          # Shared layout components
└── lib/                  # Utility functions and helpers
```

## Module Structure

Each module is self-contained and has its own:
- Components
- Pages
- Domain logic

## Module Boundaries

Modules should respect the following boundaries:

1. **Candidate Module**: Everything related to candidate users, including:
   - Profile management
   - Job search and applications
   - Resume/CV management
   - Application tracking

2. **Recruiter Module**: Everything related to recruiter users, including:
   - Company profile management
   - Job posting and management
   - Candidate search and filtering
   - Interview scheduling

3. **Home Module**: Landing page and shared authentication flows

## Cross-Module Communication

Modules should not directly import from each other. Instead:
- Use the app router for navigation between modules
- Share data through APIs or state management
- Use shared components from the `shared/` directory for common functionality

## UI Component Hierarchy

1. **Base UI Components**: Located in `components/ui/`, these are the primitive UI components from shadcn/ui
2. **Shared Business Components**: Located in `shared/components/`, these are business-specific shared components
3. **Module-specific Components**: Located in each module's `components/` directory
