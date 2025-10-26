import { call, put, takeEvery, all } from 'redux-saga/effects';
import { 
  fetchAdminQuestionsSuccess, 
  fetchAdminQuestionsFailure,
  deleteAdminQuestion,
  deleteAdminQuestionSuccessAction,
  deleteAdminQuestionFailureAction
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

// API call to delete a question for a specific user (admin function)
function* deleteAdminQuestionFromDatabase(userId, questionId) {
  try {
    const response = yield call(fetch, `/api/admin/questions/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionId }),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Questions Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error deleting admin question from database:', error);
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

// Saga to handle admin question deletion
function* deleteAdminQuestionSaga(action) {
  try {
    console.log('🚀 DELETE ADMIN QUESTION SAGA TRIGGERED!', action);
    const { userId, questionId } = action.payload;
    console.log('🔄 Admin Questions Saga: Starting question deletion for user:', userId, 'questionId:', questionId);
    
    // Note: Optimistic update removed to prevent infinite loop
    // The UI will be updated when the API call succeeds
    
    const result = yield call(deleteAdminQuestionFromDatabase, userId, questionId);
    
    console.log('✅ Admin Questions Saga: Question deleted successfully', result);
    
    yield put(deleteAdminQuestionSuccessAction({
      userId,
      questionId,
      message: result.message
    }));
  } catch (error) {
    console.error('❌ Admin Questions Saga: Error deleting question', error);
    yield put(deleteAdminQuestionFailureAction(error.message));
  }
}

// Watch for admin questions actions
export function* watchFetchAdminQuestions() {
  yield takeEvery('admin/fetchAdminQuestions', fetchAdminQuestionsSaga);
}

export function* watchDeleteAdminQuestion() {
  console.log('🔧 Setting up deleteAdminQuestion watcher');
  yield takeEvery('admin/deleteAdminQuestion', deleteAdminQuestionSaga);
}


export default function* adminQuestionsSaga() {
  yield all([
    watchFetchAdminQuestions(),
    watchDeleteAdminQuestion(),
  ]);
  console.log('🔧 Admin Questions Saga: All watchers set up');
}
