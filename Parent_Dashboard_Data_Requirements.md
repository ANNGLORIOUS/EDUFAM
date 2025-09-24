# Parent Dashboard Data Requirements

## Overview
This document outlines the data structures and API endpoints required by the frontend Parent Dashboard components. It serves as a guide for the backend team to implement the necessary data models and endpoints.

## Data Categories

### 1. User/Authentication Data
**Purpose**: Identify the logged-in parent and their associated children.

**Required Fields**:
- `id`: Unique user identifier
- `name`: Parent's full name
- `email`: Parent's email address (used for filtering data)
- `type`: User type ("parent")
- `children`: Array of child student IDs associated with this parent

**Sample**:
```json
{
  "id": "parent123",
  "name": "Jane Doe",
  "email": "janedoe.parent@email.com",
  "type": "parent",
  "children": ["12A", "7B"]
}
```

### 2. Student/Child Information
**Purpose**: Display child details in the Child Information view and throughout the dashboard.

**Required Fields**:
- `id`: Unique student identifier
- `studentId`: Student ID (e.g., "12A")
- `name`: Student's full name
- `class`: Student's class (e.g., "Class 1")
- `dateAdded`: Date student was enrolled
- `status`: Student status ("Active", "Inactive")
- `parentEmail`: Associated parent's email

**Sample**:
```json
{
  "id": "student123",
  "studentId": "12A",
  "name": "Jane Doe",
  "class": "Class 1",
  "dateAdded": "2025-01-15",
  "status": "Active",
  "parentEmail": "janedoe.parent@email.com"
}
```

### 3. Academic Results
**Purpose**: Display student's academic performance and downloadable result files.

**Required Fields**:
- `studentId`: Student identifier
- `studentName`: Student's name
- `studentClass`: Student's class
- `term`: Academic term (e.g., "Term 1", "Term 2", "Term 3")
- `grade`: Overall grade (e.g., "A", "B+", "A-")
- `fileName`: Name of the result file (optional)
- `fileDataUrl`: URL or base64 data for downloadable result file (optional)
- `parentEmail`: Parent's email for filtering
- `uploadDate`: When the result was uploaded

**Sample**:
```json
{
  "studentId": "12A",
  "studentName": "Jane Doe",
  "studentClass": "Class 1",
  "term": "Term 1",
  "grade": "A",
  "fileName": "JaneDoe_Term1_Results.pdf",
  "fileDataUrl": "https://api.edufam.com/results/12A_term1.pdf",
  "parentEmail": "janedoe.parent@email.com",
  "uploadDate": "2025-09-15T10:00:00Z"
}
```

### 4. Attendance Records
**Purpose**: Display attendance percentage and detailed attendance data.

**Required Fields**:
- `studentId`: Student identifier
- `studentName`: Student's name
- `studentClass`: Student's class
- `term`: Academic term
- `attendancePercent`: Overall attendance percentage (0-100)
- `weeks`: Array of boolean values representing attendance per week (optional for detailed view)
- `parentEmail`: Parent's email for filtering
- `totalDays`: Total number of school days in the term
- `presentDays`: Number of days present

**Sample**:
```json
{
  "studentId": "12A",
  "studentName": "Jane Doe",
  "studentClass": "Class 1",
  "term": "Term 1",
  "attendancePercent": 78,
  "weeks": [true, true, true, true, true, true, true, false, false],
  "parentEmail": "janedoe.parent@email.com",
  "totalDays": 45,
  "presentDays": 35
}
```

### 5. School Events
**Purpose**: Display upcoming school events in calendar format and notifications.

**Required Fields**:
- `id`: Unique event identifier
- `title`: Event title
- `start`: Event start date/time (ISO format)
- `end`: Event end date/time (ISO format)
- `description`: Event description
- `eventType`: Type of event (e.g., "academic", "holiday", "meeting")
- `targetAudience`: Who the event is for ("all", "parents", "students", specific classes)

**Sample**:
```json
{
  "id": 1,
  "title": "Maths Contest",
  "start": "2025-09-22T10:00:00Z",
  "end": "2025-09-22T12:00:00Z",
  "description": "Annual maths contest for all grades.",
  "eventType": "academic",
  "targetAudience": "all"
}
```

### 6. Fee Information
**Purpose**: Display fee status and payment information.

**Required Fields**:
- `studentId`: Student identifier
- `parentEmail`: Parent's email
- `totalFee`: Total fee amount for the term/year
- `paidAmount`: Amount already paid
- `dueAmount`: Amount still due
- `nextPaymentDue`: Date when next payment is due
- `paymentHistory`: Array of past payments (optional)
- `feeStructure`: Breakdown of fees (optional)

**Sample**:
```json
{
  "studentId": "12A",
  "parentEmail": "janedoe.parent@email.com",
  "totalFee": 30000,
  "paidAmount": 20000,
  "dueAmount": 10000,
  "nextPaymentDue": "2025-09-30",
  "currency": "KES",
  "paymentHistory": [
    {
      "amount": 15000,
      "date": "2025-01-15",
      "method": "M-Pesa"
    }
  ]
}
```

### 7. Feedback/Communication
**Purpose**: Handle parent-teacher communication and feedback.

**Required Fields for Submission**:
- `parentName`: Parent's name
- `parentEmail`: Parent's email
- `studentId`: Child's student ID
- `studentName`: Child's name
- `concernType`: Type of concern ("academic", "behavior", "health", "attendance", "general")
- `message`: Feedback message
- `requestCallback`: Boolean for callback request
- `scheduleMeeting`: Boolean for meeting request
- `timestamp`: When feedback was submitted
- `status`: Status of feedback ("new", "read", "responded")

**Sample Submission**:
```json
{
  "parentName": "Jane Doe",
  "parentEmail": "janedoe.parent@email.com",
  "studentId": "12A",
  "studentName": "Jane Doe",
  "concernType": "academic",
  "message": "My child is struggling with mathematics concepts.",
  "requestCallback": true,
  "scheduleMeeting": false
}
```

## API Endpoints Required

### Authentication & User Management
- `GET /api/parent/profile` - Get parent profile and associated children
- `GET /api/parent/children` - Get detailed information about parent's children

### Academic Data
- `GET /api/parent/results?studentId={id}&term={term}` - Get academic results
- `GET /api/parent/results/download/{resultId}` - Download result file
- `GET /api/parent/attendance?studentId={id}&term={term}` - Get attendance data

### Events & Calendar
- `GET /api/events` - Get all upcoming events
- `GET /api/events?start={date}&end={date}` - Get events within date range

### Financial Information
- `GET /api/parent/fees?studentId={id}` - Get fee information
- `POST /api/payments/initiate` - Initiate payment process
- `GET /api/payments/history?studentId={id}` - Get payment history

### Communication
- `POST /api/feedback` - Submit feedback/concern
- `GET /api/feedback?status={status}` - Get feedback history
- `GET /api/messages` - Get messages from teachers

## Data Flow & Relationships

1. **Parent Login**: Authenticate parent and get their profile
2. **Load Dashboard**: Fetch all children associated with parent
3. **Load Child Data**: For each child, fetch results, attendance, and fees
4. **Load Events**: Fetch upcoming events for calendar display
5. **Real-time Updates**: WebSocket or polling for new results, events, messages

## Filtering & Permissions

- All data should be filtered by `parentEmail` to ensure parents only see their own children's data
- Parents should only access data for students linked to their account
- Sensitive information should be properly secured

## Performance Considerations

- Implement pagination for large datasets (e.g., results history)
- Use caching for frequently accessed data (events, fee structures)
- Consider lazy loading for heavy components (calendar, result downloads)
- Implement proper indexing on database fields used for filtering

## Error Handling

- Return appropriate HTTP status codes
- Provide meaningful error messages
- Handle cases where no data exists for a student
- Gracefully handle network failures on frontend

## Future Enhancements

- Push notifications for new results or events
- Real-time chat with teachers
- Payment integration
- Multi-child selection and comparison
- Historical data trends and analytics</content>
<parameter name="filePath">/media/kiki/New Volume3/Kerryl Projects/EDUFAM/EDUFAM-1/Frontend/EDUFAM-1/Parent_Dashboard_Data_Requirements.md
