// Game management variables
let allGames = [];
let allRepacks = [];
let currentPage = 1;
let gamesPerPage = 12;
let isInfiniteScroll = false;
let filteredGames = [];
let filteredRepacks = [];

// JSON file URLs
const GAMES_JSON_URL = 'https://raw.githubusercontent.com/KingCatto/Morrenus-Games-Release-List/refs/heads/main/games.json';
const REPACKS_JSON_URL = 'https://raw.githubusercontent.com/KingCatto/Morrenus-Games-Release-List/refs/heads/main/repacks.json';

// Create space background
const spaceBackground = document.getElementById('spaceBackground');

// Create multiple layers of stars with different sizes
function createStars() {
    // Small stars (numerous)
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star-small';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        spaceBackground.appendChild(star);
    }

    // Medium stars
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star-medium';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        spaceBackground.appendChild(star);
    }

    // Large stars (fewer)
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star-large';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        spaceBackground.appendChild(star);
    }
}

// Create nebula effects
function createNebulas() {
    const nebulaColors = [
        'rgba(255, 100, 255, 0.1)',  // Pink
        'rgba(100, 100, 255, 0.1)',  // Blue
        'rgba(255, 150, 100, 0.1)',  // Orange
        'rgba(100, 255, 255, 0.1)'   // Cyan
    ];

    for (let i = 0; i < 4; i++) {
        const nebula = document.createElement('div');
        nebula.className = 'nebula';
        nebula.style.background = nebulaColors[i];
        nebula.style.width = `${300 + Math.random() * 200}px`;
        nebula.style.height = `${300 + Math.random() * 200}px`;
        nebula.style.left = `${Math.random() * 100}%`;
        nebula.style.top = `${Math.random() * 100}%`;
        nebula.style.animationDelay = `${Math.random() * 8}s`;
        spaceBackground.appendChild(nebula);
    }
}

// Create solar system
function createSolarSystem() {
    // Create sun
    const sun = document.createElement('div');
    sun.className = 'sun';
    spaceBackground.appendChild(sun);

    // Create orbit paths
    const orbits = [120, 160, 200, 240]; // Mercury, Venus, Earth, Mars
    orbits.forEach(radius => {
        const orbit = document.createElement('div');
        orbit.className = 'orbit-path';
        orbit.style.width = `${radius * 2}px`;
        orbit.style.height = `${radius * 2}px`;
        spaceBackground.appendChild(orbit);
    });

    // Create planets
    const planets = [
        { name: 'mercury', size: 20 },
        { name: 'venus', size: 30 },
        { name: 'earth', size: 35 },
        { name: 'mars', size: 25 }
    ];

    planets.forEach(planet => {
        const planetElement = document.createElement('div');
        planetElement.className = `planet ${planet.name}`;
        spaceBackground.appendChild(planetElement);
    });
}

// Parse Steam game title into components
function parseGameTitle(fullTitle) {
    const parts = fullTitle.split(' Build ');
    const title = parts[0];
    const version = parts[1] ? `Build ${parts[1].split(' ')[0]}` : '';
    
    // Extract platforms
    const platforms = [];
    const platformsCheck = fullTitle.toLowerCase();
    if (platformsCheck.includes('windows')) platforms.push('Windows');
    if (platformsCheck.includes('linux')) platforms.push('Linux');
    if (platformsCheck.includes('mac')) platforms.push('Mac');
    
    return {
        title,
        version,
        platforms: platforms.length > 0 ? platforms : ['Windows']
    };
}

// Parse repack title
function parseRepackTitle(fullTitle) {
    // Split by dots
    const parts = fullTitle.split('.');
    
    // Remove MorrenusGames from the end
    parts.pop();
    
    // Get the version (last part)
    let version = parts.pop();
    
    // Process version number
    if (version.startsWith('B')) {
        version = 'Build ' + version.substring(1);
    } else if (version.startsWith('v')) {
        version = version.substring(1);
    }
    
    // Remaining parts are the game name
    const title = parts.join(' ');
    
    return {
        title,
        version
    };
}

// Settings initialization
function initializeSettings() {
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const pageSizeSelect = document.getElementById('pageSize');
    const infiniteScrollToggle = document.getElementById('infiniteScroll');

    // Load saved settings
    const savedSettings = JSON.parse(localStorage.getItem('morrenusSettings') || '{}');
    gamesPerPage = savedSettings.gamesPerPage || 12;
    isInfiniteScroll = savedSettings.infiniteScroll || false;

    // Set initial values
    pageSizeSelect.value = gamesPerPage;
    infiniteScrollToggle.checked = isInfiniteScroll;

    // Toggle settings panel
    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('active');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
            settingsPanel.classList.remove('active');
        }
    });

    // Handle page size change
    pageSizeSelect.addEventListener('change', (e) => {
        gamesPerPage = parseInt(e.target.value);
        currentPage = 1;
        saveSettings();
        updateDisplay();
    });

    // Handle infinite scroll toggle
    infiniteScrollToggle.addEventListener('change', (e) => {
        isInfiniteScroll = e.target.checked;
        saveSettings();
        updateDisplay();
    });
}

// Save settings
function saveSettings() {
    localStorage.setItem('morrenusSettings', JSON.stringify({
        gamesPerPage,
        infiniteScroll: isInfiniteScroll
    }));
}

// Update display based on settings
function updateDisplay() {
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'steam') {
        renderGames();
    } else {
        renderRepacks();
    }
    if (!isInfiniteScroll) {
        setupPagination();
    }
}

// Initialize infinite scroll
function initializeInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (!isInfiniteScroll) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 800) {
            const activeTab = document.querySelector('.tab-content.active').id;
            const items = activeTab === 'steam' ? filteredGames : filteredRepacks;
            const startIndex = currentPage * gamesPerPage;
            
            if (startIndex < items.length) {
                currentPage++;
                if (activeTab === 'steam') {
                    renderGames(true);
                } else {
                    renderRepacks(true);
                }
            }
        }
    });
}

// Load and parse games
async function loadGames() {
    try {
        // Load Steam games
        const steamResponse = await fetch(GAMES_JSON_URL);
        const rawGames = await steamResponse.json();
        allGames = rawGames.map(game => {
            const parsed = parseGameTitle(game.title);
            return {
                ...game,
                parsedTitle: parsed.title,
                version: parsed.version,
                platforms: parsed.platforms
            };
        });
        filteredGames = [...allGames];
        
        // Load Repacks
        const repackResponse = await fetch(REPACKS_JSON_URL);
        const rawRepacks = await repackResponse.json();
        allRepacks = rawRepacks.map(repack => {
            const parsed = parseRepackTitle(repack.title);
            return {
                ...repack,
                parsedTitle: parsed.title,
                version: parsed.version
            };
        });
        filteredRepacks = [...allRepacks];
        
        renderGames();
        renderRepacks();
        setupPagination();
    } catch (error) {
        console.error('Error loading games:', error);
        showError('Unable to load games. Please try again later.');
    }
}

// Show error message
function showError(message) {
    const steamGamesContainer = document.getElementById('steamGames');
    const repacksContainer = document.getElementById('repacksGrid');
    
    if (steamGamesContainer) {
        steamGamesContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
    if (repacksContainer) {
        repacksContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Render Steam games
function renderGames(append = false) {
    const steamGamesContainer = document.getElementById('steamGames');
    if (!steamGamesContainer) return;

    if (!append) {
        steamGamesContainer.innerHTML = '';
    }

    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesToShow = filteredGames.slice(startIndex, endIndex);

    gamesToShow.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-image-container">
                <img src="${game.cover}" alt="${game.parsedTitle}" loading="lazy">
            </div>
            <div class="game-info">
                <div class="game-title">${game.parsedTitle}</div>
                ${game.version ? `<div class="game-meta">Version: <span>${game.version}</span></div>` : ''}
                <div class="game-platforms">
                    ${game.platforms.map(platform => 
                        `<div class="platform-tag">${platform}</div>`
                    ).join('')}
                </div>
                <div class="game-links">
                    <a href="${game.link}" class="forum-link" target="_blank">Forum Page</a>
                    ${game.store ? `<a href="${game.store}" class="store-link" target="_blank">Steam Store</a>` : ''}
                </div>
            </div>
        `;
        steamGamesContainer.appendChild(card);
    });
}

// Render repacks
function renderRepacks(append = false) {
    const repacksContainer = document.getElementById('repacksGrid');
    if (!repacksContainer) return;
    
    if (!append) {
        repacksContainer.innerHTML = '';
    }

    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const repacksToShow = filteredRepacks.slice(startIndex, endIndex);

    repacksToShow.forEach(repack => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-image-container">
                <img src="${repack.cover}" alt="${repack.parsedTitle}" loading="lazy">
            </div>
            <div class="game-info">
                <div class="game-title">${repack.parsedTitle}</div>
                ${repack.version ? `<div class="game-meta">Version: <span>${repack.version}</span></div>` : ''}
                <div class="game-links">
                    <a href="${repack.link}" class="forum-link" target="_blank">Forum Page</a>
                    ${repack.store ? `<a href="${repack.store}" class="store-link" target="_blank">Steam Store</a>` : ''}
                </div>
            </div>
        `;
        repacksContainer.appendChild(card);
    });
}

// Setup pagination
function setupPagination() {
    if (isInfiniteScroll) {
        const paginationContainers = document.querySelectorAll('.pagination');
        paginationContainers.forEach(container => {
            container.style.display = 'none';
        });
        return;
    }

    const activeTab = document.querySelector('.tab-content.active').id;
    const items = activeTab === 'steam' ? filteredGames : filteredRepacks;
    const paginationContainer = document.getElementById(activeTab === 'steam' ? 'pagination' : 'repacksPagination');
    
    if (!paginationContainer) return;
    
    paginationContainer.style.display = 'flex';
    const pageCount = Math.ceil(items.length / gamesPerPage);
    
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            if (activeTab === 'steam') {
                renderGames();
            } else {
                renderRepacks();
            }
            setupPagination();
        });
        paginationContainer.appendChild(button);
    }
}

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Filter Steam games
    filteredGames = allGames.filter(game => 
        game.parsedTitle.toLowerCase().includes(searchTerm) ||
        game.version.toLowerCase().includes(searchTerm) ||
        game.platforms.some(platform => platform.toLowerCase().includes(searchTerm))
    );
    // Filter Repacks
    filteredRepacks = allRepacks.filter(repack => 
        repack.parsedTitle.toLowerCase().includes(searchTerm) ||
        repack.version.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    
    // Render appropriate content based on active tab
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'steam') {
        renderGames();
    } else {
        renderRepacks();
    }
    
    setupPagination();
});

// Tab switching functionality
function showTab(tabId) {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    // Reset pagination and render appropriate content
    currentPage = 1;
    if (tabId === 'steam') {
        renderGames();
    } else {
        renderRepacks();
    }
    setupPagination();
}

// Initialize space background and load games
function initialize() {
    createStars();
    createNebulas();
    createSolarSystem();
    initializeSettings();
    initializeInfiniteScroll();
    loadGames();
}

// Start the application
initialize();