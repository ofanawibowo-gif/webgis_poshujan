// =======================
// Membuat Peta
// =======================

var map = L.map('map').setView([-0.8,100.4],8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19,
attribution:'© OpenStreetMap'
}).addTo(map);


// =======================
// Marker Cluster
// =======================

var markers = L.markerClusterGroup();


// =======================
// Icon Marker Berdasarkan Kondisi
// =======================

var iconBaik = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41],
popupAnchor:[1,-34]
});

var iconRusak = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41],
popupAnchor:[1,-34]
});

var iconPerbaikan = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41],
popupAnchor:[1,-34]
});


// =======================
// URL API Google Apps Script
// =======================

var apiUrl = "https://script.google.com/macros/s/AKfycbyxddm8Fw1D6hCrsx5qGyX89UkYQJ_YJKQwP_ypfK-Ul9cMwbl9JUUSLZNlUFgv6pdYyw/exec";


// =======================
// Mengambil Data
// =======================

fetch(apiUrl)
.then(response => response.json())
.then(data => {

data.forEach(function(pos){

var lat = pos.latitude;
var lon = pos.longitude;

if(!lat || !lon) return;


// =======================
// Menentukan Icon Marker
// =======================

var kondisi = pos["Kondisi alat"];

var iconMarker = iconBaik;

if(kondisi == "Rusak"){
iconMarker = iconRusak;
}
else if(kondisi == "Perlu perbaikan"){
iconMarker = iconPerbaikan;
}


// =======================
// Foto dari Google Drive
// =======================

var foto = pos["Upload foto"];
var fotoHtml = "";

if(foto){

var id = foto.split("id=")[1];

var fotoUrl = "https://drive.google.com/thumbnail?id="+id+"&sz=w400";

fotoHtml = "<br><img src='"+fotoUrl+"' width='200'>";

}else{

fotoHtml = "<br><i>Foto tidak tersedia</i>";

}


// =======================
// Isi Popup
// =======================

var popupText = 
"<b>"+pos["Nama pos hujan"]+"</b><br>"+
"Kondisi: "+pos["Kondisi alat"]+"<br>"+
"Tanggal inspeksi: "+pos["Tanggal inspeksi"]+"<br>"+
"Keterangan: "+pos["Keterangan"]+
fotoHtml;


// =======================
// Membuat Marker
// =======================

var marker = L.marker([lat,lon],{icon:iconMarker});

marker.bindPopup(popupText);


// =======================
// Masukkan ke Cluster
// =======================

markers.addLayer(marker);

});


// Tambahkan cluster ke peta

map.addLayer(markers);

})
.catch(function(error){

console.log("Error membaca data:",error);

});