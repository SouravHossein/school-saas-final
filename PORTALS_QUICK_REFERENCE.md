# Advanced Student & Parent Portals - Quick Reference

## Access URLs

### Portal Home (Role Detection)
- **URL**: `/portal`
- **Auth Required**: Yes
- **Behavior**: Detects user role (student/parent) and shows appropriate portal options

### Student Portal
- **URL**: `/portal/student`
- **Auth Required**: Yes (must have student record linked to user_id)
- **Roles**: Students

### Parent Portal
- **URL**: `/portal/parent`
- **Auth Required**: Yes (must have guardian record linked to user_id)
- **Roles**: Parents/Guardians

---

## Data Access & Security

### Student Portal Access Control
```
1. User logs in via /auth/login
2. Server checks: students table where user_id = auth.uid()
3. If found → redirect to /portal/student
4. Student dashboard loads with:
   - Own attendance records
   - Own exam marks
   - Own fee information
   - Exams scheduled for their class
```

### Parent Portal Access Control
```
1. User logs in via /auth/login
2. Server checks: guardians table where user_id = auth.uid()
3. If found → redirect to /portal/parent
4. Parent dashboard loads with:
   - student_guardians linked to their ID
   - Aggregated data for all linked children
   - Per-child detailed views
```

---

## Student Portal Features

### Dashboard Stats (4 cards)
| Metric | Calculation | Display |
|--------|-------------|---------|
| Attendance % | (Present Days / Total Days) × 100 | Green badge |
| Average Marks | Sum of marks / Number of exams | Blue badge |
| Total Exams | Count of exam records | Purple badge |
| Passed Exams | Count where is_passed = true | Purple badge |

### Tabs

#### 1. Overview Tab
- Student info (name, class, section, roll number)
- Enrollment details (status, date, DOB, gender)
- Personal information (address, contact)

#### 2. Marks Tab
- All exam results in reverse chronological order
- For each: Subject, Exam name, Marks obtained, Grade, Pass/Fail status
- Sorted by creation date (newest first)

#### 3. Attendance Tab
- Last 30 attendance records
- Display: Date, Status (Present/Absent/Leave)
- Color-coded badges: Green (P), Red (A), Yellow (L)

#### 4. Exams Tab
- Upcoming exams for student's class
- Filter: exam_date >= today
- Show: Exam name, class, date, max marks, passing marks, type

---

## Parent Portal Features

### Overall Dashboard Stats (3 cards)
| Metric | Calculation | Display |
|--------|-------------|---------|
| Children | Count of linked students | Blue badge |
| Avg Attendance | Average of all children's attendance % | Green badge |
| Pending Fees | Sum of all unpaid fees | Red badge (if > 0) |

### Multi-Student Tabs
- One tab per linked child
- Tabs auto-grid based on number of children
- Switch tabs to view different child's data

### Per-Student View

#### Student Header
- Student name and profile
- Class, section, roll number
- Status badge (Active/Inactive)

#### Student Stats (4 cards)
| Metric | Data | Display |
|--------|------|---------|
| Attendance | Percentage with present count | Green |
| Avg Marks | Average across exams | Blue |
| Fees Paid | Amount paid / total due | Orange |
| Pending | Amount still due | Red |

#### Recent Exam Results Section
- Latest 5 exam marks
- For each: Subject, Exam, Marks, Grade, Pass/Fail
- Color-coded badges

#### Fee Structure Section
- Breakdown of each fee type
- Progress bar for payment status
- Paid amount / Total amount
- Status badge (Paid/Partial/Pending)

#### Attendance Visualization
- 10-day attendance calendar
- Color codes: ✓ (Green), ✗ (Red), ~ (Yellow)
- Hover shows actual date
- Legend: Present/Absent/Leave

---

## Database Queries Used

### Student Portal

**Get Student Info**
```sql
SELECT * FROM students
WHERE user_id = $1
LIMIT 1
```

**Get Attendance**
```sql
SELECT status, attendance_date FROM attendance
WHERE student_id = $1
ORDER BY attendance_date DESC
```

**Get Marks**
```sql
SELECT m.*, e.name, s.name as subject_name
FROM marks m
JOIN exams e ON m.exam_id = e.id
JOIN subjects s ON m.subject_id = s.id
WHERE m.student_id = $1
ORDER BY m.created_at DESC
```

**Get Upcoming Exams**
```sql
SELECT * FROM exams
WHERE class_id = $1 
AND exam_date >= today
AND is_published = true
ORDER BY exam_date ASC
```

### Parent Portal

**Get Guardian**
```sql
SELECT * FROM guardians
WHERE user_id = $1
```

**Get Linked Students**
```sql
SELECT student_id FROM student_guardians
WHERE guardian_id = $1
```

**Get Student Data**
```sql
SELECT *, 
  (SELECT COUNT(*) FROM attendance WHERE student_id = students.id) as attendance_count,
  (SELECT COUNT(*) FROM marks WHERE student_id = students.id) as marks_count
FROM students
WHERE id = ANY($1)
ORDER BY first_name
```

---

## Performance Optimization

### Query Efficiency
- Single query per data type with joined related data
- Attendance/marks limited to 10-30 recent records
- Aggregation calculated server-side
- Database indexes on:
  - `students.user_id`
  - `guardians.user_id`
  - `attendance.student_id`
  - `marks.student_id`

### Caching
- Server-side data fetching (no client state)
- Related data prefetched in single query
- RSC handles rendering efficiently

### Load Times
- Student portal: ~500ms (single student query)
- Parent portal: ~1-2s (multi-student queries)
- Limited data sets for performance

---

## Common User Flows

### Student Login & Dashboard
```
1. Student visits /auth/login
2. Enters credentials
3. Redirected to /portal (home page)
4. Page detects student role
5. Shows "Student Portal" button
6. Click → redirects to /portal/student
7. Dashboard displays with all tabs loaded
```

### Parent Login & Check Child's Performance
```
1. Parent visits /auth/login
2. Enters credentials
3. Redirected to /portal
4. Page detects parent role
5. Shows "Parent Portal" button
6. Click → redirects to /portal/parent
7. Overall stats displayed
8. Tabs show each child's name
9. Click child tab to view detailed data
10. Can see marks, fees, attendance
```

### Parent Reviews Fee Status
```
1. Parent already in parent portal
2. On child's tab (e.g., "Ravi")
3. Scroll to "Fee Structure" section
4. See: Fee name, Status badge, Progress bar
5. Know exactly: Paid amount / Total amount
6. Can plan payment accordingly
```

---

## Error Handling

### Student Portal Errors
- **No student record**: Shows "No student record found"
- **Not authenticated**: Redirects to /auth/login
- **No attendance data**: Shows "No attendance records"
- **No exam marks**: Shows "No marks published yet"
- **No upcoming exams**: Shows "No exams scheduled"

### Parent Portal Errors
- **No guardian record**: Shows error alert
- **No linked students**: Shows informational alert
- **Not authenticated**: Redirects to /auth/login
- **No data for child**: Shows empty sections gracefully

---

## RLS Policy Protection

### Guardians Table
- Policy: "Guardians can view their own profile"
- Condition: `user_id = auth.uid()`
- Result: Parent can ONLY access their own guardian record

### Students Table
- Linked via `user_id` for direct student access
- Linked via `student_guardians` for parent access
- Result: Students see own data, Parents see linked children only

### Attendance/Marks/Fees Tables
- School-level and user-level filtering
- Result: No cross-school or cross-user data leaks

---

## Testing Checklist

### Student Portal
- [ ] Student logs in successfully
- [ ] Dashboard stats calculate correctly
- [ ] All 4 tabs load content
- [ ] Attendance percentage matches manual calculation
- [ ] Marks display with correct grades
- [ ] Upcoming exams filtered correctly
- [ ] Mobile responsive
- [ ] No data visible from other students
- [ ] Logout works correctly

### Parent Portal
- [ ] Parent logs in successfully
- [ ] Shows all linked children in tabs
- [ ] Overall stats aggregate correctly
- [ ] Each tab shows correct child's data
- [ ] Tab switching smooth
- [ ] Fee progress bars accurate
- [ ] Attendance calendar displays correctly
- [ ] Mobile responsive with tab scrolling
- [ ] No data visible from other parents' children

---

## Troubleshooting

### Student Can't Access Student Portal
1. Check: Does `students` table have record with `user_id = auth.uid()`?
2. If no: Admin must create student record first
3. Check: Is student `status = 'active'`?

### Parent Can't Access Parent Portal
1. Check: Does `guardians` table have record with `user_id = auth.uid()`?
2. If no: Admin must create guardian profile and link user_id
3. Check: Are there records in `student_guardians` linking guardian to students?
4. If no: Admin must create the guardian-student relationship

### Data Not Showing
1. Check browser console for errors
2. Verify RLS policies allow user access
3. Ensure data exists in database for selected student
4. Check school_id matches user's school

---

## Future Enhancements

- [ ] Print/PDF export of reports
- [ ] Email notifications for low attendance
- [ ] Fee payment reminders
- [ ] Performance trend charts
- [ ] Parent-teacher meeting scheduling
- [ ] Direct messaging integration
- [ ] Mobile app versions
- [ ] Offline access with PWA
- [ ] Custom alerts and notifications
- [ ] Export to calendar (iCal format)
