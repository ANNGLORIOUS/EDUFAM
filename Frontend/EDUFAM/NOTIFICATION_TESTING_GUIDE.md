# User-Specific Notification Testing Guide

## Overview
The notification system has been updated to support user-specific notification management. Each user type (teacher, parent, admin) can now independently mark notifications as read without affecting other user types.

## How It Works

### Storage Structure
- **Old System**: Single localStorage key `edufam_dismissed_notifications` for all users
- **New System**: Separate localStorage keys per user type and email:
  - `edufam_dismissed_notifications_teacher_teacheremail@example.com`
  - `edufam_dismissed_notifications_parent_parentemail@example.com`  
  - `edufam_dismissed_notifications_admin_adminemail@example.com`

### Key Features
1. **Independent Read States**: When a teacher marks a notification as read, it only affects their view
2. **Shared Notification Source**: All users see the same events/notifications initially
3. **User-Specific Persistence**: Each user's read/dismissed state is stored separately

## Testing Steps

### Test 1: Independent Read States
1. **Open Teacher Dashboard** (http://localhost:5176/teacher)
   - Sign in as a teacher user
   - Note the notifications in the bell icon
   - Mark 1-2 notifications as read by clicking the checkmark button
   - Verify those notifications disappear from the teacher's bell

2. **Open Parent Dashboard** (http://localhost:5176/parent)  
   - Sign in as a parent user (or open in incognito/different browser)
   - Verify the same notifications are still visible in the parent's bell
   - The notifications marked as read by the teacher should still appear for the parent

3. **Open Admin Dashboard** (http://localhost:5176/admin)
   - Sign in as an admin user  
   - Verify the same notifications are still visible in the admin's bell
   - The notifications marked as read by the teacher should still appear for the admin

### Test 2: New Notifications Appear Everywhere
1. **Add a New Event** (if you have event creation functionality)
   - Go to teacher dashboard → Add Events
   - Create a new upcoming event
   - The new event should appear as a notification on all dashboards

2. **Check All Dashboards**
   - Teacher: New notification appears
   - Parent: New notification appears  
   - Admin: New notification appears

### Test 3: Cross-User Independence
1. **Parent marks notification as read**
   - Go to parent dashboard
   - Mark a notification as read
   - Verify it disappears from parent's bell

2. **Check other users**
   - Teacher: Same notification should still be visible
   - Admin: Same notification should still be visible

## Technical Implementation

### Components Modified
1. **NotificationsContext.tsx**: New context for user-specific notification management
2. **NotificationsPopup.tsx**: Updated to use user-specific storage
3. **Navbar.tsx**: Updated to pass user type and email to NotificationsPopup
4. **App.tsx**: Added NotificationsProvider wrapper
5. **useCurrentUser.ts**: New hook to detect current user type from localStorage

### Storage Keys Used
```typescript
// Example storage keys for different user types:
"edufam_dismissed_notifications_teacher_mr.smith@email.com"
"edufam_dismissed_notifications_parent_janedoe.parent@email.com"  
"edufam_dismissed_notifications_admin_admin@school.com"
```

## Expected Behavior

✅ **Correct Behavior:**
- Teacher marks notification as read → Only disappears from teacher dashboard
- Parent marks notification as read → Only disappears from parent dashboard  
- Admin marks notification as read → Only disappears from admin dashboard
- New events appear on all dashboards initially
- Each user can independently manage their notifications

❌ **Previous Behavior (Fixed):**
- Any user marks notification as read → Disappears from ALL dashboards
- Single shared storage for all users

## Debugging Tips

1. **Check localStorage in browser DevTools:**
   - Open Application tab → Local Storage → http://localhost:5176
   - Look for keys starting with `edufam_dismissed_notifications_`
   - Each user type should have separate keys

2. **Console Errors:**
   - Check browser console for any React context errors
   - Verify NotificationsProvider is properly wrapped in App.tsx

3. **User Type Detection:**
   - Ensure user data exists in `edufam_users` localStorage key
   - Verify useCurrentUser hook is returning correct user type

## Sample User Data
The app uses sample users from `users_seed_data.json`:
- Teacher: mr.smith@email.com, ms.johnson@email.com
- Parent: janedoe.parent@email.com, johndoe.parent@email.com
- Admin: Check localStorage for admin users

## URL for Testing
- Local server: http://localhost:5176/
- Teacher Dashboard: http://localhost:5176/teacher
- Parent Dashboard: http://localhost:5176/parent  
- Admin Dashboard: http://localhost:5176/admin
