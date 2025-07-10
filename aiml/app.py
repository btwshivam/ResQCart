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

""" well if u want to run the yolo model locally u can use the archive scripts.
    Here the yolo model is added in same fastapi for integrating it with frontend.
"""

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.post("/detect")
async def detect_apples(file: UploadFile = File(...)):
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
            x1, y1, x2, y2 = map(int, box[:4])
            apple_crop = frame[y1:y2, x1:x2]

            if apple_crop.size == 0:
                continue

            apple_crop_rgb = cv2.cvtColor(apple_crop, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(apple_crop_rgb)

            image_tensor = transform(pil_image).unsqueeze(0).to(device)
            with torch.no_grad():
                pred = model(image_tensor).item()
                prediction = 'rottenapples' if pred > 0.8 else 'freshapples'

            sensor_data = simulate_apple_sensor_data(prediction, pred)
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
    try:
        while True:
            # Receive base64 encoded frame from client
            data = await websocket.receive_text()
            frame_data = json.loads(data)
            
            if frame_data.get("type") == "frame":
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
                                x1, y1, x2, y2 = map(int, box[:4])
                                confidence = float(confidences[i])
                                class_id = int(class_ids[i])
                                
                                # Get class name (assuming apple detection)
                                class_name = "apple" if class_id == 0 else f"object_{class_id}"
                                
                                # Crop detected object for further analysis
                                if x2 > x1 and y2 > y1:
                                    object_crop = frame[y1:y2, x1:x2]
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
                x1, y1, x2, y2 = map(int, box[:4])
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
if not API_KEY:
    raise RuntimeError("Set GOOGLE_MAPS_API_KEY in .env")

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
    url = (
        f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        f"?location={loc.lat},{loc.lng}"
        f"&radius=15000"
        f"&keyword=food+bank|charity|ngo"
        f"&key={API_KEY}"
    )
    res = requests.get(url).json()
    if res.get("status") != "OK":
        raise HTTPException(400, res.get("error_message", "Places API error"))
    ngos = []
    for p in res["results"]:
        ngos.append({
            "name": p["name"],
            "address": p.get("vicinity", ""),
            "lat": p["geometry"]["location"]["lat"],
            "lng": p["geometry"]["location"]["lng"],
            "place_id": p["place_id"]
        })
    return {"ngos": ngos}

@app.post("/route")
def get_route(req: RouteRequest):
    url = (
        f"https://maps.googleapis.com/maps/api/directions/json"
        f"?origin={req.origin_lat},{req.origin_lng}"
        f"&destination={req.dest_lat},{req.dest_lng}"
        f"&key={API_KEY}"
    )
    res = requests.get(url).json()
    if res.get("status") != "OK":
        raise HTTPException(400, res.get("error_message", "Directions API error"))
    route = res["routes"][0]
    overview_polyline = route["overview_polyline"]["points"]
    steps = [{
        "distance": s["distance"]["text"],
        "duration": s["duration"]["text"],
        "instruction": s["html_instructions"]
    } for leg in route["legs"] for s in leg["steps"]]
    return {"polyline": overview_polyline, "steps": steps}
