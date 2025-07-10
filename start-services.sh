#!/bin/bash

echo "🚀 Starting ResQCart Services for Real-time YOLO Video Prediction"
echo "================================================================"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check if required ports are available
echo "Checking port availability..."
check_port 3001 || exit 1
check_port 8000 || exit 1
check_port 5173 || echo "⚠️  Port 5173 (frontend) might be in use, but that's okay"

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install AIML dependencies
echo "Installing AIML dependencies..."
cd aiml
if [ -d "venv" ]; then
    echo "Virtual environment found, activating..."
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi
cd ..

echo ""
echo "🔧 Starting services..."

# Start AIML service in background
echo "Starting AIML service on port 8000..."
cd aiml
source venv/bin/activate
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload &
AIML_PID=$!
cd ..

# Wait a moment for AIML service to start
sleep 3

# Start backend service in background
echo "Starting backend service on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend service to start
sleep 3

# Start frontend service in background
echo "Starting frontend service on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Services running on:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   AIML:     http://localhost:8000"
echo ""
echo "📱 To use real-time video prediction:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Click on the 'Video' tab in the navbar"
echo "   3. Allow camera access when prompted"
echo "   4. Click 'Start Stream' to begin real-time prediction"
echo ""
echo "🛑 To stop all services, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $AIML_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait 