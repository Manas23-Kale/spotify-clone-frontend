let song = document.getElementById("song");
let progressBar = document.getElementById("progressBar");
let playBtn = document.getElementById("playBtn");
let volumeBar = document.getElementById("volumeBar");
let currentTimeEl = document.getElementById("currentTime");
let durationEl = document.getElementById("duration");

let recentlyPlayed = [];
let currentPlaylist = [];
let currentIndex = 0;

let playlists = {};
let currentPlaylistName = null;
let user = localStorage.getItem("loggedInUser");

if(!user){
window.location.href = "auth.html";
}
function logout(){
localStorage.removeItem("loggedInUser");
window.location.href = "auth.html";
}
/* ================= PLAYLIST SYSTEM ================= */

function createPlaylist(){

let name = prompt("Enter playlist name:");
if(!name) return;

playlists[name] = [];

renderPlaylists();

}

function renderPlaylists(){

let container = document.getElementById("playlistContainer");
container.innerHTML = "";

if(Object.keys(playlists).length === 0){
container.innerHTML = "<li style='color:gray;'>No playlists yet</li>";
return;
}

for(let name in playlists){

let li = document.createElement("li");
li.innerText = name;

li.onclick = () => {
openPlaylist(name);
};

container.appendChild(li);

}

}

function openPlaylist(name){

currentPlaylistName = name;
currentPlaylist = playlists[name];

openSearch();

/* 🔥 show playlist name */
document.getElementById("playlistTitle").innerText = "Viewing Playlist: " + name;

displaySongs(currentPlaylist);

}

/* ================= PLAYER ================= */

function togglePlay(){
if(song.src === "") return;
song.paused ? song.play() : song.pause();
}

function formatTime(seconds){
let mins = Math.floor(seconds / 60);
let secs = Math.floor(seconds % 60);
if(secs < 10) secs = "0" + secs;
return mins + ":" + secs;
}

song.addEventListener("play", () => {
playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
document.getElementById("wave").style.display = "flex";
});

song.addEventListener("pause", () => {
playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
document.getElementById("wave").style.display = "none";
});

song.addEventListener("timeupdate", () => {

if(song.duration){

let progress = (song.currentTime / song.duration) * 100;

progressBar.value = progress;
progressBar.style.setProperty('--progress', progress + '%');

currentTimeEl.innerText = formatTime(song.currentTime);
durationEl.innerText = formatTime(song.duration);

}

});

progressBar.addEventListener("input", () => {
song.currentTime = (progressBar.value / 100) * song.duration;
});

/* ================= NAVIGATION ================= */

function openSearch(){
document.getElementById("homePage").style.display="none";
document.getElementById("searchPage").style.display="block";
}

function showHome(){
document.getElementById("homePage").style.display="block";
document.getElementById("searchPage").style.display="none";
}

/* ================= SEARCH ================= */

async function searchSongs(query){

try{

openSearch();

document.getElementById("playlistTitle").innerText = "";

let container = document.getElementById("searchResults");
container.innerHTML = "<p>Loading...</p>";

let result = await fetch(`http://localhost:3000/search?q=${query}`);
let data = await result.json();

if(!data.tracks){
container.innerHTML = "<p>No results found</p>";
return;
}

currentPlaylist = data.tracks.items;

displaySongs(currentPlaylist);

}catch(error){
console.error(error);
document.getElementById("searchResults").innerHTML = "<p>Error loading songs</p>";
}

}

/* ================= DISPLAY ================= */

function displaySongs(tracks){

let container = document.getElementById("searchResults");
container.innerHTML = "";

if(tracks.length === 0){
container.innerHTML = "<p>No songs in this playlist</p>";
return;
}

tracks.forEach((track, index) => {

let image = track.album.images[0]?.url || "https://via.placeholder.com/150";

let card = document.createElement("div");
card.className = "card";

card.innerHTML = `
<img src="${image}">
<h3>${track.name}</h3>
<p>${track.artists[0].name}</p>
<button class="addBtn">+ Add</button>
`;

/* 🔥 ADD TO PLAYLIST (FIXED) */
card.querySelector(".addBtn").onclick = (e) => {

e.stopPropagation();

if(!currentPlaylistName){
alert("Open a playlist first!");
return;
}

playlists[currentPlaylistName].push(track);

/* 🔥 REFRESH PLAYLIST VIEW */
openPlaylist(currentPlaylistName);

};

/* PLAY SONG */
card.onclick = () => {
currentIndex = index;
playCurrent();
};

container.appendChild(card);

});

}

/* ================= RECENT ================= */

function displayRecentlyPlayed(){

let container = document.getElementById("recentSongs");
container.innerHTML = "";

if(recentlyPlayed.length === 0){
container.innerHTML = "<p style='color:gray;'>No songs played yet</p>";
return;
}

recentlyPlayed.forEach((track, index) => {

let image = track.album.images[0]?.url || "https://via.placeholder.com/150";

let card = document.createElement("div");
card.className = "card";

card.innerHTML = `
<img src="${image}">
<h3>${track.name}</h3>
<p>${track.artists[0].name}</p>
`;

card.onclick = () => {
currentPlaylist = recentlyPlayed;
currentIndex = index;
playCurrent();
};

container.appendChild(card);

});

}

/* ================= PLAY ================= */

function playCurrent(){

let track = currentPlaylist[currentIndex];

currentTimeEl.innerText = "0:00";
durationEl.innerText = "0:00";

if(!track.preview_url){
alert("No preview available");
return;
}

song.src = track.preview_url;
song.play();

document.getElementById("songName").innerText = track.name;
document.getElementById("artistName").innerText = track.artists[0].name;
document.getElementById("cover").src = track.album.images[0]?.url;

recentlyPlayed = recentlyPlayed.filter(t => t.name !== track.name);
recentlyPlayed.unshift(track);

if(recentlyPlayed.length > 6){
recentlyPlayed.pop();
}

displayRecentlyPlayed();

}

/* ================= NEXT / PREV ================= */

function nextSong(){
if(currentPlaylist.length === 0) return;
currentIndex = (currentIndex + 1) % currentPlaylist.length;
playCurrent();
}

function prevSong(){
if(currentPlaylist.length === 0) return;
currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
playCurrent();
}

/* ================= INPUT ================= */

function handleSearch(event){
if(event.key === "Enter"){
let query = event.target.value;
if(query.trim() !== ""){
searchSongs(query);
}
}
}

/* ================= HOME ================= */

document.querySelectorAll("#homePage .card").forEach((card) => {

card.onclick = () => {

let title = card.querySelector("h3").innerText;
let image = card.querySelector("img").src;

/* 🔥 Map song names to actual files */
let songMap = {
"DJ Snake ft. Justin Bieber - Let Me Love You": "letmeloveyou.mp3",
"Ed Sheeran - Sapphire": "sapphire.mp3",
"One Direction - Night Changes": "nightchanges.mp3",
"The Kid LAROI, Justin Bieber - STAY": "stay.mp3"
};

let file = songMap[title] || "song1.mp3"; // fallback

currentPlaylist = [{
name: title,
artists: [{name: "Unknown Artist"}],
preview_url: "songs/" + file,
album: {images: [{url: image}]}
}];

currentIndex = 0;
playCurrent();

};

});
function openLibrary(){

document.getElementById("homePage").style.display = "none";
document.getElementById("searchPage").style.display = "none";
document.getElementById("libraryPage").style.display = "block";

renderLibrary();

}
function renderLibrary(){

let container = document.getElementById("libraryContent");
container.innerHTML = "";

if(Object.keys(playlists).length === 0){
container.innerHTML = "<p style='color:gray;'>No playlists yet</p>";
return;
}

for(let name in playlists){

let div = document.createElement("div");
div.className = "card";

div.innerHTML = `
<h3>${name}</h3>
<p>${playlists[name].length} songs</p>
`;

div.onclick = () => {
openPlaylist(name);
};

container.appendChild(div);

}

}
/* ================= VOLUME ================= */

volumeBar.addEventListener("input", () => {

song.volume = volumeBar.value;

let icon = document.querySelector(".volumeControl i");

if(song.volume == 0){
icon.className = "fa-solid fa-volume-xmark";
}
else if(song.volume < 0.5){
icon.className = "fa-solid fa-volume-low";
}
else{
icon.className = "fa-solid fa-volume-high";
}

});