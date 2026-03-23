'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  TextField,
  Chip,
  IconButton,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  CameraAlt,
  Search,
  Close,
  LocalFireDepartment,
  Restaurant,
  CheckCircle,
} from '@mui/icons-material';

export default function BarcodeScanner({ onProductSelect, onClose }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState(null);
  const [quaggaLoaded, setQuaggaLoaded] = useState(false);
  const videoRef = useRef(null);

  // Check if Quagga is loaded
  useEffect(() => {
    const checkQuagga = () => {
      if (typeof window !== 'undefined' && window.Quagga) {
        setQuaggaLoaded(true);
        console.log('✅ Quagga library loaded');
      } else {
        console.log('⏳ Waiting for Quagga library...');
        setTimeout(checkQuagga, 500);
      }
    };
    checkQuagga();
  }, []);

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
    
    if (!quaggaLoaded) {
      setError('Barcode scanner library is still loading. Please try again in a moment or use manual entry.');
      return;
    }
    
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ 
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.Quagga) {
        try {
          window.Quagga.stop();
        } catch (e) {
          console.log('Error stopping Quagga:', e);
        }
      }
    };
  }, []);

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
      } else {
        // Product not found
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

  const handleUseProduct = () => {
    if (productInfo && onProductSelect) {
      const productData = {
        name: productInfo.name || 'Unknown Product',
        calories: productInfo.calories || 0,
        servingSize: productInfo.servingSize || '100g',
        barcode: scannedBarcode || productInfo.barcode,
        brand: productInfo.brand || '',
        source: productInfo.source || 'Manual Entry'
      };
      
      console.log('📦 Sending product to form:', productData);
      onProductSelect(productData);
    }
  };

  // Handle manual barcode entry
  const handleManualLookup = () => {
    if (!manualBarcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    setScannedBarcode(manualBarcode.trim());
    handleBarcodeLookup(manualBarcode.trim());
    setManualBarcode('');
  };

  // Clear current scan
  const clearScan = () => {
    setScannedBarcode(null);
    setProductInfo(null);
    setError(null);
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js"
        strategy="lazyOnload"
      />
    <Box>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box>
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={onClose}
            sx={{ textTransform: 'none' }}
          >
            Back to Meal Form
          </Button>
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
        <Card sx={{ mb: 3 }}>
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
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={stopScanning}
            sx={{ textTransform: 'none', mt: 2 }}
          >
            Stop Scanning
          </Button>
          </CardContent>
        </Card>
      )}

      {/* Scan/Manual Entry Controls */}
      {!isScanning && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={quaggaLoaded ? <CameraAlt /> : <CircularProgress size={20} />}
                onClick={startScanning}
                disabled={!quaggaLoaded}
                sx={{ textTransform: 'none' }}
              >
                {quaggaLoaded ? 'Scan Barcode' : 'Loading Scanner...'}
              </Button>
            </Stack>

            {/* Manual Barcode Entry */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Manual Barcode Entry
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter a barcode manually if scanning doesn't work
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Enter 12 or 13 digit barcode"
                  variant="outlined"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualLookup();
                    }
                  }}
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
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Product Information */}
      {isLoadingProduct && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">
              Looking up product information...
            </Typography>
          </CardContent>
        </Card>
      )}

      {productInfo && !isLoadingProduct && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
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
                  </Grid>
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

              {productInfo && !productInfo.suggestGoogleLens && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Restaurant />}
                    onClick={handleUseProduct}
                    sx={{ textTransform: 'none' }}
                    size="large"
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
    </Box>
    </>
  );
}

