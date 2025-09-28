# Pre-Appointment Tasks System

This document describes how the pre-appointment tasks system works in the application.

## Overview

The pre-appointment tasks are stored in the Redux store and provide a checklist for users to complete before their appointment. Each task has a completion status that defaults to `false`.

## Task Configuration

### Tasks in Redux Store

The tasks are stored in `state.appointment.preAppointmentTasks` with the following structure:

```javascript
preAppointmentTasks: {
  completeMedicalProfile: false,
  reviewCurrentMedications: false,
  prepareQuestions: false,
  testTechnology: false,
  findQuietSpace: false,
}
```

### Task Details

| Task Key | Title | Description | Navigation Path | Auto-Complete Trigger |
|----------|-------|-------------|-----------------|---------------------|
| `completeMedicalProfile` | Complete Medical Profile | Update your health information and medical history | `/profile` | When user saves profile |
| `reviewCurrentMedications` | Review Current Medications | List all medications and supplements you're currently taking | `/profile` | Manual (via profile completion) |
| `prepareQuestions` | Prepare Questions | Write down any questions or concerns you'd like to discuss | `/profile` | Manual (via profile completion) |
| `testTechnology` | Test Your Technology | Ensure your device and internet connection work properly | `/schedule` | When user accesses schedule page |
| `findQuietSpace` | Find a Quiet Space | Choose a private, well-lit location for your consultation | `/dashboard` | Manual (user can mark as done) |

## Redux Actions

### Available Actions

- `updatePreAppointmentTask({ taskKey, completed })` - Update a specific task's completion status
- `resetPreAppointmentTasks()` - Reset all tasks to false

### Usage Example

```javascript
import { useAppDispatch } from '../../store/hooks';
import { updatePreAppointmentTask } from '../../store/slices/appointmentSlice';

const dispatch = useAppDispatch();

// Mark a task as complete
dispatch(updatePreAppointmentTask({ 
  taskKey: 'completeMedicalProfile', 
  completed: true 
}));

// Mark a task as incomplete
dispatch(updatePreAppointmentTask({ 
  taskKey: 'completeMedicalProfile', 
  completed: false 
}));
```

## UI Features

### Dashboard Display

On the dashboard, tasks are displayed as:
- **Clickable list items** that navigate to relevant pages
- **Visual indicators**: 
  - ❌ Empty circle for incomplete tasks
  - ✅ Filled green circle for complete tasks
- **Color coding**:
  - Incomplete: Primary color (gold)
  - Complete: Success color (green) with bold text
- **Hover effects** with gold background

### Navigation

Each task links to its relevant page:
- Medical Profile tasks → `/profile`
- Technology test → `/schedule`
- Quiet space → `/dashboard`

## Auto-Completion Logic

### Automatic Completion

1. **Medical Profile**: Automatically marked complete when user saves their profile
2. **Technology Test**: Automatically marked complete when user accesses the schedule page

### Manual Completion

Users can manually mark tasks as complete through:
- Profile completion (for medical tasks)
- Dashboard interaction (for space selection)

## Implementation Files

### Redux Store
- `store/slices/appointmentSlice.js` - Task state and actions

### Components
- `app/dashboard/page.js` - Task display and navigation
- `app/profile/page.js` - Medical profile task completion
- `app/schedule/page.js` - Technology test task completion

## Future Enhancements

1. **Persistent Storage**: Save task completion to localStorage or database
2. **Progress Tracking**: Show completion percentage
3. **Task Dependencies**: Make some tasks dependent on others
4. **Custom Tasks**: Allow dynamic task creation
5. **Reminders**: Send notifications for incomplete tasks
6. **Analytics**: Track task completion rates

## Usage in Components

### Accessing Task State

```javascript
import { useAppSelector } from '../../store/hooks';

const preAppointmentTasks = useAppSelector((state) => state.appointment.preAppointmentTasks);
```

### Updating Task State

```javascript
import { useAppDispatch } from '../../store/hooks';
import { updatePreAppointmentTask } from '../../store/slices/appointmentSlice';

const dispatch = useAppDispatch();

// In a click handler or completion logic
const handleTaskComplete = (taskKey) => {
  dispatch(updatePreAppointmentTask({ taskKey, completed: true }));
};
```

