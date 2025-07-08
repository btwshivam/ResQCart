// Food spoilage prediction handler
export function predictSpoilage(message: string): string {
  console.log('🔮 Predicting spoilage for:', message);
  
  // Extract food item from message
  const foodItem = extractFoodItem(message);
  console.log('🍎 Food item extracted:', foodItem);
  
  // Simulate prediction logic
  const predictions = {
    'apple': { days: 7, status: 'Good', confidence: 85 },
    'banana': { days: 3, status: 'Warning', confidence: 78 },
    'tomato': { days: 5, status: 'Good', confidence: 82 },
    'milk': { days: 2, status: 'Critical', confidence: 90 },
    'bread': { days: 4, status: 'Warning', confidence: 75 }
  };
  
  const prediction = predictions[foodItem as keyof typeof predictions] || { 
    days: Math.floor(Math.random() * 7) + 1, 
    status: 'Unknown', 
    confidence: 70 
  };
  
  console.log('📊 Prediction result:', prediction);
  
  return `🔮 *Spoilage Prediction for ${foodItem}*

⏰ *Estimated shelf life:* ${prediction.days} days
📊 *Status:* ${prediction.status}
🎯 *Confidence:* ${prediction.confidence}%

💡 *Recommendations:*
• Store in refrigerator if not already
• Check for visible signs of spoilage
• Consider donating if still good

Type *info ${foodItem}* for storage tips!`;
}

// Food information handler
export function getFoodInfo(message: string): string {
  console.log('📚 Getting food info for:', message);
  
  const foodItem = extractFoodItem(message);
  console.log('🍎 Food item extracted:', foodItem);
  
  const foodInfo = {
    'apple': {
      storage: 'Refrigerate at 32-35°F',
      shelf_life: '2-4 weeks',
      tips: 'Keep away from other fruits, check for bruises'
    },
    'banana': {
      storage: 'Room temperature, then refrigerate when ripe',
      shelf_life: '3-7 days',
      tips: 'Separate from other fruits, peel and freeze when overripe'
    },
    'tomato': {
      storage: 'Room temperature, refrigerate when cut',
      shelf_life: '1-2 weeks',
      tips: 'Store stem-side down, avoid direct sunlight'
    },
    'milk': {
      storage: 'Refrigerate at 40°F or below',
      shelf_life: '5-7 days after opening',
      tips: 'Keep in coldest part of fridge, check expiration date'
    },
    'bread': {
      storage: 'Room temperature or freeze',
      shelf_life: '5-7 days',
      tips: 'Store in bread box or freeze for longer shelf life'
    }
  };
  
  const info = foodInfo[foodItem as keyof typeof foodInfo] || {
    storage: 'Check packaging for instructions',
    shelf_life: 'Varies by item',
    tips: 'Store in cool, dry place'
  };
  
  console.log('📖 Food info retrieved:', info);
  
  return `📚 *Food Information: ${foodItem}*

🌡️ *Storage:* ${info.storage}
⏰ *Shelf Life:* ${info.shelf_life}
💡 *Tips:* ${info.tips}

🔮 Type *predict ${foodItem}* for spoilage prediction!`;
}

// Rescue options handler
export function getRescueOptions(message: string): string {
  console.log('🆘 Getting rescue options for:', message);
  
  // Simulate finding nearby rescue options
  const rescueOptions = [
    { name: 'Food Bank Central', distance: '0.5 miles', items: 'All food types' },
    { name: 'Community Kitchen', distance: '1.2 miles', items: 'Fresh produce' },
    { name: 'Local Shelter', distance: '0.8 miles', items: 'Non-perishables' },
    { name: 'Animal Shelter', distance: '1.5 miles', items: 'Pet food' }
  ];
  
  console.log('📍 Rescue options found:', rescueOptions);
  
  let response = `🆘 *Food Rescue Options Nearby*

📍 *Available locations:*\n`;
  
  rescueOptions.forEach((option, index) => {
    response += `${index + 1}. *${option.name}*\n   📍 ${option.distance} away\n   🍎 Accepts: ${option.items}\n\n`;
  });
  
  response += `📞 *To donate:*
• Call the location directly
• Use our app for pickup scheduling
• Drop off during business hours

💡 *Donation tips:*
• Ensure food is still safe to eat
• Package items properly
• Call ahead to confirm acceptance

Type *help* for more options!`;
  
  return response;
}

// Helper functions for responses
export function getHelpMenu(): string {
  return `🍎 *ResQCart WhatsApp Bot* 🍎

Available commands:
• *help* or *menu* - Show this menu
• *predict [food]* - Predict spoilage (e.g., "predict apple")
• *info [food]* - Get food information (e.g., "info banana")
• *rescue* - Find rescue/donation options
• *hello* - Welcome message

Example: "predict apple" or "info banana"`;
}

export function getWelcomeMessage(): string {
  return `👋 *Welcome to ResQCart!* 

We help reduce food waste through smart predictions and rescue networks.

Type *help* to see available options or try:
• "predict apple" 
• "info banana"
• "rescue"`;
}

export function getDefaultResponse(): string {
  return `🤔 I didn't understand that command.

Type *help* to see available options or try:
• "predict apple"
• "info banana" 
• "rescue"`;
}

// Helper function to extract food item from message
function extractFoodItem(message: string): string {
  const words = message.split(' ');
  const commandIndex = words.findIndex(word => 
    ['predict', 'info', 'spoilage', 'food'].includes(word)
  );
  
  if (commandIndex !== -1 && commandIndex + 1 < words.length) {
    return words[commandIndex + 1];
  }
  
  // Fallback: return the last word if no command found
  return words[words.length - 1] || 'unknown';
} 