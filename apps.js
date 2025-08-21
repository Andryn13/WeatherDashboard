// API
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = 'f00c38e0279b7bc85480c3fe775d518c';

// Global variabel untuk chart & map
let weatherChartInstance = null;
let map;
let marker;

// Inisialisasi saat halaman dimuat
$(document).ready(function () {
    initMap(); // Map harus ada sejak awal
    weatherFn('Jakarta'); // Default Jakarta
});

// --- Fungsi utama ambil data ---
async function weatherFn(cityName) {
    const currentWeatherUrl = `${API_BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${API_BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;

    $('#error-message').hide();
    $('#loading').show();

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
            showError('Kota tidak ditemukan. Coba nama kota lain.');
            return;
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        $('#loading').hide();
        displayCurrentWeather(currentData);
        updateMap(currentData.coord.lat, currentData.coord.lon, currentData.name);
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Gagal memuat data cuaca. Periksa koneksi Anda.');
    }
}

// --- Tampilkan error ---
function showError(message) {
    $('#error-message').text(message).show();
    $('#loading').hide();
}

// --- Info cuaca saat ini ---
function displayCurrentWeather(data) {
    $('#city-name').text(`${data.name}`);
    $('#date').text(moment().format('MMMM Do YYYY'));
    $('#temperature').html(`${data.main.temp}&deg;C`);
    $('#description').text(`${data.weather[0].description}`);
    $('#humidity').text(`Humidity: ${data.main.humidity}%`);
    $('#wind-speed').text(`Wind speed: ${data.wind.speed} m/s`);
    $('#pressure').text(`Pressure: ${data.main.pressure} hPa`)
    $('#weather-icon').attr('src', `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
    $('#weather-info').fadeIn();
}

// --- Inisialisasi Map ---
function initMap() {
    map = L.map('map').setView([-6.200000, 106.816666], 10); // Jakarta

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([-6.200000, 106.816666]).addTo(map)
        .bindPopup('Jakarta')
        .openPopup();
}

// --- Update Map sesuai kota ---
function updateMap(lat, lon, city) {
    map.setView([lat, lon], 10);

    if (marker) {
        marker.setLatLng([lat, lon])
              .setPopupContent(city)
              .openPopup();
    } else {
        marker = L.marker([lat, lon]).addTo(map)
                  .bindPopup(city)
                  .openPopup();
    }
}

// --- Waktu realtime ---
function displayTime() {
    const timeElement = document.getElementById("current-time");
    const currentTime = moment().format('HH:mm:ss');
    timeElement.innerText = `${currentTime}`;
}
setInterval(displayTime, 1000);
