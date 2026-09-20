// --- STATE & LOCAL STORAGE ---
let trackerData = JSON.parse(localStorage.getItem('holyrate_tracker')) || {
    watchlist: [],
    watched: []
};

// --- DOM ELEMENTS ---
const menuIcon = document.querySelector('.menu-icon');
const sidebar = document.querySelector('.sidebar');
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

const mediaInput = document.getElementById('mediaInput');
const addBtn = document.getElementById('addBtn');

const watchlistGrid = document.getElementById('watchlist-grid');
const watchedGrid = document.getElementById('watched-grid');
const statWatchlist = document.getElementById('stat-watchlist');
const statWatched = document.getElementById('stat-watched');

// --- SIDEBAR TOGGLE ---
menuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// --- NAVIGATION TABS ---
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Hide all views
        views.forEach(v => v.style.display = 'none');

        // Show target view
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById(`${targetTab}-view`).style.display = 'block';
    });
});

// --- ADD MEDIA LOGIC ---
function addMedia() {
    const title = mediaInput.value.trim();
    if (!title) return;

    // Push to watchlist by default
    trackerData.watchlist.push({ id: Date.now(), title: title });
    mediaInput.value = '';

    saveAndRender();
}

addBtn.addEventListener('click', addMedia);
mediaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addMedia();
});

// --- MOVE & DELETE LOGIC ---
window.moveToWatched = function(id) {
    const index = trackerData.watchlist.findIndex(item => item.id === id);
    if (index !== -1) {
        const item = trackerData.watchlist.splice(index, 1)[0];
        trackerData.watched.push(item);
        saveAndRender();
    }
};

window.deleteItem = function(id, category) {
    trackerData[category] = trackerData[category].filter(item => item.id !== id);
    saveAndRender();
};

// --- SAVE & RENDER ---
function saveAndRender() {
    // Save to browser memory
    localStorage.setItem('holyrate_tracker', JSON.stringify(trackerData));

    // Update stats
    statWatchlist.textContent = trackerData.watchlist.length;
    statWatched.textContent = trackerData.watched.length;

    // Render Watchlist Grid
    watchlistGrid.innerHTML = '';
    if (trackerData.watchlist.length === 0) {
        watchlistGrid.innerHTML = '<p style="color: #666;">No items in watchlist yet.</p>';
    } else {
        trackerData.watchlist.forEach(item => {
            watchlistGrid.innerHTML += `
                <div class="media-card">
                    <div class="media-title">${item.title}</div>
                    <div class="card-actions">
                        <button class="action-btn" onclick="moveToWatched(${item.id})">Watched</button>
                        <button class="action-btn delete" onclick="deleteItem(${item.id}, 'watchlist')">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    // Render Watched Grid
    watchedGrid.innerHTML = '';
    if (trackerData.watched.length === 0) {
        watchedGrid.innerHTML = '<p style="color: #666;">No completed items yet.</p>';
    } else {
        trackerData.watched.forEach(item => {
            watchedGrid.innerHTML += `
                <div class="media-card">
                    <div class="media-title">${item.title}</div>
                    <div class="card-actions">
                        <button class="action-btn delete" onclick="deleteItem(${item.id}, 'watched')">Delete</button>
                    </div>
                </div>
            `;
        });
    }
}

// Initial render on page load
saveAndRender();