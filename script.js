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
    });
  });
})();

let city = 'Houston';

fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid={APIkey}`, { mode: 'cors' })
.then((res) => res.json())
.then((res) => {
  function convertDegreesToDirection(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    let convertedDeg = deg * 8 / 360;
    convertedDeg = Math.round(convertedDeg, 0);
    convertedDeg = (convertedDeg + 8) % 8;

    return directions[convertedDeg];
  }

  (function getTimeLocation() {
    const timeP = document.querySelector('.time-location .time');
    const cityStateP = document.querySelector('.time-location .location');
    
    const date = new Date();
    let currentTime = date.toLocaleTimeString().split(':').splice(0, 2).join(':');
    let amPM = date.toLocaleTimeString().split(':').splice(2, 3).join(' ').split(' ')[1];
    timeP.textContent = `${currentTime} ${amPM}`;
    cityStateP.textContent = `${city}, XX`;
  }());

  // (function getCurrentTemp() {
  //   const currentTempH2 = document.querySelector('.current-temp .temp');
  //   const [feelsLikeP, highP, lowP] = [...document.querySelectorAll('.temp-details .temp')];
  //   const windLi = document.querySelector('.weather-conditions p');

  //   const currentTemp = {
  //     temp: Math.round(res.main.temp),
  //     feelsLike: Math.round(res.main.feels_like),
  //     high: Math.round(res.main.temp_max),
  //     low: Math.round(res.main.temp_min),
  //     humidity: `${res.main.humidity}%`,
  //     weather: res.weather[0].main
  //   }

  //   currentTempH2.textContent = currentTemp.temp;
  //   feelsLikeP.textContent = currentTemp.feelsLike;
  //   highP.textContent = currentTemp.high;
  //   lowP.textContent = currentTemp.low;

  //   windLi.textContent = `${convertDegreesToDirection(res.wind.deg)} ${Math.round(res.wind.speed)} MPH`;
  // })();

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
        time: upcomingWeatherData[i].dt_txt.split(' ')[1].split(':').splice(0, 2).join(':')
      }

      tempP.textContent = Math.round(weatherData.temp);
      windP.textContent = `${convertDegreesToDirection(weatherData.wind.deg)} ${Math.round(weatherData.wind.speed)} MPH`;
      rainP.textContent = `${Math.round(weatherData.rain)}%`;
      humidityP.textContent = `${Math.round(weatherData.humidity)}%`;
      timeP.innerHTML = `<span>${weatherData.time}<span>${weatherData.time.split(':')[0] < '12:00' ? 'AM' : 'PM'}`;
    });
  })();

  (function getNext24Hours() {
    const next24HoursData = res.list.slice(0, 8);
    const hourlyWeatherContainer = document.querySelector('.hourly-weather-container');
    const splitContainers = [...document.querySelectorAll('.split-daily')];
    let splitContainerIndex = 0;

    next24HoursData.forEach((data, i) => {
      const hourlyWeather = document.createElement('div');
      const ul = document.createElement('ul');
      const weatherData = {
        time: data.dt_txt.split(' ')[1].split(':').splice(0, 2).join(':'),
        temp: `${Math.round(data.main.temp)}`,
        rain: `${data.pop}%`,
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
          console.log(value);
          img.src = weatherIcons[weatherData.weather.toLowerCase()].dark;
          li.appendChild(img);
        } else {
          p.textContent = value;
          li.appendChild(p);
        }

        ul.appendChild(li);
      });

      hourlyWeather.appendChild(ul);
      if (splitContainerIndex === 0 && i >= 4) splitContainerIndex = 1;

      splitContainers[splitContainerIndex].appendChild(hourlyWeather);
    });
  })();

  console.log(res)
});