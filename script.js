"use strict";

let allShows = [];
let selectedGenres = new Set();
let selectedLanguages = new Set();
let sortOption = "";
let releaseDateRange = { from: null, to: null }; // 📅 Range for show premiered date
let endDateRange = { from: null, to: null };    // 🏁 Range for show ended date

// 📥 Fetches TV Maze data
const fetchShows = async () => {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error("Помилка при завантаженні даних");
    const data = await response.json();
    allShows = data;
    generateFilters(data);
    renderShows(data);
  } catch (error) {
    document.getElementById("movieContainer").innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
};

// 🖼️ Renders filtered and sorted shows
const renderShows = (shows) => {
  const container = document.getElementById("movieContainer");
  container.innerHTML = "";

  // 🧠 Apply all filters
  let filtered = shows.filter(show => {
    // Check genre filter
    const genreMatch = selectedGenres.size === 0 || show.genres.some(g => selectedGenres.has(g));
    
    // Check language filter
    const langMatch = selectedLanguages.size === 0 || selectedLanguages.has(show.language);
    
    // Check release date range filter
    const releaseDate = show.premiered ? new Date(show.premiered) : null;
    const releaseMatch = !releaseDateRange.from || 
      (releaseDate && releaseDate >= new Date(releaseDateRange.from) && 
       (!releaseDateRange.to || releaseDate <= new Date(releaseDateRange.to)));
    
    // Check end date range filter
    const endDate = show.ended ? new Date(show.ended) : null;
    const endMatch = !endDateRange.from || 
      (endDate && endDate >= new Date(endDateRange.from) && 
       (!endDateRange.to || endDate <= new Date(endDateRange.to)));
    
    return genreMatch && langMatch && releaseMatch && endMatch;
  });

  // 🗂️ Apply sorting
  if (sortOption === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "rating") {
    filtered.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));
  } else if (sortOption === "date") {
    filtered.sort((a, b) => new Date(b.premiered) - new Date(a.premiered));
  }

  // 🎬 Create movie cards
  filtered.forEach(({ name, image, rating, genres, language, ended, premiered }) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${image?.medium || "https://via.placeholder.com/210x295"}" alt="${name}" />
      <h3>${name}</h3>
      <div class="movie-info">
        <p>🎭 Жанри: ${genres.join(", ") || "Невідомо"}</p>
        <p>🌍 Мова: ${language || "Невідомо"}</p>
        <p>📅 Дата релізу: ${premiered || "?"}</p>
        <p>🏁 Завершено: ${ended || "ще триває"}</p>
        <p>📊 Рейтинг: ${rating?.average ?? "немає"}</p>
      </div>
    `;
    container.appendChild(card);
  });
};

// 📊 Generate genre + language filter checkboxes
const generateFilters = (shows) => {
  const genresSet = new Set();
  const langSet = new Set();
  
  // Collect all unique genres and languages
  shows.forEach(show => {
    show.genres.forEach(g => genresSet.add(g));
    if (show.language) langSet.add(show.language);
  });

  // Create genre filter checkboxes
  const genreFilters = document.getElementById("genreFilters");
  genresSet.forEach(genre => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${genre}">${genre}`;
    genreFilters.appendChild(label);
  });

  // Create language filter checkboxes
  const languageFilters = document.getElementById("languageFilters");
  langSet.forEach(lang => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${lang}">${lang}`;
    languageFilters.appendChild(label);
  });
};

// 🧭 Toggle filter popup with animation
document.getElementById("filterToggle").addEventListener("click", () => {
  const menu = document.getElementById("filterMenu");
  menu.classList.toggle("show");
  menu.classList.toggle("hidden");
});

// 🔎 Search by title
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allShows.filter(show => show.name.toLowerCase().includes(query));
  renderShows(filtered);
});

// 🗃️ Handle sort change
document.querySelectorAll("input[name='sort']").forEach(radio => {
  radio.addEventListener("change", (e) => {
    sortOption = e.target.value;
    renderShows(allShows);
  });
});

// ✅ Handle checkbox filters
document.addEventListener("change", (e) => {
  const target = e.target;

  // Genre filter change
  if (target.closest("#genreFilters")) {
    target.checked ? selectedGenres.add(target.value) : selectedGenres.delete(target.value);
    renderShows(allShows);
  }

  // Language filter change
  if (target.closest("#languageFilters")) {
    target.checked ? selectedLanguages.add(target.value) : selectedLanguages.delete(target.value);
    renderShows(allShows);
  }

  // Release date range change
  if (target.id === "releaseDateFrom" || target.id === "releaseDateTo") {
    releaseDateRange = {
      from: document.getElementById("releaseDateFrom").value,
      to: document.getElementById("releaseDateTo").value
    };
    renderShows(allShows);
  }

  // End date range change
  if (target.id === "endDateFrom" || target.id === "endDateTo") {
    endDateRange = {
      from: document.getElementById("endDateFrom").value,
      to: document.getElementById("endDateTo").value
    };
    renderShows(allShows);
  }
});

// Initialize the application
fetchShows();