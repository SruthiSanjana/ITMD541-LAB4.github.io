document.addEventListener("DOMContentLoaded", function () {
    const geolocationBtn = document.getElementById("geolocationBtn");
    const locationSelect = document.getElementById("locationSelect");
    const locationSearch = document.getElementById("locationSearch");
    const dashboard = document.getElementById("dashboard");
    const errorContainer = document.getElementById("errorContainer");
    const searchBtn = document.getElementById("searchBtn");
    const locationInfo = document.getElementById("locationInfo");

    geolocationBtn.addEventListener("click", getUserLocation);
    locationSelect.addEventListener("change", getSelectedLocation);
    searchBtn.addEventListener("click", searchLocation);

    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError);
        } else {
            displayError("Geolocation is not supported by this browser.");
        }
    }

    function handleGeolocationSuccess(position) {
        const { latitude, longitude } = position.coords;
        fetchData(latitude, longitude, "Current Location");
    }

    function handleGeolocationError(error) {
        displayError(`${error.message}`);
    }

    function getSelectedLocation() {
        const selectedLocation = locationSelect.value;
        if (selectedLocation) {
            if (selectedLocation === "Use Current Location") {
                getUserLocation();
            } else {
                const locations = {
                    "New York": { latitude: 40.7128, longitude: -74.0060 },
                    "London": { latitude: 51.5074, longitude: -0.1278 },
                    "Tokyo": { latitude: 35.6895, longitude: 139.6917 },
                    "Sydney": { latitude: -33.8688, longitude: 151.2093 },
                    "Paris": { latitude: 48.8566, longitude: 2.3522 }
                };

                const { latitude, longitude } = locations[selectedLocation];
                fetchData(latitude, longitude, selectedLocation);
            }
        }
    }

    function searchLocation() {
        const searchQuery = locationSearch.value;
        if (searchQuery) {
            fetchGeocodeData(searchQuery);
        } else {
            displayError("Please enter a location to search.");
        }
    }

    function fetchGeocodeData(query) {
        const geocodeApiUrl = `https://geocode.maps.co/search?q=${query}`;
        const xhr = new XMLHttpRequest();

        xhr.open("GET", geocodeApiUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.length > 0) {
                        const selectedLocation = data[0];
                        const { lat, lon } = selectedLocation;
                        fetchData(lat, lon, selectedLocation.display_name);
                    } else {
                        displayError("No location found. Please enter a valid location.");
                    }
                } else {
                    displayError(`Geocode API request failed with status ${xhr.status}`);
                }
            }
        };

        xhr.send();
    }

    function fetchData(latitude, longitude, selectedLocation) {
        const apiUrlToday = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&formatted=0&date=today`;
        const apiUrlTomorrow = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&formatted=0&date=tomorrow`;

        const xhrToday = new XMLHttpRequest();
        xhrToday.open("GET", apiUrlToday, true);
        xhrToday.onreadystatechange = function () {
            if (xhrToday.readyState === 4) {
                if (xhrToday.status === 200) {
                    const dataToday = JSON.parse(xhrToday.responseText);

                    const xhrTomorrow = new XMLHttpRequest();
                    xhrTomorrow.open("GET", apiUrlTomorrow, true);
                    xhrTomorrow.onreadystatechange = function () {
                        if (xhrTomorrow.readyState === 4 && xhrTomorrow.status === 200) {
                            const dataTomorrow = JSON.parse(xhrTomorrow.responseText);
                            displayData(dataToday.results, dataTomorrow.results, selectedLocation);
                        } else if (xhrTomorrow.readyState === 4) {
                            displayError(`API request failed with status ${xhrTomorrow.status}`);
                        }
                    };
                    xhrTomorrow.send();
                } else {
                    displayError(`API request failed with status ${xhrToday.status}`);
                }
            }
        };
        xhrToday.send();
    }

    function displayData(resultsToday, resultsTomorrow, selectedLocation) {
        dashboard.innerHTML = `
            <div class="card">
                <h3>Today</h3>
                <p>Sunrise: ${resultsToday.sunrise}</p>
                <p>Sunset: ${resultsToday.sunset}</p>
                <p>Dawn: ${resultsToday.dawn}</p>
                <p>Dusk: ${resultsToday.dusk}</p>
                <p>Day Length: ${resultsToday.day_length}</p>
                <p>Solar Noon: ${resultsToday.solar_noon}</p>
                <p>Time Zone: ${resultsToday.timezone}</p>
            </div>

            <div class="card">
            <h3>Tomorrow</h3>
                <p>Sunrise: ${resultsTomorrow.sunrise}</p>
                <p>Sunset: ${resultsTomorrow.sunset}</p>
                <p>Dawn: ${resultsTomorrow.dawn}</p>
                <p>Dusk: ${resultsTomorrow.dusk}</p>
                <p>Day Length: ${resultsTomorrow.day_length}</p>
                <p>Solar Noon: ${resultsTomorrow.solar_noon}</p>
                <p>Time Zone: ${resultsTomorrow.timezone}</p>
            </div>
        `;

        locationInfo.textContent = `Location: ${selectedLocation}`;
        dashboard.classList.remove("hidden");
        errorContainer.classList.add("hidden");
    }

    function displayError(message) {
        dashboard.innerHTML = "";
        errorContainer.textContent = message;
        errorContainer.classList.remove("hidden");
        dashboard.classList.add("hidden");
    }
});
