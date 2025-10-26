import React, { useState, useEffect } from 'react';
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
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import { PictureAsPdf, NavigateBefore, NavigateNext } from '@mui/icons-material';

const AdminMealTracker = ({
  meals,
  mealsLoading,
  mealsError,
  currentWeek,
  onWeekChange,
  onGeneratePDF,
  onFetchMeals,
  userId,
}) => {
  // Get date range for a specific week
  const getWeekDateRange = (weekNumber) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + (weekNumber - 1) * 7));
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short' 
      });
    };
    
    return {
      start: formatDate(startOfWeek),
      end: formatDate(endOfWeek),
      startDate: startOfWeek,
      endDate: endOfWeek
    };
  };

  // Get meals data for a specific week
  const getWeekMealsData = (weekNumber) => {
    console.log('🔍 getWeekMealsData called with weekNumber:', weekNumber);
    console.log('🔍 Current meals state:', meals);
    console.log('🔍 Meals keys:', Object.keys(meals || {}));
    
    if (!meals || Object.keys(meals).length === 0) {
      console.log('⚠️ No meals data available');
      return {};
    }
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + (weekNumber - 1) * 7));
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    
    const weekData = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    daysOfWeek.forEach((day, dayIndex) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + dayIndex);
      const dateStr = dayDate.toISOString().split('T')[0];
      
      if (meals[dateStr]) {
        weekData[day] = meals[dateStr];
      }
    });
    
    console.log('🔍 Week data for week', weekNumber, ':', weekData);
    return weekData;
  };

  // Handle week change
  const handleWeekChange = (newWeek) => {
    onWeekChange(newWeek);
    
    // Calculate date range for the new week
    const dateRange = getWeekDateRange(newWeek);
    const startDate = dateRange.startDate.toISOString().split('T')[0];
    const endDate = dateRange.endDate.toISOString().split('T')[0];
    
    // Fetch meals for the new week
    onFetchMeals({ 
      userId, 
      startDate, 
      endDate 
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Meal Tracker</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdf />}
          onClick={() => onGeneratePDF('Meal Tracker', 'meal-tracker-content')}
          sx={{ textTransform: 'none' }}
        >
          Generate PDF
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Week Navigator */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6">
                    Meal Tracker - Week {currentWeek} of 4
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(() => {
                      const dateRange = getWeekDateRange(currentWeek);
                      return `${dateRange.start} to ${dateRange.end}`;
                    })()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleWeekChange(Math.max(1, currentWeek - 1))}
                    disabled={currentWeek === 1}
                    startIcon={<NavigateBefore />}
                  >
                    Previous Week
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleWeekChange(Math.min(4, currentWeek + 1))}
                    disabled={currentWeek === 4}
                    endIcon={<NavigateNext />}
                  >
                    Next Week
                  </Button>
                </Box>
              </Box>
              
              {/* Week Progress Indicator */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[1, 2, 3, 4].map((week) => {
                  const dateRange = getWeekDateRange(week);
                  return (
                    <Tooltip 
                      key={week}
                      title={`Week ${week}: ${dateRange.start} to ${dateRange.end}`}
                      placement="top"
                    >
                      <Box
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: week <= currentWeek ? 'primary.main' : 'grey.300',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: week <= currentWeek ? 'primary.dark' : 'grey.400',
                            height: 12
                          }
                        }}
                        onClick={() => handleWeekChange(week)}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Meal Breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Week {currentWeek} - Daily Meal Breakdown
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  ({(() => {
                    const dateRange = getWeekDateRange(currentWeek);
                    return `${dateRange.start} to ${dateRange.end}`;
                  })()})
                </Typography>
              </Typography>
              
              {mealsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Loading meal data...
                  </Typography>
                </Box>
              ) : mealsError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Error loading meals: {mealsError}
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {(() => {
                    const weekData = getWeekMealsData(currentWeek);
                    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    
                    return daysOfWeek.map((day, dayIndex) => {
                      const dayData = weekData[day] || {
                        breakfast: { name: 'No data', calories: 0 },
                        lunch: { name: 'No data', calories: 0 },
                        dinner: { name: 'No data', calories: 0 },
                        snacks: { name: 'No data', calories: 0 }
                      };
                      
                      const totalCalories = ((dayData.breakfast?.calories || 0) * (dayData.breakfast?.quantity || 1)) + 
                                           ((dayData.lunch?.calories || 0) * (dayData.lunch?.quantity || 1)) + 
                                           ((dayData.dinner?.calories || 0) * (dayData.dinner?.quantity || 1)) + 
                                           ((dayData.snacks?.calories || 0) * (dayData.snacks?.quantity || 1));
                    
                      return (
                        <Grid item xs={12} md={6} lg={4} key={day}>
                          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              {day}
                            </Typography>
                            
                            <Stack spacing={1.5}>
                              {/* Breakfast */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Breakfast
                                </Typography>
                                <Chip 
                                  label={`${(dayData.breakfast?.calories || 0) * (dayData.breakfast?.quantity || 1)} cal`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {dayData.breakfast?.name || 'No data'}
                              </Typography>
                              
                              {/* Lunch */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Lunch
                                </Typography>
                                <Chip 
                                  label={`${(dayData.lunch?.calories || 0) * (dayData.lunch?.quantity || 1)} cal`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {dayData.lunch?.name || 'No data'}
                              </Typography>
                              
                              {/* Dinner */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Dinner
                                </Typography>
                                <Chip 
                                  label={`${(dayData.dinner?.calories || 0) * (dayData.dinner?.quantity || 1)} cal`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {dayData.dinner?.name || 'No data'}
                              </Typography>
                              
                              {/* Snacks */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Snacks
                                </Typography>
                                <Chip 
                                  label={`${(dayData.snacks?.calories || 0) * (dayData.snacks?.quantity || 1)} cal`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {dayData.snacks?.name || 'No data'}
                              </Typography>
                              
                              <Divider sx={{ my: 1 }} />
                              
                              {/* Total Calories */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight="medium">
                                  Total
                                </Typography>
                                <Chip 
                                  label={`${totalCalories} cal`} 
                                  size="small" 
                                  color="secondary"
                                />
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    });
                  })()}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminMealTracker;
