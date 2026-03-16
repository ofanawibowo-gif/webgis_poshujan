var map = L.map('map').setView([-0.8,100.4],8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

var markers = L.markerClusterGroup();

var daftarMarker = [];
var dataGlobal = [];


// ICON

var iconBaik = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41]
});

var iconRusak = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41]
});

var iconPerbaikan = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41]
});

var iconBelum = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41]
});


// STATISTIK

var totalPos = 0;
var baik = 0;
var rusak = 0;
var perbaikan = 0;
var belum = 0;


// AMBIL DATA

fetch("https://script.google.com/macros/s/AKfycbwXgITkoPixO7j_TTOoDX5XOIMSbBAfRIEiFuJjmqyVR6ZRISdyvbKHqizPQVT3wmSw5g/exec")
.then(response => response.json())
.then(data => {

dataGlobal = data;

totalPos = data.length;

data.forEach(function(pos){

var lat = parseFloat(pos.latitude);
var lon = parseFloat(pos.longitude);

if(!lat || !lon) return;

var kondisi = pos["Kondisi alat"];
var iconMarker;
var statusText = "";

if(!kondisi){

iconMarker = iconBelum;
statusText = "Baik (belum dilakukan inspeksi)";
belum++;

}
else if(kondisi == "Baik"){

iconMarker = iconBaik;
statusText = "Baik";
baik++;

}
else if(kondisi == "Rusak"){

iconMarker = iconRusak;
statusText = "Rusak";
rusak++;

}
else{

iconMarker = iconPerbaikan;
statusText = kondisi;
perbaikan++;

}


// FOTO

var fotoHtml = "";
var foto = pos["Upload foto"];

if(foto && foto.includes("id=")){

var id = foto.split("id=")[1];
var fotoUrl = "https://drive.google.com/thumbnail?id="+id+"&sz=w400";

fotoHtml = "<br><img src='"+fotoUrl+"' width='200'>";

}


// PETUGAS

var petugas = "";

if(pos["Petugas 1"]) petugas += pos["Petugas 1"]+"<br>";
if(pos["Petugas 2"]) petugas += pos["Petugas 2"]+"<br>";
if(pos["Petugas 3"]) petugas += pos["Petugas 3"]+"<br>";
if(pos["Petugas 4"]) petugas += pos["Petugas 4"]+"<br>";


// POPUP

var popupText =
"<b>"+pos["Nama pos hujan"]+"</b><br>"+
"Kondisi : "+statusText+"<br>"+
"Tanggal inspeksi : "+pos["Tanggal inspeksi"]+"<br>"+
"<b>Petugas :</b><br>"+petugas+
"<br>Keterangan : "+pos["Keterangan"]+
fotoHtml;


// MARKER

var marker = L.marker([lat,lon],{icon: iconMarker});

marker.status = kondisi ? kondisi : "Belum";

marker.bindPopup(popupText);

marker.bindTooltip(pos["Nama pos hujan"],{
permanent:true,
direction:"top",
offset:[0,-20],
className:"labelPos"
});

marker.namaPos = pos["Nama pos hujan"];

daftarMarker.push(marker);

markers.addLayer(marker);

});

map.addLayer(markers);


// UPDATE DASHBOARD

document.getElementById("totalPos").innerHTML = totalPos;
document.getElementById("baik").innerHTML = baik;
document.getElementById("rusak").innerHTML = rusak;
document.getElementById("perbaikan").innerHTML = perbaikan;
document.getElementById("belum").innerHTML = belum;

})
.catch(error => {
console.log("Error mengambil data:", error);
});


// SEARCH

var searchBox = document.getElementById("searchBox");

if(searchBox){

searchBox.addEventListener("keyup", function(){

var keyword = this.value.toLowerCase();

daftarMarker.forEach(function(marker){

if(marker.namaPos && marker.namaPos.toLowerCase().includes(keyword)){

map.setView(marker.getLatLng(),14);
marker.openPopup();

}

});

});

}


// EXPORT EXCEL

var tombolExport = document.getElementById("exportExcel");

if(tombolExport){

tombolExport.addEventListener("click", function(){

var awal = document.getElementById("tglAwal").value;
var akhir = document.getElementById("tglAkhir").value;

var hasil = [];

dataGlobal.forEach(function(pos){

var tanggal = pos["Tanggal inspeksi"];

if(!tanggal) return;

if((!awal || tanggal >= awal) && (!akhir || tanggal <= akhir)){

hasil.push({

"Nama Pos": pos["Nama pos hujan"],
"Tanggal Inspeksi": pos["Tanggal inspeksi"],
"Kondisi": pos["Kondisi alat"],
"Petugas 1": pos["Petugas 1"],
"Petugas 2": pos["Petugas 2"],
"Petugas 3": pos["Petugas 3"],
"Petugas 4": pos["Petugas 4"],
"Keterangan": pos["Keterangan"]

});

}

});

var ws = XLSX.utils.json_to_sheet(hasil);
var wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Data");

XLSX.writeFile(wb,"Data_Pos_Hujan.xlsx");

});

}

// TOGGLE DASHBOARD

var toggleBtn = document.getElementById("toggleDashboard");
var dashboardContent = document.getElementById("dashboardContent");

if(toggleBtn){

toggleBtn.addEventListener("click", function(){

if(dashboardContent.style.display === "none"){

dashboardContent.style.display = "block";

}else{

dashboardContent.style.display = "none";

}

});

}

// FILTER MARKER BERDASARKAN STATUS

var filters = document.querySelectorAll(".filter");

filters.forEach(function(el){

el.addEventListener("click", function(){

var status = this.getAttribute("data-status");

markers.clearLayers();

daftarMarker.forEach(function(marker){

if(status == "Belum"){

if(marker.status == "Belum"){
markers.addLayer(marker);
}

}else if(status == "Perbaikan"){

if(marker.status != "Baik" && marker.status != "Rusak" && marker.status != "Belum"){
markers.addLayer(marker);
}

}else{

if(marker.status == status){
markers.addLayer(marker);
}

}

});

});

});