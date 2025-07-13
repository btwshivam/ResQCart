from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import numpy as np
import cv2
from torchvision import models, transforms
import random
import math
import datetime
import os
import base64
import json
import hashlib
from typing import List
import hashlib 
from pydantic import BaseModel
import os, requests
from dotenv import load_dotenv

from ultralytics import YOLO
from typing import List

""" well if u want to run the yolo model locally u can use the archive scripts.
    Here the yolo model is added in same fastapi for integrating it with frontend.
"""

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected clients
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Initialize models with error handling
yolo_model = None
model = None
device = torch.device('cpu')

try:
    print("Loading YOLO model...")
    yolo_model = YOLO('models/trained/yolo_apple.pt')
    print("YOLO model loaded successfully")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    yolo_model = None

try:
    print("Loading CNN model...")
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Sequential(
        torch.nn.Linear(model.fc.in_features, 128),
        torch.nn.ReLU(),
        torch.nn.Linear(128, 1),
        torch.nn.Sigmoid()
    )
    model.load_state_dict(torch.load('models/trained/spoilage_cnn.pth', map_location=device))
    model.eval()
    model = model.to(device)
    print("CNN model loaded successfully")
except Exception as e:
    print(f"Error loading CNN model: {e}")
    model = None

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def simulate_apple_sensor_data(prediction, confidence, box):

    # using bounding box and prediction as seed
    seed_str = f"{box}-{prediction}"
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (2**32)
    random.seed(seed)

    if prediction == 'rottenapples':
        ethylene = round(5.0 + (confidence * 5) + random.uniform(-0.5, 0.5), 2)
        ethylene = max(1.0, min(ethylene, 10.0))
        temp = round(27.0 + random.uniform(-1.0, 1.0), 1)
        humidity = round(75.0 + random.uniform(-2.0, 2.0), 1)
    else:
        ethylene = round(0.5 + (confidence * 0.5) + random.uniform(-0.1, 0.1), 2)
        ethylene = max(0.1, min(ethylene, 1.5))
        temp = round(22.0 + random.uniform(-1.0, 1.0), 1)
        humidity = round(65.0 + random.uniform(-2.0, 2.0), 1)

    return {
        'ethylene_ppm': ethylene,
        'temperature_c': temp,
        'humidity_percent': humidity
    }

def simulate_business_context():
    """
    Simulate daily sales, stock, and shelf life.
    """
    daily_sales_rate = random.choice([15,20, 30, 50, 70])
    stock_level = random.choice([60, 85, 100, 150, 180])
    shelf_life_days = 14

    days_in_stock = random.randint(0, shelf_life_days)
    estimated_shelf_life_days = shelf_life_days - days_in_stock

    return {
        'daily_sales_rate': daily_sales_rate,
        'stock_level': stock_level,
        'estimated_shelf_life_days': estimated_shelf_life_days
    }


def dynamic_apple_price_engine(prediction, confidence, sensor_data, daily_sales_rate=100, stock_level=500, estimated_shelf_life_days=10):
    base_price = 1.00
    ethylene = sensor_data['ethylene_ppm']

    context = simulate_business_context()
    daily_sales_rate = context['daily_sales_rate']
    stock_level = context['stock_level']
    estimated_shelf_life_days = context['estimated_shelf_life_days']

    if daily_sales_rate == 0:
        days_to_clear_stock = float('inf')
    else:
        days_to_clear_stock = stock_level / daily_sales_rate

    if prediction == 'freshapples':
        if days_to_clear_stock <= estimated_shelf_life_days:
            discount_percent = 0
        elif estimated_shelf_life_days < 3:
            discount_percent = 30
        else:
            discount_percent = min((days_to_clear_stock - estimated_shelf_life_days) * 2, 15)

        price = round(base_price * (1 - discount_percent / 100), 2)
        action = 'sell'
        message = None if discount_percent == 0 else "Discount to boost sales"

    elif prediction == 'rottenapples':
        if ethylene < 7.0:
            action = 'donate'
            discount_percent = 0
            price = 0.00
            message = 'Slightly spoiled, donate to food bank'
        else:
            action = 'dump'
            discount_percent = 0
            price = 0.00
            message = 'Dispose safely.'
    else:
        action = 'sell'
        discount_percent = 0
        price = base_price
        message = None

    return {
        'action': action,
        'discount_applied': discount_percent > 0,
        'discount_percent': round(discount_percent, 1),
        'price_usd': price,
        'message': message,
        'business_context': context 
    }

def safe_crop_box(box, frame_shape):
    """
    Ensure YOLO box coordinates are valid and inside frame bounds.
    Returns clamped (x1, y1, x2, y2).
    """
    x1, y1, x2, y2 = box
    h, w = frame_shape[:2]

    # Round coordinates
    x1 = max(0, min(int(round(x1)), w - 1))
    y1 = max(0, min(int(round(y1)), h - 1))
    x2 = max(x1 + 1, min(int(round(x2)), w))
    y2 = max(y1 + 1, min(int(round(y2)), h))

    return x1, y1, x2, y2

@app.post("/detect")
async def detect_apples(file: UploadFile = File(...)):
    if yolo_model is None:
        raise HTTPException(status_code=503, detail="YOLO model not available. Please check server logs.")
        
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    contents = await file.read()
    # Read image to OpenCV
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    results = yolo_model(frame, conf=0.5, device='cpu')
    response_data = []

    for result in results:
        boxes = result.boxes.xyxy.cpu().numpy()
        for box in boxes:
            x1, y1, x2, y2 = safe_crop_box(box[:4], frame.shape)
            apple_crop = frame[y1:y2, x1:x2]

            if apple_crop.size == 0:
                continue

            apple_crop_rgb = cv2.cvtColor(apple_crop, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(apple_crop_rgb)

            image_tensor = transform(pil_image).unsqueeze(0).to(device)
            with torch.no_grad():
                pred = model(image_tensor).item()
                prediction = 'rottenapples' if pred > 0.8 else 'freshapples'

            sensor_data = simulate_apple_sensor_data(prediction, pred, box)
            pricing = dynamic_apple_price_engine(prediction, pred, sensor_data)

            response_data.append({
                "box": [x1, y1, x2, y2],
                "prediction": prediction,
                "confidence": pred,
                "sensor_data": sensor_data,
                "pricing": pricing
            })

    return {"detections": response_data}

def deterministic_seed_from_sku(sku: str):
    hash_bytes = hashlib.md5(sku.encode()).digest()
    seed = int.from_bytes(hash_bytes[:4], 'big')
    random.seed(seed)

def simulate_milk_spoilage_data(sku):
    today = datetime.datetime.today()
    deterministic_seed_from_sku(sku)  # Seeded randomness per SKU

    if sku == 'whole_milk_1gal':
        shelf_life_days = random.randint(14, 21)
        days_past_expiry = random.randint(0, 14)
        pH = round(random.uniform(4.5, 6.6), 2)
        bacterial_load = round(random.uniform(6.0, 10.0), 2)
    elif sku == 'skim_milk_1gal':
        shelf_life_days = random.randint(21, 28)
        days_past_expiry = random.randint(0, 21)
        pH = round(random.uniform(5.0, 6.6), 2)
        bacterial_load = round(random.uniform(4.0, 9.0), 2)
    elif sku == 'lowfat_milk_1gal':
        shelf_life_days = random.randint(21, 28)
        days_past_expiry = random.randint(0, 21)
        pH = round(random.uniform(5.0, 6.6), 2)
        bacterial_load = round(random.uniform(4.0, 9.0), 2)
    elif sku == 'uht_milk_1qt':
        shelf_life_days = random.randint(90, 180)
        days_past_expiry = random.randint(0, 60)
        pH = round(random.uniform(6.0, 6.6), 2)
        bacterial_load = round(random.uniform(2.0, 7.0), 2)
    else:
        raise HTTPException(status_code=400, detail="Invalid SKU")

    production_date = today - datetime.timedelta(days=shelf_life_days + days_past_expiry)
    expiry_date = production_date + datetime.timedelta(days=shelf_life_days)
    storage_temp = round(random.uniform(0.0, 10.0), 1)

    return {
        'sku': sku,
        'production_date': production_date.strftime('%Y-%m-%d'),
        'expiry_date': expiry_date.strftime('%Y-%m-%d'),
        'days_past_expiry': days_past_expiry,
        'pH': pH,
        'bacterial_load_log_cfu_ml': bacterial_load,
        'storage_temperature_c': storage_temp
    }

def simulate_milk_business_context(sku: str):
    deterministic_seed_from_sku(sku + "biz")  # Different seed from spoilage
    demand = random.choice(['low', 'medium', 'high'])
    sales_rate = {
        'low': random.randint(10, 50),
        'medium': random.randint(50, 100),
        'high': random.randint(100, 200)
    }[demand]

    stock_level = random.randint(100, 1000)
    return {
        'demand': demand,
        'daily_sales_rate': sales_rate,
        'stock_level': stock_level
    }

def _predict_milk_spoilage(spoilage_data):
    w1, w2, w3 = 0.5, -1.0, 0.8
    b = -5.0
    x1 = spoilage_data['days_past_expiry']
    x2 = spoilage_data['pH']
    x3 = spoilage_data['bacterial_load_log_cfu_ml']
    z = w1 * x1 + w2 * x2 + w3 * x3 + b
    probability = 1 / (1 + math.exp(-z))
    prediction = 'spoiled' if probability > 0.5 else 'fresh'
    return prediction, probability


def dynamic_milk_price_engine(prediction, probability, spoilage_data, context):
    sku = spoilage_data['sku']
    base_price = 3.45 if sku in ['whole_milk_1gal', 'skim_milk_1gal', 'lowfat_milk_1gal'] else 1.50

    stock = context['stock_level']
    sales = context['daily_sales_rate']
    shelf_life_left = max(0, 10 - spoilage_data['days_past_expiry'])  # fallback in case days_past_expiry is used differently
    days_to_expiry = max(0, (datetime.datetime.strptime(spoilage_data['expiry_date'], "%Y-%m-%d") - datetime.datetime.now()).days)

    pH_threshold = 5.0 if sku == 'whole_milk_1gal' else 5.5
    bacteria_threshold = 9.0 if sku == 'whole_milk_1gal' else 8.0

    # Always enforce expiry first
    if spoilage_data['days_past_expiry'] > 0 or days_to_expiry <= 0:
        return {
            'action': 'dump',
            'discount_applied': False,
            'discount_percent': 0,
            'price_usd': 0.0,
            'message': 'Expired product. Must be dumped per food safety law.',
            'business_context': context
        }

    # If predicted spoiled or bad sensor data → dump
    if prediction == 'spoiled' or spoilage_data['pH'] < pH_threshold or spoilage_data['bacterial_load_log_cfu_ml'] > bacteria_threshold:
        return {
            'action': 'dump',
            'discount_applied': False,
            'discount_percent': 0,
            'price_usd': 0.0,
            'message': 'Unsafe spoilage risk. Must dump.',
            'business_context': context
        }

    # If near expiry and stock is very high → donate some
    if days_to_expiry <= 2 and stock > sales * 2:
        return {
            'action': 'donate',
            'discount_applied': False,
            'discount_percent': 0,
            'price_usd': 0.0,
            'message': 'Near expiry with surplus stock. Donate portion to community.',
            'business_context': context
        }

    # Otherwise, safe to sell at full price
    return {
        'action': 'sell',
        'discount_applied': False,
        'discount_percent': 0,
        'price_usd': base_price,
        'message': 'Product safe. Sell at full price.',
        'business_context': context
    }

def generate_explanation_message(spoilage_data, prediction, probability):
    return (
        f"The prediction for {spoilage_data['sku']} was calculated using a logistic regression model "
        f"based on spoilage indicators: pH={spoilage_data['pH']}, days past expiry={spoilage_data['days_past_expiry']}, "
        f"and bacterial load={spoilage_data['bacterial_load_log_cfu_ml']} log CFU/mL. "
        f"Probability of spoilage: {probability:.2f}. Storage temp: {spoilage_data['storage_temperature_c']}°C. "
        f"Recommended action: '{prediction.upper()}' based on predicted safety and shelf risk."
    )


@app.post("/predict_milk_spoilage")
async def predict_milk_spoilage(sku: str = "whole_milk_1gal"):
    if sku not in ['whole_milk_1gal', 'skim_milk_1gal', 'lowfat_milk_1gal', 'uht_milk_1qt']:
        raise HTTPException(status_code=400, detail="Invalid SKU.")

    spoilage_data = simulate_milk_spoilage_data(sku)
    prediction, probability = _predict_milk_spoilage(spoilage_data)
    context = simulate_milk_business_context(sku)
    pricing = dynamic_milk_price_engine(prediction, probability, spoilage_data, context)
    explanation = generate_explanation_message(spoilage_data, prediction, probability)

    return {
        'sku': sku,
        'spoilage_data': spoilage_data,
        'prediction': prediction,
        'probability': round(probability, 3),
        'pricing': pricing,
        'explanation': explanation
    }

@app.get("/")
async def root():
    return {
        "message": "ResQCart API is running",
        "endpoints": {
            "/detect": "POST - Upload an image to detect and analyze apples",
            "/predict_milk_spoilage": "POST - Analyze milk spoilage based on SKU",
            "/ws/video": "WebSocket - Real-time video prediction"
        },
        "status": {
            "yolo_model_loaded": yolo_model is not None,
            "cnn_model_loaded": model is not None
        }
    }

@app.websocket("/ws/video")
async def websocket_video_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print("WebSocket connection accepted")
    try:
        while True:
            # Receive base64 encoded frame from client
            data = await websocket.receive_text()
            print(f"Got data: {len(data)} chars")
            frame_data = json.loads(data)
            # print("Received raw data:", data)
            # print("Parsed frame_data:", frame_data)
            
            if frame_data.get("type") == "frame":
                print("Got frame!")
                # Decode base64 frame
                frame_bytes = base64.b64decode(frame_data["frame"])
                nparr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                print(f"Received frame: shape={frame.shape if frame is not None else None}, dtype={frame.dtype if frame is not None else None}")
                
                if frame is not None:
                    if yolo_model is None:
                        print("YOLO model not available")
                        await manager.send_personal_message(json.dumps({
                            "type": "error",
                            "message": "YOLO model not available"
                        }), websocket)
                        continue
                        
                    # Resize frame to 640x640 for YOLO
                    frame_resized = cv2.resize(frame, (640, 640))
                    # (Optional) Convert to RGB if your YOLO model expects RGB
                    frame_resized = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
                    
                    try:
                        results = yolo_model(frame_resized, conf=0.2, device='cpu')
                        print(f"YOLO results: {len(results)} detections")
                        detections = []
                        
                        for result in results:
                            boxes = result.boxes.xyxy.cpu().numpy()
                            confidences = result.boxes.conf.cpu().numpy()
                            class_ids = result.boxes.cls.cpu().numpy()
                            
                            for i, box in enumerate(boxes):
                                x1, y1, x2, y2 = safe_crop_box(box[:4], frame.shape)
                                height, width, _ = frame_resized.shape
                                x1, y1 = max(0, x1), max(0, y1)
                                x2, y2 = min(width, x2), min(height, y2)
                                confidence = float(confidences[i])
                                class_id = int(class_ids[i])
                                
                                # Get class name (assuming apple detection)
                                class_name = "apple" if class_id == 0 else f"object_{class_id}"
                                
                                # Crop detected object for further analysis
                                if x2 > x1 and y2 > y1:
                                    object_crop = frame_resized[y1:y2, x1:x2]
                                    if object_crop.size > 0:
                                        object_crop_rgb = cv2.cvtColor(object_crop, cv2.COLOR_BGR2RGB)
                                        pil_image = Image.fromarray(object_crop_rgb)
                                        
                                        try:
                                            image_tensor = transform(pil_image).unsqueeze(0).to(device)
                                            with torch.no_grad():
                                                pred = model(image_tensor).item()
                                                prediction = 'rotten' if pred > 0.8 else 'fresh'
                                        except Exception as e:
                                            print(f"Error in CNN prediction: {e}")
                                            prediction = 'unknown'
                                        
                                        detections.append({
                                            "box": [x1, y1, x2, y2],
                                            "class": class_name,
                                            "confidence": confidence,
                                            "prediction": prediction,
                                            "timestamp": datetime.datetime.now().isoformat()
                                        })
                        
                        # Send results back to client
                        response = {
                            "type": "detection_results",
                            "detections": detections,
                            "frame_count": frame_data.get("frame_count", 0),
                            "timestamp": datetime.datetime.now().isoformat()
                        }
                        
                        await manager.send_personal_message(json.dumps(response), websocket)
                        
                    except Exception as e:
                        print(f"Error in YOLO processing: {e}")
                        await manager.send_personal_message(json.dumps({
                            "type": "error",
                            "message": f"Processing error: {str(e)}"
                        }), websocket)
            
            elif frame_data.get("type") == "ping":
                # Keep connection alive
                await manager.send_personal_message(json.dumps({"type": "pong"}), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket)

@app.post("/process_video_frame")
async def process_video_frame(frame_data: dict):
    """Alternative HTTP endpoint for video frame processing"""
    if yolo_model is None:
        raise HTTPException(status_code=503, detail="YOLO model not available")
    
    try:
        # Decode base64 frame
        frame_bytes = base64.b64decode(frame_data["frame"])
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Could not decode frame")
        
        # Process with YOLO
        results = yolo_model(frame, conf=0.5, device='cpu')
        detections = []
        
        for result in results:
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy()
            
            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = safe_crop_box(box[:4], frame.shape)
                confidence = float(confidences[i])
                class_id = int(class_ids[i])
                class_name = "apple" if class_id == 0 else f"object_{class_id}"
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "class": class_name,
                    "confidence": confidence,
                    "timestamp": datetime.datetime.now().isoformat()
                })
        
        return {
            "detections": detections,
            "frame_count": frame_data.get("frame_count", 0),
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

""" for resq cart -> route optimization to nearby ngo's"""

load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
# Don't raise error if API key is not available - we'll provide mock data instead

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Location(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float

@app.post("/nearby-ngos")
def nearby_ngos(loc: Location):
    if not API_KEY:
        # Provide mock data when API key is not available
        mock_ngos = [
            {
                "name": "Community Food Bank",
                "address": "123 Main Street, Downtown",
                "lat": loc.lat + 0.01,
                "lng": loc.lng + 0.01,
                "place_id": "mock_place_1",
                "rating": 4.5,
                "types": ["food", "charity"]
            },
            {
                "name": "Hope Kitchen",
                "address": "456 Oak Avenue, Westside",
                "lat": loc.lat - 0.008,
                "lng": loc.lng + 0.015,
                "place_id": "mock_place_2",
                "rating": 4.2,
                "types": ["food", "charity"]
            },
            {
                "name": "Second Harvest Food Bank",
                "address": "789 Pine Street, Eastside",
                "lat": loc.lat + 0.012,
                "lng": loc.lng - 0.005,
                "place_id": "mock_place_3",
                "rating": 4.7,
                "types": ["food", "charity"]
            },
            {
                "name": "Neighborhood Pantry",
                "address": "321 Elm Street, Northside",
                "lat": loc.lat - 0.015,
                "lng": loc.lng - 0.008,
                "place_id": "mock_place_4",
                "rating": 4.0,
                "types": ["food", "charity"]
            }
        ]
        return {"ngos": mock_ngos, "total": len(mock_ngos), "note": "Using mock data - Google Maps API key not configured"}

    try:
        # Use the newer Places API (New) instead of legacy API
        url = (
            f"https://places.googleapis.com/v1/places:searchNearby"
        )
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.types,places.id"
        }
        
        data = {
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": loc.lat,
                        "longitude": loc.lng
                    },
                    "radius": 15000.0
                }
            },
            "includedTypes": ["food"],
            "textQuery": "food bank charity ngo food pantry"
        }

        res = requests.post(url, json=data, headers=headers, timeout=10)
        res.raise_for_status()
        data = res.json()

        ngos = []
        for place in data.get("places", []):
            location = place.get("location", {})
            ngo = {
                "name": place.get("displayName", {}).get("text", "Unknown NGO"),
                "address": place.get("formattedAddress", "Address not available"),
                "lat": location.get("latitude", 0),
                "lng": location.get("longitude", 0),
                "place_id": place.get("id", ""),
                "rating": place.get("rating"),
                "types": place.get("types", [])
            }
            ngos.append(ngo)

        return {"ngos": ngos, "total": len(ngos)}

    except requests.RequestException as e:
        # If the new API fails, fall back to mock data
        print(f"Google Maps API error: {e}")
        mock_ngos = [
            {
                "name": "Community Food Bank",
                "address": "123 Main Street, Downtown",
                "lat": loc.lat + 0.01,
                "lng": loc.lng + 0.01,
                "place_id": "mock_place_1",
                "rating": 4.5,
                "types": ["food", "charity"]
            },
            {
                "name": "Hope Kitchen",
                "address": "456 Oak Avenue, Westside",
                "lat": loc.lat - 0.008,
                "lng": loc.lng + 0.015,
                "place_id": "mock_place_2",
                "rating": 4.2,
                "types": ["food", "charity"]
            },
            {
                "name": "Second Harvest Food Bank",
                "address": "789 Pine Street, Eastside",
                "lat": loc.lat + 0.012,
                "lng": loc.lng - 0.005,
                "place_id": "mock_place_3",
                "rating": 4.7,
                "types": ["food", "charity"]
            },
            {
                "name": "Neighborhood Pantry",
                "address": "321 Elm Street, Northside",
                "lat": loc.lat - 0.015,
                "lng": loc.lng - 0.008,
                "place_id": "mock_place_4",
                "rating": 4.0,
                "types": ["food", "charity"]
            }
        ]
        return {"ngos": mock_ngos, "total": len(mock_ngos), "note": "Using mock data - Google Maps API error occurred"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding NGOs: {str(e)}")

@app.post("/route")
def get_route(req: RouteRequest):
    if not API_KEY:
        # Provide mock route data when API key is not available
        # Calculate approximate distance and duration
        lat_diff = req.dest_lat - req.origin_lat
        lng_diff = req.dest_lng - req.origin_lng
        distance_km = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111  # Rough conversion to km
        duration_min = int(distance_km * 2)  # Rough estimate: 2 min per km
        
        mock_steps = [
            {
                "distance": f"{distance_km:.1f} km",
                "duration": f"{duration_min} min",
                "instruction": f"Head towards {req.dest_lat:.4f}, {req.dest_lng:.4f}"
            }
        ]
        
        return {
            "polyline": "",  # No polyline for mock data
            "steps": mock_steps,
            "summary": {
                "total_distance": f"{distance_km:.1f} km",
                "total_duration": f"{duration_min} min",
                "total_steps": 1
            },
            "note": "Using mock data - Google Maps API key not configured"
        }

    try:
        # Use the newer Routes API instead of legacy Directions API
        url = (
            f"https://routes.googleapis.com/directions/v2:computeRoutes"
        )
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps"
        }
        
        data = {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": req.origin_lat,
                        "longitude": req.origin_lng
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": req.dest_lat,
                        "longitude": req.dest_lng
                    }
                }
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE"
        }

        res = requests.post(url, json=data, headers=headers, timeout=10)
        res.raise_for_status()
        data = res.json()

        if not data.get("routes"):
            raise HTTPException(status_code=404, detail="No routes found")

        route = data["routes"][0]
        overview_polyline = route.get("polyline", {}).get("encodedPolyline", "")

        # Extract detailed step-by-step directions
        steps = []
        total_distance = 0
        total_duration = 0

        for leg in route.get("legs", []):
            total_distance += leg.get("distanceMeters", 0)
            total_duration += leg.get("duration", "").replace("s", "")

            for step in leg.get("steps", []):
                steps.append({
                    "distance": f"{step.get('distanceMeters', 0) / 1000:.1f} km",
                    "duration": step.get("duration", "").replace("s", "") + " min",
                    "instruction": step.get("navigationInstruction", {}).get("instructions", "Continue")
                })

        return {
            "polyline": overview_polyline, 
            "steps": steps,
            "summary": {
                "total_distance": f"{total_distance / 1000:.1f} km",
                "total_duration": f"{int(total_duration) // 60} min",
                "total_steps": len(steps)
            }
        }

    except requests.RequestException as e:
        # If the new API fails, fall back to mock data
        print(f"Google Maps API error: {e}")
        lat_diff = req.dest_lat - req.origin_lat
        lng_diff = req.dest_lng - req.origin_lng
        distance_km = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111
        duration_min = int(distance_km * 2)
        
        mock_steps = [
            {
                "distance": f"{distance_km:.1f} km",
                "duration": f"{duration_min} min",
                "instruction": f"Head towards {req.dest_lat:.4f}, {req.dest_lng:.4f}"
            }
        ]
        
        return {
            "polyline": "",
            "steps": mock_steps,
            "summary": {
                "total_distance": f"{distance_km:.1f} km",
                "total_duration": f"{duration_min} min",
                "total_steps": 1
            },
            "note": "Using mock data - Google Maps API error occurred"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting route: {str(e)}")
