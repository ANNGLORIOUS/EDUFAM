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

---

# Django Backend Implementation Notes

## 🔍 Current State Analysis

The frontend currently uses:
- **LocalStorage** for all data persistence
- **Mock/dummy data** throughout all components
- **Service layer** already prepared for API integration (`api.ts`, `feeService.ts`, `userService.ts`, `calendarService.ts`)

## 📊 Required Django Models & Data Types

### 1. User Management System

```python
# User model (extend Django's User)
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=[
        ('ADMIN', 'Administrator'),
        ('TEACHER', 'Teacher'), 
        ('PARENT', 'Parent'),
        ('STUDENT', 'Student')
    ])
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    admission_number = models.CharField(max_length=20, unique=True)
    student_class = models.ForeignKey('Class', on_delete=models.CASCADE)
    parent = models.ForeignKey('Parent', on_delete=models.CASCADE, related_name='children')
    date_of_birth = models.DateField()
    
class Parent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # children relationship through Student model
    
class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    subjects = models.ManyToManyField('Subject')
    classes = models.ManyToManyField('Class')
```

### 2. Academic Structure

```python
class Class(models.Model):
    name = models.CharField(max_length=50)  # "5 Ivory", "6 Pearl"
    level = models.IntegerField()  # 1-8
    stream = models.CharField(max_length=20)  # "Ivory", "Pearl"
    
class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
```

### 3. Fee Management System

```python
class FeeStructure(models.Model):
    class_level = models.ForeignKey(Class, on_delete=models.CASCADE)
    fee_type = models.CharField(max_length=50)  # "Tuition", "Activity", etc.
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    term = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=10)
    
class FeeAccount(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
        ('OVERDUE', 'Overdue')
    ])
    
class Payment(models.Model):
    fee_account = models.ForeignKey(FeeAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50)  # "Bank Transfer", "Credit Card", etc.
    reference_number = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='COMPLETED')
```

### 4. Communication System

```python
class Feedback(models.Model):
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    concern_type = models.CharField(max_length=50, choices=[
        ('academic', 'Academic Concern'),
        ('behavioral', 'Behavioral Issue'),
        ('health', 'Health Issue'),
        ('general', 'General Inquiry'),
        ('complaint', 'Complaint')
    ])
    message = models.TextField()
    request_callback = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    
class BulkSMS(models.Model):
    message = models.TextField()
    recipient_type = models.CharField(max_length=20, choices=[
        ('all-parents', 'All Parents'),
        ('class-parents', 'Class Parents'),
        ('overdue-parents', 'Overdue Parents'),
        ('teachers', 'Teachers'),
        ('custom', 'Custom')
    ])
    recipient_filter = models.CharField(max_length=100, blank=True)
    recipient_count = models.IntegerField()
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed')
    ])
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_count = models.IntegerField(default=0)
    delivered_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
```

### 5. Academic Records

```python
class AttendanceRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late')
    ])
    week_number = models.IntegerField()
    term = models.CharField(max_length=20)
    
class ExamResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_type = models.CharField(max_length=50)  # "CAT 1", "End Term", etc.
    score = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2)
    term = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=10)
```

### 6. Events & Calendar

```python
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    event_type = models.CharField(max_length=50)  # "meeting", "holiday", etc.
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='events/', blank=True)
```

## 🚀 Required API Endpoints

### Authentication & User Management
```
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/register/
GET    /api/users/profile/
PUT    /api/users/profile/
GET    /api/users/
POST   /api/users/
PUT    /api/users/{id}/
DELETE /api/users/{id}/
GET    /api/users/pending/
POST   /api/users/{id}/approve/
POST   /api/users/{id}/reject/
```

### Student Management
```
GET    /api/students/
POST   /api/students/
GET    /api/students/{id}/
PUT    /api/students/{id}/
DELETE /api/students/{id}/
GET    /api/students/{id}/fees/
GET    /api/students/{id}/attendance/
GET    /api/students/{id}/results/
```

### Fee Management
```
GET    /api/fees/
GET    /api/fees/overview/
GET    /api/fees/records/
GET    /api/fees/overdue/
POST   /api/fees/payment/
GET    /api/fees/student/{student_id}/
POST   /api/fees/reminders/send/
POST   /api/fees/reminders/bulk/
GET    /api/fees/export/
```

### Communication
```
GET    /api/feedback/
POST   /api/feedback/
PUT    /api/feedback/{id}/
DELETE /api/feedback/{id}/

GET    /api/sms/
POST   /api/sms/
PUT    /api/sms/{id}/
DELETE /api/sms/{id}/
POST   /api/sms/{id}/approve/
POST   /api/sms/{id}/publish/
POST   /api/sms/{id}/confirm/
GET    /api/sms/stats/
```

### Academic Management
```
GET    /api/attendance/
POST   /api/attendance/
PUT    /api/attendance/{id}/
GET    /api/attendance/class/{class_id}/
GET    /api/attendance/student/{student_id}/

GET    /api/results/
POST   /api/results/upload/
GET    /api/results/class/{class_id}/
GET    /api/results/student/{student_id}/
```

### Events & Calendar
```
GET    /api/calendar/events/
POST   /api/calendar/events/
PUT    /api/calendar/events/{id}/
DELETE /api/calendar/events/{id}/
```

### Reports & Analytics
```
GET    /api/reports/overview/
GET    /api/reports/fees/
GET    /api/reports/attendance/
GET    /api/reports/academic/
GET    /api/reports/users/
POST   /api/reports/export/
```

### Settings & Configuration
```
GET    /api/settings/
PUT    /api/settings/
GET    /api/settings/classes/
POST   /api/settings/classes/
GET    /api/settings/subjects/
POST   /api/settings/subjects/
```

## 🏗️ Django Project Structure Recommendation

```
Backend/EdTech/
├── core/                    # Main app
├── users/                   # User management app
├── academics/               # Classes, subjects, results
├── fees/                    # Fee management
├── communication/           # SMS, feedback
├── attendance/              # Attendance tracking
├── events/                  # Calendar events
├── reports/                 # Analytics & reporting
└── settings/               # System configuration
```

## 📋 Priority Implementation Order

1. **Authentication & User Management** (Critical)
2. **Student & Parent Management** (Critical)
3. **Fee Management System** (High)
4. **Communication (Feedback)** (High)
5. **Attendance Management** (Medium)
6. **Events & Calendar** (Medium)
7. **Results Management** (Medium)
8. **SMS Management** (Low)
9. **Reports & Analytics** (Low)

## 🔧 Technical Considerations

- **Authentication**: Use Django REST Framework with JWT tokens
- **File Uploads**: Handle result files, event images
- **Permissions**: Role-based access control (Admin, Teacher, Parent)
- **API Documentation**: Use DRF swagger/OpenAPI
- **Data Validation**: Comprehensive serializers
- **CORS**: Configure for React frontend
- **Database**: PostgreSQL recommended for production

## 📝 Data Migration Notes

### Current LocalStorage Data Structures:
- `edufam_users`: User data with types (teacher, student, parent)
- `edufam_feedbacks`: Parent feedback submissions
- `edufam_sms`: Bulk SMS management data
- Mock payment history in ParentView
- Mock fee records in AccountsView
- Mock attendance data in various components

### Migration Strategy:
1. Create Django models matching current data structures
2. Build admin interface for initial data entry
3. Create data import scripts for bulk user creation
4. Update frontend services to use API endpoints
5. Remove localStorage dependencies progressively
6. Implement proper authentication flow