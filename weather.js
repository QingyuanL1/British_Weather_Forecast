      function updateTime() {
        const now = new Date();
        const ukTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Europe/London" })
        );

        const options = {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Europe/London",
        };

        const ukDateTime = ukTime.toLocaleString("en-GB", options);

        const chineseWeekdays = {
          Monday: "星期一",
          Tuesday: "星期二",
          Wednesday: "星期三",
          Thursday: "星期四",
          Friday: "星期五",
          Saturday: "星期六",
          Sunday: "星期日",
        };

        const chineseMonths = {
          January: "1月",
          February: "2月",
          March: "3月",
          April: "4月",
          May: "5月",
          June: "6月",
          July: "7月",
          August: "8月",
          September: "9月",
          October: "10月",
          November: "11月",
          December: "12月",
        };

        const [weekday, date, time] = ukDateTime.split(", ");
        const [month, day, year] = date.split(" ");

        const chineseDateTime = `${year}年${chineseMonths[month]}${day}日${chineseWeekdays[weekday]} ${time}`;

        document.getElementById("current-time").textContent = chineseDateTime;
      }

      updateTime();

      setInterval(updateTime, 60000);

      async function getWeather() {
        const address = document.getElementById("address").value;
        const weatherInfo = document.getElementById("weather-info");
        const loading = document.getElementById("loading");
        const error = document.getElementById("error");
        const errorMessage = error.querySelector(".error-message");

        const googleApiKey = "YOUR_GOOGLE_API_KEY";
        const weatherApiKey = "YOUR_WEATHER_API_KEY";

        if (!address) {
          error.classList.remove("hidden");
          errorMessage.textContent = "Please enter a city name";
          weatherInfo.classList.add("hidden");
          return;
        }

        loading.classList.remove("hidden");
        error.classList.add("hidden");
        weatherInfo.classList.add("hidden");

        try {
          const geoResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address
            )}&key=${googleApiKey}`
          );
          console.log(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address
            )}&key=${googleApiKey}`);
          const geoData = await geoResponse.json();

          if (geoData.results.length === 0) {
            throw new Error("City not found. Please check your input.");
          }

          const lat = geoData.results[0].geometry.location.lat;
          const lon = geoData.results[0].geometry.location.lng;

          const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=en`
            ),
            fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=en`
            ),
          ]);

          const weatherData = await weatherResponse.json();
          const forecastData = await forecastResponse.json();

          if (!weatherResponse.ok) {
            throw new Error(
              weatherData.message || "Failed to fetch weather data"
            );
          }

          const weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
          const weatherMain = weatherData.weather[0].main.toLowerCase();

          let weatherAnimation = "";
          let weatherClass = "";

          switch (weatherMain) {
            case "clear":
              weatherClass = "weather-clear";
              weatherAnimation = '<div class="sun"></div>';
              break;
            case "rain":
            case "drizzle":
              weatherClass = "weather-rain";
              weatherAnimation = Array(10)
                .fill()
                .map(
                  (_, i) =>
                    `<div class="rain-drop" style="left: ${
                      Math.random() * 100
                    }%; animation: rain 1s ${i * 0.1}s infinite linear;"></div>`
                )
                .join("");
              break;
            case "clouds":
              weatherClass = "weather-clouds";
              weatherAnimation = Array(3)
                .fill()
                .map(
                  (_, i) =>
                    `<div class="cloud" style="top: ${20 + i * 20}px; left: ${
                      10 + i * 30
                    }px; width: ${60 + i * 20}px; height: ${
                      20 + i * 10
                    }px; animation-delay: ${i * 0.5}s;"></div>`
                )
                .join("");
              break;
            case "snow":
              weatherClass = "weather-snow";
              weatherAnimation = Array(20)
                .fill()
                .map(
                  (_, i) =>
                    `<div class="snowflake" style="left: ${
                      Math.random() * 100
                    }%; animation-delay: ${Math.random() * 3}s;">❄</div>`
                )
                .join("");
              break;
            case "thunderstorm":
              weatherClass = "weather-thunderstorm";
              weatherAnimation =
                Array(3)
                  .fill()
                  .map(
                    (_, i) =>
                      `<div class="lightning" style="left: ${
                        20 + i * 30
                      }%; animation-delay: ${i * 0.8}s;"></div>`
                  )
                  .join("") +
                Array(10)
                  .fill()
                  .map(
                    (_, i) =>
                      `<div class="rain-drop" style="left: ${
                        Math.random() * 100
                      }%; animation: rain 1s ${
                        i * 0.1
                      }s infinite linear;"></div>`
                  )
                  .join("");
              break;
            case "mist":
            case "fog":
              weatherClass = "weather-mist";
              weatherAnimation = Array(4)
                .fill()
                .map(
                  (_, i) =>
                    `<div class="fog-wave" style="top: ${
                      i * 25
                    }%; animation-delay: ${i * 2}s;"></div>`
                )
                .join("");
              break;
            default:
              weatherClass = "";
              weatherAnimation = "";
          }

          const currentHour = new Date().getHours();
          const isNight = currentHour < 6 || currentHour > 18;

          const generateStars = () => {
            return Array(20)
              .fill()
              .map(
                (_, i) => `
              <div class="star" style="
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${2 + Math.random() * 2}px;
                height: ${2 + Math.random() * 2}px;
                animation-delay: ${Math.random() * 1.5}s;
              "></div>
            `
              )
              .join("");
          };

          const getTemperatureClass = (temp) => {
            if (temp > 30) return "temperature-hot";
            if (temp < 10) return "temperature-cold";
            return "temperature-mild";
          };

          weatherInfo.querySelector(".weather-content").innerHTML = `
            <div class="weather-card ${weatherClass} rounded-lg p-6 relative ${
            isNight ? "is-night" : ""
          }">
              <div class="weather-night">
                ${isNight ? generateStars() : ""}
                ${isNight ? '<div class="moon"></div>' : ""}
              </div>
              ${weatherAnimation}
              <div class="flex items-center justify-between mb-6 relative z-10">
                <div class="flex items-center gap-4">
                  <img src="${weatherIcon}" alt="Weather Icon" class="w-16 h-16">
                  <div>
                    <h2 class="font-playfair text-2xl font-bold ${
                      isNight ? "text-white" : "text-gray-800"
                    }">${weatherData.name}</h2>
                    <p class="${isNight ? "text-gray-200" : "text-gray-600"}">${
            weatherData.weather[0].description
          }</p>
                    <p class="text-sm ${
                      isNight ? "text-gray-300" : "text-gray-500"
                    }">
                      Feels like ${Math.round(weatherData.main.feels_like)}°C
                    </p>
                  </div>
                </div>
                <div class="temperature-animation">
                  <div class="text-4xl font-bold temperature-change ${getTemperatureClass(
                    weatherData.main.temp
                  )}">
                    ${Math.round(weatherData.main.temp)}°C
                  </div>
                  <div class="text-sm text-right ${
                    isNight ? "text-gray-300" : "text-gray-500"
                  }">
                    ${Math.round(weatherData.main.temp_min)}° / ${Math.round(
            weatherData.main.temp_max
          )}°
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4 text-center relative z-10">
                <div class="bg-white bg-opacity-90 rounded-lg p-4">
                  <p class="text-gray-500">Humidity</p>
                  <p class="text-xl font-semibold text-gray-800">${
                    weatherData.main.humidity
                  }%</p>
                </div>
                <div class="bg-white bg-opacity-90 rounded-lg p-4">
                  <p class="text-gray-500">Wind Speed</p>
                  <p class="text-xl font-semibold text-gray-800">
                    <span class="wind-animation inline-block">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1111.5 12H2" />
                      </svg>
                    </span>
                    ${weatherData.wind.speed} m/s
                  </p>
                </div>
                <div class="bg-white bg-opacity-90 rounded-lg p-4">
                  <p class="text-gray-500">Pressure</p>
                  <p class="text-xl font-semibold text-gray-800">${
                    weatherData.main.pressure
                  } hPa</p>
                </div>
              </div>
            </div>
          `;

          if (weatherMain === "rain" || weatherMain === "drizzle") {
            setInterval(() => {
              const splash = document.createElement("div");
              splash.className = "rain-splash";
              splash.style.left = `${Math.random() * 100}%`;
              document.querySelector(".weather-card").appendChild(splash);
              setTimeout(() => splash.remove(), 500);
            }, 100);
          }

          document.querySelector("h1").textContent = "British Weather Forecast";
          document.querySelector("#address").placeholder =
            "Enter city name, e.g., London";
          document.querySelector("button span").textContent = "Search";

          weatherInfo.classList.remove("hidden");

          const forecastInfo = document.getElementById("forecast-info");
          const forecastCards = forecastData.list
            .filter((item, index) => index % 8 === 0)
            .slice(0, 5)
            .map((day) => {
              const date = new Date(day.dt * 1000);
              const dayName = new Intl.DateTimeFormat("en", {
                weekday: "short",
              }).format(date);
              const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

              return `
                <div class="forecast-card bg-white bg-opacity-80 rounded-lg p-4 text-center">
                  <p class="font-bold text-gray-800">${dayName}</p>
                  <img src="${icon}" alt="Weather Icon" class="weather-icon w-12 h-12 mx-auto my-2">
                  <p class="text-lg font-semibold ${getTemperatureClass(
                    day.main.temp
                  )}">
                    ${Math.round(day.main.temp)}°C
                  </p>
                  <p class="text-sm text-gray-600">${day.weather[0].main}</p>
                  <div class="text-xs text-gray-500 mt-2">
                    <span>💧 ${day.main.humidity}%</span>
                    <span class="ml-2">💨 ${Math.round(
                      day.wind.speed
                    )}m/s</span>
                  </div>
                </div>
              `;
            })
            .join("");

          forecastInfo.querySelector(".grid").innerHTML = forecastCards;
          forecastInfo.classList.remove("hidden");

          document.querySelectorAll(".weather-icon").forEach((icon) => {
            icon.addEventListener("mouseover", () => {
              icon.style.transform = `scale(1.2) rotate(${
                Math.random() * 20 - 10
              }deg)`;
            });
            icon.addEventListener("mouseout", () => {
              icon.style.transform = "scale(1) rotate(0deg)";
            });
          });

          if (weatherData.main.temp > 30) {
            showNotification(
              "☀️ It's quite hot today! Don't forget your sunscreen!"
            );
          } else if (weatherData.main.temp < 10) {
            showNotification("❄️ It's chilly! Remember to wear warm clothes!");
          }
        } catch (err) {
          console.error("Error:", err);
          error.classList.remove("hidden");
          errorMessage.textContent =
            err.message ||
            "Failed to fetch weather data. Please try again later.";
        } finally {
          loading.classList.add("hidden");
        }
      }

      document
        .getElementById("address")
        .addEventListener("keypress", function (event) {
          if (event.key === "Enter") {
            getWeather();
          }
        });

      function showNotification(message) {
        const notification = document.createElement("div");
        notification.className =
          "fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 animate__animated animate__fadeInUp";
        notification.innerHTML = `
          <div class="flex items-center">
            <p class="text-gray-800">${message}</p>
            <button class="ml-4 text-gray-500 hover:text-gray-700" onclick="this.parentElement.parentElement.remove()">×</button>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.classList.remove("animate__fadeInUp");
          notification.classList.add("animate__fadeOutDown");
          setTimeout(() => notification.remove(), 1000);
        }, 5000);
      }