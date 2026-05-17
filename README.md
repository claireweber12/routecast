# RouteCast 
### [Live Demo](https://routecastweather.netlify.app/)
RouteCast is a full-stack weather and route planning app that helps users check weather conditions along a driving route. Instead of only showing weather for one city, RouteCast compares the weather at the starting location, midpoint, and destination while also showing route distance and estimated drive time.

## Project Overview
RouteCast was inspired by my own experience driving back and forth between Texas and Alabama during college. I often encountered unexpected weather, but didn't have a way to look up the weather along my exact route. 

Users enter an origin and destination and the app returns:
- Weather at the starting location
- Weather at a midpoint along the route
- Weather at the destination
- Route distance
- Estimated drive time
- A simple weather comparison summary

This project was built as a software engineering portfolio project to practice full-stack development, API integration, backend routing, and working with geospatial data.

## Features
- Search by origin city/state and destination city/state
- Fetch current weather using latitude and longitude
- Convert city/state input into geographic coordinates
- Get route distance and estimated drive time
- Find a midpoint coordinate from the driving route
- Display weather for origin, midpoint, and destination
- Compare destination temperature against origin temperature
- Responsive frontend layout
- Backend keeps API keys out of the frontend

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- CORS
- dotenv

### APIs
- OpenWeatherMap Geocoding API
- OpenWeatherMap Current Weather API
- Mapbox Geocoding API
- Mapbox Directions API

## Project Structure

```text
routecast/
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
└── README.md
```

## Future Improvements
Planned features include:
*  Add a map display with route drawn on the page
*  Add multiple checkpoints along the route
*  Show forecasted weather based on estimated arrival time
*  Add severe weather alerts
*  Add route-based warnings for rain, storms, and high wind
*  Improve design midpoint selection using distance-based logic
*  Deploy the frontend and backend
*  Add loading animations and better error states

## What I learned 
While building RouteCast, I practiced:
*  Creating a Node.js and Express backend
*  Using environment variables to protext API keys
*  Calling third-party APIs from the backend
*  Fetching and displaying JSON data
*  Handling errors from API requests
*  structuring a full-stack project

## Author
Claire Weber

