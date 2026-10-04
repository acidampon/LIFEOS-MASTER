# LIFEOS

**LIFEOS** is a personal life operating system for managing daily focus, goals, missions, habits, growth, decisions, and personal progress in one place.

## Current foundation — v2.0.2

- Command Center dashboard with daily metrics
- Daily Focus with completion state and priority
- Goals with progress tracking
- Missions linked to goals
- Habits with daily completion protection and streaks
- Growth dashboard with measurable momentum and achievement milestones
- Decision Room with context, options, pros/cons, chosen option, next action, and status
- First-run onboarding for profile and life direction
- State validation and safer backup restoration
- Local-first persistence using browser storage
- JSON backup and restore
- Responsive mobile-first interface with mobile access to Profile and Life System
- PWA manifest and offline service-worker foundation
- Automated GitHub Actions QA
- GitHub Pages deployment workflow
- Planner calendar with dated events, times, notes, monthly navigation, daily agenda, and reminders

## Product architecture

LIFEOS is being built incrementally as a modular personal operating system. The GitHub repository is the canonical source of truth; deployment artifacts should always be produced from the repository rather than uploaded ZIP files.

### Planned systems

1. Personal profile and onboarding
2. Command Center
3. Daily Focus and planning
4. Goals, missions and milestones
5. Habits and routines
6. Growth, achievements and progress history
7. Decision Room
8. Life System and personal areas
9. Calendar, reminders, and notifications
10. Data validation, backup and restore
11. Accessibility, responsive QA and production hardening

## Development principles

- Mobile-first
- Local-first where appropriate
- Clear persisted data models
- No silent data loss
- Progressive enhancement
- Automated validation before deployment
- GitHub as the source of truth

## Version

2.0.2


## v1.4.0 planner release
- Adds a mobile-friendly monthly Planner calendar.
- Supports dated events, optional times, notes, daily agenda view, month navigation, and event deletion.
- Includes planner data in backup/restore.

## v1.3.1 maintenance
- Uses the device's local calendar date for daily focus and habit completion.
- Refreshes the PWA service-worker cache when the app version changes.
- Keeps filtered daily focus actions tied to their original records.

## v1.5.0 reminder release
- Adds optional reminders to Planner events.
- Android builds use Capacitor Local Notifications for scheduled notifications.
- Users can explicitly enable notification permission from the More section.
- Reminder schedules are restored from LIFEOS data and re-scheduled when the app starts.
