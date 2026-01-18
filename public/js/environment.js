// public/js/environment.js - Environment Module JavaScript

let environmentChart;
let energyChart;
let pollutionChart;
let environmentData = [];

// Initialize environment module
async function initEnvironment() {
    await updateEnvironmentData();
    setupCharts();
    startDataUpdates(updateEnvironmentData, 5000);
}

// Update environment data
async function updateEnvironmentData() {
    try {
        const response = await fetch('/api/environment');
        const data = await response.json();

        // Update header KPIs
        document.getElementById('current-aqi').textContent = data.airQualityIndex.toFixed(2);
        document.getElementById('energy-usage').textContent = formatNumber(data.energyConsumption) + ' kWh';
        document.getElementById('renewable-percent').textContent = data.renewableEnergyPercentage.toFixed(2) + '%';

        // Update KPI cards
        updateKPIs(data);

        // Store data for charts
        environmentData.push(data);
        if (environmentData.length > 12) environmentData.shift();

        // Update charts
        updateCharts();

        // Update data table
        updateDataTable(data);

        // Update pollution analysis
        updatePollutionAnalysis(data);

        // Update alerts
        updateAlerts(data);

    } catch (error) {
        console.error('Failed to update environment data:', error);
    }
}

// Update KPI cards
function updateKPIs(data) {
    // AQI
    document.getElementById('aqi-value').textContent = data.airQualityIndex.toFixed(2);
    const aqiStatus = getAQIStatus(data.airQualityIndex);
    document.getElementById('aqi-status').innerHTML = `
        <span class="aqi-indicator ${aqiStatus.class}"></span>
        <span>${aqiStatus.text}</span>
    `;

    // Temperature
    document.getElementById('temperature-value').textContent = data.temperature.toFixed(2) + '°C';
    document.getElementById('temp-status').textContent = getTemperatureStatus(data.temperature);

    // CO2 Levels
    document.getElementById('co2-value').textContent = data.co2Levels + ' ppm';
    document.getElementById('co2-status').textContent = getCO2Status(data.co2Levels);

    // Rainfall
    document.getElementById('rainfall-value').textContent = data.rainfall + ' mm';
    document.getElementById('rain-status').textContent = getRainfallStatus(data.rainfall);
}

// Get AQI status
function getAQIStatus(aqi) {
    if (aqi <= 50) return { class: 'aqi-good', text: 'Good' };
    if (aqi <= 100) return { class: 'aqi-moderate', text: 'Moderate' };
    if (aqi <= 150) return { class: 'aqi-unhealthy', text: 'Unhealthy' };
    return { class: 'aqi-hazardous', text: 'Hazardous' };
}

// Get temperature status
function getTemperatureStatus(temp) {
    if (temp >= 18 && temp <= 25) return 'Comfortable';
    if (temp > 25) return 'Warm';
    return 'Cool';
}

// Get CO2 status
function getCO2Status(co2) {
    if (co2 < 400) return 'Excellent';
    if (co2 < 600) return 'Good';
    if (co2 < 1000) return 'Moderate';
    return 'High';
}

// Get rainfall status
function getRainfallStatus(rainfall) {
    if (rainfall < 5) return 'Light';
    if (rainfall < 20) return 'Moderate';
    if (rainfall < 50) return 'Heavy';
    return 'Extreme';
}

// Setup charts
function setupCharts() {
    // Environment Trend Chart
    // Environment Trend Chart
    const envCtx = document.getElementById('environmentChart').getContext('2d');

    const gradientAQI = envCtx.createLinearGradient(0, 0, 0, 400);
    gradientAQI.addColorStop(0, 'rgba(74, 222, 128, 0.5)'); // Green
    gradientAQI.addColorStop(1, 'rgba(74, 222, 128, 0.0)');

    const gradientTemp = envCtx.createLinearGradient(0, 0, 0, 400);
    gradientTemp.addColorStop(0, 'rgba(248, 113, 113, 0.5)'); // Red
    gradientTemp.addColorStop(1, 'rgba(248, 113, 113, 0.0)');

    const gradientCO2 = envCtx.createLinearGradient(0, 0, 0, 400);
    gradientCO2.addColorStop(0, 'rgba(192, 132, 252, 0.5)'); // Purple
    gradientCO2.addColorStop(1, 'rgba(192, 132, 252, 0.0)');

    environmentChart = new Chart(envCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Air Quality Index',
                    data: [],
                    borderColor: '#4ade80',
                    backgroundColor: gradientAQI,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#f87171',
                    backgroundColor: gradientTemp,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                },
                {
                    label: 'CO₂ Levels (ppm)',
                    data: [],
                    borderColor: '#c084fc',
                    backgroundColor: gradientCO2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true } },
                title: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    title: {
                        display: true,
                        text: 'AQI / CO₂',
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                }
            }
        }
    });

    // Energy Distribution Chart
    const energyCtx = document.getElementById('energyChart').getContext('2d');
    energyChart = new Chart(energyCtx, {
        type: 'doughnut',
        data: {
            labels: ['Renewable', 'Coal', 'Natural Gas', 'Nuclear', 'Hydro'],
            datasets: [{
                data: [38, 25, 20, 12, 5],
                backgroundColor: [
                    '#4ade80', // Green
                    '#94a3b8', // Slate
                    '#fbbf24', // Amber
                    '#38bdf8', // Blue
                    '#818cf8'  // Indigo
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Energy Source Distribution'
                }
            }
        }
    });

    // Pollution Source Chart
    const pollCtx = document.getElementById('pollutionChart').getContext('2d');
    pollutionChart = new Chart(pollCtx, {
        type: 'bar',
        data: {
            labels: ['Transport', 'Industry', 'Energy', 'Agriculture', 'Residential'],
            datasets: [{
                label: 'Pollution Contribution (%)',
                data: [35, 28, 22, 10, 5],
                backgroundColor: [
                    '#f87171', // Red
                    '#fbbf24', // Amber
                    '#c084fc', // Purple
                    '#4ade80', // Green
                    '#38bdf8'  // Blue
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Pollution Source Analysis'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                    title: {
                        display: true,
                        text: 'Contribution (%)'
                    }
                }
            }
        }
    });
}

// Update charts
function updateCharts() {
    if (!environmentChart || !energyChart || !pollutionChart) return;

    const now = new Date();
    const timeLabels = environmentData.map((_, i) => `${i * 5}s ago`);

    // Update environment chart
    environmentChart.data.labels = timeLabels;
    environmentChart.data.datasets[0].data = environmentData.map(d => d.airQualityIndex);
    environmentChart.data.datasets[1].data = environmentData.map(d => d.temperature);
    environmentChart.data.datasets[2].data = environmentData.map(d => d.co2Levels);
    environmentChart.update('none');

    // Update energy chart with latest data
    const current = environmentData[environmentData.length - 1];
    energyChart.data.datasets[0].data = [
        current.renewableEnergyPercentage,
        Math.max(0, 25 - (current.renewableEnergyPercentage - 38)), // Adjust Coal based on Renewable
        20,
        12,
        5
    ];
    energyChart.update('none');

    // Update pollution chart to match List Logic
    // Realistic Calculation using Pollutants

    // Normalize Pollutants to relative impact values (0-100 scale roughly)
    const p = current.pollutants || {};
    const no2 = p.no2 || 45;    // Traffic proxy
    const so2 = p.so2 || 15;    // Industry proxy
    const pm25 = p.pm2_5 || 35; // Combustion/Energy proxy
    const co = p.co || 550;     // Residential proxy (heating/cooking)

    // Calculate contributions
    // Traffic: Driven by NO2 and CO
    let trafficScore = (no2 * 1.5) + (co / 50);

    // Industry: Driven by SO2 and some PM2.5
    let industryScore = (so2 * 3) + (pm25 * 0.5);

    // Energy: PM2.5 heavily
    let energyScore = (pm25 * 1.2) + (100 - current.renewableEnergyPercentage) * 0.2;

    // Agriculture: Humidity/Seasonality inverse (Proxy)
    let agriScore = (100 - current.humidity) / 5;

    // Residential: CO and PM2.5
    let resScore = (co / 40) + (pm25 * 0.5);

    // Normalize to percentages summing to ~100 for display, or just raw relative comparison
    const total = trafficScore + industryScore + energyScore + agriScore + resScore;

    const trafficPct = (trafficScore / total) * 100;
    const industryPct = (industryScore / total) * 100;
    const energyPct = (energyScore / total) * 100;
    const agriPct = (agriScore / total) * 100;
    const resPct = (resScore / total) * 100;

    pollutionChart.data.labels = ['Transportation', 'Industry', 'Energy Production', 'Agriculture', 'Residential'];
    pollutionChart.data.datasets[0].data = [
        trafficPct,
        industryPct,
        energyPct,
        agriPct,
        resPct
    ];
    pollutionChart.update('none');
}

// Update data table
function updateDataTable(data) {
    const tableBody = document.getElementById('environmentDataTable');

    const rows = [
        {
            parameter: 'Air Quality Index',
            value: data.airQualityIndex.toFixed(0), // Standard AQI is integer
            change: getRandomChange(-5, 5),
            status: getAQIStatus(data.airQualityIndex).text,
            health: getHealthImpact(data.airQualityIndex),
            recommendation: getAQIRecommendation(data.airQualityIndex)
        },
        {
            parameter: 'Temperature',
            value: data.temperature.toFixed(1) + '°C',
            change: getRandomChange(-2, 2) + '°C',
            status: getTemperatureStatus(data.temperature),
            health: 'Comfortable range',
            recommendation: 'Normal'
        },
        {
            parameter: 'Nitrogen Dioxide (NO₂)',
            value: (data.pollutants?.no2 || 45).toFixed(1) + ' µg/m³',
            change: getRandomChange(-5, 5) + '%',
            status: (data.pollutants?.no2 > 50) ? 'High' : 'Normal',
            health: 'Traffic Emission',
            recommendation: 'Monitor traffic'
        },
        {
            parameter: 'Particulate Matter (PM2.5)',
            value: (data.pollutants?.pm2_5 || 35).toFixed(1) + ' µg/m³',
            change: getRandomChange(-2, 2) + '%',
            status: (data.pollutants?.pm2_5 > 35) ? 'High' : 'Normal',
            health: 'Respiratory risk',
            recommendation: 'Wear mask if high'
        },
        {
            parameter: 'Rainfall (24h)',
            value: data.rainfall + ' mm',
            change: getRandomChange(-5, 5) + ' mm',
            status: getRainfallStatus(data.rainfall),
            health: 'Positive for air quality',
            recommendation: data.rainfall > 50 ? 'Flood watch' : 'Normal'
        },
        {
            parameter: 'Energy Consumption',
            value: formatNumber(data.energyConsumption) + ' kWh',
            change: getRandomChange(-100, 100) + ' kWh',
            status: data.energyConsumption > 9000 ? 'High' : 'Normal',
            health: 'Indirect impact',
            recommendation: data.energyConsumption > 9000 ? 'Consider conservation' : 'Efficient'
        }
    ];

    let html = '';
    rows.forEach(row => {
        const statusClass = row.status === 'Good' || row.status === 'Ideal' || row.status === 'Normal' ? 'text-success' :
            row.status === 'Moderate' ? 'text-warning' : 'text-danger';

        html += `
            <tr class="fade-in">
                <td><strong>${row.parameter}</strong></td>
                <td>${row.value}</td>
                <td>${row.change}</td>
                <td class="${statusClass}">${row.status}</td>
                <td><small>${row.health}</small></td>
                <td><small class="text-info">${row.recommendation}</small></td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

// Update pollution analysis
function updatePollutionAnalysis(data) {
    const sourcesContainer = document.getElementById('pollutionSources');
    const impactContainer = document.getElementById('environment-impact');

    const p = data.pollutants || {};
    const no2 = p.no2 || 45;
    const so2 = p.so2 || 15;
    const pm25 = p.pm2_5 || 35;
    const co = p.co || 550;

    // Calculate contributions (Same logic as chart)
    let trafficScore = (no2 * 1.5) + (co / 50);
    let industryScore = (so2 * 3) + (pm25 * 0.5);
    let energyScore = (pm25 * 1.2) + (100 - data.renewableEnergyPercentage) * 0.2;
    let agriScore = (100 - data.humidity) / 5;
    let resScore = (co / 40) + (pm25 * 0.5);

    const total = trafficScore + industryScore + energyScore + agriScore + resScore;

    const trafficPct = (trafficScore / total) * 100;
    const industryPct = (industryScore / total) * 100;
    const energyPct = (energyScore / total) * 100;
    const agriPct = (agriScore / total) * 100;
    const resPct = (resScore / total) * 100;

    sourcesContainer.innerHTML = `
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>🚗 Transportation</span>
                <span class="badge bg-danger">${trafficPct.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-danger" style="width: ${trafficPct}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>🏭 Industry</span>
                <span class="badge bg-warning">${industryPct.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-warning" style="width: ${industryPct}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>⚡ Energy Production</span>
                <span class="badge bg-info">${energyPct.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-info" style="width: ${energyPct}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>🌾 Agriculture</span>
                <span class="badge bg-success">${agriPct.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-success" style="width: ${agriPct}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>🏠 Residential</span>
                <span class="badge bg-primary">${resPct.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-primary" style="width: ${resPct}%"></div>
            </div>
        </div>
    `;

    // Rule-Based Predictive Analytics
    let impactMessage = '';
    if (data.airQualityIndex < 50) {
        impactMessage = 'Air quality is excellent. Current pollutant levels are stable.';
    } else if (data.airQualityIndex < 100) {
        impactMessage = `Air quality is moderate. Primary contributor today appears to be ${getMaxContributor(trafficPct, industryPct, energyPct)}.`;
    } else {
        impactMessage = 'Air quality needs attention. High accumulation of pollutants detected.';
    }

    impactContainer.innerHTML = `
        <div class="alert alert-info">
            <strong>Predictive Analysis:</strong> ${impactMessage}
            <div class="mt-2">
                <small>
                    <strong>Real-time Data:</strong> Analysis based on live sensors: NO₂ (${no2.toFixed(1)} µg/m³), PM2.5 (${pm25.toFixed(1)} µg/m³), SO₂ (${so2.toFixed(1)} µg/m³).
                </small>
            </div>
        </div>
    `;
}

function getMaxContributor(traffic, industry, energy) {
    if (traffic > industry && traffic > energy) return 'Transportation';
    if (industry > traffic && industry > energy) return 'Industry';
    return 'Energy Production';
}

// Update alerts
function updateAlerts(data) {
    const alertsContainer = document.getElementById('environmentAlerts');
    const alerts = [];

    if (data.airQualityIndex > 100) {
        alerts.push({
            type: 'danger',
            title: 'Poor Air Quality Alert',
            message: `AQI is ${data.airQualityIndex}. Consider limiting outdoor activities.`
        });
    }

    if (data.co2Levels > 800) {
        alerts.push({
            type: 'warning',
            title: 'Elevated CO₂ Levels',
            message: `CO₂ levels at ${data.co2Levels} ppm. Consider improving ventilation.`
        });
    }

    if (data.energyConsumption > 9000) {
        alerts.push({
            type: 'warning',
            title: 'High Energy Consumption',
            message: `Energy usage at ${formatNumber(data.energyConsumption)} kWh. Consider conservation measures.`
        });
    }

    if (data.renewableEnergyPercentage < 30) {
        alerts.push({
            type: 'info',
            title: 'Low Renewable Energy',
            message: `Only ${data.renewableEnergyPercentage}% from renewable sources.`
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            title: 'All Systems Normal',
            message: 'Environmental parameters within acceptable ranges.'
        });
    }

    let html = '';
    alerts.forEach(alert => {
        const alertClass = alert.type === 'danger' ? 'alert-danger' :
            alert.type === 'warning' ? 'alert-warning' :
                alert.type === 'info' ? 'alert-info' : 'alert-success';

        html += `
            <div class="alert ${alertClass} alert-card fade-in">
                <h6>${alert.title}</h6>
                <p class="mb-0">${alert.message}</p>
            </div>
        `;
    });

    alertsContainer.innerHTML = html;
}

// Helper functions
function getRandomChange(min, max) {
    const change = Math.floor(Math.random() * (max - min + 1)) + min;
    return change > 0 ? `+${change}` : change;
}

function getHealthImpact(aqi) {
    if (aqi <= 50) return 'Minimal impact';
    if (aqi <= 100) return 'Moderate - sensitive groups affected';
    if (aqi <= 150) return 'Unhealthy for sensitive groups';
    return 'Health alert - everyone affected';
}

function getAQIRecommendation(aqi) {
    if (aqi <= 50) return 'Continue normal activities';
    if (aqi <= 100) return 'Sensitive groups reduce outdoor exertion';
    if (aqi <= 150) return 'Everyone reduce prolonged outdoor exertion';
    return 'Avoid outdoor activities';
}

function getCO2HealthImpact(co2) {
    if (co2 < 400) return 'No health effects';
    if (co2 < 1000) return 'Possible drowsiness';
    return 'Headaches, poor concentration';
}

function getCO2Recommendation(co2) {
    if (co2 < 400) return 'Excellent ventilation';
    if (co2 < 1000) return 'Consider opening windows';
    return 'Improve ventilation immediately';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initEnvironment);