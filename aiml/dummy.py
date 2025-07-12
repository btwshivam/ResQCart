import torch
from torchvision import models, transforms
from PIL import Image
import numpy as np

# Load model structure
model = models.resnet50(weights=None)
model.fc = torch.nn.Sequential(
    torch.nn.Linear(model.fc.in_features, 128),
    torch.nn.ReLU(),
    torch.nn.Linear(128, 1),
    torch.nn.Sigmoid()
)

# Load your weights
ckpt_path = 'models/trained/spoilage_cnn.pth'
state_dict = torch.load(ckpt_path, map_location='cpu')

print(f"State dict keys: {list(state_dict.keys())}")

model.load_state_dict(state_dict)
model.eval()

print(model)

# Check with dummy input
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Dummy image (white apple image)
dummy = np.ones((224, 224, 3), dtype=np.uint8) * 255
pil_image = Image.fromarray(dummy)
tensor = transform(pil_image).unsqueeze(0)

with torch.no_grad():
    output = model(tensor).item()
    print(f"Dummy output: {output:.4f}")
