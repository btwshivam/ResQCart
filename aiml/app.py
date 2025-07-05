from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import torch
from torchvision import models, transforms
import io

app = FastAPI()

# Load model
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

# Transform for input image
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    # Read and process image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        output = model(image)
        pred = output.item()
        label = 'rottenapples' if pred > 0.7 else 'freshapples'
    
    return {"prediction": label, "confidence": pred}