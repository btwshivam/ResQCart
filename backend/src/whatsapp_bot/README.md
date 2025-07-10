# ResQCart WhatsApp Bot

A simple WhatsApp bot built with Twilio for food spoilage prediction and rescue options.

## Features

- 🍎 **Food Spoilage Prediction** - Predict how long food items will last
- 📚 **Food Information** - Get storage tips and shelf life information
- 🆘 **Rescue Options** - Find nearby food donation locations


## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` and add your Twilio credentials:
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
BOT_PORT=3001
```

### 3. Set Up Twilio (For WhatsApp Integration)

#### Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up or log in
3. Copy your Account SID and Auth Token
4. Add them to your `.env` file

#### Activate WhatsApp Sandbox

1. In Twilio Console, go to **Messaging > Try it out > Send a WhatsApp message**
2. You'll see a sandbox number (usually +14155238886)
3. Send "join <your-sandbox-code>" to that number from your WhatsApp
4. You'll receive a confirmation message

#### Run Setup Script

```bash
npm run bot:setup
```

This will test your connection and provide next steps.

### 4. Start the WhatsApp Bot

#### Option A: Local Development (with ngrok)

1. Install ngrok: `npm install -g ngrok`
2. Start the bot: `npm run bot`
3. In another terminal: `ngrok http 3001`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. In Twilio Console, set webhook URL to: `https://abc123.ngrok.io/webhook`

#### Option B: Production Deployment

1. Deploy your bot to a server with a public URL
2. Set the webhook URL in Twilio Console to: `https://your-domain.com/webhook`

## Available Commands

### WhatsApp Commands

- `help` or `menu` - Show available options
- `predict [food]` - Predict spoilage (e.g., "predict apple")
- `info [food]` - Get food information (e.g., "info banana")
- `rescue` - Find rescue/donation options
- `hello` - Welcome message

### Supported Food Items

The bot currently supports these items with detailed predictions:
- Apple
- Banana
- Tomato
- Milk
- Bread

For other items, it provides generic predictions.

## Project Structure

```
whatsapp_bot/
├── bot.ts          # Main WhatsApp bot server
├── handlers.ts     # Command handlers
├── setup.ts        # Twilio setup script
└── README.md       # This file
```

## Development

### Adding New Commands

1. Add the command logic in `handlers.ts`
2. Update the command parser in `bot.ts`
3. Update the help menu

### Adding New Food Items

Edit the `predictions` and `foodInfo` objects in `handlers.ts`:

```typescript
const predictions = {
  'apple': { days: 7, status: 'Good', confidence: 85 },
  'orange': { days: 10, status: 'Good', confidence: 80 }, // Add new item
  // ...
};
```

## Troubleshooting

### Common Issues

1. **"Cannot find module 'twilio'"**
   - Run `npm install` to install dependencies

2. **"Missing Twilio credentials"**
   - Check your `.env` file has correct TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN

3. **Webhook not receiving messages**
   - Ensure ngrok is running and URL is correct
   - Check Twilio Console webhook URL setting
   - Verify WhatsApp sandbox is activated

4. **Bot not responding**
   - Check console logs for errors
   - Verify the bot server is running on correct port

### Debug Mode

Add more console logs by editing the handlers in `handlers.ts`. All functions include console.log statements for debugging.

## Next Steps

- Integrate with your ML model for real predictions
- Add database storage for user interactions
- Implement location-based rescue options
- Add image recognition for food items
- Create admin dashboard for bot management

## License

MIT License - see main project LICENSE file 