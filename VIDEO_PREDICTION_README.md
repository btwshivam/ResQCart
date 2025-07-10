# Real-time YOLO Video Prediction Feature

This document describes the new real-time YOLO video prediction feature added to ResQCart.

## Overview

The real-time video prediction feature allows users to:
- Stream live video from their camera
- Detect objects in real-time using YOLO (You Only Look Once) model
- Classify detected objects as fresh or rotten using a CNN classifier
- View real-time detection results with bounding boxes and confidence scores
- Monitor detection statistics and performance metrics

## Architecture

The feature consists of three main components:

### 1. Frontend (React + TypeScript)
- **Location**: `frontend/src/components/VideoPrediction.tsx`
- **Features**:
  - Camera access and video streaming
  - WebSocket communication with AIML service
  - Real-time visualization of detections
  - Detection statistics and metrics
  - User-friendly interface with start/stop controls

### 2. Backend (Node.js + Express)
- **Location**: `backend/src/`
- **Features**:
  - HTTP proxy to AIML service (`/api/aiml/*`)
  - Increased payload limits for video frames
  - CORS configuration for cross-origin requests

### 3. AIML Service (Python + FastAPI)
- **Location**: `aiml/app.py`
- **Features**:
  - WebSocket endpoint for real-time video processing (`/ws/video`)
  - YOLO model integration for object detection
  - CNN classifier for fresh/rotten classification
  - Base64 frame processing
  - Real-time response streaming

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Camera access (for video streaming)

### Quick Start

1. **Run the startup script** (recommended):
   ```bash
   ./start-services.sh
   ```

2. **Manual setup** (alternative):
   ```bash
   # Install dependencies
   cd backend && npm install
   cd ../frontend && npm install
   cd ../aiml && pip install -r requirements.txt
   
   # Start services (in separate terminals)
   # Terminal 1 - AIML Service
   cd aiml && python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   
   # Terminal 2 - Backend Service
   cd backend && npm run dev
   
   # Terminal 3 - Frontend Service
   cd frontend && npm run dev
   ```

### Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Click on the "Video" tab in the navbar
3. Allow camera access when prompted
4. Click "Start Stream" to begin real-time prediction

## Features

### Real-time Video Processing
- Live camera feed with real-time object detection
- WebSocket-based communication for low-latency processing
- Automatic frame capture and transmission

### Object Detection & Classification
- YOLO model for object detection (currently configured for apple detection)
- CNN classifier for fresh/rotten classification
- Confidence scores for each detection
- Bounding box visualization with color-coded results

### User Interface
- **Connection Status**: Shows WebSocket connection state
- **FPS Counter**: Displays frames per second
- **Detection Stats**: Real-time statistics including:
  - Frame count
  - Objects detected
  - Fresh vs rotten object counts
- **Recent Detections**: Scrollable list of recent detections with confidence scores

### Error Handling
- Graceful handling of camera access failures
- WebSocket connection error recovery
- Service availability checks
- User-friendly error messages

## Technical Details

### WebSocket Communication
```typescript
// Client sends frame data
{
  type: "frame",
  frame: "base64_encoded_image_data",
  frame_count: 123
}

// Server responds with detections
{
  type: "detection_results",
  detections: [
    {
      box: [x1, y1, x2, y2],
      class: "apple",
      confidence: 0.95,
      prediction: "fresh",
      timestamp: "2025-01-01T12:00:00"
    }
  ],
  frame_count: 123,
  timestamp: "2025-01-01T12:00:00"
}
```

### Model Configuration
- **YOLO Model**: Configured for apple detection with confidence threshold of 0.5
- **CNN Classifier**: ResNet50-based model for fresh/rotten classification
- **Processing Device**: CPU-based processing (can be optimized for GPU)

### Performance Considerations
- Frame rate limited by processing speed
- Base64 encoding/decoding overhead
- WebSocket message size limits
- Camera resolution optimization

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure browser has camera permissions
   - Check if camera is being used by another application

2. **WebSocket Connection Failed**
   - Verify AIML service is running on port 8000
   - Check firewall settings
   - Ensure no CORS issues

3. **No Detections**
   - Verify YOLO model files are present in `aiml/models/`
   - Check model loading logs in AIML service
   - Ensure objects are within camera view

4. **Low Performance**
   - Reduce camera resolution
   - Lower frame rate
   - Consider GPU acceleration for models

### Logs and Debugging
- Check browser console for frontend errors
- Monitor AIML service logs for model loading and processing errors
- Verify backend proxy logs for HTTP request issues

## Future Enhancements

### Planned Features
- Support for multiple object types
- GPU acceleration for faster processing
- Recording and playback capabilities
- Batch processing for uploaded videos
- Integration with inventory management system

### Performance Optimizations
- WebRTC for better video streaming
- Model quantization for faster inference
- Edge computing deployment options
- Caching mechanisms for repeated detections

## API Endpoints

### WebSocket Endpoints
- `ws://localhost:8000/ws/video` - Real-time video processing

### HTTP Endpoints
- `POST /api/aiml/detect` - Single image detection
- `POST /api/aiml/process_video_frame` - HTTP-based frame processing
- `GET /api/aiml/` - Service status and available endpoints

## Contributing

When contributing to the video prediction feature:

1. Follow the existing code structure and patterns
2. Add proper error handling and logging
3. Test with different camera configurations
4. Update documentation for new features
5. Consider performance implications of changes

## Support

For issues related to the video prediction feature:
1. Check the troubleshooting section above
2. Review service logs for error details
3. Verify all dependencies are properly installed
4. Ensure all services are running on correct ports 