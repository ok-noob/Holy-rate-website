/**
 * ============================================================================
 * HOLYRATE TRACKER ENGINE - MASTER CONTROLLER SCRIPT
 * Version: 2.0.0 (Production Grade)
 * Description: Fully modularized client-side state management, local storage
 * persistence, UI router navigation, dynamic modal control, and search filtering.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // 1. STATE MANAGEMENT & INITIAL DATA LAYER
    // --------------------------------------------------------------------------
    const AppState = {
        currentView: 'home-view',
        sidebarCollapsed: false,
        activeFilters: {
            movies: 'All',
            shows: 'Airing'
        },
        userStats: {
            totalWatched: 14,
            currentlyTracking: 5,
            hoursSpent: 48,
            averageScore: 8.9
        },
        mediaLibrary: [
            {
                id: 'media-1',
                title: 'Cyberpunk: Edgerunners',
                type: 'TV Show',
                category: 'Series',
                score: 9.2,
                status: 'watching',
                progress: 'Ep. 6 / 10',
                progressPercent: 60,
                year: '2022',
                genre: 'Sci-Fi / Action',
                poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&auto=format&fit=crop'
            },
            {
                id: 'media-2',
                title: 'Interstellar',
                type: 'Movie',
                category: 'Movie',
                score: 9.6,
                status: 'completed',
                progress: 'Completed',
                progressPercent: 100,
                year: '2014',
                genre: 'Sci-Fi / Drama',
                poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=400&auto=format&fit=crop'
            },
            {
                id: 'media-3',
                title: 'Blade Runner 2049',
                type: 'Movie',
                category: 'Movie',
                score: 9.1,
                status: 'completed',
                progress: 'Completed',
                progressPercent: 100,
                year: '2017',
                genre: 'Sci-Fi / Cyberpunk',
                poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop'
            },
            {
                id: 'media-4',
                title: 'Arcane Universe',
                type: 'TV Show',
                category: 'Series',
                score: 9.4,
                status: 'watching',
                progress: 'Ep. 3 / 9',
                progressPercent: 35,
                year: '2024',
                genre: 'Animation / Fantasy',
                poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop'
            },
            {
                id: 'media-5',
                title: 'Dune: Part Two',
                type: 'Movie',
                category: 'Discover',
                score: 8.8,
                status: 'plantowatch',
                progress: 'Plan to Watch',
                progressPercent: 0,
                year: '2024',
                genre: 'Epic Adventure',
                poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=400&auto=format&fit=crop'
            }
        ],
        activeModalItem: null
    };

    // --------------------------------------------------------------------------
    // 2. LOCALSTORAGE PERSISTENCE ENGINE
    // --------------------------------------------------------------------------
    const StorageService = {
        KEY: 'holyrate_tracker_state_v1',
        save() {
            try {
                const dataToSave = {
                    mediaLibrary: AppState.mediaLibrary,
                    userStats: AppState.userStats
                };
                localStorage.setItem(this.KEY, JSON.stringify(dataToSave));
            } catch (error) {
                console.error('Failed to save state to localStorage:', error);
            }
        },
        load() {
            try {
                const savedData = localStorage.getItem(this.KEY);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    AppState.mediaLibrary = parsed.mediaLibrary || AppState.mediaLibrary;
                    AppState.userStats = parsed.userStats || AppState.userStats;
                }
            } catch (error) {
                console.error('Failed to load state from localStorage:', error);
            }
        }
    };

    // Load initial persistent settings
    StorageService.load();

    // --------------------------------------------------------------------------
    // 3. UI DOM SELECTORS CACHE
    // --------------------------------------------------------------------------
    const DOM = {
        sidebar: document.getElementById('sidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        brandToggle: document.getElementById('brandToggle'),
        menuItems: document.querySelectorAll('.menu-item'),
        viewSections: document.querySelectorAll('.view-section'),
        globalSearchInput: document.getElementById('globalSearchInput'),

        // Stats elements
        statWatched: document.getElementById('statWatched'),
        statTracking: document.getElementById('statTracking'),

        // Modal Elements
        modalOverlay: document.getElementById('trackerModal'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),
        modalCancelBtn: document.getElementById('modalCancelBtn'),
        modalSaveBtn: document.getElementById('modalSaveBtn'),
        modalTitleText: document.getElementById('modalTitleText'),
        modalCategoryText: document.getElementById('modalCategoryText'),
        modalPosterImg: document.getElementById('modalPosterImg'),
        statusSelect: document.getElementById('statusSelect'),
        progressInput: document.getElementById('progressInput'),
        scoreInput: document.getElementById('scoreInput'),

        // Dynamic Grids
        continueGrid: document.getElementById('continueWatchingGrid'),
        moviesGrid: document.getElementById('moviesGrid'),
        showsGrid: document.getElementById('showsGrid')
    };

    // --------------------------------------------------------------------------
    // 4. NAVIGATION & VIEW ROUTER SYSTEM
    // --------------------------------------------------------------------------
    function switchView(targetId) {
        if (!document.getElementById(targetId)) return;

        AppState.currentView = targetId;

        // Update menu items active state
        DOM.menuItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update view sections visibility
        DOM.viewSections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Scroll main container to top on view change
        const mainContainer = document.querySelector('.main-content');
        if (mainContainer) {
            mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    DOM.menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            switchView(targetId);
        });
    });

    // --------------------------------------------------------------------------
    // 5. SIDEBAR COLLAPSE & RESPONSIVE DRAWER MANAGEMENT
    // --------------------------------------------------------------------------
    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            DOM.sidebar.classList.toggle('mobile-open');
        } else {
            DOM.sidebar.classList.toggle('collapsed');
            AppState.sidebarCollapsed = DOM.sidebar.classList.contains('collapsed');
        }
    }

    if (DOM.sidebarToggle) DOM.sidebarToggle.addEventListener('click', toggleSidebar);
    if (DOM.brandToggle) DOM.brandToggle.addEventListener('click', toggleSidebar);

    // Auto adjust on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            DOM.sidebar.classList.remove('mobile-open');
        }
    });

    // --------------------------------------------------------------------------
    // 6. DYNAMIC UI RENDERING ENGINE
    // --------------------------------------------------------------------------
    function renderStats() {
        if (DOM.statWatched) DOM.statWatched.innerText = AppState.userStats.totalWatched;
        if (DOM.statTracking) DOM.statTracking.innerText = AppState.userStats.currentlyTracking;
    }

    function renderMediaGrids() {
        // Clear grids before building
        if (DOM.continueGrid) DOM.continueGrid.innerHTML = '';
        if (DOM.moviesGrid) DOM.moviesGrid.innerHTML = '';
        if (DOM.showsGrid) DOM.showsGrid.innerHTML = '';

        AppState.mediaLibrary.forEach(item => {
            const cardHTML = `
                <div class="media-card" data-id="${item.id}">
                    <div class="poster-container">
                        <span class="media-badge">${item.type.toUpperCase()}</span>
                        <span class="media-score">${item.score}</span>
                        <img src="${item.poster}" alt="${item.title}" loading="lazy">
                    </div>
                    <div class="media-info">
                        <div class="media-title">${item.title}</div>
                        <div class="media-meta">
                            <span>${item.genre}</span>
                            <span>${item.progress}</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${item.progressPercent}%;"></div>
                        </div>
                    </div>
                </div>
            `;

            // Append to appropriate view containers based on type/status
            if (item.status === 'watching' && DOM.continueGrid) {
                DOM.continueGrid.insertAdjacentHTML('beforeend', cardHTML);
            }
            if (item.type === 'Movie' && DOM.moviesGrid) {
                DOM.moviesGrid.insertAdjacentHTML('beforeend', cardHTML);
            }
            if (item.type === 'TV Show' && DOM.showsGrid) {
                DOM.showsGrid.insertAdjacentHTML('beforeend', cardHTML);
            }
        });

        // Re-attach card click listeners for modal initialization
        attachCardListeners();
    }

    function attachCardListeners() {
        document.querySelectorAll('.media-card').forEach(card => {
            card.addEventListener('click', () => {
                const mediaId = card.getAttribute('data-id');
                const foundItem = AppState.mediaLibrary.find(m => m.id === mediaId);
                if (foundItem) {
                    openTrackerModal(foundItem);
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // 7. INTERACTIVE MODAL & CONFIGURATION CONTROLLER
    // --------------------------------------------------------------------------
    function openTrackerModal(mediaObject) {
        AppState.activeModalItem = mediaObject;

        if (DOM.modalTitleText) DOM.modalTitleText.innerText = mediaObject.title;
        if (DOM.modalCategoryText) DOM.modalCategoryText.innerText = `Genre: ${mediaObject.genre} (${mediaObject.year})`;
        if (DOM.modalPosterImg) DOM.modalPosterImg.src = mediaObject.poster;
        if (DOM.statusSelect) DOM.statusSelect.value = mediaObject.status;
        if (DOM.progressInput) DOM.progressInput.value = mediaObject.progress;
        if (DOM.scoreInput) DOM.scoreInput.value = mediaObject.score;

        if (DOM.modalOverlay) {
            DOM.modalOverlay.classList.add('open');
        }
    }

    function closeTrackerModal() {
        if (DOM.modalOverlay) {
            DOM.modalOverlay.classList.remove('open');
        }
        AppState.activeModalItem = null;
    }

    if (DOM.modalCloseBtn) DOM.modalCloseBtn.addEventListener('click', closeTrackerModal);
    if (DOM.modalCancelBtn) DOM.modalCancelBtn.addEventListener('click', closeTrackerModal);

    if (DOM.modalOverlay) {
        DOM.modalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.modalOverlay) {
                closeTrackerModal();
            }
        });
    }

    // Save configuration updates from modal
    if (DOM.modalSaveBtn) {
        DOM.modalSaveBtn.addEventListener('click', () => {
            if (!AppState.activeModalItem) return;

            // Update active item properties
            AppState.activeModalItem.status = DOM.statusSelect.value;
            AppState.activeModalItem.progress = DOM.progressInput.value;
            AppState.activeModalItem.score = parseFloat(DOM.scoreInput.value) || AppState.activeModalItem.score;

            // Calculate mock progress percentage based on inputs
            if (AppState.activeModalItem.status === 'completed') {
                AppState.activeModalItem.progressPercent = 100;
                AppState.activeModalItem.progress = 'Completed';
            } else if (AppState.activeModalItem.status === 'plantowatch') {
                AppState.activeModalItem.progressPercent = 0;
                AppState.activeModalItem.progress = 'Plan to Watch';
            }

            // Persist & re-render state
            StorageService.save();
            renderMediaGrids();
            renderStats();

            closeTrackerModal();

            // Flash visual confirmation toast or notification
            showNotification(`Updated tracking status for "${AppState.activeModalItem.title}"`);
        });
    }

    // --------------------------------------------------------------------------
    // 8. GLOBAL SEARCH & FILTER LOGIC
    // --------------------------------------------------------------------------
    if (DOM.globalSearchInput) {
        DOM.globalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length > 0) {
                // Switch automatically to discover or filter current cards
                const cards = document.querySelectorAll('.media-card');
                cards.forEach(card => {
                    const titleElement = card.querySelector('.media-title');
                    if (titleElement) {
                        const titleText = titleElement.innerText.toLowerCase();
                        if (titleText.includes(query)) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            } else {
                // Reset card displays
                document.querySelectorAll('.media-card').forEach(card => {
                    card.style.display = 'flex';
                });
            }
        });
    }

    // Filter Tabs Manager
    document.querySelectorAll('.filter-tabs').forEach(group => {
        const tabs = group.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Here you can hook category-specific filtering algorithms if required
                const filterValue = tab.innerText;
                console.log(`Applied view filter category: ${filterValue}`);
            });
        });
    });

    // --------------------------------------------------------------------------
    // 9. UTILITY NOTIFICATION SYSTEM
    // --------------------------------------------------------------------------
    function showNotification(message) {
        const existingToast = document.getElementById('holyrateToast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'holyrateToast';
        toast.innerText = message;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: '#121216',
            color: '#00FF66',
            padding: '14px 24px',
            borderRadius: '12px',
            border: '1px solid #00FF66',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            zIndex: '2000',
            fontWeight: '600',
            fontSize: '0.9rem',
            opacity: '0',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transform: 'translateY(10px)'
        });

        document.body.appendChild(toast);

        // Trigger entrance animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Auto remove after 3.5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --------------------------------------------------------------------------
    // 10. INITIALIZATION ROUTINE
    // --------------------------------------------------------------------------
    function initApp() {
        renderStats();
        renderMediaGrids();
        console.info('Holyrate Tracker Engine initialized successfully.');
    }

    initApp();

});