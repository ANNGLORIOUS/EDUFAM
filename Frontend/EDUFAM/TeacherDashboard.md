# Teacher Event Management and Parent Event Calendar Integration

## Overview
This guide explains how teachers can add school events, how those events are automatically populated to the parent dashboard event calendar, and how both teachers and parents interact with event notifications and summaries in the EDUFAM system.


## 6. Teacher: Uploading Results
Teachers can upload student results using a dedicated form in their dashboard. The results are saved and summarized for teachers, while parents can only download the uploaded result files (e.g., PDF) for their children.

### Steps for Teachers
1. **Navigate to the 'Results' tab** in the Teacher Dashboard sidebar.
2. **Fill out the results upload form** with the following input fields:
   - **Student Name** (`studentName`): Text input for the student's name.
   - **Student ID** (`studentId`): Text input for the student's ID.
   - **Class/Stream** (`studentClass`): Dropdown to select the class.
   - **Term** (`term`): Dropdown to select the term.
   - **Grade** (`grade`): Dropdown to select the grade.
   - **Parent Email** (`parentEmail`): Email input for the parent.
   - **Student Results File** (`file`): File upload (PDF or Excel) for the student's results.
3. **Click 'Upload Results'** to submit. The data is saved and appears in the teacher's summary tables.

#### Example Results Input Fields
- Student Name: `Jane Doe`
- Student ID: `12A`
- Class/Stream: `Class 1`
- Term: `Term 1`
- Grade: `A`
- Parent Email: `janedoe.parent@email.com`
- Student Results File: `results_term1_jane.pdf`

### Data Storage
- Uploaded results are stored in the application state and also reflected in the `seed_data.json` file for demo or initial data.

### Teacher Dashboard
- Teachers see a summary table of all uploaded results, filterable by class and term.

### Parent Dashboard
- Parents do not see the full summary table. Instead, they can **download the PDF or Excel file** for their child's latest uploaded results from their dashboard.


## 8. Teacher: Marking Attendance
Teachers can mark student attendance using a dedicated form in their dashboard. Attendance is tracked weekly and automatically converted to a percentage, which is visualized for parents and summarized for teachers.

### Steps for Teachers
1. **Navigate to the 'Attendance' tab** in the Teacher Dashboard sidebar.
2. **Fill out the attendance form** with the following input fields:
  - **Student ID** (`studentId`): Text input for the student's ID.
  - **Student Name** (`studentName`): Text input for the student's name.
  - **Student Class** (`studentClass`): Dropdown to select the class.
  - **Term** (`term`): Dropdown to select the term.
  - **Parent Email** (`parentEmail`): Email input for the parent.
  - **Weeks 1-9** (`weeks`): 9 checkboxes, one for each week. Check if the student was present that week.
3. **Click 'Upload Attendance'** to submit. The number of weeks marked present is converted to a percentage (e.g., 7/9 weeks = 78%).

#### Example Attendance Input Fields
- Student ID: `12A`
- Student Name: `Jane Doe`
- Student Class: `Class 1`
- Term: `Term 1`
- Parent Email: `janedoe.parent@email.com`
- Weeks: `[✓, ✓, ✓, ✗, ✓, ✓, ✓, ✓, ✗]` (7 out of 9 weeks present)

### Data Storage
- Attendance records are stored in the application state and also reflected in the `seed_data.json` file for demo or initial data.

### Teacher Dashboard
- Teachers see a summary table of attendance for each class, showing student name, ID, term, and attendance percentage.

### Parent Dashboard
- Parents see their child's attendance visualized as a pie chart (e.g., 78% attendance).
- The pie chart and percentage are updated automatically when new attendance is uploaded.

---

## 7. Event Data Sources (Correction)
- **Events** shown in both teacher and parent dashboards come from:
  - Events added by teachers via the dashboard event form.
  - Pre-populated demo events in the `seed_data.json` file (for initial/demo data).
- Both sources are merged and displayed in the event calendar and notifications.

---

## 1. Teacher: Adding Events
Teachers can add new school events from their dashboard. These events are then visible to parents in their event calendar and as notifications.

### Steps for Teachers
1. **Navigate to the Teacher Dashboard.**
2. **Go to the 'Events' tab** in the sidebar.
3. **Fill out the event form** with the following input fields:
   - **Event Name** (`title`): Text input for the event's name.
   - **Date** (`date`): Date picker for the event date.
   - **Start Time** (`startTime`): Time picker for when the event starts.
   - **End Time** (`endTime`): Time picker for when the event ends.
   - **Description** (`description`): Text area for event details (optional).
4. **Click 'Add Event'** to submit. The event will be saved and distributed to all relevant parents.

#### Example Event Input Fields
- Event Name: `School Sports Day`
- Date: `2025-10-15`
- Start Time: `09:00`
- End Time: `15:00`
- Description: `Annual sports day for all classes.`

---

## 2. Parent: Viewing Events
Parents see all upcoming events in two main ways:

### a. Event Calendar
- The parent dashboard features an **Event Calendar** that displays all events added by teachers.
- Events are shown on their respective dates, and parents can click on them for more details.

### b. Recent Event Notifications
- The parent dashboard also shows a **Recent Events/Notifications** section.
- This section lists the next 5 upcoming events, including event name, date, time, and description.

---

## 3. Teacher: Viewing Event Summaries
Teachers can view summaries of events based on class and summary type:

- **Class Filter:** Teachers can select a class (e.g., Class 1, Class 2, etc.) to filter events relevant to that class.
- **Summary Type:** Teachers can choose to view a summary of Results, Events, or Attendance for the selected class.
- **Event Summary Table:** Shows a list of all events for the all class, including event name, date, start/end time, and description.

---

## 4. Data Flow Summary
- When a teacher adds an event, it is saved in the shared context/state.
- The event is immediately available to:
  - The teacher (for summary and management)
  - All parents (in their event calendar and notifications)
- No manual refresh is needed; the UI updates automatically.

---

## 5. Technical Notes
- Events are managed via the `EventsContext` and accessed using the `useEvents` hook.
- The event form uses controlled React components for all input fields.
- Parent and teacher dashboards both subscribe to the same event data, ensuring real-time updates.

---

For more details, see the source code in:
- `src/components/teacher/TeacherDashboard.tsx`
- `src/components/parent/ParentDashboard.tsx`
- `src/context/useEvents.ts`

