# Notification System Implementation

## Overview
A comprehensive notification system has been implemented with the following features:

### Models Created
1. **Notification Model** (`users/models.py`)
   - `user`: ForeignKey to User (nullable) - for specific user notifications
   - `user_type`: CharField (nullable) - for user type-based notifications
   - `title`: CharField - notification title
   - `message`: TextField - notification content
   - `type`: CharField - notification type (task, reminder, sale, system, update, alert)
   - `priority`: CharField - priority level (low, normal, high)
   - `expires_at`: DateTimeField (nullable) - notification expiration
   - `created_at`, `updated_at`: Auto timestamps

2. **UserNotification Model** (`users/models.py`)
   - `notification`: ForeignKey to Notification
   - `user`: ForeignKey to User
   - `is_read`: BooleanField (default: False)
   - `read_at`: DateTimeField (nullable)
   - `delivered_at`: DateTimeField (auto-created)

### API Endpoints
1. **GET `/api/auth/notifications/`** - Fetch last 5 notifications for current user
2. **PATCH `/api/auth/notifications/{id}/mark-read/`** - Mark notification as read

### Frontend Integration
- **Custom Hook**: `hooks/useNotifications.ts` - Manages notification state and API calls
- **Dashboard Header**: Updated to display real notifications with:
  - Unread count indicator
  - Priority-based color coding
  - Type-based icons
  - Time formatting
  - Mark as read functionality

## Setup Instructions

### 1. Database Migration
```bash
# In your Django backend
python manage.py makemigrations users
python manage.py migrate
```

### 2. Create Sample Notifications
```bash
# In your Django backend
python manage.py create_sample_notifications
```

### 3. Test the System
1. Start your Django backend server
2. Start your Next.js frontend server
3. Login to the dashboard
4. Check the notification bell icon in the header
5. Click on notifications to mark them as read

## Notification Targeting Logic
Notifications are shown to users based on:
1. **Specific User**: `user` field matches current user
2. **User Type**: `user_type` field matches current user's type
3. **All Users**: Both `user` and `user_type` are null
4. **Not Expired**: `expires_at` is null or in the future

## Features
- ✅ Real-time notification fetching
- ✅ Unread count indicator
- ✅ Priority-based visual indicators
- ✅ Type-based icons
- ✅ Mark as read functionality
- ✅ Responsive design (mobile & desktop)
- ✅ Loading states
- ✅ Error handling
- ✅ Time formatting (e.g., "2 hours ago")

## Sample Notifications Created
The management command creates these sample notifications:
1. Welcome message (all users)
2. Material price update (contractors)
3. Profile update reminder (all users)
4. New machinery alert (contractors)
5. System maintenance notice (all users)

## Customization
You can easily customize:
- Notification types in `TYPE_CHOICES`
- Priority levels in `PRIORITY_CHOICES`
- Icons in `getTypeIcon()` function
- Colors in `getPriorityColor()` function
- Time formatting in `formatTimeAgo()` function

## Next Steps
- Add push notifications
- Add email notifications
- Add notification preferences
- Add bulk mark as read
- Add notification categories
- Add notification history page
