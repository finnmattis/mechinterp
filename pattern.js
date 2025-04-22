const canvas = document.getElementById("grid-canvas");
const tooltip = document.getElementById("tooltip");
const tooltipSource = document.getElementById("tooltip-source");
const tooltipDest = document.getElementById("tooltip-dest");
const tooltipValue = document.getElementById("tooltip-value");
const ctx = canvas.getContext("2d");

const tokens = ["The", "boy", "pet", "the", "fluffy", ",", "brown", "dog", "."];

const attentionData = [
  [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.942, 0.058, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.8316, 0.1052, 0.0632, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.2726, 0.1486, 0.2557, 0.3231, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.3461, 0.0199, 0.1667, 0.432, 0.0353, 0.0, 0.0, 0.0, 0.0],
  [0.288, 0.0315, 0.0599, 0.2737, 0.0926, 0.2543, 0.0, 0.0, 0.0],
  [0.1603, 0.0045, 0.0403, 0.0753, 0.0172, 0.6669, 0.0355, 0.0, 0.0],
  [0.264, 0.0268, 0.0315, 0.0609, 0.0742, 0.3525, 0.0586, 0.1315, 0.0],
  [0.1376, 0.0235, 0.0099, 0.0247, 0.0855, 0.2683, 0.0488, 0.3663, 0.0355],
];

let cellSize = 58;
let padding = 6;
let margin = 60;
let fontFamily = "'Inter', sans-serif";

function init() {
  console.log("init");
  // Make sure we're setting up the event listeners correctly
  if (canvas) {
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseout", () => {
      tooltip.classList.remove("visible");
    });
    draw();
  } else {
    console.error("Canvas element not found!");
  }
}

function draw() {
  const n = tokens.length;

  const totalWidth = margin + n * cellSize + margin * 2;
  const totalHeight = margin + n * cellSize + margin * 2;

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = totalWidth * pixelRatio;
  canvas.height = totalHeight * pixelRatio;

  canvas.style.width = `${totalWidth}px`;
  canvas.style.height = `${totalHeight}px`;

  ctx.scale(pixelRatio, pixelRatio);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const orangeColors = [
    "#fff4e6",
    "#ffe8cc",
    "#ffd8a8",
    "#ffc078",
    "#ffa94d",
    "#ff922b",
    "#fd7e14",
    "#e8590c",
    "#d9480f",
  ];

  const grayColor = "#f1f3f5";

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = margin + j * cellSize;
      const y = margin + i * cellSize;

      const value = attentionData[i][j];
      let color;

      if (value === 0.0) {
        color = grayColor;
      } else {
        const normalizedValue = Math.min(1, Math.max(0, value));
        const colorIndex = Math.min(
          Math.floor(normalizedValue * orangeColors.length),
          orangeColors.length - 1
        );
        color = orangeColors[colorIndex];
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;

  for (let j = 0; j <= n; j++) {
    const x = margin + j * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, margin + n * cellSize);
    ctx.stroke();
  }

  for (let i = 0; i <= n; i++) {
    const y = margin + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(margin + n * cellSize, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#333";
  ctx.font = `500 13px ${fontFamily}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i < n; i++) {
    const y = margin + i * cellSize + cellSize / 2;
    ctx.fillText(`${tokens[i]} (${i})`, margin - 12, y);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  for (let j = 0; j < n; j++) {
    const x = margin + j * cellSize + cellSize / 2;
    ctx.fillText(`${tokens[j]}`, x, margin - 18);
    ctx.fillText(`(${j})`, x, margin - 5);
  }
}

// Handle mouse movement to show tooltip
function handleMouseMove(e) {
  // Remove the debug log to prevent console flooding
  // console.log("MOUSE!");

  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;

  // Adjust for pixel ratio and CSS scaling
  const scaleX = canvas.width / pixelRatio / rect.width;
  const scaleY = canvas.height / pixelRatio / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  // Check if mouse is in grid area
  if (
    mouseX >= margin &&
    mouseX <= margin + tokens.length * cellSize &&
    mouseY >= margin &&
    mouseY <= margin + tokens.length * cellSize
  ) {
    const col = Math.floor((mouseX - margin) / cellSize);
    const row = Math.floor((mouseY - margin) / cellSize);

    if (col >= 0 && col < tokens.length && row >= 0 && row < tokens.length) {
      const value = attentionData[row][col];

      // Update tooltip content
      tooltipSource.textContent = `${tokens[row]} (${row})`;
      tooltipDest.textContent = `${tokens[col]} (${col})`;
      tooltipValue.textContent = value.toFixed(4);

      // Position tooltip
      const tooltipX = e.clientX + 15; // Offset from cursor
      const tooltipY = e.clientY;

      // Check if tooltip would go off-screen
      const windowWidth = window.innerWidth;
      const tooltipWidth = 180; // Based on min-width set in CSS

      if (tooltipX + tooltipWidth > windowWidth - 20) {
        // Position to the left of the cursor if it would go off-screen
        tooltip.style.left = `${e.clientX - tooltipWidth - 15}px`;
      } else {
        tooltip.style.left = `${tooltipX}px`;
      }

      tooltip.style.top = `${tooltipY}px`;
      tooltip.classList.add("visible");

      return;
    }
  }

  tooltip.classList.remove("visible");
}

// Ensure we're properly initializing when the page loads
window.addEventListener("load", init);

// Additional fallback to handle potential timing issues
if (document.readyState === "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
