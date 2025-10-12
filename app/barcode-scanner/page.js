'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Paper,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person,
  QrCodeScanner,
  CameraAlt,
  Restaurant,
  Search,
  Refresh,
  Close,
  CheckCircle,
  Warning,
  Info,
  Nutrition,
  LocalFireDepartment,
  NavigateBefore,
} from '@mui/icons-material';

function BarcodeScannerContent() {
  const { user, isLoading, error: authError } = useUser();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load scan history from user metadata
  useEffect(() => {
    if (user) {
      const savedHistory = user.user_metadata?.barcode_scan_history || [];
      setScanHistory(savedHistory);
    }
  }, [user]);

  // Initialize Quagga scanner
  const initializeScanner = () => {
    if (typeof window !== 'undefined' && window.Quagga && videoRef.current) {
      window.Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          },
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true
        },
      }, (err) => {
        if (err) {
          console.error('Quagga initialization error:', err);
          setError('Failed to initialize camera scanner. Please try manual entry.');
          setIsScanning(false);
          return;
        }
        window.Quagga.start();
        window.Quagga.onDetected(onDetected);
      });
    } else {
      console.error('Quagga not available or video element not ready');
      setError('Camera scanner not available. Please use manual barcode entry.');
      setIsScanning(false);
    }
  };

  // Handle barcode detection
  const onDetected = (data) => {
    const barcode = data.codeResult.code;
    setScannedBarcode(barcode);
    window.Quagga.stop();
    setIsScanning(false);
    handleBarcodeLookup(barcode);
  };

  // Start scanning
  const startScanning = async () => {
    setError(null);
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setIsScanning(true);
      setScannedBarcode(null);
      setProductInfo(null);
      
      // Initialize scanner after a short delay to ensure video element is ready
      setTimeout(() => {
        initializeScanner();
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please use manual barcode entry.');
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (window.Quagga) {
      window.Quagga.stop();
    }
    setIsScanning(false);
  };

  // Look up product information from Open Food Facts
  const handleBarcodeLookup = async (barcode) => {
    setIsLoadingProduct(true);
    setError(null);
    
    try {
      // Use our API route for Open Food Facts lookup
      const response = await fetch('/api/lookup-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      });
      
      const data = await response.json();
      
      if (data.success && data.product) {
        setProductInfo(data.product);
        
        // Add to scan history
        addToHistory({
          barcode,
          productName: data.product.name,
          timestamp: new Date().toISOString(),
          source: data.product.source
        });
      } else {
        // Product not found - suggest Google Lens
        setProductInfo({
          name: 'Product not found in Open Food Facts',
          brand: '',
          calories: null,
          servingSize: '',
          ingredients: '',
          nutritionGrade: '',
          image: '',
          source: 'Not Found',
          barcode: barcode,
          fullData: null,
          suggestGoogleLens: true
        });
      }
    } catch (err) {
      console.error('Product lookup error:', err);
      setError('Failed to lookup product information. Please try again.');
      setProductInfo({
        name: 'Error retrieving product info',
        brand: '',
        calories: null,
        servingSize: '',
        ingredients: '',
        nutritionGrade: '',
        image: '',
        source: 'Error',
        barcode: barcode,
        fullData: null,
        suggestGoogleLens: true
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleUseForMeal = () => {
    if (productInfo && returnTo === 'meal-tracker') {
      // Store product info in localStorage for meal tracker to pick up
      const mealData = {
        name: productInfo.name || 'Unknown Product',
        calories: productInfo.calories || 0,
        servingSize: productInfo.servingSize || '100g',
        barcode: scannedBarcode || productInfo.barcode,
        brand: productInfo.brand || '',
        source: productInfo.source || 'Manual Entry'
      };
      
      console.log('📦 Sending product to meal tracker:', mealData);
      localStorage.setItem('scannedProductForMeal', JSON.stringify(mealData));
      
      // Navigate back to meal tracker
      window.location.href = '/meal-tracker';
    }
  };

  // Add to scan history
  const addToHistory = (scanData) => {
    const newHistory = [scanData, ...scanHistory.slice(0, 9)]; // Keep last 10 scans
    setScanHistory(newHistory);
    
    // Save to user metadata (in a real app, this would be an API call)
    console.log('Saving scan history:', newHistory);
  };

  // Handle manual barcode entry
  const handleManualLookup = () => {
    if (!manualBarcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    handleBarcodeLookup(manualBarcode.trim());
    setManualBarcode('');
  };

  // Clear current scan
  const clearScan = () => {
    setScannedBarcode(null);
    setProductInfo(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading barcode scanner...
          </Typography>
        </Container>
      </>
    );
  }

  if (authError && !mounted) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading barcode scanner: {authError.message}
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
              Please log in to use the barcode scanner.
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

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading barcode scanner...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                <QrCodeScanner sx={{ fontSize: 30 }} />
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
                  Barcode Scanner
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.name || 'User'} • Scan products to find nutritional information
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              {returnTo === 'meal-tracker' && (
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  onClick={() => {
                    // Preserve the form data flag to keep the add meal form open
                    const formData = localStorage.getItem('mealFormData');
                    if (formData) {
                      // Form data exists, will return to add meal form
                      window.location.href = '/meal-tracker';
                    } else {
                      // No form data, just return to meal tracker
                      window.location.href = '/meal-tracker';
                    }
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Add Meal
                </Button>
              )}
              {!isScanning ? (
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={startScanning}
                  sx={{ textTransform: 'none' }}
                >
                  Scan Barcode
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Close />}
                  onClick={stopScanning}
                  sx={{ textTransform: 'none' }}
                >
                  Stop Scanning
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Camera Scanner */}
        {isScanning && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Camera Scanner
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Point your camera at a barcode to scan it
              </Typography>
              <Box
                ref={videoRef}
                sx={{
                  width: '100%',
                  maxWidth: 640,
                  height: 480,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Initializing camera...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Manual Barcode Entry */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Manual Barcode Entry
            </Typography>
            {returnTo === 'meal-tracker' ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter a barcode manually if scanning doesn't work. Once you find the product, click "Add to Meal" to return to your meal form, or click "Back to Add Meal" above to return without selecting a product.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter a barcode manually if scanning doesn't work
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Barcode"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter 12 or 13 digit barcode"
                variant="outlined"
              />
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleManualLookup}
                disabled={isLoadingProduct}
                sx={{ textTransform: 'none', minWidth: 120 }}
              >
                Lookup
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Product Information */}
        {isLoadingProduct && (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">
                Looking up product information...
              </Typography>
            </CardContent>
          </Card>
        )}

        {productInfo && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">
                  Product Information
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label={`Barcode: ${scannedBarcode}`} 
                    variant="outlined" 
                    size="small"
                  />
                  <Chip 
                    label={productInfo.source} 
                    color={productInfo.source === 'Open Food Facts' ? 'success' : 'warning'}
                    size="small"
                  />
                  <IconButton size="small" onClick={clearScan}>
                    <Close />
                  </IconButton>
                </Stack>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {productInfo.name}
                  </Typography>
                  {productInfo.brand && (
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {productInfo.brand}
                    </Typography>
                  )}
                  
                  {productInfo.calories && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
                      <LocalFireDepartment sx={{ color: 'orange', mr: 1 }} />
                      <Typography variant="h6">
                        {productInfo.calories} calories per {productInfo.servingSize}
                      </Typography>
                    </Box>
                  )}

                  {productInfo.ingredients && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Ingredients:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {productInfo.ingredients}
                      </Typography>
                    </Box>
                  )}

                  {productInfo.nutrition && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Nutritional Information (per 100g):
                      </Typography>
                      <Grid container spacing={1}>
                        {productInfo.nutrition.fat && (
                          <Grid item xs={6}>
                            <Chip label={`Fat: ${productInfo.nutrition.fat}g`} size="small" variant="outlined" />
                          </Grid>
                        )}
                        {productInfo.nutrition.carbohydrates && (
                          <Grid item xs={6}>
                            <Chip label={`Carbs: ${productInfo.nutrition.carbohydrates}g`} size="small" variant="outlined" />
                          </Grid>
                        )}
                        {productInfo.nutrition.proteins && (
                          <Grid item xs={6}>
                            <Chip label={`Protein: ${productInfo.nutrition.proteins}g`} size="small" variant="outlined" />
                          </Grid>
                        )}
                        {productInfo.nutrition.sugars && (
                          <Grid item xs={6}>
                            <Chip label={`Sugars: ${productInfo.nutrition.sugars}g`} size="small" variant="outlined" />
                          </Grid>
                        )}
                        {productInfo.nutrition.fiber && (
                          <Grid item xs={6}>
                            <Chip label={`Fiber: ${productInfo.nutrition.fiber}g`} size="small" variant="outlined" />
                          </Grid>
                        )}
                        {productInfo.nutrition.salt && (
                          <Grid item xs={6}>
                            <Chip label={`Salt: ${productInfo.nutrition.salt}g`} size="small" variant="outlined" />
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {productInfo.allergens && productInfo.allergens.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Allergens:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {productInfo.allergens.map((allergen, index) => (
                          <Chip 
                            key={index} 
                            label={allergen.replace('en:', '').replace('_', ' ')} 
                            color="warning" 
                            size="small" 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {productInfo.nutritionScore && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Nutrition Score:
                      </Typography>
                      <Chip 
                        label={productInfo.nutritionScore.toUpperCase()} 
                        color={productInfo.nutritionScore === 'a' ? 'success' : 
                               productInfo.nutritionScore === 'b' ? 'info' : 
                               productInfo.nutritionScore === 'c' ? 'warning' : 'error'} 
                        size="small" 
                      />
                    </Box>
                  )}

                  {productInfo.suggestGoogleLens && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Product not found in our database. Try using Google Lens to identify the product and find nutritional information.
                      </Typography>
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => window.open('https://lens.google.com/', '_blank')}
                      >
                        Open Google Lens
                      </Button>
                    </Alert>
                  )}

                  {returnTo === 'meal-tracker' && productInfo && !productInfo.suggestGoogleLens && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom color="success.main">
                        Ready to add this to your meal?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {productInfo.calories 
                          ? 'This product will be added to your meal tracker with the nutritional information we found.'
                          : 'This product will be added to your meal tracker. You can fill in the nutritional information manually.'}
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Restaurant />}
                        onClick={handleUseForMeal}
                        sx={{ textTransform: 'none' }}
                      >
                        Add to Meal
                      </Button>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  {productInfo.image && (
                    <Box sx={{ textAlign: 'center' }}>
                      <img
                        src={productInfo.image}
                        alt={productInfo.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          borderRadius: 8,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Scans
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your last {scanHistory.length} scanned products
              </Typography>
              <List>
                {scanHistory.map((scan, index) => (
                  <ListItem key={index} divider={index < scanHistory.length - 1}>
                    <ListItemIcon>
                      <Restaurant />
                    </ListItemIcon>
                    <ListItemText
                      primary={scan.productName}
                      secondary={`Barcode: ${scan.barcode} • ${new Date(scan.timestamp).toLocaleDateString()}`}
                    />
                    <Chip 
                      label={scan.source} 
                      size="small" 
                      color={scan.source === 'Open Food Facts' ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
}

export default function BarcodeScanner() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading barcode scanner...
          </Typography>
        </Container>
      </>
    }>
      <BarcodeScannerContent />
    </Suspense>
  );
}
