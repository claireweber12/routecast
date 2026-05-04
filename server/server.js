import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

//weather helper function
async function getWeatherByCoordinates(lat, lon, apiKey) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  const weatherResponse = await fetch(weatherUrl);
  const weatherData = await weatherResponse.json();

  if (!weatherResponse.ok) {
    throw new Error(weatherData.message || "Could not fetch weather.");
  }

  return {
    city: weatherData.name,
    lat: Number(lat),
    lon: Number(lon),
    description: weatherData.weather[0].description,
    temperature: weatherData.main.temp,
    feelsLike: weatherData.main.feels_like,
    humidity: weatherData.main.humidity,
    windSpeed: weatherData.wind.speed,
  };
}

// Geocoding helper function
async function getCoordinatesByLocation(city, state, apiKey) {
  const locationQuery = encodeURIComponent(`${city},${state},US`);

  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${locationQuery}&limit=1&appid=${apiKey}`;

  const geoResponse = await fetch(geoUrl);
  const geoData = await geoResponse.json();

  if (!geoResponse.ok || geoData.length === 0) {
    throw new Error("Location not found.");
  }

  return {
    city: geoData[0].name,
    state: geoData[0].state,
    country: geoData[0].country,
    lat: geoData[0].lat,
    lon: geoData[0].lon,
  };
}

//Mapbox geocoding helper
async function getMapboxCoordinates(location, mapboxToken) {
  const encodedLocation = encodeURIComponent(location);

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${mapboxToken}&limit=1&country=US`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.features.length === 0) {
    throw new Error(`Could not find coordinates for ${location}.`);
  }

  return {
    name: data.features[0].place_name,
    lon: data.features[0].center[0],
    lat: data.features[0].center[1],
  };
}

//Mapbox route helper
async function getDrivingRoute(origin, destination, mapboxToken) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?geometries=geojson&overview=full&access_token=${mapboxToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || !data.routes || data.routes.length === 0) {
    throw new Error("Could not find a driving route.");
  }

  const route = data.routes[0];

  return {
    distanceMiles: route.distance / 1609.34,
    durationHours: route.duration / 3600,
    durationMinutes: route.duration / 60,
    coordinates: route.geometry.coordinates,
  };
}

app.get("/", (req, res) => {
  res.send("RouteCast backend is running!");
});

//weather API route
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;
  const state = req.query.state || "";

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OpenWeather API key is missing.",
    });
  }

  try {
    const location = await getCoordinatesByLocation(city, state, apiKey);
    const weather = await getWeatherByCoordinates(location.lat, location.lon, apiKey);

    res.json({
      ...weather,
      city: location.city,
      state: location.state,
      country: location.country,
    });
  } catch (error) {
    console.error("Weather route error:", error);
    res.status(500).json({
      error: error.message || "Server error while fetching weather",
    });
  }
});

//coordinates API route
app.get("/api/weather/coordinates", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (!lat || !lon) {
    return res.status(400).json({
      error: "Latitude and longitude are required.",
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OpenWeather API key is missing.",
    });
  }

  try {
    const weather = await getWeatherByCoordinates(lat, lon, apiKey);
    res.json(weather);
  } catch (error) {
    console.error("Coordinate weather route error:", error);
    res.status(500).json({
      error: error.message || "Server error while fetching coordinate weather.",
    });
  }
});

//API route endpoint 
app.get("/api/route", async (req, res) => {
  const origin = req.query.origin;
  const destination = req.query.destination;

  if (!origin || !destination) {
    return res.status(400).json({
      error: "Origin and destination are required.",
    });
  }

  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return res.status(500).json({
      error: "Mapbox access token is missing.",
    });
  }

  try {
    const originCoords = await getMapboxCoordinates(origin, mapboxToken);
    const destinationCoords = await getMapboxCoordinates(destination, mapboxToken);

    const route = await getDrivingRoute(
      originCoords,
      destinationCoords,
      mapboxToken
    );

    res.json({
      origin: originCoords,
      destination: destinationCoords,
      distanceMiles: Number(route.distanceMiles.toFixed(1)),
      durationHours: Number(route.durationHours.toFixed(2)),
      durationMinutes: Math.round(route.durationMinutes),
      coordinates: route.coordinates,
    });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({
      error: error.message || "Server error while fetching route.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});