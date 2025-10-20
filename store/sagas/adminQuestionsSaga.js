import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminQuestionsSuccess, 
  fetchAdminQuestionsFailure
} from '../slices/adminSlice';

// API call to fetch questions for a specific user (admin function)
function* fetchAdminQuestionsFromDatabase(userId, options = {}) {
  try {
    const { limit = 10 } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('limit', limit);
    
    const response = yield call(fetch, `/api/admin/questions/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Questions Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin questions from database:', error);
    throw error;
  }
}

// Saga to handle admin questions fetching
function* fetchAdminQuestionsSaga(action) {
  try {
    const { userId, limit = 10 } = action.payload;
    console.log('🔄 Admin Questions Saga: Starting questions fetch for user:', userId, `limit: ${limit}`);
    
    const result = yield call(fetchAdminQuestionsFromDatabase, userId, { limit });
    
    console.log('✅ Admin Questions Saga: Questions fetched successfully', result);
    console.log('📋 Saga received questions data:', {
      questionsCount: result.questions ? result.questions.length : 0,
      questionsSample: result.questions ? result.questions.slice(0, 2) : 'no questions'
    });
    
    yield put(fetchAdminQuestionsSuccess({
      userId,
      questions: result.questions,
      limit: result.limit
    }));
  } catch (error) {
    console.error('❌ Admin Questions Saga: Error fetching questions', error);
    yield put(fetchAdminQuestionsFailure(error.message));
  }
}

// Watch for admin questions actions
export function* watchFetchAdminQuestions() {
  yield takeEvery('admin/fetchAdminQuestions', fetchAdminQuestionsSaga);
}

export default function* adminQuestionsSaga() {
  yield watchFetchAdminQuestions();
}
