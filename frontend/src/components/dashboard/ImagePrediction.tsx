import { useState, useRef, useEffect } from 'react';
import { aimlApi } from '../../services/api';

interface Detection {
  box: number[];
  prediction: string;
  confidence: number;
  sensor_data: {
    ethylene_ppm: number;
    temperature_c: number;
    humidity_percent: number;
  };
  pricing: {
    action: string;
    discount_applied: boolean;
    discount_percent: number;
    price_usd: number;
    message: string | null;
  };
}

const ImagePrediction = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<{
    isRunning: boolean;
    yolo_model_loaded: boolean;
    cnn_model_loaded: boolean;
  }>({
    isRunning: false,
    yolo_model_loaded: false,
    cnn_model_loaded: false
  });
  const [checkingStatus, setCheckingStatus] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check AIML service status on component mount and periodically
  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        setCheckingStatus(true);
        const response = await aimlApi.getStatus();
        setServiceStatus({
          isRunning: true,
          yolo_model_loaded: response.data.status.yolo_model_loaded,
          cnn_model_loaded: response.data.status.cnn_model_loaded
        });
        setError(null);
      } catch (err) {
        console.error('Error checking AIML service status:', err);
        setServiceStatus({
          isRunning: false,
          yolo_model_loaded: false,
          cnn_model_loaded: false
        });
        setError('AIML service is not available. Please ensure the service is running at http://localhost:8000');
      } finally {
        setCheckingStatus(false);
      }
    };

    // Check immediately on mount
    checkServiceStatus();
    
    // Then check every 30 seconds
    const intervalId = setInterval(checkServiceStatus, 30000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetections([]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image to analyze');
      return;
    }

    if (!serviceStatus.isRunning || !serviceStatus.yolo_model_loaded) {
      setError('AIML service or YOLO model is not available. Please check the service status.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await aimlApi.detectItems(formData);
      
      if (response.data.detections && response.data.detections.length > 0) {
        setDetections(response.data.detections);
      } else {
        setError('No objects were detected in the image. Try with a different image.');
      }
    } catch (err: any) {
      console.error('Error analyzing image:', err);
      
      if (err.response && err.response.status === 503) {
        setError('The YOLO model is not available on the server. Please check server logs.');
      } else if (!navigator.onLine) {
        setError('You are offline. Please check your internet connection.');
      } else {
        setError('Failed to analyze image. Please try again or check if the AIML service is running.');
      }
      
      // Reset service status and trigger a new check
      setServiceStatus({
        isRunning: false,
        yolo_model_loaded: false,
        cnn_model_loaded: false
      });
      setCheckingStatus(true);
      
      // Try to check service status again
      try {
        const statusResponse = await aimlApi.getStatus();
        setServiceStatus({
          isRunning: true,
          yolo_model_loaded: statusResponse.data.status.yolo_model_loaded,
          cnn_model_loaded: statusResponse.data.status.cnn_model_loaded
        });
      } catch (statusErr) {
        // Service is definitely down
        console.error('Service status check failed:', statusErr);
      } finally {
        setCheckingStatus(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetections([]);
      setError(null);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetections([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (previewUrl && detections.length > 0 && canvasRef.current) {
      const image = new Image();
      image.src = previewUrl;
      
      image.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas dimensions to match image
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Draw the image
        ctx.drawImage(image, 0, 0);
        
        // Draw bounding boxes for each detection
        detections.forEach(detection => {
          const [x1, y1, x2, y2] = detection.box;
          const color = detection.prediction === 'freshapples' ? '#4ade80' : '#ef4444';
          
          // Draw rectangle
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
          
          // Draw label background
          ctx.fillStyle = color;
          const label = `${detection.prediction} (${Math.round(detection.confidence * 100)}%)`;
          const textWidth = ctx.measureText(label).width;
          ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);
          
          // Draw label text
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Arial';
          ctx.fillText(label, x1 + 5, y1 - 7);
        });
      };
    }
  }, [previewUrl, detections]);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Image Prediction Analysis</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Upload an image to analyze products with our AI/ML model
            </p>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
              checkingStatus ? 'bg-gray-100 text-gray-800' :
              serviceStatus.isRunning && serviceStatus.yolo_model_loaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            } mr-2`}>
              {checkingStatus ? 'Checking...' :
               serviceStatus.isRunning && serviceStatus.yolo_model_loaded ? 'Service Online' : 'Service Offline'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
              YOLO v8
            </span>
          </div>
        </div>
      </div>

      {/* Service status alert */}
      {!checkingStatus && !serviceStatus.isRunning && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">AIML Service Unavailable</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The AI/ML service is not running or cannot be reached. Please check that:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>The AIML service is started</li>
                  <li>You can access http://localhost:8000 in your browser</li>
                  <li>Network connectivity between frontend and backend is working</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload Section */}
          <div>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
                previewUrl ? 'border-gray-300' : 'border-blue-300 hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
              {!previewUrl ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-700 mb-2">Drag and drop an image here or click to browse</p>
                  <p className="text-sm text-gray-500">Supported formats: JPG, PNG, WEBP</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </>
              ) : (
                <div className="relative w-full">
                  <div className="aspect-w-16 aspect-h-9 w-full">
                    {detections.length > 0 ? (
                      <canvas ref={canvasRef} className="w-full h-full object-contain" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearImage();
                      }}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Choose File
              </button>
              
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading || !serviceStatus.isRunning}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !selectedFile || loading || !serviceStatus.isRunning
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Analyze Image'}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Results Section */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6 h-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detection Results</h3>
              
              {detections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-gray-500">
                    {selectedFile 
                      ? 'Click "Analyze Image" to detect objects' 
                      : 'Upload an image to start detection'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                  {detections.map((detection, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${
                            detection.prediction.includes('fresh') ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {detection.prediction.replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())
                              .replace(/([a-z])([A-Z])/g, '$1 $2')}
                          </h4>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {Math.round(detection.confidence * 100)}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Temperature</p>
                          <p className="text-sm font-medium">{detection.sensor_data.temperature_c}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Humidity</p>
                          <p className="text-sm font-medium">{detection.sensor_data.humidity_percent}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ethylene</p>
                          <p className="text-sm font-medium">{detection.sensor_data.ethylene_ppm} ppm</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price</p>
                          <p className="text-sm font-medium">${detection.pricing.price_usd.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {detection.pricing.discount_applied && (
                        <div className="mt-3 bg-yellow-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-yellow-800">
                              <span className="font-medium">{detection.pricing.discount_percent}% discount recommended</span>
                              {detection.pricing.message && ` - ${detection.pricing.message}`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            detection.pricing.action === 'none' ? 'bg-gray-100 text-gray-800' :
                            detection.pricing.action === 'discount' ? 'bg-yellow-100 text-yellow-800' :
                            detection.pricing.action === 'remove' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {detection.pricing.action === 'none' ? 'No Action Needed' :
                             detection.pricing.action === 'discount' ? 'Apply Discount' :
                             detection.pricing.action === 'remove' ? 'Remove from Sale' :
                             'Monitor Item'}
                          </span>
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Take Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePrediction; 