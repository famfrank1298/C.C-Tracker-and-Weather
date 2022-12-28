window.onload = init;
let chicago = false;
let month = false;
let inj = false;
let units = false;
let weather = false;
let map;
let snackbar;
var target;
var watchId;
let loc_btn;

var db = new Dexie("LocationDatabase");

// DB with single table "location" with primary key "lat", "lon"
db.version(1).stores({
  geo_location: `
    lat,
    lon`,
});

function init() {
  loc_btn = document.querySelector(".loc-btn");
  target = document.querySelector(".loc-btn");
  document.querySelector(".map").style.display = "none";
  document.querySelector(".map").style.height = "100%";
  snackbar = new mdc.snackbar.MDCSnackbar(
    document.querySelector(".mdc-snackbar")
  );

  document.querySelector("#chicagoBtn").addEventListener("click", () => {
    document.querySelector(".welcome-screen").style.display = "none";
    document.querySelector(".chicago-screen").style.display = "block";
    chicago = true;
  });

  document.querySelector("#weatherBtn").addEventListener("click", () => {
    document.querySelector(".welcome-screen").style.display = "none";
    document.querySelector(".weather-screen").style.display = "block";
    weather = true;
  });

  document.querySelector(".chibackBtn").addEventListener("click", () => {
    document.querySelector(".result-screen").style.display = "none";
    document.querySelector(".chicago-screen").style.display = "block";
  });

  document.querySelector(".cbackBtn").addEventListener("click", () => {
    document.querySelector(".welcome-screen").style.display = "block";
    document.querySelector(".chicago-screen").style.display = "none";
  });

  document.querySelector(".mapbackBtn").addEventListener("click", () => {
    document.querySelector(".result-screen").style.display = "block";
    document.querySelector(".map-screen").style.display = "none";
  });

  document.querySelector(".chi-month-btn").addEventListener("click", () => {
    document.querySelector(".chi-month-btn").style.opacity = 1;
    document.querySelector(".sub-text-desc").innerText =
      "Enter the Month's Number e.g January --> 1 and December --> 12";
    document.querySelector(".chi-text-field").style.display = "block";
    month = true;

    document.querySelector(".chi-units-btn").style.opacity = 0.5;
    units = false;
    document.querySelector(".chi-inj-btn").style.opacity = 0.5;
    inj = false;
  });

  document.querySelector(".chi-units-btn").addEventListener("click", () => {
    document.querySelector(".chi-units-btn").style.opacity = 1;
    document.querySelector(".sub-text-desc").innerText =
      "What is the minimun number of cars you want to see involved? ";
    document.querySelector(".chi-text-field").style.display = "block";
    units = true;

    document.querySelector(".chi-month-btn").style.opacity = 0.5;
    month = false;
    document.querySelector(".chi-inj-btn").style.opacity = 0.5;
    inj = false;
  });

  document.querySelector(".chi-inj-btn").addEventListener("click", () => {
    document.querySelector(".chi-inj-btn").style.opacity = 1;
    document.querySelector(".sub-text-desc").innerText =
      "What is the number of casualties you want to filter by?";
    document.querySelector(".chi-text-field").style.display = "block";
    inj = true;

    document.querySelector(".chi-units-btn").style.opacity = 0.5;
    units = false;
    document.querySelector(".chi-month-btn").style.opacity = 0.5;
    month = false;
  });

  document.querySelector(".chi-filter-btn").addEventListener("click", () => {
    filterChicago();
  });

  document.querySelector(".loc-btn").addEventListener("click", () => {
    let url1 =
      "https://api.openweathermap.org/data/2.5/weather?lat=41.87&lon=-87.62&appid=cf52f4fd75c5765fa91cfb63c207a4d8";
    fetchWeatherData(url1);
  });

  document.querySelector(".mapBtn").addEventListener("click", () => {
    document.querySelector(".map-screen").style.display = "block";
    document.querySelector(".map").style.display = "block";
    document.querySelector(".result-screen").style.display = "none";
  });

  document.querySelector(".wEnter-btn").addEventListener("click", () => {
    let lon = document.querySelector(".lon").value;
    let lat = document.querySelector(".lat").value;

    if (lon == "" || lat == "") {
      document.querySelector(".mdc-snackbar__label").innerText =
        "Please Fill in Both Coordinates";
      snackbar.open();
    } else if (isNaN(lon) && isNaN(lat)) {
      document.querySelector(".mdc-snackbar__label").innerText =
        "Enter Valid Coordinates Please";
      snackbar.open();
    } else if (parseInt(lon) > 180 || parseInt(lon) < -180) {
      document.querySelector(".mdc-snackbar__label").innerText =
        "Longitude Value must be <= 180 and >= -180";
      snackbar.open();
    } else if (parseInt(lat) > 90 || parseInt(lat) < -90) {
      document.querySelector(".mdc-snackbar__label").innerText =
        "Latitude Value must be <= 90 and >= -90";
      snackbar.open();
    } else {
      let url =
        "https://api.openweathermap.org/data/2.5/weather?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=cf52f4fd75c5765fa91cfb63c207a4d8";
      fetchWeatherData(url);
    }
  });

  document.querySelector(".wsbackBtn").addEventListener("click", () => {
    document.querySelector(".weather-screen").style.display = "none";
    document.querySelector(".welcome-screen").style.display = "block";
  });

  document.querySelector(".wbackBtn").addEventListener("click", () => {
    document.querySelector(".weather-screen").style.display = "block";
    document.querySelector(".weather-result").style.display = "none";

    let nodes = document.querySelector(".contain-weather");
    let child = nodes.lastElementChild;

    while (child) {
      nodes.removeChild(child);
      child = nodes.lastElementChild;
    }
  });

  map = new google.maps.Map(document.querySelector(".map"), {
    center: { lat: 41.8781, lng: -87.6298 },
    zoom: 12,
  });

  if ("geolocation" in navigator) {
    loc_btn.addEventListener("click", function () {
      navigator.geolocation.getCurrentPosition(function (location) {
        appendLocation(location, "fetched");
        let url =
          "https://api.openweathermap.org/data/2.5/weather?lat=" +
          location.coords.latitude +
          "&lon=" +
          location.coords.longitude +
          "&appid=cf52f4fd75c5765fa91cfb63c207a4d8";

        db.geo_location.add({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });
        fetchWeatherData(url);
      });
    });
  } else {
    console.log("Geolocation API not supported.");
  }
}

function fetchData(url) {
  document.querySelector(".chicago-screen").style.display = "none";
  document.querySelector(".weather-screen").style.display = "none";
  let map1 = document.querySelector(".map");

  let nodes = document.querySelector(".contain");
  let child = nodes.lastElementChild;

  while (child) {
    nodes.removeChild(child);
    child = nodes.lastElementChild;
  }

  fetch(url)
    .then((response) => {
      // console.log(response);
      return response.json();
    })
    .then((data) => {
      console.log(data);
      let count = 0;

      data.forEach((record) => {
        count++;
        let id = document.createElement("h4");
        id.innerText = "Crash_ID:" + record.crash_record_id;

        let date = document.createElement("p");
        date.innerText = "Occurred " + record.crash_date;

        let loc = document.createElement("p");
        loc.innerText =
          "Location: " +
          record.street_no +
          " " +
          record.street_direction +
          " " +
          record.street_name;

        let dc = document.createElement("p");
        dc.innerText = "Projected Damage Cost was " + record.damage;

        let hitrun = document.createElement("p");

        if (record.hit_and_run_i == "Y") {
          hitrun.innerText = "Hit and Run";
        } else {
          hitrun.innerText = "Not a Hit and Run";
        }

        let cause = document.createElement("p");
        cause.innerText = "Cause: " + record.prim_contributory_cause;

        let type = document.createElement("p");
        type.innerText = "Crash Type: " + record.crash_type;

        let num = document.createElement("p");
        num.innerText = "Number of Injuries: " + record.injuries_total;

        let cars = document.createElement("p");
        cars.innertext = "Number of Cars Involved: " + record.num_units;

        let container = document.createElement("div");
        container.classList.add("card-container");
        let div = document.createElement("div");
        div.classList.add("card-content");

        div.append(date);
        div.append(loc);
        div.append(cause);
        div.append(cars);
        div.append(dc);
        div.append(hitrun);
        div.append(type);
        div.append(num);
        container.append(div);

        document.querySelector(".contain").append(container);

        let lat = record.latitude;
        let lng = record.longitude;
        const myLatLng = { lat: parseFloat(lat, 10), lng: parseFloat(lng, 10) };

        // The marker, positioned at Uluru
        const marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
        });
      });

      if (count == 0) {
        let empty = document.createElement("h2");
        empty.classList.add("center-screen");
        empty.innerText = "No Results Matching Given Filtered Data Value...";
        document.querySelector(".result-screen").append(empty);
      }

      document.querySelector(".result-screen").style.display = "block";
      map1.append(map);
    });
}

function fetchWeatherData(url1) {
  document.querySelector(".weather-screen").style.display = "none";
  let weather_scr = document.querySelector(".weather-result");
  weather_scr.style.display = "block";

  // Remove old data if present
  let nodes = document.querySelector(".contain-weather");
  let child = nodes.lastElementChild;

  while (child) {
    nodes.removeChild(child);
    child = nodes.lastElementChild;
  }

  fetch(url1)
    .then((response) => {
      // console.log(response);
      return response.json();
    })
    .then((data) => {
      console.log(data);

      let location = document.createElement("h3");
      location.innerText = data.sys.country + ", " + data.name;
      let coord = document.createElement("h4");
      coord = "(Lat: " + data.coord.lat + ", Lon: " + data.coord.lon + ")";

      let weather = document.createElement("p");
      weather.innerText = "Weather Description: ";

      data.weather.forEach((par) => {
        weather.innerText = weather.innerText + " " + par.description;
      });

      let windsp = document.createElement("p");
      windsp.innerText = "Wind Speed: " + data.wind.speed;

      let winddeg = document.createElement("p");
      winddeg.innerText = "Wind Degree: " + data.wind.deg;

      let container = document.createElement("div");
      container.classList.add("card-container");
      container.classList.add("card-container--weather");
      let div = document.createElement("div");
      div.classList.add("card-content");

      div.append(location);
      div.append(coord);
      div.append(weather);
      div.append(windsp);
      div.append(winddeg);

      container.append(div);
      document.querySelector(".contain-weather").append(container);
    });
}

function filterChicago() {
  let val = document.querySelector(".temp").value;

  if (val == "") {
    document.querySelector(".mdc-snackbar__label").innerText =
      "Enter a Value Please";
    snackbar.open();
  } else if (isNaN(val)) {
    document.querySelector(".mdc-snackbar__label").innerText =
      "Enter a Valid Integer Please";
    snackbar.open();
  } else if (month) {
    if (parseInt(val) >= 1 && parseInt(val) <= 12) {
      let url =
        "https://data.cityofchicago.org/resource/85ca-t3if.json?crash_month=" +
        val;
      fetchData(url);
    } else {
      document.querySelector(".mdc-snackbar__label").innerText =
        "Enter a Number between 1-12";
      snackbar.open();
    }
  } else if (units) {
    let url =
      "https://data.cityofchicago.org/resource/85ca-t3if.json?num_units=" + val;
    fetchData(url);
  } else if (inj) {
    let url =
      "https://data.cityofchicago.org/resource/85ca-t3if.json?injuries_total=" +
      val;
    fetchData(url);
  }
}

function appendLocation(location, verb) {
  verb = verb || "updated";
  // var newLocation = document.createElement('p');
  // newLocation.innerHTML = 'Location ' + verb + ': ' + location.coords.latitude + ', ' + location.coords.longitude + '';
  // target.appendChild(newLocation);
}
