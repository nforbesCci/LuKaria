'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { saveMeals, fetchMeals } from '../../store/slices/mealsSlice';
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
  InputLabel,
  Select,
  MenuItem,
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
  CalendarToday,
} from '@mui/icons-material';

export default function MealTracker() {
  const { user, isLoading, error } = useUser();
  
  // Access control - Admin or Patient with consultation
  useConsultationAccess();
  const dispatch = useDispatch();
  const mealsState = useSelector((state) => state.meals);
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
    unit: 'servings',
    mealType: 'breakfast',
    notes: ''
  });
  const [foodSearchResults, setFoodSearchResults] = useState([]);
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const [showFoodResults, setShowFoodResults] = useState(false);
  const [mealItems, setMealItems] = useState([]); // Track multiple items in a meal

  useEffect(() => {
    setMounted(true);
    setSelectedDate(new Date());
    
    // Fetch meals from database when component mounts
    if (user) {
      dispatch(fetchMeals());
    }
  }, [user, dispatch]);

  // Load meals from Redux store for selected date
  useEffect(() => {
    if (selectedDate && mealsState.meals) {
      const dateKey = formatDateKey(selectedDate);
      setMeals(mealsState.meals[dateKey] || []);
    }
  }, [selectedDate, mealsState.meals]);

  // Check for scanned product data from barcode scanner or returning to add meal form
  useEffect(() => {
    const scannedProduct = localStorage.getItem('scannedProductForMeal');
    const formData = localStorage.getItem('mealFormData');
    
    if (mounted) {
      // Case 1: User scanned/selected a product
      if (scannedProduct) {
        try {
          const productData = JSON.parse(scannedProduct);
          console.log('📦 Received product from barcode scanner:', productData);
          
          // Always use servings as unit
          let unit = 'servings';
          
          // Build notes with brand info if available
          let notes = `Scanned from barcode: ${productData.barcode || 'unknown'}`;
          if (productData.brand) {
            notes += ` | Brand: ${productData.brand}`;
          }
          if (productData.source) {
            notes += ` | Source: ${productData.source}`;
          }
          
          let restoredFormData = {
            name: productData.name || 'Unknown Product',
            calories: (productData.calories || 0).toString(),
            quantity: '1',
            unit: unit,
            mealType: 'breakfast',
            notes: notes
          };
          
          // Restore previous form data if available
          if (formData) {
            try {
              const parsedFormData = JSON.parse(formData);
              restoredFormData = {
                ...restoredFormData,
                quantity: parsedFormData.quantity || '1',
                mealType: parsedFormData.mealType || 'breakfast',
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
          
          console.log('✅ Populating meal form with:', restoredFormData);
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
      // Case 2: User clicked "Back to Add Meal" without selecting a product
      else if (formData) {
        try {
          const parsedFormData = JSON.parse(formData);
          console.log('🔙 Returning to add meal form:', parsedFormData);
          
          setNewMeal({
            name: parsedFormData.name || '',
            calories: parsedFormData.calories || '',
            quantity: parsedFormData.quantity || '',
            unit: parsedFormData.unit || 'servings',
            mealType: parsedFormData.mealType || 'breakfast',
            notes: parsedFormData.notes || ''
          });
          
          // Restore editing state
          if (parsedFormData.isEditing) {
            setEditingMeal({ id: Date.now() }); // Placeholder for editing
          }
          
          // Restore selected date
          if (parsedFormData.selectedDate) {
            setSelectedDate(new Date(parsedFormData.selectedDate));
          }
          
          setIsAddingMeal(true);
          
          // Clear the localStorage data
          localStorage.removeItem('mealFormData');
        } catch (error) {
          console.error('Error parsing form data:', error);
          localStorage.removeItem('mealFormData');
        }
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
      unit: 'servings',
      mealType: 'breakfast',
      notes: ''
    });
    setFoodSearchResults([]);
    setShowFoodResults(false);
    setMealItems([]); // Clear any previous meal items
  };

  const handleAddItemToMeal = () => {
    if (!newMeal.name.trim()) {
      alert('Please enter an item name');
      return;
    }

    if (!newMeal.calories || newMeal.calories <= 0) {
      alert('Please enter a valid calorie count');
      return;
    }

    if (!newMeal.quantity || newMeal.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newMeal.name,
      calories: parseFloat(newMeal.calories),
      quantity: parseFloat(newMeal.quantity),
      unit: newMeal.unit,
      notes: newMeal.notes
    };

    setMealItems([...mealItems, newItem]);
    
    // Clear the form for next item, but keep mealType
    setNewMeal({
      name: '',
      calories: '',
      quantity: '',
      unit: 'servings',
      mealType: newMeal.mealType,
      notes: ''
    });
    
    setFoodSearchResults([]);
    setShowFoodResults(false);
  };

  const handleRemoveItemFromMeal = (itemId) => {
    setMealItems(mealItems.filter(item => item.id !== itemId));
  };

  const handleSaveMeal = () => {
    // If there are items in the list, save them all
    if (mealItems.length > 0) {
      const newMeals = mealItems.map(item => ({
        ...item,
        id: Date.now() + Math.random(), // Ensure unique IDs
        mealType: newMeal.mealType,
        date: selectedDate.toISOString()
      }));

      const updatedMeals = [...meals, ...newMeals];
      setMeals(updatedMeals);
      
      console.log('Saving meals:', newMeals);
      console.log('Updated meals for date:', formatDateKey(selectedDate), updatedMeals);
      
      // Dispatch action to save to database
      dispatch(saveMeals({
        date: formatDateKey(selectedDate),
        meals: updatedMeals
      }));
      
      setIsAddingMeal(false);
      setNewMeal({ name: '', calories: '', quantity: '', unit: 'servings', mealType: 'breakfast', notes: '' });
      setMealItems([]);
      setFoodSearchResults([]);
      setShowFoodResults(false);
    } else {
      // If no items in list but form is filled, save current item
      if (!newMeal.name.trim()) {
        alert('Please add at least one item to the meal');
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
      
      console.log('Saving meal:', meal);
      console.log('Updated meals for date:', formatDateKey(selectedDate), updatedMeals);
      
      // Dispatch action to save to database
      dispatch(saveMeals({
        date: formatDateKey(selectedDate),
        meals: updatedMeals
      }));
      
      setIsAddingMeal(false);
      setNewMeal({ name: '', calories: '', quantity: '', unit: 'servings', mealType: 'breakfast', notes: '' });
      setFoodSearchResults([]);
      setShowFoodResults(false);
    }
  };

  const handleDeleteMeal = (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
      
      console.log('Deleted meal:', mealId);
      
      // Dispatch action to save to database
      dispatch(saveMeals({
        date: formatDateKey(selectedDate),
        meals: updatedMeals
      }));
      
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
    
    // Dispatch action to save to database
    dispatch(saveMeals({
      date: formatDateKey(selectedDate),
      meals: updatedMeals
    }));
    
    setIsAddingMeal(false);
    setEditingMeal(null);
    setNewMeal({ name: '', calories: '', quantity: '', unit: 'servings', mealType: 'breakfast', notes: '' });
    setMealItems([]);
    setFoodSearchResults([]);
    setShowFoodResults(false);
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

  const handleFoodSearch = async () => {
    const itemName = newMeal.name.trim();
    
    // Only search if there's a valid search term
    if (!itemName || itemName.length < 3) {
      setFoodSearchResults([]);
      setShowFoodResults(false);
      return;
    }
    
    setIsSearchingFood(true);
    setShowFoodResults(true);
    
    try {
      console.log('🔍 Searching for food:', itemName);
      const response = await fetch(`/api/food/search?query=${encodeURIComponent(itemName)}&pageSize=10`);
      
      if (!response.ok) {
        throw new Error('Failed to search for food');
      }
      
      const data = await response.json();
      console.log('✅ Food search results:', data);
      
      setFoodSearchResults(data.foods || []);
    } catch (error) {
      console.error('❌ Error searching for food:', error);
      alert('Failed to search for food. Please try again.');
      setFoodSearchResults([]);
    } finally {
      setIsSearchingFood(false);
    }
  };

  const handleSelectFood = (food) => {
    // Auto-populate the form with selected food data
    setNewMeal({
      ...newMeal,
      name: food.description,
      calories: food.calories.toString() || '',
      quantity: food.servingSize?.toString() || '100',
      unit: 'servings',
      notes: food.brandName ? `Brand: ${food.brandName}` : ''
    });
    
    setShowFoodResults(false);
    setFoodSearchResults([]);
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
                    setNewMeal({ name: '', calories: '', quantity: '', unit: 'servings', mealType: 'breakfast', notes: '' });
    setMealItems([]);
                    setFoodSearchResults([]);
                    setShowFoodResults(false);
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

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <TextField
                      label="Item"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                      onBlur={handleFoodSearch}
                      placeholder="e.g., Grilled Chicken Breast"
                      sx={{ flexGrow: 1, minWidth: 200 }}
                      helperText="Type food name and click away to search for nutritional info or by barcode"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<QrCodeScanner />}
                      onClick={handleBarcodeLookup}
                      sx={{ 
                        textTransform: 'none',
                        height: '56px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Scan Barcode
                    </Button>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={newMeal.quantity}
                      onChange={(e) => setNewMeal({...newMeal, quantity: e.target.value})}
                      inputProps={{ step: "0.1", min: "0" }}
                      sx={{ width: 120 }}
                    />
                    <FormControl sx={{ width: 120 }}>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={newMeal.unit}
                        onChange={(e) => setNewMeal({...newMeal, unit: e.target.value})}
                        label="Unit"
                      >
                        <MenuItem value="servings">servings</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Calories per serving"
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                      inputProps={{ step: "0.1", min: "0" }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">cal/serving</InputAdornment>
                      }}
                      sx={{ flexGrow: 1, minWidth: 150 }}
                    />
                  </Box>

                  {/* Food Search Results */}
                  {showFoodResults && (
                    <Paper elevation={3} sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                      {isSearchingFood ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                          <CircularProgress size={24} sx={{ mr: 2 }} />
                          <Typography>Searching food database...</Typography>
                        </Box>
                      ) : foodSearchResults.length > 0 ? (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              Found {foodSearchResults.length} results
                            </Typography>
                            <IconButton size="small" onClick={() => setShowFoodResults(false)}>
                              <Close />
                            </IconButton>
                          </Box>
                          <List dense>
                            {foodSearchResults.map((food, index) => (
                              <ListItem
                                key={food.fdcId}
                                button
                                onClick={() => handleSelectFood(food)}
                                divider={index < foodSearchResults.length - 1}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                    cursor: 'pointer'
                                  }
                                }}
                              >
                                <ListItemIcon>
                                  <Restaurant color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={food.description}
                                  secondary={
                                    <Box>
                                      {food.brandName && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          Brand: {food.brandName}
                                        </Typography>
                                      )}
                                      <Typography variant="body2" component="span">
                                        Calories: {Math.round(food.calories)} cal
                                        {food.servingSize && ` per ${food.servingSize}${food.servingSizeUnit || ''}`}
                                      </Typography>
                                      {(food.protein > 0 || food.carbs > 0 || food.fat > 0) && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          P: {food.protein?.toFixed(1)}g | C: {food.carbs?.toFixed(1)}g | F: {food.fat?.toFixed(1)}g
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Typography color="text.secondary">
                            No results found for "{newMeal.name}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Try a different search term or enter nutritional info manually
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  )}

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

                  {/* Items Added to Meal */}
                  {!editingMeal && mealItems.length > 0 && (
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Items in this meal ({mealItems.length})
                      </Typography>
                      <List dense>
                        {mealItems.map((item, index) => (
                          <ListItem
                            key={item.id}
                            divider={index < mealItems.length - 1}
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                size="small" 
                                onClick={() => handleRemoveItemFromMeal(item.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <Restaurant fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.name}
                              secondary={`${item.quantity} ${item.unit} • ${Math.round(item.calories * item.quantity)} cal`}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Box sx={{ mt: 2, p: 1, backgroundColor: 'primary.50', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Total: {Math.round(mealItems.reduce((sum, item) => sum + (item.calories * item.quantity), 0))} calories
                        </Typography>
                      </Box>
                    </Paper>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                    {!editingMeal && (
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddItemToMeal}
                        sx={{ textTransform: 'none' }}
                      >
                        Add Item to Meal
                      </Button>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsAddingMeal(false);
                        setEditingMeal(null);
                        setNewMeal({ name: '', calories: '', quantity: '', unit: 'servings', mealType: 'breakfast', notes: '' });
    setMealItems([]);
                        setFoodSearchResults([]);
                        setShowFoodResults(false);
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
                      {editingMeal ? 'Update Meal' : (mealItems.length > 0 ? 'Save Meal' : 'Add Meal')}
                    </Button>
                    </Box>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: '#877449' }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0],
                  min: getFirstLoginDate().toISOString().split('T')[0]
                }}
                sx={{ 
                  width: 200,
                  '& .MuiInputBase-input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(55%) sepia(18%) saturate(1019%) hue-rotate(8deg) brightness(92%) contrast(85%)',
                    cursor: 'pointer',
                  },
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiInputBase-input::-webkit-calendar-picker-indicator': {
                      filter: 'invert(55%) sepia(18%) saturate(1019%) hue-rotate(8deg) brightness(92%) contrast(85%)',
                    },
                    '&.Mui-focused .MuiInputBase-input::-webkit-calendar-picker-indicator': {
                      filter: 'invert(55%) sepia(18%) saturate(1019%) hue-rotate(8deg) brightness(92%) contrast(85%)',
                    },
                  },
                }}
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
