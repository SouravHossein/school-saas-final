# Navigation & Route Structure

## Dashboard Routes

### Teacher Portal
- `/dashboard/teacher` - Main dashboard
- `/dashboard/teacher/attendance` - Mark attendance
- `/dashboard/teacher/marks` - Enter marks
- `/dashboard/teacher/classes` - View classes (create this)
- `/dashboard/teacher/analytics` - View reports (create this)

### Accountant Panel
- `/dashboard/accountant` - Main dashboard
- `/dashboard/accountant/fees` - Fee management
- `/dashboard/accountant/fees/:id/payment` - Record payment
- `/dashboard/accountant/payments` - Payment records (create this)
- `/dashboard/accountant/reports` - Financial reports (create this)
- `/dashboard/accountant/reminders` - Send reminders (create this)

### Office Staff Panel
- `/dashboard/office` - Main dashboard
- `/dashboard/office/admissions/new` - New admission form
- `/dashboard/office/records` - Student records
- `/dashboard/office/documents` - Document management
- `/dashboard/office/calendar` - Events calendar

### Messaging
- `/dashboard/messages` - All messages

### Admin
- `/admin` - Super admin dashboard
- `/admin/schools` - School management (create this)
- `/admin/schools/:id` - School details
- `/admin/users` - User management (create this)
- `/admin/analytics` - Platform analytics (create this)
- `/admin/settings` - Platform settings (create this)

### Public
- `/website` - Public website landing page
- `/about` - About page (create this)
- `/admission` - Admission page (create this)
- `/contact` - Contact page (create this)

## API Endpoints to Create

### Attendance API
```
POST /api/attendance/mark
GET /api/attendance/by-date
GET /api/attendance/by-student
PUT /api/attendance/:id
```

### Marks API
```
POST /api/marks/record
GET /api/marks/by-exam
GET /api/marks/by-student
PUT /api/marks/:id
GET /api/marks/grades
```

### Fee API
```
POST /api/fees/record-payment
GET /api/fees/by-student
GET /api/fees/pending
PUT /api/fees/:id/status
```

### Permission API
```
GET /api/permissions/user
GET /api/permissions/check
POST /api/roles/create
PUT /api/roles/:id/permissions
```

### Messaging API
```
POST /api/conversations/create
GET /api/conversations
GET /api/messages/:conversationId
POST /api/messages/send
PUT /api/messages/:id/read
```

## Navigation Sidebar Items

### For Teachers
```
- Dashboard
- Attendance
- Marks
- Classes
- My Students
- Analytics
- Messages
- Settings
```

### For Accountants
```
- Dashboard
- Fee Management
- Payment Records
- Reports
- Reminders
- Settings
```

### For Office Staff
```
- Dashboard
- New Admission
- Student Records
- Documents
- Events Calendar
- Settings
```

### For Super Admin
```
- Dashboard
- Schools
- Users & Roles
- Permissions
- Analytics
- Platform Settings
```

## Database Queries to Optimize

1. Teacher dashboard stats
   ```sql
   - Classes by teacher
   - Students in teacher's sections
   - Today's attendance summary
   - Pending marks
   ```

2. Accountant dashboard
   ```sql
   - Student fees summary
   - Payment status breakdown
   - Collection statistics
   - Due date analysis
   ```

3. Office staff dashboard
   ```sql
   - Total students
   - Recent admissions
   - Pending documents
   - Upcoming events
   ```

4. Super admin dashboard
   ```sql
   - Total schools
   - Platform-wide student count
   - Staff across schools
   - Revenue statistics
   ```

## Authentication Checks

Each protected route should verify:
1. User is authenticated (Supabase Auth)
2. User has required role
3. User belongs to correct school
4. User has required permissions for action

## RLS Policy Scoping

All queries should:
1. Include `school_id` filter
2. Respect user's role permissions
3. Use RLS policies at database level
4. Cache permission checks (5-10 minute TTL)

## Suggested Navigation Component

```tsx
// Sidebar should show based on user role:
- Admin: All modules
- Teacher: Teacher portal, Messages, Settings
- Accountant: Accountant panel, Settings
- Office Staff: Office panel, Settings
- Parent: Messages, Portal, Settings
- Student: Portal, Attendance, Marks, Messages

// Mobile drawer with same structure
```

## Theme Configuration

School theme can be stored in schools.theme_config:
```json
{
  "primaryColor": "#2563eb",
  "secondaryColor": "#64748b",
  "mode": "light|dark",
  "logoUrl": "...",
  "faviconUrl": "...",
  "customCSS": "..."
}
```

Apply theme globally in layout.tsx or use CSS variables.
