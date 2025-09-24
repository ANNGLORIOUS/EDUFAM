# Testing User-Specific Notifications

## How to Test:

1. **Open http://localhost:5175**
2. **Open browser DevTools (F12) → Console tab**

### Test Scenario 1: Teacher marks notification as read

1. **Go to Teacher Dashboard**: `/teacher`
   - Look at console logs to see:
     - "useCurrentUser - Current path: /teacher"
     - "Navbar - Current user: {type: 'teacher', email: 'teacher@example.com', ...}"
     - "NotificationsPopup - Props: {...userType: 'teacher'...}"

2. **Click notification bell and mark one as read**
   - Console should show:
     - "NotificationsContext - Dismissing notification: {id: X, userType: 'teacher', ...}"
     - "NotificationsContext - Updated dismissed: [X]"

3. **Check localStorage**:
   - Open DevTools → Application → Local Storage
   - Should see key: `edufam_dismissed_notifications_teacher_teacher@example.com`

### Test Scenario 2: Check other dashboards

4. **Go to Parent Dashboard**: `/parent`
   - Same notification should still be visible
   - Console shows: "userType: 'parent'"
   - Different localStorage key: `edufam_dismissed_notifications_parent_parent@example.com`

5. **Go to Admin Dashboard**: `/admin`  
   - Same notification should still be visible
   - Console shows: "userType: 'admin'"
   - Different localStorage key: `edufam_dismissed_notifications_admin_admin@example.com`

## Expected localStorage Keys:

```
edufam_dismissed_notifications_teacher_teacher@example.com: [1, 3]
edufam_dismissed_notifications_parent_parent@example.com: [2]
edufam_dismissed_notifications_admin_admin@example.com: [4, 5]
```

## Clear All Notifications (for testing):

Run in browser console:
```javascript
// Clear all notification dismissals
Object.keys(localStorage)
  .filter(key => key.startsWith('edufam_dismissed_notifications_'))
  .forEach(key => localStorage.removeItem(key));

// Also clear events to reload fresh data
localStorage.removeItem('edufam_events');

// Refresh page
location.reload();
```

## Debug Console Commands:

```javascript
// Check current user type detection
console.log('Current path:', window.location.pathname);

// Check all localStorage notification keys
Object.keys(localStorage)
  .filter(key => key.startsWith('edufam_dismissed_notifications_'))
  .forEach(key => console.log(key + ':', localStorage.getItem(key)));

// Check events
console.log('Events:', localStorage.getItem('edufam_events'));
```
