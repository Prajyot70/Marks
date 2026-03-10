

// Grab DOM elements
const analysisForm = document.getElementById('analysisForm');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const resultsDashboard = document.getElementById('resultsDashboard');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const errorMessage = document.getElementById('errorMessage');

let currentChart = null;

// Function to initialize or update the Chart.js doughnut chart
function initAccuracyChart(correctCount, incorrectCount, accuracyPercent) {
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    document.getElementById('centerAccuracyText').innerText = accuracyPercent + '%';

    // Destroy existing chart to prevent hover glitches if analyzed multiple times
    if (currentChart) { currentChart.destroy(); }

    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [correctCount, incorrectCount],
                backgroundColor: ['#4F46E5', '#E2E8F0'], // Indigo and Gray
                borderColor: '#FFFFFF', 
                borderWidth: 4,
                hoverOffset: 5
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '78%',
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            animation: { animateRotate: true, animateScale: false, duration: 1500, easing: 'easeOutQuart' }
        }
    });
}

// Handle Form Submission and API Request
analysisForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const htmlInput = document.getElementById('htmlInput').value;

    // UI Loading State
    btnText.innerText = 'Analyzing Data...';
    btnSpinner.style.display = 'block';
    analyzeBtn.disabled = true;
    errorMessage.style.display = 'none';
    resultsDashboard.classList.remove('show'); 

    try {
        // ⚠️ REPLACE THIS URL WITH YOUR LIVE RENDER URL BEFORE UPLOADING TO GITHUB
        const backendUrl = 'https://marks-nyvd.onrender.com/api/analyze'; 
        // Example: 'https://gate-api-backend.onrender.com/api/analyze'
        // If testing locally on your computer, use: 'http://127.0.0.1:5000/api/analyze'

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: htmlInput })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to process the response sheet.");
        }

        // Calculate Accuracy
        const totalAttempted = data.correct + data.incorrect;
        const accuracy = totalAttempted > 0 ? Math.round((data.correct / totalAttempted) * 100) : 0;

        // Update UI Text
        finalScoreDisplay.innerText = data.score;
        resultsDashboard.classList.add('show');
        
        // Scroll down smoothly on mobile
        setTimeout(() => { resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);

        // Draw Chart
        initAccuracyChart(data.correct, data.incorrect, accuracy);

    } catch (error) {
        console.error("Error analyzing HTML:", error);
        errorMessage.innerText = error.message;
        errorMessage.style.display = 'block';
    } finally {
        // Reset Button UI
        btnText.innerText = 'Calculate Marks';
        btnSpinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
});