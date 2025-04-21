import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error

df = pd.read_csv('house.csv')

df['Gr Liv Area'] = pd.to_numeric(df['Gr Liv Area'], errors='coerce')
df['SalePrice'] = pd.to_numeric(df['SalePrice'], errors='coerce')

df = df.dropna(subset=['Gr Liv Area', 'SalePrice'])

slopes = np.arange(0, 300, 1)
intercepts = np.arange(0, 500_000, 10_000)

M, B = np.meshgrid(slopes, intercepts)
loss_surface = np.zeros_like(M, dtype=float)

for i in range(M.shape[0]):
    for j in range(M.shape[1]):
        m = M[i, j]
        b = B[i, j]
        predictions = m * df['Gr Liv Area'] + b
        loss_surface[i, j] = mean_squared_error(df['SalePrice'], predictions)

fig = plt.figure(figsize=(10, 6))
cp = plt.contourf(M, B, loss_surface, levels=50, cmap='viridis')
plt.colorbar(cp)
plt.xlabel('Slope (m)')
plt.ylabel('Intercept (b)')
plt.title('Loss Surface (Mean Squared Error)')
plt.tight_layout()
plt.show()
