// Global variables
let moviesData = [];
let revenueChart, ratingChart;

// DOM Elements
const moviesContainer = document.getElementById('movies-container');
const genreFilter = document.getElementById('genre-filter');
const yearFilter = document.getElementById('year-filter');
const ratingFilter = document.getElementById('rating-filter');

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Calculate movie statistics
const calculateStats = (movies) => {
    const totalMovies = movies.length;
    const totalRevenue = movies.reduce((sum, movie) => {
        return sum + parseInt(movie.box_office?.box_office_worldwide || 0);
    }, 0);
    const avgRuntime = Math.round(movies.reduce((sum, movie) => {
        return sum + parseInt(movie.run_time || 0);
    }, 0) / Math.max(1, totalMovies));

    return { totalMovies, totalRevenue, avgRuntime };
};

// Update statistics
const updateStats = (movies) => {
    const { totalMovies, totalRevenue, avgRuntime } = calculateStats(movies);
    
    document.getElementById('total-movies').textContent = totalMovies;
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('avg-runtime').textContent = `${avgRuntime} min`;
};

// Create movie card
const createMovieCard = (movie) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const releaseYear = new Date(movie.release_date).getFullYear();
    
    card.innerHTML = `
        <img src="https://source.unsplash.com/random/600x400/?pixar-${encodeURIComponent(movie.film)}" 
             alt="${movie.film}" 
             class="movie-poster" 
             onerror="this.src='https://via.placeholder.com/400x225?text=No+Image+Available'"
        >
        <div class="movie-info">
            <h3 class="movie-title">${movie.film} (${releaseYear})</h3>
            <div class="movie-meta">
                <span class="rating-${movie.film_rating}">${movie.film_rating}</span>
                <span>${movie.run_time} min</span>
            </div>
            <p class="movie-plot">${movie.plot}</p>
            <div class="movie-genres">
                ${movie.genres.slice(0, 3).map(genre => 
                    `<span class="genre-tag">${genre}</span>`
                ).join('')}
            </div>
        </div>
    `;
    
    return card;
};

// Filter movies based on selected filters
const filterMovies = () => {
    const selectedGenre = genreFilter.value;
    const selectedYear = yearFilter.value;
    const selectedRating = ratingFilter.value;
    
    return moviesData.filter(movie => {
        const matchesGenre = !selectedGenre || movie.genres.includes(selectedGenre);
        const matchesYear = !selectedYear || new Date(movie.release_date).getFullYear().toString() === selectedYear;
        const matchesRating = !selectedRating || movie.film_rating === selectedRating;
        
        return matchesGenre && matchesYear && matchesRating;
    });
};

// Update movies grid
const updateMoviesGrid = (movies) => {
    moviesContainer.innerHTML = '';
    
    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p class="no-results">No movies found matching the selected filters.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    movies.forEach(movie => {
        fragment.appendChild(createMovieCard(movie));
    });
    
    moviesContainer.appendChild(fragment);
};

// Initialize filters
const initFilters = (movies) => {
    // Get unique genres
    const genres = new Set();
    movies.forEach(movie => {
        movie.genres.forEach(genre => genres.add(genre));
    });
    
    // Add genre options
    Array.from(genres).sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
    
    // Get unique years
    const years = new Set(
        movies.map(movie => new Date(movie.release_date).getFullYear())
    );
    
    // Add year options
    Array.from(years)
        .sort((a, b) => b - a)
        .forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    
    // Add event listeners
    [genreFilter, yearFilter, ratingFilter].forEach(filter => {
        filter.addEventListener('change', () => {
            const filteredMovies = filterMovies();
            updateMoviesGrid(filteredMovies);
            updateStats(filteredMovies);
            updateCharts(filteredMovies);
        });
    });
};

// Create revenue chart
const createRevenueChart = (movies) => {
    const ctx = document.getElementById('revenue-chart').getContext('2d');
    
    // Sort movies by release date
    const sortedMovies = [...movies].sort((a, b) => 
        new Date(a.release_date) - new Date(b.release_date)
    );
    
    const labels = sortedMovies.map(movie => movie.film);
    const revenueData = sortedMovies.map(movie => ({
        x: movie.film,
        y: parseInt(movie.box_office?.box_office_worldwide || 0) / 1000000, // Convert to millions
        budget: parseInt(movie.box_office?.budget || 0) / 1000000,
        profit: (parseInt(movie.box_office?.box_office_worldwide || 0) - parseInt(movie.box_office?.budget || 0)) / 1000000
    }));
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue (Millions $)',
                    data: revenueData,
                    backgroundColor: 'rgba(0, 123, 255, 0.7)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Budget (Millions $)',
                    data: revenueData.map(item => item.budget),
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Profit (Millions $)',
                    data: revenueData.map(item => item.profit),
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (Millions $)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw.toLocaleString()}M`;
                        }
                    }
                }
            }
        }
    });
};

// Create rating chart
const createRatingChart = (movies) => {
    const ctx = document.getElementById('rating-chart').getContext('2d');
    
    // Count movies by rating
    const ratingCounts = movies.reduce((acc, movie) => {
        acc[movie.film_rating] = (acc[movie.film_rating] || 0) + 1;
        return acc;
    }, {});
    
    const labels = Object.keys(ratingCounts);
    const data = Object.values(ratingCounts);
    
    const backgroundColors = {
        'G': 'rgba(40, 167, 69, 0.7)',
        'PG': 'rgba(255, 193, 7, 0.7)',
        'PG-13': 'rgba(220, 53, 69, 0.7)'
    };
    
    const borderColors = {
        'G': 'rgba(40, 167, 69, 1)',
        'PG': 'rgba(255, 193, 7, 1)',
        'PG-13': 'rgba(220, 53, 69, 1)'
    };
    
    if (ratingChart) {
        ratingChart.destroy();
    }
    
    ratingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(rating => backgroundColors[rating] || '#6c757d'),
                borderColor: labels.map(rating => borderColors[rating] || '#6c757d'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
};

// Update charts
const updateCharts = (movies) => {
    createRevenueChart(movies);
    createRatingChart(movies);
};

// Initialize the application
const init = async () => {
    try {
        // Load the data
        const response = await fetch('data/pixar_movies_combined.json');
        if (!response.ok) {
            throw new Error('Failed to load movie data');
        }
        
        moviesData = await response.json();
        
        // Initialize filters
        initFilters(moviesData);
        
        // Initial render
        updateMoviesGrid(moviesData);
        updateStats(moviesData);
        updateCharts(moviesData);
        
    } catch (error) {
        console.error('Error initializing application:', error);
        moviesContainer.innerHTML = `
            <div class="error-message">
                <h3>Error loading data</h3>
                <p>${error.message}</p>
                <p>Please make sure the data file exists and is accessible.</p>
            </div>
        `;
    }
};

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
