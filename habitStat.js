document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('weeklyStatsChart').getContext('2d');
    const weeklyStatsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [{
                label: 'Completed Habits',
                data: [12, 19, 3, 5, 2, 3, 9], //Using Dummy Data for now, change with actual data from DB 
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
