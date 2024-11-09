let fpsChart,
  frametimeChart,
  percentileFpsChart,
  microStutterChart,
  heavyStutterChart;
let uploadedFiles = [];

function initCharts(data) {
  if (fpsChart) fpsChart.destroy();
  if (frametimeChart) frametimeChart.destroy();
  if (percentileFpsChart) percentileFpsChart.destroy();
  if (microStutterChart) microStutterChart.destroy();
  if (heavyStutterChart) heavyStutterChart.destroy();

  if (!data || data.length === 0) {
    const summary = document.getElementById("summary");
    summary.innerHTML =
      "<h2>Performance Summary</h2><p>No data loaded. Please upload CSV files to view performance metrics.</p>";
    return;
  }

  const ctx1 = document.getElementById("fpsChart").getContext("2d");
  const ctx2 = document.getElementById("frametimeChart").getContext("2d");
  const ctx3 = document.getElementById("percentileFpsChart").getContext("2d");
  const ctx4 = document.getElementById("microStutterChart").getContext("2d");
  const ctx5 = document.getElementById("heavyStutterChart").getContext("2d");

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          color: "#F0F0F0",
        },
        grid: {
          color: "rgba(240, 240, 240, 0.1)",
        },
        ticks: {
          color: "#F0F0F0",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(240, 240, 240, 0.1)",
        },
        ticks: {
          color: "#F0F0F0",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#F0F0F0",
          font: {
            family: "'Roboto', sans-serif",
          },
        },
      },
    },
  };

  fpsChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: data[0].timestamps,
      datasets: data.flatMap((fileData, fileIndex) =>
        fileData.processes.map((process, processIndex) => ({
          label: `${fileData.fileName} - ${process}`,
          data: fileData.fps[processIndex],
          borderColor: getColor(
            fileIndex * fileData.processes.length + processIndex
          ),
          backgroundColor: getColor(
            fileIndex * fileData.processes.length + processIndex,
            0.1
          ),
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0,
          fill: true,
        }))
      ),
    },
    options: {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          ...chartOptions.scales.y,
          title: {
            display: true,
            text: "FPS",
            color: "#F0F0F0",
          },
        },
      },
    },
  });

  frametimeChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: data[0].timestamps,
      datasets: data.flatMap((fileData, fileIndex) =>
        fileData.processes.map((process, processIndex) => ({
          label: `${fileData.fileName} - ${process}`,
          data: fileData.fps[processIndex].map((fps) =>
            fps > 0 ? 1000 / fps : null
          ),
          borderColor: getColor(
            fileIndex * fileData.processes.length + processIndex
          ),
          backgroundColor: getColor(
            fileIndex * fileData.processes.length + processIndex,
            0.1
          ),
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0,
          fill: true,
        }))
      ),
    },
    options: {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          ...chartOptions.scales.y,
          title: {
            display: true,
            text: "AVG Frametime (ms)",
            color: "#F0F0F0",
          },
        },
      },
    },
  });

  percentileFpsChart = new Chart(ctx3, {
    type: "line",
    data: {
      labels: data[0].timestamps,
      datasets: data.flatMap((fileData, fileIndex) =>
        fileData.processes.map((process, processIndex) => ({
          label: `${fileData.fileName} - ${process}`,
          data: fileData.percentile99Fps[processIndex],
          borderColor: getColor(
            fileIndex * fileData.processes.length + processIndex
          ),
          backgroundColor: getColor(
            fileIndex * fileData.processes.length + processIndex,
            0.1
          ),
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0,
          fill: true,
        }))
      ),
    },
    options: {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          ...chartOptions.scales.y,
          title: {
            display: true,
            text: "99th Percentile FPS",
            color: "#F0F0F0",
          },
        },
      },
    },
  });

  microStutterChart = new Chart(ctx4, {
    type: "line",
    data: {
      labels: data[0].timestamps,
      datasets: data.flatMap((fileData, fileIndex) =>
        fileData.processes.map((process, processIndex) => ({
          label: `${fileData.fileName} - ${process}`,
          data: fileData.microStutter[processIndex],
          borderColor: getColor(
            fileIndex * fileData.processes.length + processIndex
          ),
          backgroundColor: getColor(
            fileIndex * fileData.processes.length + processIndex,
            0.1
          ),
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0,
          fill: true,
        }))
      ),
    },
    options: {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          ...chartOptions.scales.y,
          title: {
            display: true,
            text: "Micro Stutter",
            color: "#F0F0F0",
          },
        },
      },
    },
  });

  heavyStutterChart = new Chart(ctx5, {
    type: "line",
    data: {
      labels: data[0].timestamps,
      datasets: data.flatMap((fileData, fileIndex) =>
        fileData.processes.map((process, processIndex) => ({
          label: `${fileData.fileName} - ${process}`,
          data: fileData.heavyStutter[processIndex],
          borderColor: getColor(
            fileIndex * fileData.processes.length + processIndex
          ),
          backgroundColor: getColor(
            fileIndex * fileData.processes.length + processIndex,
            0.1
          ),
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0,
          fill: true,
        }))
      ),
    },
    options: {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          ...chartOptions.scales.y,
          title: {
            display: true,
            text: "Heavy Stutter Rate",
            color: "#F0F0F0",
          },
        },
      },
    },
  });

  updateSummary(data);
}

function updateSummary(data) {
  const summary = document.getElementById("summary");
  let summaryHTML = "<h2>Performance Summary</h2>";

  data.forEach((fileData, index) => {
    const fpsAll = fileData.fps
      .flat()
      .filter((fps) => fps !== "N/A" && fps !== undefined && !isNaN(fps));
    const percentile99FpsAll = fileData.percentile99Fps
      .flat()
      .filter((fps) => fps !== "N/A" && fps !== undefined && !isNaN(fps));
    const microStutterAll = fileData.microStutter
      .flat()
      .filter(
        (stutter) =>
          stutter !== "N/A" && stutter !== undefined && !isNaN(stutter)
      );
    const heavyStutterAll = fileData.heavyStutter
      .flat()
      .filter(
        (stutter) =>
          stutter !== "N/A" && stutter !== undefined && !isNaN(stutter)
      );

    const avgFps = (fpsAll.reduce((a, b) => a + b, 0) / fpsAll.length).toFixed(
      2
    );
    const minFps = Math.min(...fpsAll).toFixed(2);
    const maxFps = Math.max(...fpsAll).toFixed(2);
    const avgFrametime = (1000 / avgFps).toFixed(2);
    const avgPercentile99Fps = (
      percentile99FpsAll.reduce((a, b) => a + b, 0) / percentile99FpsAll.length
    ).toFixed(2);
    const avgMicroStutter = (
      microStutterAll.reduce((a, b) => a + b, 0) / microStutterAll.length
    ).toFixed(2);
    const avgHeavyStutter = (
      heavyStutterAll.reduce((a, b) => a + b, 0) / heavyStutterAll.length
    ).toFixed(2);

    summaryHTML += `
          <h3>${fileData.fileName}</h3>
          <p>Average FPS: <span style="color: var(--accent);">${avgFps}</span></p>
          <p>Minimum FPS: <span style="color: var(--accent);">${minFps}</span></p>
          <p>Maximum FPS: <span style="color: var(--accent);">${maxFps}</span></p>
          <p>Average 99th Percentile FPS: <span style="color: var(--accent);">${avgPercentile99Fps}</span></p>
          <p>Average Frametime: <span style="color: var(--accent);">${avgFrametime} ms</span></p>
          <p>Average Micro Stutter: <span style="color: var(--accent);">${avgMicroStutter}</span></p>
          <p>Average Heavy Stutter Rate: <span style="color: var(--accent);">${avgHeavyStutter}</span></p>
          <p>Processes: <span style="color: var(--secondary);">${fileData.processes.join(
            ", "
          )}</span></p>
        `;
  });

  summary.innerHTML = summaryHTML;
}

function getColor(index, alpha = 1) {
  const colors = [
    `rgba(0, 255, 255, ${alpha})`,
    `rgba(255, 0, 0, ${alpha})`,
    `rgba(0, 255, 0, ${alpha})`,
    `rgba(255, 255, 0, ${alpha})`,
    `rgba(255, 0, 255, ${alpha})`,
    `rgba(255, 165, 0, ${alpha})`,
    `rgba(0, 0, 255, ${alpha})`,
    `rgba(128, 0, 128, ${alpha})`,
    `rgba(0, 128, 0, ${alpha})`,
    `rgba(255, 192, 203, ${alpha})`,
  ];
  return colors[index % colors.length];
}

function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: function (results) {
        const data = {
          fileName: file.name,
          timestamps: [],
          processes: [],
          fps: [],
          percentile99Fps: [],
          microStutter: [],
          heavyStutter: [],
        };

        results.data.forEach((row, index) => {
          if (index === 0) return;
          if (row[1] === "N/A" || row[1] === undefined) return;

          const processIndex = data.processes.indexOf(row[1]);
          if (processIndex === -1) {
            data.processes.push(row[1]);
            data.fps.push([]);
            data.percentile99Fps.push([]);
            data.microStutter.push([]);
            data.heavyStutter.push([]);
          }
          const currentIndex =
            processIndex === -1 ? data.processes.length - 1 : processIndex;

          data.timestamps.push(row[0]);
          data.fps[currentIndex].push(
            row[3] !== "N/A" && row[3] !== undefined ? parseFloat(row[3]) : null
          );
          data.percentile99Fps[currentIndex].push(
            row[5] !== "N/A" && row[5] !== undefined ? parseFloat(row[5]) : null
          );
          data.microStutter[currentIndex].push(
            row[6] !== "N/A" && row[6] !== undefined ? parseFloat(row[6]) : null
          );
          data.heavyStutter[currentIndex].push(
            row[7] !== "N/A" && row[7] !== undefined ? parseFloat(row[7]) : null
          );
        });

        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

function updateFileList() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";
  uploadedFiles.forEach((file, index) => {
    const fileDiv = document.createElement("div");
    fileDiv.textContent = file.name;
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => removeFile(index);
    fileDiv.appendChild(removeButton);
    fileList.appendChild(fileDiv);
  });
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  updateFileList();
  if (uploadedFiles.length > 0) {
    Promise.all(uploadedFiles.map(parseCSV)).then(initCharts);
  } else {
    initCharts([]);
  }
}

document.getElementById("csvUpload").addEventListener("change", function (e) {
  const files = Array.from(e.target.files);
  uploadedFiles = uploadedFiles.concat(files);
  updateFileList();
  Promise.all(uploadedFiles.map(parseCSV)).then(initCharts);
});

document
  .getElementById("csvUpload")
  .addEventListener("contextmenu", function (e) {
    e.preventDefault();
    this.value = "";
    uploadedFiles = [];
    updateFileList();
    initCharts([]);
  });
