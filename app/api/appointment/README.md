# Appointment API

This API handles appointment scheduling and retrieval with MongoDB integration.

## Endpoints

### GET /api/appointment/check
Check if an appointment is configured and get appointment details.

**Authentication:** Required (Auth0 session)

**Response:**
```json
{
  "success": true,
  "data": {
    "isScheduled": true,
    "scheduledAt": "2024-01-15T14:30:00.000Z",
    "appointmentDetails": {
      "time": "14:30",
      "length": "60",
      "date": "2024-01-15",
      "provider": "Dr. Smith",
      "type": "consultation"
    },
    "status": "scheduled",
    "checkedAt": "2024-01-15T10:00:00.000Z",
    "userId": "auth0|...",
    "source": "database"
  }
}
```

### POST /api/appointment/check
Create or update an appointment configuration.

**Authentication:** Required (Auth0 session)

**Request Body:**
```json
{
  "isScheduled": true,
  "appointmentTime": "14:30",
  "appointmentLength": "60",
  "appointmentDate": "2024-01-15",
  "appointmentProvider": "Dr. Smith",
  "appointmentType": "consultation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isScheduled": true,
    "scheduledAt": "2024-01-15T14:30:00.000Z",
    "appointmentDetails": {
      "time": "14:30",
      "length": "60",
      "date": "2024-01-15",
      "provider": "Dr. Smith",
      "type": "consultation"
    },
    "status": "scheduled",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "userId": "auth0|...",
    "dbOperation": "inserted"
  },
  "message": "Appointment created successfully"
}
```

## MongoDB Schema

### Collection: `appointments`

```javascript
{
  userId: "auth0|...",              // Auth0 user ID
  isScheduled: true,                // Whether appointment is scheduled
  time: "14:30",                    // Appointment time (24-hour format)
  length: "60",                     // Length in minutes
  date: "2024-01-15",              // Appointment date
  provider: "Dr. Smith",            // Provider name
  type: "consultation",             // Appointment type
  scheduledAt: "2024-01-15T14:30:00.000Z",  // ISO timestamp
  status: "scheduled",              // Status: scheduled, not_scheduled, cancelled
  userEmail: "user@example.com",   // User's email
  userName: "John Doe",            // User's name
  createdAt: "2024-01-15T10:00:00.000Z",    // When created
  updatedAt: "2024-01-15T10:00:00.000Z"     // When last updated
}
```

## Environment Variables

### Required:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=lukaria
```

### Optional (Fallback if MongoDB has no data):
```env
APPOINTMENT_SCHEDULED=false
APPOINTMENT_TIME=14:30
APPOINTMENT_LENGTH=60
APPOINTMENT_DATE=2024-01-15
APPOINTMENT_PROVIDER=Dr. Smith
APPOINTMENT_TYPE=consultation
```

## Usage

### From Redux Saga:
```javascript
import { checkAppointmentConfig } from '../store/slices/appointmentSlice';

// Dispatch action
dispatch(checkAppointmentConfig());
```

### Direct API Call:
```javascript
import { checkAppointmentConfiguration } from '../lib/api/appointmentService';

const response = await checkAppointmentConfiguration();
console.log(response.data);
```

### Using the Component:
```javascript
import AppointmentChecker from '../components/AppointmentChecker';

<AppointmentChecker />
```

## Data Flow

1. **User triggers check** → Dispatch `checkAppointmentConfig()`
2. **Saga calls API** → `/api/appointment/check`
3. **API queries MongoDB** → Find user's appointment
4. **Fallback to env vars** → If no database entry exists
5. **Return appointment data** → To saga
6. **Update Redux store** → Store appointment details
7. **Persist to localStorage** → For offline access

## Error Handling

The API handles various error scenarios:
- Missing authentication → 401 Unauthorized
- Missing required fields → 400 Bad Request
- Database errors → 500 Internal Server Error
- Network errors → Caught by client service

All errors are logged to console and returned to the client with descriptive messages.



