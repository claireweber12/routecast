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

    if(!city) {
        return res.status(400).json({error: "City is required"});

    }
    const apiKey = process.env.OPENWEATHER_API_KEY;
    try{
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=imperial`;

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Could not fetch weather",
      });
    }
    res.json({
        city:data.name,
        country:data.sys.country,
        temperature:data.main.temp,
        feelsLike:data.main.feels_like,
        condition:data.weather[0].description,
        windSpeed: data.wind.speed,
    });
    } catch (error){
        console.error("Weather route error", error);
        res.status(500).json({ error: "Server error while fetching weather"});
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});