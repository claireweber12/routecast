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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});