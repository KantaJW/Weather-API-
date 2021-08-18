
const apiKey = "9ea9ad53ad78fb74d18f03ee90c9c9db"; //vår egen api-nykel
//
const urlParams = new URLSearchParams(location.search);

/*****************************************************************************
* 
*   Funktion: getPageName
*   Parametrar: inga
*   Returnerar: namnet på nuvarande HTML-fil minus filändelsen, t ex "weather"
*
******************************************************************************/
function getPageName() {
    const match = window.location.pathname.match(/([a-z]+)\.html/);
    return match[1];
}
/******************************************************************************
 *
 *   Funktion: toDateString
 *   Parametrar: datum/tid-värde på formen antal sekunder sedan 1970-01-01
 *   Returnerar: en datumsträng med formatering enligt systemets lokal
 *
 ******************************************************************************/
function toDateString(dval) {
    const date = new Date(Number(dval) * 1000);
    return date.toLocaleDateString();
}

/******************************************************************************
 *
 *   Funktion: toTimeString
 *   Parametrar: datum/tid-värde på formen antal sekunder sedan 1970-01-01
 *   Returnerar: en tidssträng med formatering enligt systemets lokal
 *
 ******************************************************************************/
function toTimeString(dval) {
    const date = new Date(Number(dval) * 1000);
    return date.toLocaleTimeString();
}

/******************************************************************************
 *
 *   Funktion: matchSubstring
 *   Argument: en sträng "main" med vilken en kortare sträng "sub" jämförs
 *   Returnerar: true om "sub" är en delsträng i början av "main", annars false
 *
 ******************************************************************************/
function matchSubstring(main, sub) {
    return main.substr(0, sub.length).localeCompare(sub, "sv", {
        sensitivity: "base"
    }) === 0;
}

/******************************************************************************
 *
 *   Funktion: getCurrentWeather
 *   Parametrar: location-id för aktuell ort/stad
 *   Returnerar: funktionen returnerar inget värde, utan interagerar med DOM
 *               för att rendera väderinformation för aktuell plats
 *
 ******************************************************************************/
function getCurrentWeather(locationId) {
    const uri = `https://api.openweathermap.org/data/2.5/weather?id=${locationId}&appid=${apiKey}&lang=sv&units=metric`;
    fetch(uri)
        .then(response => response.json())
        .then(currentWeatherData => {
            document.getElementById("city-name").textContent = currentWeatherData.name;
            document.querySelector(".sunrise").innerHTML = toTimeString(currentWeatherData.sys.sunrise) + ' &#128337;'; //slutet här lägger till tecken och symboler
            document.querySelector(".sunset").innerHTML = toTimeString(currentWeatherData.sys.sunset) + ' &#128337;'; //för användaren
            document.querySelector(".current-time").innerHTML = toTimeString(currentWeatherData.dt) + ' &#128337;';
            document.querySelector(".description").innerHTML = currentWeatherData.weather[0].description;
            document.querySelector(".icon img").src = `http://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@2x.png`;
            document.querySelector(".temperature").innerHTML = `${currentWeatherData.main.temp}` + ' °C';
            document.querySelector(".feels-like").innerHTML = `${currentWeatherData.main.feels_like}` + ' °C';
            document.querySelector(".temp-min").innerHTML = `${currentWeatherData.main.temp_min}` + '°C';
            document.querySelector(".temp-max").innerHTML = `${currentWeatherData.main.temp_max}` + ' °C';
            document.querySelector(".air-pressure").innerHTML = `${currentWeatherData.main.pressure}` + ' hPa';
            document.querySelector(".air-humidity").innerHTML = `${currentWeatherData.main.humidity}` + ' RF';
            document.querySelector(".wind-speed").innerHTML = `${currentWeatherData.wind.speed}` + ' m/s';
            document.querySelector(".wind-deg").innerHTML = `${currentWeatherData.wind.deg}` + ' &#9780;';
        });
}

/******************************************************************************
 *
 *   Funktion: getForecast
 *   Parametrar: location - id för aktuell ort / stad
 *   Returnerar: funktionen returnerar inget värde, utan interagerar med DOM
 *               för att rendera en 5-dygnsprognos för aktuell plats
 *
 ******************************************************************************/
function getForecast(locationId) {
    const uri = `https://api.openweathermap.org/data/2.5/forecast?id=${locationId}&appid=${apiKey}&lang=sv&units=metric`;
    const nameElement = document.getElementById("city-name");
    const elementForecast = document.querySelector("#forecast tbody");
    const templateForecast = document.getElementById("template-forecast");
    fetch(uri)
        .then(response => response.json())
        .then(forecastData => {
            nameElement.textContent = forecastData.city.name;
            forecastData.list.forEach(item => {
                let element = document.importNode(templateForecast.content, true);
                element.querySelector(".date").textContent = toDateString(item.dt);
                element.querySelector(".time").textContent = toTimeString(item.dt);
                element.querySelector(".temperature").textContent = item.main.temp;
                element.querySelector(".feels-like").textContent = item.main.feels_like;
                element.querySelector(".icon").src = `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
                elementForecast.appendChild(element);
            });
        });
}

/******************************************************************************
 *
 *   Funktion: searchLocation
 *   Parametrar: inga parametrar
 *   Returnerar: funktionen returnerar inget värde, utan genererar en lista med
 *               namn på platser som matchar användarens söksträng
 *
 ******************************************************************************/
function searchLocation() {
    const inputElement = document.getElementById("input-search");
    const cityListElement = document.getElementById("search-result");
    const templateCity = document.getElementById("template-city");
    const query = inputElement.value.trim();
    if (query.length === 0) return;  // Genomför inte någon sökning om sökfältet är tomt
    let selection = cities.filter(city => matchSubstring(city.name, query));
    selection.forEach(city => {
        let element = document.importNode(templateCity.content, true);
        element.querySelector(".city-name").textContent = `${city.name}`;
        element.querySelector(".link-current").href = `weather.html?id=${city.id}`;
        element.querySelector(".link-forecast").href = `forecast.html?id=${city.id}`;
        element.querySelector(".city-coords").textContent = `${city.lat} ${city.lon}`;
        element.querySelector(".city-country").textContent = `${city.countryCode}`;
        cityListElement.appendChild(element);
    });
}

function getCitiesId() {
    const inputElement = document.getElementById("input-search");
    const query = inputElement.value.trim();
    if (query.length === 0) return;  // Genomför inte någon sökning om sökfältet är tomt
    let selection = cities.filter(city => matchSubstring(city.name, query));
    return selection 
}

let searchField = document.getElementById("input-search");

searchField.addEventListener("keyup", (event) => {
    if (event.key === 'Enter') { //man kan använda enter vid sök
        event.preventDefault();
        document.getElementById("button-search").click();
        document.getElementById("weather").style.visibility = "visible"; //tar fram innehållet som är hidden
    }
});

document.getElementById("button-search").addEventListener("click", () => {
    let CityId = getCitiesId() //listar upp städerna från det api:et
    getForecast(CityId[0].id)
    getCurrentWeather(CityId[0].id) //så man ser både forecast och weather
    document.getElementById("weather").style.visibility = "visible";
});




const filterCities = (searchLetters, cities) =>
    cities.filter(cities =>
        cities.name.match(new RegExp(`^${searchLetters}`, 'i'))
    ); //filterar vilka av städerna man ser om man ex. söker på lon kommer london men även longbeach upp. 

searchField.addEventListener('input', function (event) {

    let searchLetters = event.target.value;
    console.log(searchLetters)
    const displayArea = document.getElementById("search-result");
    const filteredCities = filterCities(searchLetters, cities);
    console.log(filteredCities)
    
    // must be >= 2 otherwise site crash
    if (searchLetters.length >= 2) {
        if(filteredCities.length == 0) {
            displayArea.innerHTML = "";
            let errorContainer = document.createElement("p")
            let errorMessage = "No matches, Please try another search"; //om man söker men det inte finns något retuneras error msg
            errorContainer.textContent = errorMessage;
            displayArea.appendChild(errorContainer);
            return
        }
        displayArea.innerHTML = "";
        for (let i = 0; i < filteredCities.length; i++) { //loopar igenom filteredcities
            let searchedResults = document.createElement("div")
            searchedResults.setAttribute('onclick',`chooseCity("${filteredCities[i].name}")`) //visar upp så man kan välja vid onclick
            searchedResults.textContent = filteredCities[i].name;
            displayArea.appendChild(searchedResults);
        }

    } else {
        displayArea.innerText = "";
    }

})

/* lägg till choose city och klicka ord lista vidare  */
function chooseCity(city){
    var m_input = document.getElementById('input-search')
    m_input.value = city
    const displayArea = document.getElementById("search-result");
    displayArea.innerHTML = "";
    document.getElementById("button-search").click();
}

document.getElementById("weather").style.visibility = "hidden"; //döljer den ena applikationen om vädret när det inte är sökt någonting.