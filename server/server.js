import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("RouteCast backend is running!");
});

app.get("/api/weather",async (req, res) => {
    const city = req.query.city;
    const state = req.query.state || "";

    if(!city) {
        return res.status(400).json({error: "City is required"});

    }
    const apiKey = process.env.OPENWEATHER_API_KEY;
    try{
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${apiKey}`;
      const geoResponse = await fetch(geoUrl);
      const geoData=await geoResponse.json();
      if (!geoResponse.ok || geoData.length === 0) {
        return res.status(404).json({
        error: "Location not found.",
        });
      }
      const lat = geoData[0].lat;
      const lon = geoData[0].lon;


      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    if (!weatherResponse.ok) {
      return res.status(weatherResponse.status).json({
        error: weatherData.message || "Could not fetch weather",
      });
    }
    res.json({
        city: weatherData.name,
        state:geoData.state,
        country: geoData[0].country,
        lat,
        lon,
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
    });
    } catch (error){
        console.error("Weather route error", error);
        res.status(500).json({ error: "Server error while fetching weather"});
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});