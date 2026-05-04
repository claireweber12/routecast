const cityInput = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const searchBtn = document.getElementById("searchBtn");
const weatherInfo = document.getElementById("weatherInfo");

const API_BASE_URL = "http://localhost:5050";

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", handleEnter);
stateInput.addEventListener("keydown", handleEnter);

function handleEnter(event) {
  if (event.key === "Enter") {
    getWeather();
  }
}

async function getWeather() {
  const city = cityInput.value.trim();
  const state = stateInput.value.trim();

  if (!city) {
    showMessage("Please enter a city.", true);
    return;
  }

  try {
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    showMessage("Fetching weather...");

    const url = `${API_BASE_URL}/api/weather?city=${encodeURIComponent(
      city
    )}&state=${encodeURIComponent(state)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Could not fetch weather.", true);
      return;
    }

    displayWeather(data);
  } catch (error) {
    console.error(error);
    showMessage("Could not connect to the backend server.", true);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Get Weather";
  }
}

function displayWeather(data) {
  weatherInfo.classList.remove("hidden");

  weatherInfo.innerHTML = `
    <div class="weather-header">
      <div>
        <h2>${data.name || data.city}, ${data.state || data.country || ""}</h2>
        <p class="description">${data.description}</p>
      </div>

      <div class="temp">${Math.round(data.temperature)}°F</div>
    </div>

    <div class="weather-grid">
      <div class="weather-stat">
        <span>Feels Like</span>
        <strong>${Math.round(data.feelsLike)}°F</strong>
      </div>

      <div class="weather-stat">
        <span>Humidity</span>
        <strong>${data.humidity}%</strong>
      </div>

      <div class="weather-stat">
        <span>Wind</span>
        <strong>${data.windSpeed} mph</strong>
      </div>
    </div>
  `;
}

function showMessage(message, isError = false) {
  weatherInfo.classList.remove("hidden");

  weatherInfo.innerHTML = `
    <p class="${isError ? "error" : ""}">${message}</p>
  `;
}