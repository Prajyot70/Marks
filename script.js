
const analysisForm = document.getElementById('analysisForm');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const resultsDashboard = document.getElementById('resultsDashboard');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const errorMessage = document.getElementById('errorMessage');

let currentChart = null;

function initAccuracyChart(correctCount, incorrectCount, accuracyPercent) {
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    document.getElementById('centerAccuracyText').innerText = accuracyPercent + '%';

    if (currentChart) { currentChart.destroy(); }

    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [correctCount, incorrectCount],
                backgroundColor: ['#4F46E5', '#E2E8F0'], 
                borderColor: '#FFFFFF', 
                borderWidth: 4,
                hoverOffset: 5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '78%',
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            animation: { animateRotate: true, animateScale: false, duration: 1500, easing: 'easeOutQuart' }
        }
    });
}

analysisForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    // Grab the URL from the input box
    const urlInput = document.getElementById('urlInput').value;

    btnText.innerText = 'Fetching Response Sheet...';
    btnSpinner.style.display = 'block';
    analyzeBtn.disabled = true;
    errorMessage.style.display = 'none';
    resultsDashboard.classList.remove('show'); 

    try {
        // ⚠️ REPLACE WITH YOUR LIVE RENDER URL
        const backendUrl = 'https://marks-nyvd.onrender.com/api/analyze'; 
        // Local testing: 'http://127.0.0.1:5000/api/analyze'

        // Send the URL to the Python backend
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to process the response sheet.");
        }

        const totalAttempted = data.correct + data.incorrect;
        const accuracy = totalAttempted > 0 ? Math.round((data.correct / totalAttempted) * 100) : 0;

        finalScoreDisplay.innerText = data.score;
        resultsDashboard.classList.add('show');
        
        setTimeout(() => { resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);

        initAccuracyChart(data.correct, data.incorrect, accuracy);

    } catch (error) {
        console.error("Error analyzing URL:", error);
        errorMessage.innerText = error.message;
        errorMessage.style.display = 'block';
    } finally {
        btnText.innerText = 'Calculate Marks';
        btnSpinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
});
