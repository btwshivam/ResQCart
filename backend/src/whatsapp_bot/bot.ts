import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import dotenv from 'dotenv';
import { predictSpoilage, getFoodInfo, getRescueOptions, getHelpMenu, getWelcomeMessage, getDefaultResponse, getWhatsNewMessage } from './handlers';

dotenv.config();

const app = express();
const PORT = process.env.BOT_PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Centralized async command router
async function handleCommand(incomingMessage: string, fromNumber: string, location?: { lat: number, lng: number }) {
  try {
    const msg = incomingMessage.trim().toLowerCase();
    if (msg === 'help' || msg === 'menu' || msg === '/help' || msg === '/menu') {
      return getHelpMenu();
    } else if (msg.startsWith('predict') || msg.includes('spoilage')) {
      return await predictSpoilage(incomingMessage);
    } else if (msg.startsWith('info') || msg.includes('food')) {
      return await getFoodInfo(incomingMessage);
    } else if (msg.startsWith('rescue') || msg.startsWith('donate')) {
      // In future: parse location from message or user profile
      return await getRescueOptions(incomingMessage, location);
    } else if (msg === 'hello' || msg === 'hi' || msg === '/hello' || msg === '/hi') {
      return getWelcomeMessage();
    } else if (msg.startsWith('contact')) {
      return '📞 *Contact Support*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nFor support or feedback, email us at support@resqcart.com or call (555) RESQCART.';
    } else if (msg.startsWith("what's new") || msg.startsWith('whats new')) {
      return getWhatsNewMessage();
    } else {
      return getDefaultResponse();
    }
  } catch (err: any) {
    console.error('Command handler error:', err.message);
    return '❌ Sorry, something went wrong. Please try again later.';
  }
}

// WhatsApp webhook endpoint
app.post('/webhook', async (req, res) => {
  console.log('📱 WhatsApp message received:', req.body);

  const incomingMessage = req.body.Body?.toLowerCase() || '';
  const fromNumber = req.body.From;
  // In future: parse location from message or user profile
  const location = undefined;

  console.log(`📨 From: ${fromNumber}`);
  console.log(`💬 Message: ${incomingMessage}`);

  const twiml = new twilio.twiml.MessagingResponse();
  let response = '';

  response = await handleCommand(incomingMessage, fromNumber, location);

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

 