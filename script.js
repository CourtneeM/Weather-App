const weatherIcons = {
  clear: {
    light: './img/weather-sunny-light.png',
    dark: './img/weather-sunny-dark.png',
  },
  clouds: {
    light: './img/weather-partly-cloudy-light.png',
    dark: './img/weather-partly-cloudy-dark.png',
  },
  conditions: {
    wind: {
      light: './img/weather-windy-light.png',
      dark: './img/weather-windy-dark.png',
    },
    humidity: {
      light: './img/water-outline-light.png',
      dark: './img/water-outline-dark.png',
    },
    rain: {
      light: './img/umbrella-outline-light.png',
      dark: './img/umbrella-outline-dark.png',
    }
  }
};

let city = 'Houston';
let currentTemp;

(function footerTabListener() {
  const sections = document.querySelectorAll('section');
  const viewTabs = [...document.querySelectorAll('footer div')];

  function displaySection(btnIndex) {
    sections.forEach((section, sectionIndex) => {
      section.style.display = btnIndex === sectionIndex ? 'block' : 'none';
    });
  }

  function selectTab(btn) {
    viewTabs.forEach((btn) => {
      if (btn.id === 'active-tab') btn.removeAttribute('id');
    });

    btn.id = 'active-tab';
  }

  viewTabs.forEach((btn, btnIndex) => {
    btn.addEventListener('click', () => {
      selectTab(btn);
      displaySection(btnIndex);
      getTimeLocation();
      getTempHeader();
    });
  });
})();

function convertDegreesToDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  let convertedDeg = deg * 8 / 360;
  convertedDeg = Math.round(convertedDeg, 0);
  convertedDeg = (convertedDeg + 8) % 8;

  return directions[convertedDeg];
}

window.addEventListener('resize', () => {
  const currentUpcomingWeatherContainer = document.querySelector('#current-upcoming-weather');
  
  if (document.documentElement.clientWidth >= '1024') {
    currentUpcomingWeatherContainer.style.display = 'flex';
  } else {
    currentUpcomingWeatherContainer.style.display = 'block';
  }
});

function getTimeLocation() {
  const activeTab = document.querySelector('#active-tab');
  const currentSection = activeTab.querySelector('p').textContent === 'Current' ? 'current-upcoming-weather' : 'daily-weather'
  const timeP = document.querySelector(`#${currentSection} .time-location .time`);
  const cityStateP = document.querySelector(`#${currentSection} .time-location .location`);
  const date = new Date();
  let currentTime = date.toLocaleTimeString().split(':').splice(0, 2).join(':');
  let amPM = date.toLocaleTimeString().split(':').splice(2, 3).join(' ').split(' ')[1];

  timeP.textContent = `${currentTime} ${amPM}`;
  cityStateP.textContent = `${city}`;
};

function getTempHeader() {
  const tempP = document.querySelector('#daily-weather .current-temp p:last-child');

  tempP.innerHTML = currentTemp;
}

getTimeLocation();

function convertTime(time) {
  const extractedTime = String(new Date(time*1000)).split(' ')[4].split(':').slice(0, 2);
  let amPM;

  amPM = extractedTime[0] < 12 ? 'AM' : 'PM';

  if (extractedTime[0] > 12) extractedTime[0] = extractedTime[0] - 12;
  if (extractedTime == ['00', '00']) extractedTime[0] = ['12'];

  return `<span>${extractedTime.join(':')}</span>${amPM}`;
}

function invalidCity() {
  const errorContainer = document.querySelector('#error-container');
  errorContainer.classList.remove('hidden');
}

function getWeather() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid={APIkey}`, { mode: 'cors' })
  .then((res) => res.json())
  .then((res) => {
    currentTemp = `${Math.round(res.main.temp)}&deg;F`;

    (function getCurrentTemp() {
      const currentTempH2 = document.querySelector('.current-temp .temp');
      const [feelsLikeP, highP, lowP] = [...document.querySelectorAll('.temp-details .temp')];
      const windLi = document.querySelector('.weather-conditions p');

      const currentTemp = {
        temp: Math.round(res.main.temp),
        feelsLike: Math.round(res.main.feels_like),
        high: Math.round(res.main.temp_max),
        low: Math.round(res.main.temp_min),
        humidity: `${res.main.humidity}%`,
        weather: res.weather[0].main
      }

      currentTempH2.textContent = currentTemp.temp;
      feelsLikeP.textContent = currentTemp.feelsLike;
      highP.textContent = currentTemp.high;
      lowP.textContent = currentTemp.low;

      windLi.textContent = `${convertDegreesToDirection(res.wind.deg)} ${Math.round(res.wind.speed)} MPH`;
    })();
  })
  .catch((rej) => {
    console.log(rej);
    invalidCity();
  });

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid={APIkey}`, { mode: 'cors' })
  .then((res) => res.json())
  .then((res) => {
    (function getUpcomingWeather() {
      const upcomingContainers = [...document.querySelectorAll('.upcoming-container')];
      const upcomingWeatherData = [res.list[0], res.list[1], res.list[2]];

      upcomingContainers.forEach((container, i) => {
        const tempP = container.querySelector('div .temp');
        const windP = container.querySelector('.weather-conditions li p');
        const rainP = container.querySelector('.weather-conditions li:nth-child(2) p');
        const humidityP = container.querySelector('.weather-conditions li:last-child p');
        const timeP = container.querySelector('.time p');

        const weatherData = {
          temp: upcomingWeatherData[i].main.temp,
          wind: upcomingWeatherData[i].wind,
          rain: upcomingWeatherData[i].pop,
          humidity: upcomingWeatherData[i].main.humidity,
          time: upcomingWeatherData[i].dt 
        }

        tempP.textContent = Math.round(weatherData.temp);
        windP.textContent = `${convertDegreesToDirection(weatherData.wind.deg)} ${Math.round(weatherData.wind.speed)} MPH`;
        rainP.textContent = `${Math.round(weatherData.rain)}%`;
        humidityP.textContent = `${Math.round(weatherData.humidity)}%`;
        timeP.innerHTML = convertTime(weatherData.time);
      });
    })();

    (function getNext24Hours() {
      const next24HoursData = res.list.slice(0, 8);
      const splitContainers = [...document.querySelectorAll('.split-daily')];
      let splitContainerIndex = 0;

      next24HoursData.forEach((data, i) => {
        const hourlyWeather = document.createElement('div');
        const ul = document.createElement('ul');
        const weatherData = {
          time: data.dt,
          temp: `${Math.round(data.main.temp)}&deg;F`,
          rain: `${Math.round(data.pop)}%`,
          wind: `${convertDegreesToDirection(data.wind.deg)} ${Math.round(data.wind.speed)} MPH`,
          weather: data.weather[0].main
        }

        hourlyWeather.classList.add('hourly-weather');

        Object.values(weatherData).forEach((value, i) => {
          const li = document.createElement('li');
          const img = document.createElement('img');
          const p = document.createElement('p');

          if (weatherIcons.conditions[Object.keys(weatherData)[i]]) {
            img.src = weatherIcons.conditions[Object.keys(weatherData)[i]].dark;
            li.appendChild(img);
          }

          if (Object.keys(weatherData)[i] === 'weather') {
            img.src = weatherIcons[weatherData.weather.toLowerCase()].dark;
            li.appendChild(img);
          } else if (Object.keys(weatherData)[i] === 'time') {
            p.innerHTML = convertTime(value); 
            li.appendChild(p);
          } else {
            p.innerHTML = value;
            li.appendChild(p);
          }

          ul.appendChild(li);
        });

        hourlyWeather.appendChild(ul);
        if (splitContainerIndex === 0 && i >= 4) splitContainerIndex = 1;

        splitContainers[splitContainerIndex].appendChild(hourlyWeather);
      });
    })();
  })
  .catch((rej) => {
    console.log(rej);
    invalidCity();
  });
}

getWeather();


(function getCityName() {
  const searchBtn = document.querySelector('#search-btn');

  searchBtn.addEventListener('click', () => {
    const userInput = document.querySelector('#user-input');

    if (userInput === '') return;

    city = userInput.value;
    userInput.value = '';

    document.querySelector('#error-container').classList.add('hidden');
    getTimeLocation();
    getTempHeader();
    getWeather();
  });
})();