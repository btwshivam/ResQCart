# ResQCart WhatsApp Bot

A professional WhatsApp bot built with Twilio for food spoilage prediction, food info, and food rescue/donation options.

## Features

- 🍎 **Food Spoilage Prediction** — Predict how long food items will last using AI
- 📚 **Food Information** — Get storage tips and shelf life information
- 🆘 **Donate Food** — Find local food donation organizations
- 🛠️ **Quick Reference Help** — Professional, grouped command menu
- 👋 **Branded Welcome** — Warm, motivational welcome message
- 📞 **Contact Support** — Instantly get support or send feedback
- 🆕 **What’s New** — See the latest features and updates

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

1. Go to [Twilio Console](https://console.twilio.com/)
2. Activate WhatsApp Sandbox
3. Set the webhook URL to: `https://<your-ngrok-url>/webhook`

### 4. Start the WhatsApp Bot

```bash
npm run bot
```

## Available Commands

All commands are **case-insensitive** (e.g., `help`, `HELP`, `Help` all work).

| Command                | Description                                                      | Example                |
|------------------------|------------------------------------------------------------------|------------------------|
| help / menu            | Show the quick reference help menu                               | help                   |
| hello / hi             | Show a warm, branded welcome message                             | hello                  |
| predict [food]         | Predict spoilage for a food item using AI                        | predict apple          |
| info [food]            | Get storage tips and shelf life for a food item                  | info banana            |
| donate                 | Find local food donation organizations                           | donate                 |
| rescue                 | (Alias for donate)                                               | rescue                 |
| contact                | Contact support or send feedback                                 | contact                |
| what's new / whats new | See the latest features and updates                              | what's new             |

## Enhanced User Experience

- **Help Menu**: Grouped by category, with usage tips and examples.
- **Welcome Message**: Motivational, branded, and action-oriented.
- **Professional Formatting**: All responses use clear structure, emojis, and branding.
- **Donation Guidance**: Step-by-step tips for donating food safely.
- **Support & Feedback**: Instantly get support or send feedback with `contact`.
- **Latest Features**: Stay up to date with `what's new`.

## Project Structure

```
whatsapp_bot/
├── bot.ts          # Main WhatsApp bot server
├── handlers.ts     # Command handlers
├── setup.ts        # Twilio setup script
└── README.md       # This file
```

## Development

- To add new commands, update `handlers.ts` and the command router in `bot.ts`.
- To update the help or welcome message, edit the corresponding functions in `handlers.ts`.

## Troubleshooting

- **404 Not Found on ngrok**: Make sure your Twilio webhook URL ends with `/webhook`.
- **Bot not responding**: Check your console logs and ensure the bot is running on the correct port.
- **Need help?** Use the `contact` command in WhatsApp for instant support.

---

*ResQCart — Every meal saved is a win for the planet!* 🌍 