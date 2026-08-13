# LuxInfra Roadmap & Task Tracker

This file tracks planned and in-progress features. Check off items as they ship.
Deploy branches: backend `luxinfrabackend` / frontend `luxinfra-frontend` / combined `luxinfra`.

## In progress — Weather integration (V1)

Goal: project-site weather cards, weather status on the site map, and a subtle
weather-driven theme. ₹0 cost via Open-Meteo (non-commercial OK; add attribution).
Provider is hidden behind `IWeatherService` so it can be swapped for a commercial
API later without UI changes.

- [x] Create this TODO.md tracker
- [x] Backend: `IWeatherService` + `OpenMeteoWeatherService` + weather DTO
- [x] Backend: `GET /api/weather?latitude=..&longitude=..` endpoint (auth'd)
- [x] Backend: weather-code -> condition mapper (`Clear/Cloudy/Drizzle/Rain/Snow/Thunderstorm`)
- [x] Backend: day/night detection + short in-memory cache (15-30 min per site)
- [ ] Backend: push backend to `luxinfrabackend` so Render redeploys
- [x] Frontend: theme engine — `data-weather` CSS variables (sunny/cloudy/rain/storm/night)
- [x] Frontend: "Switch to weather app mode" button in topbar + auto theme resolver
- [x] Frontend: `WeatherCard` (temp, feels-like, humidity, wind, rain chance, updated)
- [x] Frontend: weather in Site Map popups using each project's lat/lng
- [x] Frontend: Open-Meteo attribution link (About/Settings/footer)
- [ ] Verify on mobile + desktop, confirm live deploy

## Recently shipped

- Recipient picker for SOS + live-location sharing ("pick people at trigger time")
- Site Map: always-on map, route planner, "Route in Google Maps", share live location
- Project location tagging (LocationPicker in new-project form + set-location modal)
- SOS resolve/stop-alerts endpoint + UI (was 404 on live until backend redeploy)