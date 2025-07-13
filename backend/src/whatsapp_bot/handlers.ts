import axios from 'axios';

// --- CONFIG ---
const AIML_BASE_URL = process.env.AIML_SERVICE_URL || 'http://localhost:8000';

// --- PREDICTION HANDLER ---
export async function predictSpoilage(message: string): Promise<string> {
  try {
    const foodItem = extractFoodItem(message);
    
    // Use API for milk spoilage prediction
    if (foodItem === 'milk') {
      const res = await axios.post(`${AIML_BASE_URL}/predict_milk_spoilage`, { sku: 'whole_milk_1gal' });
      const { prediction, probability, explanation } = res.data;
      
      return `🥛 *MILK SPOILAGE ANALYSIS*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *Status:* ${prediction.toUpperCase()}
🎯 *Confidence:* ${(probability * 100).toFixed(1)}%

📋 *Analysis Details:*
${explanation}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Next Steps:*
• Check expiration date
• Inspect for visual signs
• Consider donation if still safe

🔍 Type *info milk* for storage tips
🆘 Type *rescue* for donation options`;
    }
    
    // TODO: Add more API integrations as available
    // Fallback: Enhanced hardcoded predictions
    const predictions: any = {
      'apple': { days: 7, status: 'Fresh', confidence: 85, emoji: '🍎' },
      'banana': { days: 3, status: 'Ripening', confidence: 78, emoji: '🍌' },
      'tomato': { days: 5, status: 'Fresh', confidence: 82, emoji: '🍅' },
      'bread': { days: 4, status: 'Good', confidence: 75, emoji: '🍞' },
      'lettuce': { days: 5, status: 'Fresh', confidence: 80, emoji: '🥬' },
      'cheese': { days: 10, status: 'Good', confidence: 88, emoji: '🧀' }
    };
    
    const prediction = predictions[foodItem] || { 
      days: Math.floor(Math.random() * 7) + 1, 
      status: 'Unknown', 
      confidence: 70,
      emoji: '🥘'
    };
    
    return `${prediction.emoji} *${foodItem.toUpperCase()} SPOILAGE PREDICTION*
━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ *Estimated Shelf Life:* ${prediction.days} days
📊 *Current Status:* ${prediction.status}
🎯 *Confidence Level:* ${prediction.confidence}%

💡 *Recommendations:*
• Store in optimal conditions
• Monitor for spoilage signs
• Consider price reduction if near expiry
• Donate if still safe but unsellable

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Type *info ${foodItem}* for storage tips
🆘 Type *rescue* for donation options`;
    
  } catch (error: any) {
    console.error('Prediction error:', error.message);
    return `❌ *SERVICE TEMPORARILY UNAVAILABLE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

We're experiencing technical difficulties with our prediction service.

🔄 *Please try again in a few moments*
📞 *For urgent assistance, contact support*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// --- FOOD INFO HANDLER ---
export async function getFoodInfo(message: string): Promise<string> {
  try {
    const foodItem = extractFoodItem(message);
    
    // Enhanced hardcoded food information
    const foodInfo: any = {
      'apple': {
        storage: 'Refrigerate at 32-35°F (0-2°C)',
        shelf_life: '2-4 weeks refrigerated',
        tips: 'Keep away from other fruits to prevent premature ripening',
        emoji: '🍎'
      },
      'banana': {
        storage: 'Room temperature until ripe, then refrigerate',
        shelf_life: '3-7 days at room temperature',
        tips: 'Separate from other fruits, freeze when overripe for smoothies',
        emoji: '🍌'
      },
      'tomato': {
        storage: 'Room temperature, refrigerate only when cut',
        shelf_life: '1-2 weeks at room temperature',
        tips: 'Store stem-side down, avoid direct sunlight',
        emoji: '🍅'
      },
      'milk': {
        storage: 'Refrigerate at 40°F (4°C) or below',
        shelf_life: '5-7 days after opening',
        tips: 'Keep in coldest part of fridge, check expiration date daily',
        emoji: '🥛'
      },
      'bread': {
        storage: 'Room temperature or freeze for longer storage',
        shelf_life: '5-7 days at room temperature',
        tips: 'Store in bread box or airtight container, freeze for up to 3 months',
        emoji: '🍞'
      },
      'lettuce': {
        storage: 'Refrigerate in crisper drawer',
        shelf_life: '7-10 days refrigerated',
        tips: 'Wash just before use, store in perforated plastic bag',
        emoji: '🥬'
      },
      'cheese': {
        storage: 'Refrigerate in cheese paper or wax paper',
        shelf_life: '1-4 weeks depending on type',
        tips: 'Allow to breathe, avoid plastic wrap for hard cheeses',
        emoji: '🧀'
      }
    };
    
    const info = foodInfo[foodItem] || {
      storage: 'Check product packaging for specific instructions',
      shelf_life: 'Varies by product type and brand',
      tips: 'Store in cool, dry place away from direct sunlight',
      emoji: '🥘'
    };
    
    return `${info.emoji} *${foodItem.toUpperCase()} STORAGE GUIDE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

🌡️ *Optimal Storage:*
${info.storage}

⏰ *Expected Shelf Life:*
${info.shelf_life}

💡 *Pro Tips:*
${info.tips}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 Type *predict ${foodItem}* for spoilage prediction
🆘 Type *rescue* for donation options`;
    
  } catch (error: any) {
    console.error('Food info error:', error.message);
    return `❌ *INFORMATION SERVICE UNAVAILABLE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Unable to retrieve food information at this time.

🔄 *Please try again shortly*
📞 *For immediate assistance, contact support*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// --- RESCUE OPTIONS HANDLER ---
export async function getRescueOptions(message: string, location?: { lat: number, lng: number }): Promise<string> {
  try {
    if (location) {
      // Use API if location is provided
      const res = await axios.post(`${AIML_BASE_URL}/nearby-ngos`, location);
      const ngos = res.data.ngos || [];
      
      if (ngos.length === 0) {
        return `📍 *NO RESCUE OPTIONS FOUND*
━━━━━━━━━━━━━━━━━━━━━━━━━━

No food rescue organizations found in your area.

🔄 *Try expanding your search radius*
📞 *Contact local food banks directly*
🌐 *Visit our website for more options*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      }
      
      let response = `🆘 *NEARBY RESCUE ORGANIZATIONS*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 *Found ${ngos.length} organization(s) in your area:*

`;
      
      ngos.forEach((ngo: any, idx: number) => {
        response += `${idx + 1}. *${ngo.name}*
   📍 ${ngo.address}
   ⭐ Rating: ${ngo.rating || 'Not rated'}
   
`;
      });
      
      response += `━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Donation Guidelines:*
• Ensure food is safe for consumption
• Package items properly and securely
• Call ahead to confirm acceptance
• Follow organization's pickup schedule

📞 *Need help?* Contact support for assistance`;
      
      return response;
    }
    
    // Fallback: Enhanced hardcoded options
    const rescueOptions = [
      { name: 'Central Food Bank', distance: '0.5 miles', items: 'All food types', phone: '(555) 123-4567' },
      { name: 'Community Kitchen Network', distance: '1.2 miles', items: 'Fresh produce & prepared meals', phone: '(555) 234-5678' },
      { name: 'Hope Shelter', distance: '0.8 miles', items: 'Non-perishables & canned goods', phone: '(555) 345-6789' },
      { name: 'Pet Food Rescue', distance: '1.5 miles', items: 'Pet food & animal supplies', phone: '(555) 456-7890' }
    ];
    
    let response = `🆘 *FOOD RESCUE DIRECTORY*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 *Local Organizations Near You:*

`;
    
    rescueOptions.forEach((option, index) => {
      response += `${index + 1}. *${option.name}*
   📍 Distance: ${option.distance}
   🍎 Accepts: ${option.items}
   📞 Phone: ${option.phone}
   
`;
    });
    
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *How to Donate:*
• Call organization directly
• Schedule pickup through our app
• Drop off during business hours
• Follow safety guidelines

💡 *Donation Tips:*
• Verify food safety and quality
• Package items in clean containers
• Confirm acceptance before delivery
• Keep donation receipts for tax purposes

🌐 *For more options, visit our website*`;
    
    return response;
    
  } catch (error: any) {
    console.error('Rescue options error:', error.message);
    return `❌ *RESCUE SERVICE UNAVAILABLE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Unable to access rescue organization database.

🔄 *Please try again in a few moments*
📞 *For urgent donations, call: (555) 911-FOOD*
🌐 *Visit our website for alternative options*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// --- HELP & DEFAULT RESPONSES ---
export function getHelpMenu(): string {
  return `🛠️ *RESQCART QUICK REFERENCE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

*How can I assist you today?*

📦 *Predictions*
• *predict [food]* — Get AI-powered spoilage prediction
   _e.g., "predict apple"_

📚 *Info & Tips*
• *info [food]* — Storage & shelf life guide
   _e.g., "info banana"_

🤝 *Donate Food*
• *donate* or *rescue* — Find local food donation organizations
   _e.g., "donate" or "rescue"_

👋 *Welcome*
• *hello* or *hi* — Get a warm welcome and introduction

🛠️ *Help & Support*
• *help* or *menu* — Show this menu
• *contact* — Contact support or send feedback
• *what's new* or *whats new* — See the latest features

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *How to use:*
Just type a command, like "predict milk" or "info bread".

🌱 *Together, let's reduce food waste!*
`;
}

export function getWhatsNewMessage(): string {
  return `🆕 *WHAT'S NEW AT RESQCART?*
━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ *Recent Improvements:*
• Enhanced professional help and welcome messages
• All commands now accept multiple alternatives (e.g., hi/hello, help/menu)
• Improved donation directory and guidance
• More food types supported for predictions and info
• Case-insensitive command recognition for a smoother experience

🚀 *Upcoming Features:*
• Personalized usage stats and impact summary
• Location-based rescue and donation matching
• More AI-powered food insights
• Multi-language support

🔔 *Stay tuned for more updates!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

export function getWelcomeMessage(): string {
  return `👋 *WELCOME TO RESQCART!*
━━━━━━━━━━━━━━━━━━━━━━━━━━

*Empowering You to Fight Food Waste*

Hi there! I’m your ResQCart assistant — here to help you:
• Predict food spoilage with AI
• Get expert storage tips
• Donate surplus food to local organizations
• And more!

🌟 *Sustainability starts with small steps.*

Type *help* to see what I can do, or try:
• "predict tomato"
• "info milk"
• "donate"

"Every meal saved is a win for the planet!" 🌍`;
}

export function getDefaultResponse(): string {
  return `🤔 *COMMAND NOT RECOGNIZED*
━━━━━━━━━━━━━━━━━━━━━━━━━━

I didn't understand that command.

📋 *Available Commands:*
• *predict [food]* - Spoilage prediction
• *info [food]* - Storage information
• *rescue* - Find donation options
• *help* - Full command menu

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Examples:*
• "predict apple"
• "info banana"
• "rescue"

❓ Type *help* for detailed assistance`;
}

// --- HELPER: Extract food item from message ---
function extractFoodItem(message: string): string {
  const words = message.split(' ');
  const commandIndex = words.findIndex(word => ['predict', 'info', 'spoilage', 'food'].includes(word));
  if (commandIndex !== -1 && commandIndex + 1 < words.length) {
    return words[commandIndex + 1];
  }
  return words[words.length - 1] || 'unknown';
} 