// public/js/dashboard.js - Dashboard Page JavaScript

let cityChart;
let predictionsChart;

// Initialize dashboard
async function initDashboard() {
    await updateDashboardData();
    setupCharts();
    startDataUpdates(updateDashboardData, 5000);
}

// Update dashboard data
async function updateDashboardData() {
    try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        // Update overall metrics
        document.getElementById('overall-health').textContent = data.overallCityHealth.toFixed(1); // Usually score out of 100

        // Update module scores
        document.getElementById('mobility-score').textContent = data.modules.mobility.score.toFixed(0);
        document.getElementById('environment-score').textContent = data.modules.environment.score.toFixed(0);
        document.getElementById('health-score').textContent = data.modules.health.score.toFixed(0);
        document.getElementById('agriculture-score').textContent = data.modules.agriculture.score.toFixed(0);

        // Update status indicators
        document.getElementById('mobility-status-text').textContent = data.modules.mobility.status;
        document.getElementById('environment-status-text').textContent = data.modules.environment.status;
        document.getElementById('health-status-text').textContent = data.modules.health.status;
        document.getElementById('agriculture-status-text').textContent = data.modules.agriculture.status;

        setStatusIndicator('mobility-status', data.modules.mobility.status);
        setStatusIndicator('environment-status', data.modules.environment.status);
        setStatusIndicator('health-status', data.modules.health.status);
        setStatusIndicator('agriculture-status', data.modules.agriculture.status);

        // Update alerts
        updateAlerts(data.alerts);

        // Update predictions
        updatePredictions(data.predictions);

        // Update charts
        updateCharts(data);

    } catch (error) {
        console.error('Failed to update dashboard:', error);
    }
}

// Setup charts
function setupCharts() {
    const ctx = document.getElementById('cityMetricsChart').getContext('2d');

    // Create Gradients
    const gradientTraffic = ctx.createLinearGradient(0, 0, 0, 400);
    gradientTraffic.addColorStop(0, 'rgba(56, 189, 248, 0.5)'); // Sky Blue
    gradientTraffic.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    const gradientEnv = ctx.createLinearGradient(0, 0, 0, 400);
    gradientEnv.addColorStop(0, 'rgba(74, 222, 128, 0.5)'); // Green
    gradientEnv.addColorStop(1, 'rgba(74, 222, 128, 0.0)');

    const gradientHealth = ctx.createLinearGradient(0, 0, 0, 400);
    gradientHealth.addColorStop(0, 'rgba(244, 114, 182, 0.5)'); // Pink
    gradientHealth.addColorStop(1, 'rgba(244, 114, 182, 0.0)');

    const gradientAgri = ctx.createLinearGradient(0, 0, 0, 400);
    gradientAgri.addColorStop(0, 'rgba(251, 191, 36, 0.5)'); // Amber
    gradientAgri.addColorStop(1, 'rgba(251, 191, 36, 0.0)');

    cityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Traffic Flow',
                    data: [],
                    borderColor: '#38bdf8',
                    backgroundColor: gradientTraffic,
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Air Quality',
                    data: [],
                    borderColor: '#4ade80',
                    backgroundColor: gradientEnv,
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Health Index',
                    data: [],
                    borderColor: '#f472b6',
                    backgroundColor: gradientHealth,
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Crop Yield',
                    data: [],
                    borderColor: '#fbbf24',
                    backgroundColor: gradientAgri,
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    title: {
                        display: true,
                        text: 'Performance Score (0-100)',
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                }
            }
        }
    });
}

// Update charts with new data
function updateCharts(data) {
    if (!cityChart) return;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add new data point
    if (cityChart.data.labels.length > 10) {
        cityChart.data.labels.shift();
        cityChart.data.datasets.forEach(dataset => {
            dataset.data.shift();
        });
    }

    cityChart.data.labels.push(timeLabel);
    cityChart.data.datasets[0].data.push(data.modules.mobility.score);
    cityChart.data.datasets[1].data.push(data.modules.environment.score);
    cityChart.data.datasets[2].data.push(data.modules.health.score);
    cityChart.data.datasets[3].data.push(data.modules.agriculture.score);

    cityChart.update('none');
}

// Update alerts display
function updateAlerts(alerts) {
    const container = document.getElementById('alerts-container');

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="alert alert-success fade-in">
                <strong>✅ All systems normal</strong>
                <p class="mb-0">No critical alerts at this time.</p>
            </div>
        `;
        document.getElementById('active-alerts').textContent = '0';
        return;
    }

    let html = '';
    alerts.forEach(alert => {
        html += createAlertElement(alert);
    });

    container.innerHTML = html;
    document.getElementById('active-alerts').textContent = alerts.length;
}

// Update predictions display
function updatePredictions(predictions) {
    const container = document.getElementById('predictions-container');

    const predictionData = [
        {
            title: 'Traffic Impact Prediction',
            description: 'Expected change in congestion levels',
            impact: predictions.trafficImpact.toFixed(2)
        },
        {
            title: 'Pollution Forecast',
            description: 'Predicted air quality changes',
            impact: predictions.pollutionImpact.toFixed(2)
        },
        {
            title: 'Health Risk Assessment',
            description: 'Estimated health impact',
            impact: predictions.healthImpact.toFixed(2)
        },
        {
            title: 'Agricultural Outlook',
            description: 'Crop yield predictions',
            impact: predictions.agricultureImpact.toFixed(2)
        }
    ];

    let html = '';
    predictionData.forEach(pred => {
        html += createPredictionElement(pred);
    });

    html += `
        <div class="alert alert-info mt-3">
            <small>
                <strong>System Architecture Note:</strong> 
                Current predictions use rule-based analytics. 
                The system is designed to integrate machine learning models for enhanced accuracy.
            </small>
        </div>
    `;

    container.innerHTML = html;
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', initDashboard);