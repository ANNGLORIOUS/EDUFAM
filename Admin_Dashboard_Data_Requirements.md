# Admin Dashboard Data Requirements

## Overview
This document outlines the data structures and API endpoints required by the frontend Admin Dashboard components. It serves as a guide for the backend team to implement the necessary data models and endpoints for comprehensive school management.

## Data Categories

### 1. User Management Data
**Purpose**: CRUD operations for managing students, teachers, and parents.

**Required Fields for User Entity**:
- `id`: Unique user identifier
- `type`: User type ("student", "teacher", "parent")
- `name`: Full name
- `email`: Email address (generated for students if not provided)
- `studentId`: Student ID (for students only)
- `class`: Class name (for students only)
- `subject`: Subject taught (for teachers only)
- `children`: Array of student IDs (for parents only)
- `status`: Account status ("pending", "approved", "rejected", "active", "inactive")
- `dateAdded`: Account creation date
- `dateModified`: Last modification date
- `createdBy`: Admin who created the account

**Sample Student**:
```json
{
  "id": 123,
  "type": "student",
  "name": "Jane Doe",
  "email": "jane.doe@school.edu",
  "studentId": "12A",
  "class": "Class 1",
  "status": "active",
  "dateAdded": "2025-01-15",
  "dateModified": "2025-09-18"
}
```

**Sample Teacher**:
```json
{
  "id": 456,
  "type": "teacher",
  "name": "John Smith",
  "email": "john.smith@school.edu",
  "subject": "Mathematics",
  "status": "active",
  "dateAdded": "2025-01-10",
  "dateModified": "2025-09-18"
}
```

**Sample Parent**:
```json
{
  "id": 789,
  "type": "parent",
  "name": "Mary Johnson",
  "email": "mary.johnson@email.com",
  "children": ["12A", "7B"],
  "status": "active",
  "dateAdded": "2025-01-20",
  "dateModified": "2025-09-18"
}
```

### 2. Fee and Financial Data
**Purpose**: Managing student fees, payments, and financial records.

**Required Fields for Fee Record**:
- `id`: Unique fee record identifier
- `studentId`: Associated student ID
- `studentName`: Student name
- `studentClass`: Student class
- `parentId`: Associated parent ID
- `parentName`: Parent name
- `term`: Academic term (e.g., "2025-term-1")
- `academicYear`: Academic year
- `totalFee`: Total fee amount for the term
- `paidAmount`: Amount paid so far
- `balance`: Outstanding balance
- `dueDate`: Payment due date
- `status`: Payment status ("paid", "pending", "overdue", "partial")
- `paymentHistory`: Array of payment transactions
- `feeStructure`: Breakdown of fee components
- `lastPaymentDate`: Date of last payment
- `remindersSent`: Number of payment reminders sent

**Sample Fee Record**:
```json
{
  "id": 1001,
  "studentId": "12A",
  "studentName": "Jane Doe",
  "studentClass": "Class 1",
  "parentId": 789,
  "parentName": "Mary Johnson",
  "term": "2025-term-3",
  "academicYear": "2025",
  "totalFee": 30000,
  "paidAmount": 20000,
  "balance": 10000,
  "dueDate": "2025-09-30",
  "status": "pending",
  "paymentHistory": [
    {
      "id": 5001,
      "amount": 15000,
      "date": "2025-01-15",
      "method": "M-Pesa",
      "reference": "REF123456",
      "receivedBy": "Admin User"
    },
    {
      "id": 5002,
      "amount": 5000,
      "date": "2025-06-15",
      "method": "Bank Transfer",
      "reference": "BT789012",
      "receivedBy": "Accounts Manager"
    }
  ],
  "feeStructure": {
    "tuition": 25000,
    "transport": 3000,
    "meals": 1500,
    "activities": 500
  },
  "lastPaymentDate": "2025-06-15",
  "remindersSent": 2
}
```

### 3. Academic Results Data
**Purpose**: Managing student academic performance and result uploads.

**Required Fields for Result Record**:
- `id`: Unique result identifier
- `studentId`: Student identifier
- `studentName`: Student name
- `studentClass`: Student class
- `term`: Academic term
- `academicYear`: Academic year
- `subject`: Subject name
- `grade`: Grade achieved
- `marks`: Numerical marks (optional)
- `maxMarks`: Maximum possible marks
- `percentage`: Percentage score
- `gradePoint`: GPA points
- `uploadedBy`: Teacher/admin who uploaded
- `uploadDate`: Date uploaded
- `fileName`: Result file name
- `fileUrl`: URL to downloadable result file
- `comments`: Teacher comments
- `status`: Result status ("draft", "published", "archived")

**Sample Result Record**:
```json
{
  "id": 2001,
  "studentId": "12A",
  "studentName": "Jane Doe",
  "studentClass": "Class 1",
  "term": "Term 1",
  "academicYear": "2025",
  "subject": "Mathematics",
  "grade": "A",
  "marks": 85,
  "maxMarks": 100,
  "percentage": 85,
  "gradePoint": 4.0,
  "uploadedBy": "John Smith",
  "uploadDate": "2025-04-15",
  "fileName": "JaneDoe_Maths_Term1.pdf",
  "fileUrl": "/api/results/download/2001",
  "comments": "Excellent performance in algebra",
  "status": "published"
}
```

### 4. Attendance Data
**Purpose**: Tracking student attendance records.

**Required Fields for Attendance Record**:
- `id`: Unique attendance identifier
- `studentId`: Student identifier
- `studentName`: Student name
- `studentClass`: Student class
- `date`: Attendance date
- `term`: Academic term
- `status`: Attendance status ("present", "absent", "late", "excused")
- `checkInTime`: Time student checked in (optional)
- `checkOutTime`: Time student checked out (optional)
- `recordedBy`: Teacher/admin who recorded
- `notes`: Additional notes
- `weeklySummary`: Weekly attendance aggregation

**Sample Attendance Record**:
```json
{
  "id": 3001,
  "studentId": "12A",
  "studentName": "Jane Doe",
  "studentClass": "Class 1",
  "date": "2025-09-18",
  "term": "Term 3",
  "status": "present",
  "checkInTime": "08:30:00",
  "checkOutTime": "15:30:00",
  "recordedBy": "Mary Johnson",
  "notes": ""
}
```

### 5. Communication/SMS Data
**Purpose**: Managing bulk SMS communications and notifications.

**Required Fields for SMS Campaign**:
- `id`: Unique SMS identifier
- `message`: SMS content
- `recipientType`: Type of recipients ("all-parents", "class-parents", "overdue-parents", "teachers", "custom")
- `recipientFilter`: Filter criteria (class name, custom criteria)
- `recipientCount`: Number of recipients
- `status`: SMS status ("draft", "approved", "published", "confirmed", "failed")
- `createdBy`: Admin who created
- `createdAt`: Creation timestamp
- `approvedBy`: Admin who approved (optional)
- `approvedAt`: Approval timestamp (optional)
- `publishedAt`: Publication timestamp (optional)
- `confirmedAt`: Confirmation timestamp (optional)
- `deliveryStats`: Delivery statistics
- `cost`: SMS cost (optional)

**Sample SMS Campaign**:
```json
{
  "id": 4001,
  "message": "Important: School will be closed tomorrow due to national holiday. Classes resume Monday.",
  "recipientType": "all-parents",
  "recipientFilter": "",
  "recipientCount": 150,
  "status": "confirmed",
  "createdBy": "Admin User",
  "createdAt": "2025-09-17T10:00:00Z",
  "approvedBy": "Principal",
  "approvedAt": "2025-09-17T10:30:00Z",
  "publishedAt": "2025-09-17T11:00:00Z",
  "confirmedAt": "2025-09-17T11:05:00Z",
  "deliveryStats": {
    "sent": 150,
    "delivered": 148,
    "failed": 2,
    "pending": 0
  },
  "cost": 2250
}
```

### 6. Feedback and Communication Data
**Purpose**: Managing parent-teacher feedback and communication.

**Required Fields for Feedback**:
- `id`: Unique feedback identifier
- `parentId`: Parent identifier
- `parentName`: Parent name
- `parentEmail`: Parent email
- `studentId`: Student identifier
- `studentName`: Student name
- `concernType`: Type of concern ("academic", "behavior", "health", "attendance", "general")
- `message`: Feedback message
- `requestCallback`: Boolean for callback request
- `scheduleMeeting`: Boolean for meeting request
- `timestamp`: When feedback was submitted
- `status`: Feedback status ("new", "read", "responded", "resolved")
- `assignedTo`: Teacher/admin assigned to handle
- `response`: Admin/teacher response
- `responseDate`: When response was given
- `priority`: Priority level ("low", "medium", "high", "urgent")

**Sample Feedback Record**:
```json
{
  "id": 5001,
  "parentId": 789,
  "parentName": "Mary Johnson",
  "parentEmail": "mary.johnson@email.com",
  "studentId": "12A",
  "studentName": "Jane Doe",
  "concernType": "academic",
  "message": "My child is struggling with mathematics concepts and needs additional support.",
  "requestCallback": true,
  "scheduleMeeting": false,
  "timestamp": "2025-09-18T09:00:00Z",
  "status": "new",
  "assignedTo": "John Smith",
  "priority": "medium"
}
```

### 7. System Settings and Configuration
**Purpose**: Managing system-wide settings and configurations.

**Required Fields for Settings**:
- `schoolName`: School name
- `schoolAddress`: School address
- `schoolPhone`: School phone number
- `schoolEmail`: School email
- `academicYear`: Current academic year
- `currentTerm`: Current term
- `feeStructure`: Default fee structure
- `classList`: Available classes
- `subjectList`: Available subjects
- `workingDays`: School working days
- `schoolHours`: School operating hours
- `smsSettings`: SMS gateway settings
- `emailSettings`: Email configuration
- `notificationSettings`: Notification preferences

### 8. Dashboard Analytics Data
**Purpose**: Providing overview statistics and analytics for the admin dashboard.

**Required Analytics Fields**:
- `totalStudents`: Total number of students
- `totalTeachers`: Total number of teachers
- `totalParents`: Total number of parents
- `totalClasses`: Number of active classes
- `totalRevenue`: Total expected revenue
- `collectedRevenue`: Amount collected
- `outstandingRevenue`: Amount outstanding
- `collectionRate`: Payment collection rate
- `averageAttendance`: Average attendance rate
- `pendingApprovals`: Number of pending account approvals
- `recentActivity`: Recent system activities
- `systemAlerts`: Active system alerts

## API Endpoints Required

### User Management
- `GET /api/admin/users` - Get all users with filtering and pagination
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/users/bulk` - Bulk user operations
- `GET /api/admin/users/stats` - User statistics
- `POST /api/admin/users/{id}/approve` - Approve pending user
- `POST /api/admin/users/{id}/reject` - Reject pending user

### Financial Management
- `GET /api/admin/fees` - Get fee records with filtering
- `GET /api/admin/fees/{id}` - Get specific fee record
- `PUT /api/admin/fees/{id}` - Update fee record
- `POST /api/admin/fees/{id}/payment` - Record payment
- `GET /api/admin/fees/stats` - Fee statistics
- `POST /api/admin/fees/reminders` - Send payment reminders
- `GET /api/admin/fees/export` - Export fee data

### Academic Management
- `GET /api/admin/results` - Get result records
- `POST /api/admin/results` - Upload result
- `PUT /api/admin/results/{id}` - Update result
- `DELETE /api/admin/results/{id}` - Delete result
- `GET /api/admin/results/download/{id}` - Download result file
- `GET /api/admin/results/stats` - Result statistics

### Attendance Management
- `GET /api/admin/attendance` - Get attendance records
- `POST /api/admin/attendance` - Record attendance
- `PUT /api/admin/attendance/{id}` - Update attendance
- `GET /api/admin/attendance/stats` - Attendance statistics
- `GET /api/admin/attendance/report` - Attendance reports

### Communication Management
- `GET /api/admin/sms` - Get SMS campaigns
- `POST /api/admin/sms` - Create SMS campaign
- `PUT /api/admin/sms/{id}` - Update SMS campaign
- `POST /api/admin/sms/{id}/approve` - Approve SMS campaign
- `POST /api/admin/sms/{id}/publish` - Publish SMS campaign
- `GET /api/admin/sms/stats` - SMS statistics

### Feedback Management
- `GET /api/admin/feedback` - Get feedback records
- `PUT /api/admin/feedback/{id}` - Update feedback
- `POST /api/admin/feedback/{id}/respond` - Respond to feedback
- `GET /api/admin/feedback/stats` - Feedback statistics

### System Management
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings
- `GET /api/admin/dashboard` - Get dashboard analytics
- `GET /api/admin/reports` - Generate various reports
- `POST /api/admin/backup` - Create system backup
- `GET /api/admin/logs` - Get system logs

### Event Management
- `GET /api/admin/events` - Get school events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/{id}` - Update event
- `DELETE /api/admin/events/{id}` - Delete event

## Data Relationships

1. **User Relationships**: Students linked to parents, teachers linked to subjects/classes
2. **Financial Relationships**: Fee records linked to students and parents
3. **Academic Relationships**: Results and attendance linked to students
4. **Communication Relationships**: SMS campaigns and feedback linked to users
5. **Event Relationships**: Events can be linked to specific classes or user groups

## Security and Permissions

- Admin role-based access control
- Audit logging for all administrative actions
- Data encryption for sensitive information
- API rate limiting and authentication
- Secure file upload and storage for documents

## Performance Considerations

- Database indexing on frequently queried fields
- Caching for dashboard statistics
- Pagination for large datasets
- Background processing for bulk operations
- Optimized queries for complex reports

## Future Enhancements

- Advanced analytics and reporting
- Integration with external systems (payment gateways, SMS providers)
- Automated notifications and alerts
- Mobile app API support
- Multi-school management capabilities
- Advanced user role management</content>
<parameter name="filePath">/media/kiki/New Volume3/Kerryl Projects/EDUFAM/EDUFAM-1/Frontend/EDUFAM-1/Admin_Dashboard_Data_Requirements.md
