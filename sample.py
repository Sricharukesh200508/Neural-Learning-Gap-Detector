import torch
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import torchvision.transforms as transforms

import torch
# Make sure to import your model class (e.g., CSRNet) from your model file
from model import CSRNet 

# 1. Define the device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 2. Initialize the model architecture
model = CSRNet() 

# 3. Load the weights (the OrderedDict)
state_dict = torch.load('crowd.pth', map_location=device)

# 4. Load the weights into the model
model.load_state_dict(state_dict)

# 5. Move the full model to the device and set to eval mode
model.to(device)
model.eval()
# Load a sample image from your test set
img_path = "IMG_26.jpg"
gt_path = "GT_IMG_26.mat"

# Image Preprocessing
img = Image.open(img_path).convert('RGB')
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
input_tensor = transform(img).unsqueeze(0).to(device)

# Inference
with torch.no_grad():
    output = model(input_tensor)
    pred_count = torch.sum(output).item()

# Load Ground Truth
gt_map = np.load(gt_path)
gt_count = np.sum(gt_map)

# Plotting the 4-panel figure
fig, axes = plt.subplots(1, 3, figsize=(20, 7))

axes[0].imshow(img)
axes[0].set_title(f"Original Image\n(Actual Count: {int(gt_count)})")
axes[0].axis('off')

axes[1].imshow(gt_map, cmap='jet')
axes[1].set_title("Ground Truth Density Map")
axes[1].axis('off')

axes[2].imshow(output.detach().cpu().squeeze(), cmap='jet')
axes[2].set_title(f"Predicted Density Map\n(Predicted Count: {pred_count:.2f})")
axes[2].axis('off')

plt.tight_layout()
plt.savefig('paper_sample_result.png', dpi=300)
plt.show()