'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveMeals, fetchMeals } from '../../store/slices/mealsSlice';
import Header from '../../components/Header';
import BarcodeScanner from '../../components/BarcodeScanner';
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
  CalendarToday,
} from '@mui/icons-material';

export default function MealTracker() {
  const { user, isLoading, error } = useUser();
  
  // Access control - Admin or Patient with consultation
  useConsultationAccess();
  const dispatch = useDispatch();
  const mealsState = useSelector((state) => state.meals);
  const [mounted, setMounted] = useState(false);
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
  const [foodSearchResults, setFoodSearchResults] = useState([]);
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const [showFoodResults, setShowFoodResults] = useState(false);
  const [mealItems, setMealItems] = useState([]); // Track multiple items in a meal
  const [searchMethod, setSearchMethod] = useState('name'); // 'name' or 'barcode'
  const [isBarcodeScannerView, setIsBarcodeScannerView] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSelectedDate(new Date());
    
    // Fetch last 2 weeks of meals from database when component mounts
    if (user) {
      console.log('📅 Fetching last 2 weeks of meals...');
      dispatch(fetchMeals({ daysBack: 14 }));
    }
  }, [user, dispatch]);

  // Load meals from Redux store for selected date
  useEffect(() => {
    if (selectedDate && mealsState.meals) {
      const dateKey = formatDateKey(selectedDate);
      const mealsForDate = mealsState.meals[dateKey] || [];
      console.log(`📅 Loading meals from store for ${dateKey}:`, mealsForDate.length, 'meals');
      setMeals(mealsForDate);
    }
  }, [selectedDate, mealsState.meals]);


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
    
    // Start with no meal type selected - user must choose
    setNewMeal({
      name: '',
      calories: '',
      quantity: '',
      unit: 'g',
      mealType: '', // No default meal type
      notes: ''
    });
    setFoodSearchResults([]);
    setShowFoodResults(false);
    setMealItems([]);
    setSearchMethod('name'); // Reset to name search
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
      unit: 'g',
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
        id: item.id || Date.now() + Math.random(), // Use existing ID if available, or generate new
        mealType: newMeal.mealType,
        date: selectedDate.toISOString()
      }));

      // Remove existing meals of this meal type and add new ones
      const mealsWithoutThisType = meals.filter(meal => meal.mealType !== newMeal.mealType);
      const updatedMeals = [...mealsWithoutThisType, ...newMeals];
      setMeals(updatedMeals);
      
      console.log('Saving meals:', newMeals);
      console.log('Updated meals for date:', formatDateKey(selectedDate), updatedMeals);
      
      // Dispatch action to save to database
      dispatch(saveMeals({
        date: formatDateKey(selectedDate),
        meals: updatedMeals
      }));
      
      setIsAddingMeal(false);
      setNewMeal({ name: '', calories: '', quantity: '', unit: 'g', mealType: 'breakfast', notes: '' });
      setMealItems([]);
      setFoodSearchResults([]);
      setShowFoodResults(false);
      setSearchMethod('name');
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
      setSearchMethod('name');
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
    setSearchMethod('name');
  };

  const handleBarcodeLookup = () => {
    // Show barcode scanner view
    setIsBarcodeScannerView(true);
  };

  const handleBarcodeProductSelect = (productData) => {
    console.log('📦 Received product from barcode scanner:', productData);
    
    // Build notes with brand info if available
    let notes = `Scanned from barcode: ${productData.barcode || 'unknown'}`;
    if (productData.brand) {
      notes += ` | Brand: ${productData.brand}`;
    }
    if (productData.source) {
      notes += ` | Source: ${productData.source}`;
    }
    
    // Calculate calories per gram (divide by 100)
    const caloriesPerGram = productData.calories ? (productData.calories / 100).toFixed(2) : 0;
    
    // Populate the form with product data
    setNewMeal({
      ...newMeal,
      name: productData.name || 'Unknown Product',
      calories: caloriesPerGram.toString(),
      quantity: '100',
      unit: 'g',
      notes: notes
    });
    
    // Switch back to name mode to show the populated form
    setSearchMethod('name');
    
    // Close the barcode scanner view
    setIsBarcodeScannerView(false);
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
    // Calculate calories per gram (divide by 100)
    const caloriesPerGram = food.calories ? (food.calories / 100).toFixed(2) : 0;
    
    // Auto-populate the form with selected food data
    setNewMeal({
      ...newMeal,
      name: food.description,
      calories: caloriesPerGram.toString(),
      quantity: '100',
      unit: 'g',
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
    morning_snack: meals.filter(meal => meal.mealType === 'morning_snack' || meal.mealType === 'snack'),
    lunch: meals.filter(meal => meal.mealType === 'lunch'),
    afternoon_snack: meals.filter(meal => meal.mealType === 'afternoon_snack'),
    dinner: meals.filter(meal => meal.mealType === 'dinner'),
    supper: meals.filter(meal => meal.mealType === 'supper'),
  };

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '' },
    { key: 'morning_snack', label: 'Morning snack', icon: '' },
    { key: 'lunch', label: 'Lunch', icon: '' },
    { key: 'afternoon_snack', label: 'Afternoon snack', icon: '' },
    { key: 'dinner', label: 'Dinner', icon: '' },
    { key: 'supper', label: 'Supper', icon: '' },
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
        {isBarcodeScannerView ? (
          // Barcode Scanner View
          <Box>
            <BarcodeScanner 
              onProductSelect={handleBarcodeProductSelect}
              onClose={() => {
                setIsBarcodeScannerView(false);
                setSearchMethod('name'); // Reset to name search when closing
              }}
            />
          </Box>
        ) : isAddingMeal ? (
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
                    setSearchMethod('name');
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
                      onChange={(e) => {
                        const newMealType = e.target.value;
                        setNewMeal({...newMeal, mealType: newMealType});
                        
                        // Check if meals exist for this meal type and load them
                        const existingMealsForType = meals.filter(meal => meal.mealType === newMealType);
                        if (existingMealsForType.length > 0) {
                          console.log(`📋 Meal type changed to ${newMealType}, loading ${existingMealsForType.length} existing meals...`);
                          setMealItems(existingMealsForType.map(meal => ({
                            id: meal.id,
                            name: meal.name,
                            calories: meal.calories,
                            quantity: meal.quantity,
                            unit: meal.unit,
                            notes: meal.notes || ''
                          })));
                        } else {
                          console.log(`📋 Meal type changed to ${newMealType}, no existing meals`);
                          setMealItems([]);
                        }
                      }}
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

                  <FormControl component="fieldset" disabled={!newMeal.mealType}>
                    <FormLabel component="legend">Search by</FormLabel>
                    <RadioGroup
                      row
                      value={searchMethod}
                      onChange={(e) => {
                        const newMethod = e.target.value;
                        setSearchMethod(newMethod);
                        // Auto-open barcode scanner when barcode is selected
                        if (newMethod === 'barcode') {
                          handleBarcodeLookup();
                        }
                      }}
                    >
                      <FormControlLabel 
                        value="name" 
                        control={<Radio />} 
                        label="Name" 
                      />
                      <FormControlLabel 
                        value="barcode" 
                        control={<Radio />} 
                        label="Barcode" 
                      />
                    </RadioGroup>
                  </FormControl>

                  {!newMeal.mealType && (
                    <Alert severity="info">
                      Please select a meal type to continue
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {searchMethod === 'name' ? (
                      <>
                        <TextField
                          label="Item"
                          value={newMeal.name}
                          onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                          onBlur={handleFoodSearch}
                          placeholder="e.g., Grilled Chicken Breast"
                          sx={{ flexGrow: 1, minWidth: 200 }}
                          helperText="Type food name and click away to search for nutritional info"
                          disabled={!newMeal.mealType}
                        />
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<QrCodeScanner />}
                        onClick={handleBarcodeLookup}
                        disabled={!newMeal.mealType}
                        sx={{ 
                          textTransform: 'none',
                          height: '56px',
                          whiteSpace: 'nowrap',
                          flexGrow: 1,
                          minWidth: 200
                        }}
                      >
                        Scan Barcode
                      </Button>
                    )}
                    <TextField
                      label="Quantity (grams)"
                      type="number"
                      value={newMeal.quantity}
                      onChange={(e) => setNewMeal({...newMeal, quantity: e.target.value})}
                      inputProps={{ step: "0.1", min: "0" }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">g</InputAdornment>
                      }}
                      sx={{ width: 150 }}
                      disabled={!newMeal.mealType}
                    />
                    <TextField
                      label="Calories per gram"
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                      inputProps={{ step: "0.01", min: "0" }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">cal/g</InputAdornment>
                      }}
                      sx={{ flexGrow: 1, minWidth: 150 }}
                      disabled={!newMeal.mealType}
                    />
                  </Box>

                  {/* Food Search Results */}
                  {searchMethod === 'name' && showFoodResults && (
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
                    disabled={!newMeal.mealType}
                  />

                  {/* Add Item to Meal Button */}
                  {!editingMeal && (
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddItemToMeal}
                      fullWidth
                      sx={{ textTransform: 'none' }}
                      disabled={!newMeal.mealType}
                    >
                      Add Item to Meal
                    </Button>
                  )}

                  {/* Items Added to Meal */}
                  {!editingMeal && mealItems.length > 0 && (
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#36454F' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#877449' }}>
                        Items in this meal ({mealItems.length})
                      </Typography>
                      <List dense>
                        {mealItems.map((item, index) => (
                          <ListItem
                            key={item.id}
                            divider={index < mealItems.length - 1}
                            sx={{ 
                              borderColor: index < mealItems.length - 1 ? '#877449' : 'transparent'
                            }}
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                size="small" 
                                onClick={() => handleRemoveItemFromMeal(item.id)}
                                sx={{ color: '#FF6B6B' }}
                              >
                                <Delete />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <Restaurant fontSize="small" sx={{ color: '#877449' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.name}
                              secondary={`${item.quantity} ${item.unit === 'g' ? 'grams' : item.unit} • ${Math.round(item.calories * item.quantity)} cal`}
                              primaryTypographyProps={{ sx: { color: '#877449' } }}
                              secondaryTypographyProps={{ sx: { color: '#B8941F' } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Box sx={{ mt: 2, p: 1, backgroundColor: '#877449', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#000' }}>
                          Total: {Math.round(mealItems.reduce((sum, item) => sum + (item.calories * item.quantity), 0))} calories
                        </Typography>
                      </Box>
                    </Paper>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsAddingMeal(false);
                        setEditingMeal(null);
                        setNewMeal({ name: '', calories: '', quantity: '', unit: 'g', mealType: 'breakfast', notes: '' });
                        setMealItems([]);
                        setFoodSearchResults([]);
                        setShowFoodResults(false);
                        setSearchMethod('name');
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingMeal ? handleUpdateMeal : handleSaveMeal} 
                      variant="contained"
                      sx={{ textTransform: 'none' }}
                      disabled={!newMeal.mealType}
                    >
                      {editingMeal ? 'Update Meal' : (mealItems.length > 0 ? 'Save Meal' : 'Add Meal')}
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
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: { xs: 'flex-start', md: 'space-between' },
              gap: 2, 
              mb: 2,
              flexWrap: 'wrap'
            }}>
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
                sx={{ textTransform: 'none', order: { xs: 1, md: 1 } }}
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
                  width: { xs: '100%', md: 'auto' },
                  flexGrow: { xs: 0, md: 1 },
                  maxWidth: { xs: '100%', md: 300 },
                  order: { xs: 3, md: 2 },
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
                sx={{ textTransform: 'none', order: { xs: 2, md: 3 } }}
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
                              {meal.quantity} {meal.unit === 'g' ? 'grams' : meal.unit} • {Math.round(meal.calories * meal.quantity)} calories
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
