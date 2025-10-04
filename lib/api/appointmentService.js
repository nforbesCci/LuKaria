/**
 * Client-side API service for appointment operations
 */

const APPOINTMENT_API_BASE_URL = '/api/appointment';

/**
 * Check appointment configuration and get details
 * @returns {Promise<Object>} - API response with appointment data
 */
export async function checkAppointmentConfiguration() {
  console.log('🌐 Client: Calling API endpoint:', `${APPOINTMENT_API_BASE_URL}/check`);
  
  try {
    const response = await fetch(`${APPOINTMENT_API_BASE_URL}/check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Client: Response status:', response.status, response.statusText);
    console.log('📡 Client: Response OK?', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Client: API returned error:', errorData);
      throw new Error(errorData.error || 'Failed to check appointment configuration');
    }

    const data = await response.json();
    console.log('✅ Client: API response data:', data);
    return data;
  } catch (error) {
    console.error('❌ Client: Error checking appointment configuration:', error);
    console.error('❌ Client: Error details:', error.message);
    throw error;
  }
}

/**
 * Update appointment configuration
 * @param {Object} appointmentConfig - Appointment configuration
 * @returns {Promise<Object>} - API response
 */
export async function updateAppointmentConfiguration(appointmentConfig) {
  try {
    const response = await fetch(`${APPOINTMENT_API_BASE_URL}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentConfig),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update appointment configuration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating appointment configuration:', error);
    throw error;
  }
}

/**
 * Get appointment details from server configuration
 * @returns {Promise<Object>} - Appointment details
 */
export async function getAppointmentDetails() {
  try {
    const response = await checkAppointmentConfiguration();
    return response.data;
  } catch (error) {
    console.error('Error getting appointment details:', error);
    throw error;
  }
}

/**
 * Check if appointment is scheduled based on server configuration
 * @returns {Promise<boolean>} - Whether appointment is scheduled
 */
export async function isAppointmentScheduled() {
  try {
    const response = await checkAppointmentConfiguration();
    return response.data.isScheduled;
  } catch (error) {
    console.error('Error checking if appointment is scheduled:', error);
    return false;
  }
}

/**
 * Save appointment to MongoDB database
 * @param {Object} appointmentData - Appointment details
 * @returns {Promise<Object>} - API response
 */
export async function saveAppointment(appointmentData) {
  console.log('🌐 Client: Calling API endpoint:', `${APPOINTMENT_API_BASE_URL}/save`);
  console.log('📤 Client: Sending data:', appointmentData);
  
  try {
    const response = await fetch(`${APPOINTMENT_API_BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    console.log('📡 Client: Response status:', response.status, response.statusText);
    console.log('📡 Client: Response OK?', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Client: API returned error:', errorData);
      throw new Error(errorData.error || 'Failed to save appointment');
    }

    const data = await response.json();
    console.log('✅ Client: API response data:', data);
    return data;
  } catch (error) {
    console.error('❌ Client: Error saving appointment:', error);
    console.error('❌ Client: Error details:', error.message);
    throw error;
  }
}

/**
 * Get schedule data from database
 * @returns {Promise<Object>} - API response with schedule data
 */
export async function getSchedule() {
  try {
    const response = await checkAppointmentConfiguration();
    return response;
  } catch (error) {
    console.error('Error getting schedule:', error);
    throw error;
  }
}
