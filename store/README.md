# Redux Store Setup with Redux Saga

This project uses Redux Toolkit with Redux Saga for state management and side effects handling.

## Store Structure

### Slices

1. **authSlice** - Handles authentication state
   - `isAuthenticated`: Boolean indicating if user is logged in
   - `user`: User object from Auth0
   - `isLoading`: Loading state for auth operations
   - `error`: Any authentication errors

2. **appointmentSlice** - Manages appointment-related state
   - `appointments`: Array of all appointments
   - `currentAppointment`: Current/upcoming appointment
   - `isBooking`: Boolean for booking status
   - `isScheduleCompleted`: Boolean indicating if schedule is complete
   - `bookingError`: Any booking-related errors

3. **userSlice** - Handles user profile and health data
   - `profile`: Complete user profile object
   - `isProfileComplete`: Boolean indicating profile completion
   - `isLoading`: Loading state for profile operations
   - `error`: Any profile-related errors

## Usage

### In Components

```javascript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentAppointment } from '../store/slices/appointmentSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const currentAppointment = useAppSelector((state) => state.appointment.currentAppointment);
  
  const handleUpdateAppointment = (data) => {
    dispatch(setCurrentAppointment(data));
  };
  
  return (
    // Component JSX
  );
}
```

### Actions

#### Auth Actions
- `loginStart()` - Start login process
- `loginSuccess(user)` - Login successful
- `loginFailure(error)` - Login failed
- `logout()` - Logout user
- `clearError()` - Clear auth errors

#### Appointment Actions
- `setScheduleCompleted(status)` - Set schedule completion status
- `setCurrentAppointment(appointment)` - Set current appointment
- `addAppointment(appointment)` - Add new appointment
- `setBookingStatus(status)` - Set booking status
- `clearAppointments()` - Clear all appointments

#### User Actions
- `setProfile(profile)` - Set complete profile
- `updatePersonalInfo(data)` - Update personal information
- `updateHealthInfo(data)` - Update health information
- `setProfileComplete(status)` - Set profile completion status
- `resetProfile()` - Reset profile to initial state

## Redux Saga Integration

### Sagas

1. **authSaga** - Handles authentication side effects
   - `loginUser`: Processes user login with API simulation
   - `logoutUser`: Handles user logout and cleanup

2. **appointmentSaga** - Manages appointment-related side effects
   - `bookAppointment`: Handles appointment booking with API simulation
   - `completeSchedule`: Processes schedule completion
   - `loadAppointmentData`: Loads appointment data from localStorage

3. **userSaga** - Handles user profile side effects
   - `updatePersonalInfo`: Updates personal information with API simulation
   - `updateHealthInfo`: Updates health information
   - `loadUserProfile`: Loads user profile from localStorage

### Saga Actions

#### Auth Saga Actions
- `loginUser(user)` - Triggers login saga
- `logout()` - Triggers logout saga

#### Appointment Saga Actions
- `bookAppointment(appointmentData)` - Triggers booking saga
- `completeSchedule(appointmentData)` - Triggers schedule completion saga
- `loadAppointmentData()` - Triggers data loading saga

#### User Saga Actions
- `updatePersonalInfoAsync(personalData)` - Triggers personal info update saga
- `updateHealthInfoAsync(healthData)` - Triggers health info update saga
- `loadUserProfile()` - Triggers profile loading saga

## Integration with Existing Code

The Redux store with Sagas integrates with:
- **Auth0**: Syncs user authentication state through sagas
- **localStorage**: Persists data through saga side effects
- **Dashboard**: Displays appointment information from Redux state
- **Schedule Page**: Updates Redux state when appointments are booked via sagas
- **User Profile**: Manages profile updates through saga workflows

## Example Usage with Sagas

```javascript
// Trigger saga actions instead of direct state updates
import { useAppDispatch } from '../store/hooks';
import { completeSchedule, loadAppointmentData } from '../store/slices/appointmentSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  
  // Load data using saga
  useEffect(() => {
    dispatch(loadAppointmentData());
  }, [dispatch]);
  
  // Complete schedule using saga
  const handleComplete = (data) => {
    dispatch(completeSchedule(data));
  };
}
```
