from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import torch
from torchvision import models, transforms
import io
import random
import math
import datetime

app = FastAPI()

model = models.resnet50(weights=None)
model.fc = torch.nn.Sequential(
    torch.nn.Linear(model.fc.in_features, 128),
    torch.nn.ReLU(),
    torch.nn.Linear(128, 1),
    torch.nn.Sigmoid()
)

model.load_state_dict(torch.load('models/spoilage_cnn.pth', map_location=torch.device('cpu')))
model.eval()
device = torch.device('cpu')
model = model.to(device)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict_apple_image")
async def predict_apple_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        output = model(image)
        pred = output.item()
        label = 'rottenapples' if pred > 0.8 else 'freshapples'
    
    return {"prediction": label, "confidence": pred}

def simulate_apple_sensor_data(prediction, confidence):
    if prediction == 'rottenapples':
        ethylene = round(random.uniform(1.0, 10.0), 2)
        temp = round(random.uniform(25.0, 30.0), 1)
        humidity = round(random.uniform(70.0, 80.0), 1)
    else:
        ethylene = round(random.uniform(0.1, 1.0), 2)
        temp = round(random.uniform(20.0, 25.0), 1)
        humidity = round(random.uniform(60.0, 70.0), 1)
    return {
        'ethylene_ppm': ethylene,
        'temperature_c': temp,
        'humidity_percent': humidity
    }

def dynamic_apple_price_engine(prediction, confidence, sensor_data):
    base_price = 1.00
    ethylene = sensor_data['ethylene_ppm']

    if prediction == 'freshapples':
        discount_percent = min(ethylene * 10, 10) if ethylene >= 0.2 else 0
        price = round(base_price * (1 - discount_percent / 100), 2)
        action = 'sell'
        message = None
    else:
        if confidence > 0.7:
            if ethylene < 5.0:
                action = 'sell'
                discount_percent = 30
                price = round(base_price * (1 - discount_percent / 100), 2)
                message = None
            elif ethylene < 10.0:
                action = 'donate'
                discount_percent = 0
                price = 0.00
                message = 'Donate to local food bank for community support.'
            else:
                action = 'dump'
                discount_percent = 0
                price = 0.00
                message = 'Dispose of spoiled apple safely to prevent contamination.'
        else:
            discount_percent = 20 + (confidence - 0.5) * 100 * 0.6
            discount_percent = min(discount_percent, 50)
            price = round(base_price * (1 - discount_percent / 100), 2)
            action = 'sell'
            message = None

    return {
        'action': action,
        'discount_applied': discount_percent>0,
        'discount_percent': round(discount_percent, 1),
        'price_usd': price,
        'message': message
    }

@app.post("/predict_apple_with_sensor")
async def predict_apple_with_sensor(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    contents = await file.read()
    # Directly reuse local prediction logic instead of hitting self
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(image)
        pred = output.item()
        prediction = 'rottenapples' if pred > 0.7 else 'freshapples'
    
    sensor_data = simulate_apple_sensor_data(prediction, pred)
    pricing = dynamic_apple_price_engine(prediction, pred, sensor_data)
    
    return {
        'prediction': prediction,
        'confidence': pred,
        'sensor_data': sensor_data,
        'pricing': pricing
    }

def simulate_milk_spoilage_data(sku):
    today = datetime.datetime(2025, 6, 29)  # Current date
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

def dynamic_milk_price_engine(prediction, probability, spoilage_data):
    base_price = 3.45 if spoilage_data['sku'] in ['whole_milk_1gal', 'skim_milk_1gal', 'lowfat_milk_1gal'] else 1.50
    sku = spoilage_data['sku']
    
    if prediction == 'fresh':
        days_threshold = 2 if sku == 'whole_milk_1gal' else 5
        discount_percent = min(spoilage_data['days_past_expiry'] * 2, 10) if spoilage_data['days_past_expiry'] >= days_threshold else 0
        price = round(base_price * (1 - discount_percent / 100), 2)
        action = 'sell'
        discount_applied = discount_percent > 0
        message = None
    else:
        pH_threshold = 5.0 if sku == 'whole_milk_1gal' else 5.5
        bacterial_threshold = 9.0 if sku == 'whole_milk_1gal' else 8.0
        if probability > 0.7 and spoilage_data['pH'] < pH_threshold:
            if spoilage_data['bacterial_load_log_cfu_ml'] < bacterial_threshold:
                action = 'donate'
                message = 'Donate to local food bank for community support, as milk is still usable for immediate consumption.'
                price = 0.00
                discount_applied = False
                discount_percent = 0
            else:
                action = 'dump'
                message = 'Dispose of spoiled milk safely to prevent health risks due to high bacterial contamination.'
                price = 0.00
                discount_applied = False
                discount_percent = 0
        else:
            discount_percent = 20 + (probability - 0.5) * 100 * 0.6
            discount_percent = min(discount_percent, 50)
            price = round(base_price * (1 - discount_percent / 100), 2)
            action = 'sell'
            discount_applied = True
            message = None
    return {
        'action': action,
        'discount_applied': discount_applied,
        'discount_percent': round(discount_percent, 1),
        'price_usd': price,
        'message': message
    }

def generate_explanation_message(spoilage_data, prediction, probability):
    pH = spoilage_data['pH']
    days = spoilage_data['days_past_expiry']
    bacterial_load = spoilage_data['bacterial_load_log_cfu_ml']
    temp = spoilage_data['storage_temperature_c']
    sku = spoilage_data['sku']
    expiry_date = spoilage_data['expiry_date']
    return (
        f"The spoilage prediction for {sku} was determined using a logistic regression model, "
        f"P(spoiled) = 1 / (1 + e^-(0.5*days + (-1.0)*pH + 0.8*bacterial_load - 5.0)), "
        f"based on research indicating pH, bacterial load, and days past expiry as key spoilage indicators "
        f"([ResearchGate: Screening of Bacteria Responsible for Milk Spoilage]). "
        f"For this sample, pH={pH}, days past expiry={days}, and bacterial load={bacterial_load} log CFU/mL "
        f"yielded a spoilage probability of {probability:.2f}. Storage at {temp}°C and expiry date {expiry_date} "
        f"were considered. The prediction '{prediction}' guides the action: sell with a discount for mildly spoiled milk, "
        f"donate if usable but not sellable, or dump if unsafe, optimizing inventory for a retail store."
    )


@app.post("/predict_milk_spoilage")
async def predict_milk_spoilage(sku: str = "whole_milk_1gal"):
    if sku not in ['whole_milk_1gal', 'skim_milk_1gal', 'lowfat_milk_1gal', 'uht_milk_1qt']:
        raise HTTPException(status_code=400, detail="Invalid SKU. Choose from: whole_milk_1gal, skim_milk_1gal, lowfat_milk_1gal, uht_milk_1qt")
    
    spoilage_data = simulate_milk_spoilage_data(sku)
    prediction, probability = _predict_milk_spoilage(spoilage_data)
    pricing = dynamic_milk_price_engine(prediction, probability, spoilage_data)
    explanation = generate_explanation_message(spoilage_data, prediction, probability)
    
    return {
        'sku': sku,
        'spoilage_data': spoilage_data,
        'prediction': prediction,
        'probability': probability,
        'pricing': pricing,
        'explanation': explanation
    }