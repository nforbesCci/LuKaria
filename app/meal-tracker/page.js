'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  Paper,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Restaurant,
  Add,
  Edit,
  Delete,
  QrCodeScanner,
  LocalFireDepartment,
  NavigateBefore,
  NavigateNext,
  CheckCircle,
  Close,
} from '@mui/icons-material';

export default function MealTracker() {
  const { user, isLoading, error } = useUser();
  
  // Access control - Admin or Patient with consultation
  useConsultationAccess();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [meals, setMeals] = useState([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    quantity: '',
    unit: 'g',
    mealType: 'breakfast',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
    setSelectedDate(new Date());
  }, []);

  // Load user's meals from Auth0 metadata
  useEffect(() => {
    if (user && selectedDate) {
      const savedMeals = user.user_metadata?.meals || {};
      const dateKey = formatDateKey(selectedDate);
      setMeals(savedMeals[dateKey] || []);
    }
  }, [user, selectedDate]);

  // Check for scanned product data from barcode scanner
  useEffect(() => {
    const scannedProduct = localStorage.getItem('scannedProductForMeal');
    const formData = localStorage.getItem('mealFormData');
    
    if (scannedProduct && mounted) {
      try {
        const productData = JSON.parse(scannedProduct);
        let restoredFormData = {
          name: productData.name,
          calories: productData.calories.toString(),
          quantity: '1',
          unit: productData.servingSize.includes('g') ? 'g' : 'serving',
          mealType: 'breakfast',
          notes: `Scanned from barcode: ${productData.barcode}`
        };
        
        // Restore previous form data if available
        if (formData) {
          try {
            const parsedFormData = JSON.parse(formData);
            restoredFormData = {
              ...parsedFormData,
              name: productData.name,
              calories: productData.calories.toString(),
              quantity: parsedFormData.quantity || '1',
              unit: productData.servingSize.includes('g') ? 'g' : 'serving',
              notes: `Scanned from barcode: ${productData.barcode}`
            };
            
            // Restore editing state
            if (parsedFormData.isEditing) {
              setEditingMeal({ id: Date.now() }); // Placeholder for editing
            }
            
            // Restore selected date
            if (parsedFormData.selectedDate) {
              setSelectedDate(new Date(parsedFormData.selectedDate));
            }
          } catch (error) {
            console.error('Error parsing form data:', error);
          }
        }
        
        setNewMeal(restoredFormData);
        setIsAddingMeal(true);
        
        // Clear the localStorage data
        localStorage.removeItem('scannedProductForMeal');
        localStorage.removeItem('mealFormData');
      } catch (error) {
        console.error('Error parsing scanned product data:', error);
        localStorage.removeItem('scannedProductForMeal');
        localStorage.removeItem('mealFormData');
      }
    }
  }, [mounted]);

  // Get user's first login date for calendar range
  const getFirstLoginDate = () => {
    if (user?.created_at) {
      return new Date(user.created_at);
    }
    // Fallback to 30 days ago if no created_at
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo;
  };

  const formatDateKey = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (newDate) => {
    if (newDate && newDate <= new Date()) {
      setSelectedDate(newDate);
      // Load meals for the new date
      if (user) {
        const savedMeals = user.user_metadata?.meals || {};
        const dateKey = formatDateKey(newDate);
        setMeals(savedMeals[dateKey] || []);
      }
    }
  };

  const handleAddMeal = () => {
    setIsAddingMeal(true);
    setNewMeal({
      name: '',
      calories: '',
      quantity: '',
      unit: 'g',
      mealType: 'breakfast',
      notes: ''
    });
  };

  const handleSaveMeal = () => {
    if (!newMeal.name.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (!newMeal.calories || newMeal.calories <= 0) {
      alert('Please enter a valid calorie count');
      return;
    }

    const meal = {
      ...newMeal,
      id: Date.now(),
      calories: parseFloat(newMeal.calories),
      quantity: parseFloat(newMeal.quantity) || 1,
      date: selectedDate.toISOString()
    };

    const updatedMeals = [...meals, meal];
    setMeals(updatedMeals);
    
    // Save to user metadata (in a real app, this would be an API call)
    console.log('Saving meal:', meal);
    console.log('Updated meals for date:', formatDateKey(selectedDate), updatedMeals);
    
    setIsAddingMeal(false);
    setNewMeal({ name: '', calories: '', quantity: '', unit: 'g', mealType: 'breakfast', notes: '' });
  };

  const handleDeleteMeal = (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
      
      console.log('Deleted meal:', mealId);
      alert('Meal deleted successfully!');
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setNewMeal({
      name: meal.name,
      calories: meal.calories.toString(),
      quantity: meal.quantity.toString(),
      unit: meal.unit,
      mealType: meal.mealType,
      notes: meal.notes || ''
    });
    setIsAddingMeal(true);
  };

  const handleUpdateMeal = () => {
    if (!newMeal.name.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (!newMeal.calories || newMeal.calories <= 0) {
      alert('Please enter a valid calorie count');
      return;
    }

    const updatedMeal = {
      ...editingMeal,
      ...newMeal,
      calories: parseFloat(newMeal.calories),
      quantity: parseFloat(newMeal.quantity) || 1,
    };

    const updatedMeals = meals.map(meal => 
      meal.id === editingMeal.id ? updatedMeal : meal
    );
    setMeals(updatedMeals);
    
    console.log('Updated meal:', updatedMeal);
    
    setIsAddingMeal(false);
    setEditingMeal(null);
    setNewMeal({ name: '', calories: '', quantity: '', unit: 'g', mealType: 'breakfast', notes: '' });
  };

  const handleBarcodeLookup = () => {
    // Store current meal form data in localStorage before navigating
    const currentFormData = {
      ...newMeal,
      selectedDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
      isEditing: !!editingMeal
    };
    
    localStorage.setItem('mealFormData', JSON.stringify(currentFormData));
    
    // Navigate to barcode scanner page
    router.push('/barcode-scanner?returnTo=meal-tracker');
  };

  // Calculate total calories for the day
  const totalCalories = meals.reduce((total, meal) => total + (meal.calories * meal.quantity), 0);

  // Group meals by meal type
  const mealsByType = {
    breakfast: meals.filter(meal => meal.mealType === 'breakfast'),
    lunch: meals.filter(meal => meal.mealType === 'lunch'),
    dinner: meals.filter(meal => meal.mealType === 'dinner'),
    snack: meals.filter(meal => meal.mealType === 'snack')
  };

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' },
    { key: 'snack', label: 'Snack', icon: '🍿' }
  ];

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading meal tracker...
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading meal tracker: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom color="primary">
              Access Denied
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Please log in to track your meals.
            </Typography>
            <Button
              href="/api/auth/login"
              variant="contained"
              size="large"
              startIcon={<Person />}
              sx={{ textTransform: 'none' }}
            >
              Log In
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  if (!mounted || !selectedDate) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading meal tracker...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {isAddingMeal ? (
          // Add/Edit Meal Form
          <>
            {/* Header Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      mr: 3, 
                      backgroundColor: 'primary.main' 
                    }}
                  >
                    <Restaurant sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {editingMeal ? 'Edit Meal' : 'Add New Meal'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user.name || 'User'} • {formatDisplayDate(selectedDate)}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Close />}
                  onClick={() => {
                    setIsAddingMeal(false);
                    setEditingMeal(null);
                    setNewMeal({ name: '', calories: '', quantity: '', unit: 'g', mealType: 'breakfast', notes: '' });
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>

            {/* Meal Form */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Meal Name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                    placeholder="e.g., Grilled Chicken Breast"
                  />
                  
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Meal Type</FormLabel>
                    <RadioGroup
                      row
                      value={newMeal.mealType}
                      onChange={(e) => setNewMeal({...newMeal, mealType: e.target.value})}
                    >
                      {mealTypes.map(type => (
                        <FormControlLabel 
                          key={type.key} 
                          value={type.key} 
                          control={<Radio />} 
                          label={`${type.icon} ${type.label}`} 
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={newMeal.quantity}
                      onChange={(e) => setNewMeal({...newMeal, quantity: e.target.value})}
                      inputProps={{ step: "0.1", min: "0" }}
                      sx={{ width: 120 }}
                    />
                    <TextField
                      label="Unit"
                      value={newMeal.unit}
                      onChange={(e) => setNewMeal({...newMeal, unit: e.target.value})}
                      sx={{ width: 100 }}
                    />
                    <TextField
                      label="Calories per unit"
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                      inputProps={{ step: "0.1", min: "0" }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">cal/{newMeal.unit}</InputAdornment>
                      }}
                      sx={{ flexGrow: 1 }}
                    />
                  </Box>

                  {newMeal.quantity && newMeal.calories && (
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total calories: {Math.round(newMeal.quantity * newMeal.calories)}
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Notes (optional)"
                    multiline
                    rows={2}
                    value={newMeal.notes}
                    onChange={(e) => setNewMeal({...newMeal, notes: e.target.value})}
                    placeholder="Any additional notes about this meal..."
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<QrCodeScanner />}
                      onClick={handleBarcodeLookup}
                      sx={{ textTransform: 'none' }}
                    >
                      Scan Barcode
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      Don't know the calories? Use the barcode scanner to find nutritional information!
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsAddingMeal(false);
                        setEditingMeal(null);
                        setNewMeal({ name: '', calories: '', quantity: '', unit: 'g', mealType: 'breakfast', notes: '' });
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingMeal ? handleUpdateMeal : handleSaveMeal} 
                      variant="contained"
                      sx={{ textTransform: 'none' }}
                    >
                      {editingMeal ? 'Update Meal' : 'Add Meal'}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </>
        ) : (
          // Main Meal Tracker View
          <>
            {/* Header Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      mr: 3, 
                      backgroundColor: 'primary.main' 
                    }}
                  >
                    <Restaurant sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h4" 
                      gutterBottom 
                      color="primary"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '2.125rem' },
                        fontWeight: 600
                      }}
                    >
                      Meal Tracker
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user.name || 'User'} • Track your daily meals and calories
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddMeal}
                  sx={{ textTransform: 'none' }}
                >
                  Add Meal
                </Button>
              </Box>
            </Paper>

        {/* Calendar Navigation */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Date
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                onClick={() => {
                  if (selectedDate) {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    if (prevDate >= getFirstLoginDate()) {
                      handleDateChange(prevDate);
                    }
                  }
                }}
                disabled={!selectedDate || selectedDate <= getFirstLoginDate()}
                sx={{ textTransform: 'none' }}
              >
                Previous Day
              </Button>
              
              <TextField
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (newDate <= new Date() && newDate >= getFirstLoginDate()) {
                    handleDateChange(newDate);
                  }
                }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0],
                  min: getFirstLoginDate().toISOString().split('T')[0]
                }}
                sx={{ width: 200 }}
              />
              
              <Button
                variant="outlined"
                endIcon={<NavigateNext />}
                onClick={() => {
                  if (selectedDate) {
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    if (nextDate <= new Date()) {
                      handleDateChange(nextDate);
                    }
                  }
                }}
                disabled={!selectedDate || selectedDate >= new Date()}
                sx={{ textTransform: 'none' }}
              >
                Next Day
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {formatDisplayDate(selectedDate)}
            </Typography>
          </CardContent>
        </Card>

        {/* Daily Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocalFireDepartment sx={{ fontSize: 40, color: 'orange', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Total Calories
                </Typography>
                <Typography variant="h4" color="primary">
                  {Math.round(totalCalories)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {meals.length} meals logged
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Restaurant sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Meal Types
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                  {mealTypes.map(type => (
                    <Chip 
                      key={type.key}
                      label={`${type.icon} ${mealsByType[type.key].length}`}
                      size="small"
                      variant={mealsByType[type.key].length > 0 ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Meals by Type */}
        {mealTypes.map(type => (
          <Card key={type.key} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    {type.icon}
                  </Typography>
                  <Typography variant="h6">
                    {type.label}
                  </Typography>
                  <Chip 
                    label={`${mealsByType[type.key].length} items`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={handleAddMeal}
                  sx={{ textTransform: 'none' }}
                >
                  Add {type.label}
                </Button>
              </Box>
              
              {mealsByType[type.key].length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    No {type.label.toLowerCase()} logged for this day
                  </Typography>
                </Box>
              ) : (
                <List>
                  {mealsByType[type.key].map((meal, index) => (
                    <ListItem key={meal.id} divider={index < mealsByType[type.key].length - 1}>
                      <ListItemIcon>
                        <Restaurant />
                      </ListItemIcon>
                      <ListItemText
                        primary={meal.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {meal.quantity} {meal.unit} • {Math.round(meal.calories * meal.quantity)} calories
                            </Typography>
                            {meal.notes && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {meal.notes}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleEditMeal(meal)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteMeal(meal.id)} size="small" color="error">
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        ))}
          </>
        )}
      </Container>
    </>
  );
}
