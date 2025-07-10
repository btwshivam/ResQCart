import express from 'express';
import axios from 'axios';

const router = express.Router();

// AIML service base URL
const AIML_BASE_URL = process.env.AIML_SERVICE_URL || 'http://localhost:8000';

// Proxy middleware for AIML service
const proxyToAIML = async (req: express.Request, res: express.Response) => {
  try {
    const { method, url, body, headers } = req;
    const targetUrl = `${AIML_BASE_URL}${url}`;
    
    // Remove host header to avoid conflicts
    const { host, ...proxyHeaders } = headers;
    
    const response = await axios({
      method: method as any,
      url: targetUrl,
      data: body,
      headers: proxyHeaders,
      timeout: 30000, // 30 second timeout
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('AIML proxy error:', error.message);
    
    if (error.response) {
      // Forward error response from AIML service
      res.status(error.response.status).json(error.response.data);
    } else {
      // Handle network errors
      res.status(503).json({
        error: 'AIML service unavailable',
        message: 'The AI/ML service is currently unavailable. Please try again later.'
      });
    }
  }
};

// Define specific routes for AIML endpoints
router.get('/', proxyToAIML);
router.post('/detect', proxyToAIML);
router.post('/predict_milk_spoilage', proxyToAIML);
router.post('/process_video_frame', proxyToAIML);

export default router; 