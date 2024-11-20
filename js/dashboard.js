const allSideMenu = document.querySelectorAll("#sidebar .side-menu.top li a");

allSideMenu.forEach((item) => {
	const li = item.parentElement;

	item.addEventListener("click", function () {
		allSideMenu.forEach((i) => {
			i.parentElement.classList.remove("active");
		});
		li.classList.add("active");
	});
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector("#content nav .bx.bx-menu");
const sidebar = document.getElementById("sidebar");

menuBar.addEventListener("click", function () {
	sidebar.classList.toggle("hide");
});

const searchButton = document.querySelector(
	"#content nav form .form-input button"
);
const searchButtonIcon = document.querySelector(
	"#content nav form .form-input button .bx"
);
const searchForm = document.querySelector("#content nav form");

searchButton.addEventListener("click", function (e) {
	if (window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle("show");
		if (searchForm.classList.contains("show")) {
			searchButtonIcon.classList.replace("bx-search", "bx-x");
		} else {
			searchButtonIcon.classList.replace("bx-x", "bx-search");
		}
	}
});

if (window.innerWidth < 768) {
	sidebar.classList.add("hide");
} else if (window.innerWidth > 576) {
	searchButtonIcon.classList.replace("bx-x", "bx-search");
	searchForm.classList.remove("show");
}

window.addEventListener("resize", function () {
	if (this.innerWidth > 576) {
		searchButtonIcon.classList.replace("bx-x", "bx-search");
		searchForm.classList.remove("show");
	}
});

document.getElementById("downloadPdf").addEventListener("click", async (e) => {
	e.preventDefault(); // Prevent default link behavior

	// Target the specific section
	const content = document.getElementById("ss_part");

	// Use html2canvas to capture the section
	const canvas = await html2canvas(content, {
		scale: 2, // Increase scale for better resolution
		logging: true, // Optionally log for debugging
		useCORS: true, // For cross-origin image support
	});

	// Convert the canvas to an image
	const imgData = canvas.toDataURL("image/png");

	// Create a PDF document
	const { jsPDF } = window.jspdf;
	const pdf = new jsPDF({
		orientation: "landscape",
		unit: "px",
		format: [canvas.width, canvas.height], // Set format based on the canvas size
	});

	// Calculate scale to fit the PDF page size (for example A4)
	const pdfWidth = pdf.internal.pageSize.getWidth();
	const pdfHeight = pdf.internal.pageSize.getHeight();

	// Scale the image to fit the PDF page while maintaining the aspect ratio
	const imgWidth = canvas.width;
	const imgHeight = canvas.height;
	const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
	const scaledWidth = imgWidth * ratio;
	const scaledHeight = imgHeight * ratio;

	// Add the image to the PDF with the scaled dimensions
	pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);

	// Trigger the download
	pdf.save("detail-report.pdf");
});

// Data arrays for storing values
let labels = ["Day 1", "Day 2", "Day 3"];
let caloriesData = [300, 450, 500];
let distanceData = [5, 7, 6];
let stepsData = [7000, 8500, 7500];
let weightData = [70, 71, 72];
let sleepData = [7, 2]; // [sleep hours, awake hours]

// Function to open the modal
function openModal() {
	document.getElementById("data-modal").style.display = "block";
}

// Function to close the modal
function closeModal() {
	document.getElementById("data-modal").style.display = "none";
}

// Function to handle data submission and update charts
function submitData() {
	const calories = parseFloat(document.getElementById("calories-input").value);
	const distance = parseFloat(document.getElementById("distance-input").value);
	const steps = parseInt(document.getElementById("steps-input").value);
	const weight = parseFloat(document.getElementById("weight-input").value);
	const sleepHours = parseFloat(
		document.getElementById("sleep-hours-input").value
	);

	// Validate inputs
	if (
		isNaN(calories) ||
		isNaN(distance) ||
		isNaN(steps) ||
		isNaN(weight) ||
		isNaN(sleepHours)
	) {
		alert("Please enter valid values for all fields.");
		return;
	}
	document.getElementById("kcalB").innerText = `${calories} kcal`;
	document.getElementById("distanceT").innerText = `${distance} km`;

	// Add new data to the arrays
	caloriesData.push(calories);
	distanceData.push(distance);
	stepsData.push(steps);
	weightData.push(weight);
	sleepData = [sleepHours, 24 - sleepHours]; // Update sleep and awake data
	labels.push(`Day ${labels.length + 1}`);

	// Update the graphs
	updateGraphs();

	// Close the modal after saving data
	closeModal();

	// Clear the form inputs
	document.getElementById("data-form").reset();
}

// Function to update all graphs
function updateGraphs() {
	// Update Steps and Weight Graph
	updateStepsAndWeightGraph();

	// Update Energy Expended Graph (Optional based on the data you have)
	updateEnergyExpendedGraph();

	// Update Sleep Monitor Graph
	updateSleepMonitorGraph();
}

// Declare the chart instance globally
let stepsWeightChart = null;

// Function to update the Steps and Weight Chart with dual Y-axes
function updateStepsAndWeightGraph() {
	const ctx1 = document.getElementById("steps-weight-graph").getContext("2d");

	// Destroy the existing chart if it exists
	if (stepsWeightChart) {
		stepsWeightChart.destroy();
	}

	// Create a new chart
	stepsWeightChart = new Chart(ctx1, {
		type: "line",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Steps Taken",
					data: stepsData,
					borderColor: "#22177A",
					backgroundColor: "#22177A74",
					tension: 0.4,
					yAxisID: "y1", // Link to the left y-axis
				},
				{
					label: "Weight (kg)",
					data: weightData,
					borderColor: "#006A67",
					backgroundColor: "#006A678f",
					tension: 0.4,
					yAxisID: "y2", // Link to the right y-axis
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: {
					position: "top",
				},
			},
			scales: {
				// Left Y-axis (Steps)
				y1: {
					type: "linear",
					position: "left",
					title: {
						display: true,
						text: "Steps",
					},
				},
				// Right Y-axis (Weight)
				y2: {
					type: "linear",
					position: "right",
					title: {
						display: true,
						text: "Weight (kg)",
					},
					grid: {
						drawOnChartArea: false, // Hide grid lines for the right axis
					},
				},
				x: {
					title: {
						display: true,
						text: "Days",
					},
				},
			},
		},
	});
}

let energyExpendedChart = null;
let sleepMonitorChart = null;

function updateEnergyExpendedGraph() {
	const ctx2 = document
		.getElementById("energy-expended-graph")
		.getContext("2d");
	// Destroy the existing chart if it exists
	if (energyExpendedChart) {
		energyExpendedChart.destroy();
	}

	energyExpendedChart = new Chart(ctx2, {
		type: "line",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Energy Expended (kcal)",
					data: caloriesData,
					backgroundColor: "#FA812F74",
					borderColor: "#FA812F",
					tension: 0.4,
					fill: true,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: {
					position: "top",
				},
			},
			scales: {
				y: {
					title: {
						display: true,
						text: "Energy Expended (kcal)",
					},
				},
				x: {
					title: {
						display: true,
						text: "Days",
					},
				},
			},
		},
	});
}

function updateSleepMonitorGraph() {
	const ctx3 = document.getElementById("sleep-monitor-graph").getContext("2d");
	// Destroy the existing chart if it exists
	if (sleepMonitorChart) {
		sleepMonitorChart.destroy();
	}

	sleepMonitorChart = new Chart(ctx3, {
		type: "doughnut",
		data: {
			labels: ["Sleep", "Awake"],
			datasets: [
				{
					data: sleepData,
					backgroundColor: ["#FAB12F","#FA4032"],
					borderWidth: 0,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: {
					position: "top",
				},
				tooltip: {
					callbacks: {
						label: function (tooltipItem) {
							return `${tooltipItem.label}: ${tooltipItem.raw} hours`;
						},
					},
				},
			},
		},
	});
}

// Call this function to initialize the charts with default data
updateGraphs();
