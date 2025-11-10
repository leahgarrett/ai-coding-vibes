# Pixar Movies Dashboard

An interactive dashboard for exploring Pixar movies data with visualizations and filtering capabilities.

## Features

- View all Pixar movies with details like release date, runtime, and plot
- Filter movies by genre, release year, and rating
- Interactive charts showing box office performance and rating distribution
- Responsive design that works on desktop and mobile devices

## Getting Started

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Explore the data using the interactive filters and charts

## Data Sources

- Movie data was compiled from various sources
- Try more datasets from [Maven Analytics Data Playground](https://mavenanalytics.io/data-playground)

## AI Prompts

### Data Processing
- "Combine the files in the data folder into one JSON file"
  - Created `combine_data.py` to process and merge CSV files
  - Output: `data/pixar_movies_combined.json`

### Web Development
- "Create a single page website to visualize the data in the JSON file"
  - Created responsive HTML/CSS/JS dashboard
  - Added interactive charts using Chart.js
  - Implemented filtering and search functionality
  - Ensured mobile responsiveness

### UI/UX Improvements
- Added loading states and error handling
- Implemented smooth animations and transitions
- Created a clean, modern interface with a Pixar-themed color scheme
- Ensured accessibility with proper ARIA labels and keyboard navigation