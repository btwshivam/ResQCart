import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import dotenv from 'dotenv';
import { predictSpoilage, getFoodInfo, getRescueOptions, getHelpMenu, getWelcomeMessage, getDefaultResponse } from './handlers';

dotenv.config();

const app = express();
const PORT = process.env.BOT_PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// WhatsApp webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('📱 WhatsApp message received:', req.body);
  
  const incomingMessage = req.body.Body?.toLowerCase() || '';
  const fromNumber = req.body.From;
  
  console.log(`📨 From: ${fromNumber}`);
  console.log(`💬 Message: ${incomingMessage}`);
  
  const twiml = new twilio.twiml.MessagingResponse();
  let response = '';
  
  // Simple command parser
  if (incomingMessage.includes('help') || incomingMessage.includes('menu')) {
    response = getHelpMenu();
  } else if (incomingMessage.includes('predict') || incomingMessage.includes('spoilage')) {
    response = predictSpoilage(incomingMessage);
  } else if (incomingMessage.includes('info') || incomingMessage.includes('food')) {
    response = getFoodInfo(incomingMessage);
  } else if (incomingMessage.includes('rescue') || incomingMessage.includes('donate')) {
    response = getRescueOptions(incomingMessage);
  } else if (incomingMessage.includes('hello') || incomingMessage.includes('hi')) {
    response = getWelcomeMessage();
  } else {
    response = getDefaultResponse();
  }
  
  twiml.message(response);
  
  console.log(`📤 Sending response: ${response}`);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Bot is running!', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 WhatsApp Bot running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('\n📋 Available commands:');
  console.log('  - "help" or "menu" - Show available options');
  console.log('  - "predict [food item]" - Predict spoilage');
  console.log('  - "info [food item]" - Get food information');
  console.log('  - "rescue" - Get rescue/donation options');
  console.log('  - "hello" - Welcome message');
});

 