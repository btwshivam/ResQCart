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

const RealtimePredictionAnalysis = () => {
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Realtime YOLO Prediction Analysis</h3>
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
              <p className="text-sm text-red-700">
                The AIML service is currently offline. Please ensure the service is running at http://localhost:8000
              </p>
              <div className="mt-2">
                <button 
                  onClick={() => {
                    setCheckingStatus(true);
                    aimlApi.getStatus()
                      .then(response => {
                        setServiceStatus({
                          isRunning: true,
                          yolo_model_loaded: response.data.status.yolo_model_loaded,
                          cnn_model_loaded: response.data.status.cnn_model_loaded
                        });
                        setError(null);
                      })
                      .catch(() => {
                        setServiceStatus({
                          isRunning: false,
                          yolo_model_loaded: false,
                          cnn_model_loaded: false
                        });
                      })
                      .finally(() => setCheckingStatus(false));
                  }}
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Retry connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!checkingStatus && serviceStatus.isRunning && !serviceStatus.yolo_model_loaded && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                The AIML service is online but the YOLO model is not loaded. Object detection will not work.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Please check that model files exist in the 'models' directory on the server.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-5 sm:p-6">
        <div 
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            {!previewUrl ? (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload an image</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <canvas ref={canvasRef} className="max-h-96 max-w-full object-contain" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleClearImage}
                  >
                    <span className="sr-only">Clear image</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
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

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </button>
        </div>

        {detections.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900">Detection Results</h4>
            <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Prediction</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Confidence</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sensor Data</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Recommended Action</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {detections.map((detection, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full ${detection.prediction === 'freshapples' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                          <span className="font-medium text-gray-900">
                            {detection.prediction === 'freshapples' ? 'Fresh Apple' : 'Rotten Apple'}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {(detection.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>Ethylene: {detection.sensor_data.ethylene_ppm} ppm</div>
                        <div>Temp: {detection.sensor_data.temperature_c}°C</div>
                        <div>Humidity: {detection.sensor_data.humidity_percent}%</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          detection.pricing.action === 'sell' ? 'bg-green-100 text-green-800' :
                          detection.pricing.action === 'donate' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {detection.pricing.action === 'sell' ? 'Sell' :
                           detection.pricing.action === 'donate' ? 'Donate' : 'Dispose'}
                        </span>
                        {detection.pricing.message && (
                          <p className="mt-1 text-xs text-gray-500">{detection.pricing.message}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ${detection.pricing.price_usd.toFixed(2)}
                        {detection.pricing.discount_applied && (
                          <span className="ml-2 text-xs text-red-500">
                            (-{detection.pricing.discount_percent}%)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimePredictionAnalysis; 