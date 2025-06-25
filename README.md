# ResQCart: Food Waste Prediction & Rescue Network

## 🎯 Executive Summary

**Problem Statement:** Walmart loses $1.8B annually due to food waste, while 38M Americans face food insecurity. Current markdown systems are reactive and inefficient, leading to massive waste and missed revenue opportunities.

**Solution:** AI-powered predictive system that forecasts product expiration 3-7 days in advance, automatically triggering a cascading rescue protocol through dynamic pricing, community partnerships, and employee programs.

**Impact:** 40% reduction in food waste, $720M annual savings, 50M meals redirected to food banks, enhanced brand reputation as sustainability leader.

## 🧠 Technical Architecture

### Core AI Engine

**Predictive Models:** Multi-variate time series analysis combining:
- Historical sales velocity data
- Product-specific shelf life algorithms
- Environmental factors (temperature, humidity)
- Seasonal demand patterns
- Local event impacts (sports games, holidays)
- Weather correlation analysis

**Real-time Data Integration:**
- IoT sensors on shelves and storage areas
- POS system integration
- Inventory management system feeds
- Supply chain logistics data
- Customer traffic patterns

### Automated Rescue Protocol (ARP)

**Day 7-5 Before Expiry: Predictive Early Warning**
- AI identifies at-risk products
- Automated inventory rebalancing between stores
- Supply chain adjustment recommendations

**Day 4-3 Before Expiry: Dynamic Pricing Activation**
- Automatic 15-30% price reduction
- Customer app notifications to nearby users
- Targeted digital coupons for relevant customers

**Day 2-1 Before Expiry: Community Rescue Mode**
- Instant alerts to partner food banks
- Employee purchase program activation (50% discount)
- Bulk sale opportunities to local restaurants/caterers

**Day of Expiry: Final Rescue Attempts**
- Flash sale notifications (70% off)
- Community pickup alerts
- Compost/recycling program routing

## 📁 Project Structure

The project consists of three main components:

### Frontend
- React with TypeScript
- User interfaces for store managers, employees, and partners
- Real-time dashboards and analytics
- Mobile-responsive design
- Tailwind CSS for styling

### Backend
- Node.js with Express
- REST API endpoints for data exchange
- Authentication and authorization
- Integration with ML models
- MongoDB database for product and user management

### AIML
- Milk waste prediction models (initial focus)
- Data preprocessing and feature engineering
- Model training and evaluation
- API for model inference

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB
- Docker (optional)

### Installation

**Clone the repository:**
```
git clone https://github.com/btwshivam/ResQCart.git
cd ResQCart
```

**Frontend Setup:**
```
cd frontend
npm install
npm run dev
```

**Backend Setup:**
```
cd backend
npm install
npm run dev
```

**AIML Setup:**
```
cd aiml
pip install -r requirements.txt
python -m src.api.server
```

### Environment Variables

The project includes environment files for easy setup:

**Backend (.env):**
```
PORT=3000
MONGODB_URI="your_mongodb_connection_string"
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
ML_API_URL=http://localhost:8000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000/api
VITE_ML_API_URL=http://localhost:8000
```

## 🔄 Workflow

1. **Data Collection:** Continuous ingestion of sales, inventory, and environmental data
2. **Prediction:** AI models forecast product expiration dates
3. **Notification:** System alerts stakeholders based on expiration timeline
4. **Action:** Dynamic pricing and rescue protocols are activated
5. **Feedback:** System learns from outcomes to improve future predictions

## 👥 Team

- Dikshant
- Shivam
- Nupur
- Onkar

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. 