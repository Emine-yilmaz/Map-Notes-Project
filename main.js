import { detecIcon, detecType, setStorage } from "./helpers.js";

//! HTML'den gelenler
const form = document.querySelector("form");
const list = document.querySelector("ul");

//! Olay izleyicisi
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

//! ortak kullanim alani
let map;
let coords = [];
let notes =JSON.parse(localStorage.getItem("notes")) || [];
let layerGroup = [];

//* Kullanicinin konumunu ogrenme
navigator.geolocation.getCurrentPosition(
  loadMap,
  console.log("kullanici kabul etmedi")
);
//* Haritaya tiklaninca calisir
function onMapClick(e) {
  form.style.display = "flex";
  coords = [e.latlng.lat, e.latlng.lng];
  console.log(coords);
}

//* Kullanicinin konumuna gore ekrana haritayi gosterme
function loadMap(e) {
  // console.log(e);
  //   Haritanin kurulumu
   map = new L.map("map").setView(
    [e.coords.latitude, e.coords.longitude],
    10
  );
  L.control;
  //   Haritanin nasil gozukecegini belirler
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Haritada ekrana basilacak imlecleri tutacagimiz katman
  layerGroup = L.layerGroup().addTo(map);
  // localden gelen notlari listeleme
  renderNoteList(notes);

  // Harita da bir tiklanma oldugunda calisacak fonksiyon
  map.on("click", onMapClick);
}

//* Ekrana marker basma
function renderMarker(item) {
  
  // markeri olusturur
  L.marker(item.coords, { icon: detecIcon(item.status) })
  // imleclerin oldugu katmana ekler
    .addTo(layerGroup)
    // uzerine tiklaninca acilacak popup ekleme
    .bindPopup(`${item.desc}`);
}

//* Form gonderildiginde calisir
function handleSubmit(e) {
  e.preventDefault();
  console.log(e);
  const desc = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // notes dizisine eleman ekleme
  notes.push({ id: new Date().getTime(), desc, date, status, coords });
  console.log(notes);
  // localStorage guncelleme
  setStorage(notes);
  // notlari ekrana aktarabilmek icin fonksiyona notes dizisini parametre olarak gonderdik
  renderNoteList(notes);

  // Form gonderildiginde kapanir
  form.style.display = "none";
}

function renderNoteList(item) {
  list.innerHTML = "";

// markerlari temizler
  layerGroup.clearLayers();

  item.forEach((item) => {
    const listElement = document.createElement("li");
    // datasina sahip oldugu id yi ekleme
    listElement.dataset.id = item.id;
    listElement.innerHTML = `
          <div>
              <p>${item.desc}</p>
              <p><span>Date:</span>${item.date}</p>
              <p><span>Status:</span>${detecType(item.status)}</p>
          </div>
          <i class="bi bi-x" id="delete"></i>
          <i class="bi bi-airplane-fill" id="fly"></i>
    `;

    list.insertAdjacentElement("afterbegin", listElement);
    // ekrana marker basma
    renderMarker(item);
  });
}

function handleClick(e) {
  console.log(e.target.id);
  // guncellenecek elemanin id'sini ogrenme
  const id = e.target.parentElement.dataset.id
  console.log(notes);
  if (e.target.id === "delete") {
    console.log("tiklanildi");
    // idsini bildigimiz elemani diziden kaldirma
    notes = notes.filter((note) => note.id != id );
    console.log(notes);
// localStorage guncelleme
    setStorage(notes);
    // ekrani guncelleme
    renderNoteList(notes);
  }
  

  if (e.target.id === "fly") {
   const note = notes.find((note) => note.id == id);
   map.flyTo(note.coords);
  }
}
