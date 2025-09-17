# Application Refactor TODO List

This document outlines the steps to refactor the application to use a standardized layout, centralized services, and role-based rendering.

## Phase 1: Project Structure & Foundation

- [x] Create a `src/services` directory to house all API-related logic.
- [x] Create a `src/context` directory for React context providers (e.g., AuthContext).
- [x] Create a `src/layouts` directory for the main application layout component.
- [x] Create a `src/hooks` directory for custom React hooks.
- [x] Create a `src/views` or `src/pages` directory to distinguish between reusable `components` and full-page views.
- [x] Set up app-wide theming for React Bootstrap. Define primary, secondary, and accent colors by overriding Bootstrap's root CSS variables in `index.css`.

## Phase 2: Authentication & Role Management

- [x] Create `src/context/AuthContext.tsx`. This context will provide user information, including the user's role (`ADMIN`, `TEACHER`, `PARENT`), authentication status, and login/logout functions.
- [x] Create a `useAuth` hook in `src/hooks/useAuth.tsx` for easy access to the `AuthContext`.
- [x] Wrap the main application in `App.tsx` with the `AuthProvider`.

## Phase 3: UI Unification & Layout

- [x] Create a `src/layouts/MainLayout.tsx` component. This component will feature the `Sidebar` and a main content area that renders child routes (using `react-router-dom`'s `<Outlet />`).
- [x] Refactor `src/components/Sidebar.tsx`. It should no longer have hardcoded navigation links. Instead, it should accept an array of navigation items as a prop.
- [x] In `MainLayout.tsx`, use the `useAuth` hook to get the user's role and generate the appropriate navigation items to pass to the `Sidebar`.
- [x] Update `App.tsx` routing to use the `MainLayout` for all authenticated routes.

## Phase 4: Centralize API Logic into Services

- [x] Create `src/services/api.ts` to configure a base Axios instance or a fetch wrapper with base URL, headers, and error handling.
- [x] Identify all `fetch` or other API calls currently in components (`Calendar.tsx`, `Fees.tsx`, etc.).
- [x] Create dedicated service files for each data model, e.g., `src/services/calendarService.ts`, `src/services/feeService.ts`, `src/services/userService.ts`.
- [x] Move the API call logic into functions within these service files (e.g., `getCalendarEvents()`, `getUserProfile()`).
- [ ] Optional but recommended: Create custom hooks like `useFetchCalendarEvents` in the `src/hooks` directory to encapsulate the data-fetching lifecycle (loading, error, data) for components.

## Phase 5: Refactor Dashboards and Pages

- [x] Create a new `src/pages/Dashboard.tsx` page.
- [x] Inside `Dashboard.tsx`, use the `useAuth` hook to get the user's role.
- [x] Conditionally render different UI components or "widgets" based on the role.
- [x] Move the specific logic from `AdminDashboard.tsx`, `ParentDashboard.tsx`, and `TeacherDashboard.tsx` into smaller, role-specific components (`AdminWidgets`, etc.).
- [ ] Refactor all other pages (`Profile.tsx`, `Calendar.tsx`, etc.) to use the `MainLayout` and fetch data from the newly created services.

## Phase 6: Cleanup

- [x] Delete the old dashboard components: `AdminDashboard.tsx`, `ParentDashboard.tsx`, `TeacherDashboard.tsx`.
- [x] Delete any associated CSS that is no longer needed, like `ParentDashboard.css`.
- [ ] Review all refactored components and remove any unused imports or variables.
- [ ] Run `eslint` and `tsc` to ensure the codebase is clean and type-safe.