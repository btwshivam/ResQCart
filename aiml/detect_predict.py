import cv2
import numpy as np
from ultralytics import YOLO
import requests
from PIL import Image
import io

yolo_model = YOLO('models/yolo_apple.pt')

url = 'http://localhost:8001/predict_with_sensor'

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Could not read frame")
        break

    # Detect apples
    results = yolo_model(frame, conf=0.5, device='cpu')

    for result in results:
        boxes = result.boxes.xyxy.cpu().numpy()
        for box in boxes:
            x1, y1, x2, y2 = map(int, box[:4])
            apple_crop = frame[y1:y2, x1:x2]
            if apple_crop.size == 0:
                continue

            # Convert to PIL Image
            apple_crop_rgb = cv2.cvtColor(apple_crop, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(apple_crop_rgb)

            # Save crop to bytes
            img_byte_arr = io.BytesIO()
            pil_image.save(img_byte_arr, format='JPEG')
            img_byte_arr.seek(0)

            try:
                response = requests.post(url, files={'file': ('image.jpg', img_byte_arr, 'image/jpeg')})
                if response.status_code == 200:
                    result = response.json()
                    prediction = result['prediction']
                    confidence = result['confidence']
                    sensor_data = result['sensor_data']
                    pricing = result['pricing']
                    # Draw bounding box and label
                    color = (0, 255, 0) if prediction == 'freshapples' else (0, 0, 255)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    text = f'{prediction} {confidence:.2f} | {pricing["action"]} ${pricing["price_usd"]:.2f}'
                    if pricing['message']:
                        text += f' | {pricing["message"]}'
                    cv2.putText(frame, text, (x1, y1-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
                    print(f"Prediction: {prediction}, Confidence: {confidence:.2f}, "
                          f"Sensor: {sensor_data}, Pricing: {pricing}")
                else:
                    print(f"FastAPI error: {response.status_code}")
            except Exception as e:
                print(f"Request error: {e}")

    cv2.imshow('Apple Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()