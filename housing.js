window.addEventListener("DOMContentLoaded", function () {
  fetch("house_data.json")
    .then((response) => response.json())
    .then((data) => {
      const area = data.map((d) => d["Gr Liv Area"]);
      const price = data.map((d) => d["SalePrice"]);

      createRawDataPlot(area, price);
      createInteractivePlot(area, price);
      createLossLandscape(area, price);
    });
});

function createRawDataPlot(area, price) {
  const scatterOnly = {
    x: area,
    y: price,
    mode: "markers",
    name: "Actual Data",
    type: "scatter",
    marker: {
      color: "#d65b28",
      size: 8,
      opacity: 0.7,
      line: { width: 1, color: "#fff" },
    },
  };

  const layout = {
    xaxis: {
      title: "Living Area (sq ft)",
      gridcolor: "#e0e0e0",
      zeroline: false,
    },
    yaxis: {
      title: "Sale Price ($)",
      gridcolor: "#e0e0e0",
      zeroline: false,
    },
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
    margin: { t: 60, l: 70, r: 30, b: 70 },
  };

  Plotly.newPlot("raw-data-plot", [scatterOnly], layout, {
    responsive: true,
    displayModeBar: false,
  });
}

function createInteractivePlot(area, price) {
  let m = +document.getElementById("mSlider").value;
  let b = +document.getElementById("bSlider").value;

  updateSliderValues(m, b);

  const getLine = (x) => x.map((val) => m * val + b);

  const calculateMSE = () => {
    const predictions = getLine(area);
    let sumSquaredErrors = 0;
    for (let i = 0; i < area.length; i++) {
      const error = predictions[i] - price[i];
      sumSquaredErrors += error * error;
    }
    return sumSquaredErrors / area.length;
  };

  updateMSEValue(calculateMSE());

  const scatter = {
    x: area,
    y: price,
    mode: "markers",
    name: "Actual Data",
    type: "scatter",
    marker: {
      color: "#d65b28",
      size: 8,
      opacity: 0.6,
      line: { width: 1, color: "#fff" },
    },
  };

  const line = {
    x: area,
    y: getLine(area),
    mode: "lines",
    name: "Prediction Line",
    type: "scatter",
    line: {
      color: "#000000",
      width: 4,
      dash: "solid",
    },
  };

  const layout = {
    xaxis: {
      title: "Living Area (sq ft)",
      gridcolor: "#e0e0e0",
      zeroline: false,
    },
    yaxis: {
      title: "Sale Price ($)",
      gridcolor: "#e0e0e0",
      zeroline: false,
    },
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
    margin: { t: 60, l: 70, r: 30, b: 70 },
  };

  Plotly.newPlot("plot", [scatter, line], layout, {
    responsive: true,
    displayModeBar: false,
  });

  const update = () => {
    m = +document.getElementById("mSlider").value;
    b = +document.getElementById("bSlider").value;
    updateSliderValues(m, b);
    Plotly.restyle("plot", { y: [getLine(area)] }, [1]);
    updateMSEValue(calculateMSE());
  };

  document.getElementById("mSlider").addEventListener("input", update);
  document.getElementById("bSlider").addEventListener("input", update);
}

function updateSliderValues(m, b) {
  document.getElementById("mValue").textContent = m;
  if (b >= 1000) {
    document.getElementById("bValue").textContent = (b / 1000).toFixed(0) + "k";
  } else {
    document.getElementById("bValue").textContent = b;
  }
}

function formatMSE(mse) {
  if (mse >= 1000000000) {
    return (mse / 1000000000).toFixed(2) + " billion";
  } else {
    return mse.toFixed(0);
  }
}

function updateMSEValue(mse) {
  document.getElementById("mseValue").textContent = formatMSE(mse);
}

const createLossLandscape = async (area, price) => {
  const mMin = 0;
  const mMax = 500;
  const bMin = 0;
  const bMax = 800000;
  const gridSize = 20;

  const mStep = (mMax - mMin) / (gridSize - 1);
  const bStep = (bMax - bMin) / (gridSize - 1);

  const zValues = [];
  const mTickVals = [];
  const bTickVals = [];

  for (let i = 0; i < gridSize; i++) {
    const m = mMin + i * mStep;
    mTickVals.push(m);

    const row = [];
    for (let j = 0; j < gridSize; j++) {
      const b = bMin + j * bStep;
      if (i === 0) bTickVals.push(b);

      let sumSquaredErrors = 0;
      for (let k = 0; k < area.length; k++) {
        const prediction = m * area[k] + b;
        const error = prediction - price[k];
        sumSquaredErrors += error * error;
      }
      const mse = sumSquaredErrors / area.length;
      row.push(mse);
    }
    zValues.push(row);
  }

  const surfacePlot = {
    type: "surface",
    x: mTickVals,
    y: bTickVals,
    z: zValues,
    colorscale: [
      [0, "#d65b28"],
      [0.25, "#e67e52"],
      [0.5, "#f0a080"],
      [0.75, "#f7c2ad"],
      [1, "#fde5dc"],
    ],
    contours: {
      z: {
        show: true,
        usecolormap: true,
        highlightcolor: "#ffffff",
        project: { z: true },
        width: 2,
        size: 0.5,
        start: 0.5,
        end: 15,
      },
    },
    lighting: {
      ambient: 0.6,
      diffuse: 0.8,
      specular: 0.3,
      roughness: 0.5,
      fresnel: 0.2,
    },
    hidesurface: false,
    showscale: true,
  };

  const layout = {
    scene: {
      xaxis: {
        title: {
          text: "Slope (m)",
          font: {
            family: "Segoe UI, sans-serif",
            size: 16,
            color: "#2c3e50",
          },
        },
        nticks: 6,
        tickfont: {
          family: "Segoe UI, sans-serif",
          size: 12,
        },
        backgroundcolor: "rgba(255, 255, 255, 0.95)",
        gridcolor: "rgba(0, 0, 0, 0.1)",
        showbackground: true,
        zerolinecolor: "rgba(0, 0, 0, 0.3)",
      },
      yaxis: {
        title: {
          text: "Intercept (b)",
          font: {
            family: "Segoe UI, sans-serif",
            size: 16,
            color: "#2c3e50",
          },
        },
        tickformat: "$.0s",
        nticks: 6,
        tickfont: {
          family: "Segoe UI, sans-serif",
          size: 12,
        },
        backgroundcolor: "rgba(255, 255, 255, 0.95)",
        gridcolor: "rgba(0, 0, 0, 0.1)",
        showbackground: true,
        zerolinecolor: "rgba(0, 0, 0, 0.3)",
      },
      zaxis: {
        title: {
          text: "Mean Squared Error",
          font: {
            family: "Segoe UI, sans-serif",
            size: 16,
            color: "#2c3e50",
          },
        },
        type: "log",
        tickformat: ".2e",
        nticks: 5,
        tickfont: {
          family: "Segoe UI, sans-serif",
          size: 12,
        },
        backgroundcolor: "rgba(255, 255, 255, 0.95)",
        gridcolor: "rgba(0, 0, 0, 0.1)",
        showbackground: true,
        zerolinecolor: "rgba(0, 0, 0, 0.3)",
      },
      camera: {
        eye: { x: 1.5, y: -1.5, z: 1.2 },
        center: { x: 0, y: 0, z: -0.1 },
        up: { x: 0, y: 0, z: 1 },
      },
      aspectratio: { x: 1, y: 1, z: 0.7 },
    },
    autosize: true,
    margin: { t: 80, l: 20, r: 20, b: 20 },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
    coloraxis: {
      showscale: true,
      colorbar: {
        title: {
          text: "MSE",
          side: "right",
          font: {
            family: "Segoe UI, sans-serif",
            size: 14,
            color: "#2c3e50",
          },
        },
        tickfont: {
          family: "Segoe UI, sans-serif",
          size: 12,
        },
        len: 0.75,
        y: 0.5,
      },
    },
    hoverlabel: {
      font: {
        family: "Segoe UI, sans-serif",
        size: 14,
      },
    },
  };

  Plotly.newPlot("loss-landscape-container", [surfacePlot], layout, {
    responsive: true,
    displayModeBar: false,
  });
};
