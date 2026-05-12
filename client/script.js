const origCity = document.getElementById("origCity");
const origState = document.getElementById("origState");
const destCity = document.getElementById("destCity");
const destState = document.getElementById("destState");
const searchBtn = document.getElementById("searchBtn");
const weatherInfo = document.getElementById("weatherInfo");

const API_BASE_URL = https://routecast-chyc.onrender.com
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5050"
    : "https://routecast-api.onrender.com";

searchBtn.addEventListener("click", getWeather);

origCity.addEventListener("keydown", handleEnter);
origState.addEventListener("keydown", handleEnter);
destCity.addEventListener("keydown", handleEnter);
destState.addEventListener("keydown", handleEnter);

function handleEnter(event) {
  if (event.key === "Enter") {
    getWeather();
  }
}

async function getWeather() {
  const origcity = origCity.value.trim();
  const origstate = origState.value.trim();
  const destcity = destCity.value.trim();
  const deststate = destState.value.trim();

  if (!origcity) {
    showMessage("Please enter a origin city.", true);
    return;
  }
  if (!destcity) {
    showMessage("Please enter a destination city.", true);
    return;
  }

  try {
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    showMessage("Fetching weather...");

    const origUrl = `${API_BASE_URL}/api/weather?city=${encodeURIComponent(
      origcity
    )}&state=${encodeURIComponent(origstate)}`;
    const destUrl = `${API_BASE_URL}/api/weather?city=${encodeURIComponent(
      destcity
    )}&state=${encodeURIComponent(deststate)}`;
    const routeUrl = `${API_BASE_URL}/api/route?origin=${encodeURIComponent(
    `${origcity},${origstate}`
    )}&destination=${encodeURIComponent(`${destcity},${deststate}`)}`;

    const origResponse = await fetch(origUrl);
    const origData = await origResponse.json();

    if (!origResponse.ok) {
      showMessage(origData.error || "Could not fetch weather.", true);
      return;
    }

    const destResponse = await fetch(destUrl);
    const destData = await destResponse.json();

    if (!destResponse.ok) {
      showMessage(destData.error || "Could not fetch weather.", true);
      return;
    }
    const routeResponse = await fetch(routeUrl);
    const routeData = await routeResponse.json();

    if (!routeResponse.ok) {
    showMessage(routeData.error || "Could not fetch route.", true);
    return;
    }

    const middleIndex = Math.floor(routeData.coordinates.length / 2);
    const midpoint = routeData.coordinates[middleIndex];

    // Mapbox coordinates are [longitude, latitude]
    const midpointLon = midpoint[0];
    const midpointLat = midpoint[1];

    const midpointUrl = `${API_BASE_URL}/api/weather/coordinates?lat=${midpointLat}&lon=${midpointLon}`;

    const midpointResponse = await fetch(midpointUrl);
    const midpointData = await midpointResponse.json();

    if (!midpointResponse.ok) {
      showMessage(midpointData.error || "Could not fetch midpoint weather.", true);
      return;
    }

    displayTripWeather(origData, midpointData, destData, routeData);
    
  } catch (error) {
    console.error(error);
    showMessage("Could not connect to the backend server.", true);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Get Weather";
  }
}

function displayTripWeather(origin, midpoint, destination, route){
    weatherInfo.classList.remove("hidden");
    const tempDifference = Math.round(destination.temperature - origin.temperature);

  let comparisonMessage = "";

  if (tempDifference > 0) {
    comparisonMessage = `Your destination is ${tempDifference}°F warmer than your starting point.`;
  } else if (tempDifference < 0) {
    comparisonMessage = `Your destination is ${Math.abs(
      tempDifference
    )}°F cooler than your starting point.`;
  } else {
    comparisonMessage = "Your destination is about the same temperature as your starting point.";
  }

  weatherInfo.innerHTML = `
    <div class="trip-summary">
      <h2>Trip Weather Summary</h2>
      <p>${comparisonMessage}</p>
      <p><strong>Distance:</strong> ${route.distanceMiles} miles</p>
<p><strong>Estimated drive time:</strong> ${formatDuration(route.durationMinutes)}</p>
    </div>

    <div class="weather-card-grid">
      ${createWeatherCard(origin, "Origin")}
      ${createWeatherCard(midpoint, "Midpoint")}
      ${createWeatherCard(destination, "Destination")}
    </div>
  `;
}

function createWeatherCard(data, label) {
  return `
    <div class="weather-location-card">
      <p class="eyebrow">${label}</p>

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
    </div>
  `;
}

function showMessage(message, isError = false) {
  weatherInfo.classList.remove("hidden");

  weatherInfo.innerHTML = `
    <p class="${isError ? "error" : ""}">${message}</p>
  `;
}
//Duration helper function
function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} hr ${minutes} min`;
}