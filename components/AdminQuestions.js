import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';

const AdminQuestions = ({
  adminQuestions,
  adminQuestionsLoading,
  adminQuestionsError,
  onDeleteQuestion,
  onGeneratePDF,
  formatDate,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Questions</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdf />}
          onClick={() => onGeneratePDF('Questions', 'questions-content')}
          sx={{ textTransform: 'none' }}
        >
          Generate PDF
        </Button>
      </Box>
      
      {adminQuestionsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading questions data...
          </Typography>
        </Box>
      ) : adminQuestionsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading questions: {adminQuestionsError}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {adminQuestions && adminQuestions.length > 0 ? (
                  <Stack spacing={2}>
                    {adminQuestions.map((question, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider', 
                          borderRadius: 2,
                          backgroundColor: 'background.paper'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" color="primary">
                            {formatDate(question.createdAt)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {question.answered ? (
                              <Chip 
                                label="Answered" 
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => onDeleteQuestion(question._id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Delete
                              </Button>
                            )}
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          <strong>Question:</strong> {question.questions || 'No question text available'}
                        </Typography>
                        
                        {question.category && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Category:</Typography>
                            <Chip 
                              label={question.category} 
                              size="small" 
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        )}
                        
                        {question.answer && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Answer:</strong>
                            </Typography>
                            <Typography variant="body2">
                              {question.answer}
                            </Typography>
                          </Box>
                        )}
                        
                        {question.answeredAt && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Answered on: {formatDate(question.answeredAt)}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No questions found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No questions have been submitted recently.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminQuestions;
