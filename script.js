// Game management variables
let allGames = [];
let allRepacks = [];
let currentPage = 1;
const gamesPerPage = 12;
let filteredGames = [];
let filteredRepacks = [];

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

// Create planets
function createPlanets() {
    const planets = [
        { 
            size: 100, 
            color: 'linear-gradient(45deg, #ff4444, #aa2222)', 
            speed: 30,
            orbitRadius: 150
        },
        { 
            size: 80, 
            color: 'linear-gradient(45deg, #4444ff, #2222aa)', 
            speed: 20,
            orbitRadius: 200
        },
        { 
            size: 120, 
            color: 'linear-gradient(45deg, #9944ff, #662299)', 
            speed: 25,
            orbitRadius: 250
        }
    ];

    planets.forEach(({ size, color, speed, orbitRadius }) => {
        const planet = document.createElement('div');
        planet.className = 'planet';
        planet.style.width = `${size}px`;
        planet.style.height = `${size}px`;
        planet.style.background = color;
        planet.style.animationDuration = `${speed}s`;
        planet.style.left = `${50 + Math.random() * 20}%`;
        planet.style.top = `${50 + Math.random() * 20}%`;
        spaceBackground.appendChild(planet);
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
        platforms: platforms.length > 0 ? platforms : ['Windows'] // Default to Windows if no platform specified
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

// Load and parse both Steam games and repacks
async function loadGames() {
    try {
        // Load Steam games
        const steamResponse = await fetch('games.json');
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
        const repackResponse = await fetch('repacks.json');
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
        // Fallback to sample data if needed
        handleLoadError();
    }
}

// Handle load error with sample data
function handleLoadError() {
    // Sample Steam game
    const sampleGame = {
        title: "A Game About Flicking A Switch Build 15398309 Windows",
        cover: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2672850/header.jpg?t=1718979371",
        link: "https://cs.rin.ru/forum/viewtopic.php?p=3205105#p3205105"
    };
    const parsed = parseGameTitle(sampleGame.title);
    allGames = [{
        ...sampleGame,
        parsedTitle: parsed.title,
        version: parsed.version,
        platforms: parsed.platforms
    }];
    filteredGames = [...allGames];

    // Sample Repack
    const sampleRepack = {
        title: "Sample.Game.B1000000.MorrenusGames",
        cover: "https://example.com/cover.jpg",
        link: "https://example.com/download"
    };
    const parsedRepack = parseRepackTitle(sampleRepack.title);
    allRepacks = [{
        ...sampleRepack,
        parsedTitle: parsedRepack.title,
        version: parsedRepack.version
    }];
    filteredRepacks = [...allRepacks];

    renderGames();
    renderRepacks();
    setupPagination();
}

// Render Steam games
function renderGames() {
    const steamGamesContainer = document.getElementById('steamGames');
    if (!steamGamesContainer) return;

    steamGamesContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesToShow = filteredGames.slice(startIndex, endIndex);

    gamesToShow.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${game.cover}" alt="${game.parsedTitle}" loading="lazy">
            <div class="game-info">
                <div class="game-title">${game.parsedTitle}</div>
                ${game.version ? `<div class="game-meta">Version: <span>${game.version}</span></div>` : ''}
                <div class="game-platforms">
                    ${game.platforms.map(platform => 
                        `<div class="platform-tag">${platform}</div>`
                    ).join('')}
                </div>
                <a href="${game.link}" target="_blank">View Details →</a>
            </div>
        `;
        steamGamesContainer.appendChild(card);
    });
}

// Render repacks
function renderRepacks() {
    const repacksContainer = document.getElementById('repacksGrid');
    if (!repacksContainer) return;
    
    repacksContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const repacksToShow = filteredRepacks.slice(startIndex, endIndex);

    repacksToShow.forEach(repack => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${repack.cover}" alt="${repack.parsedTitle}" loading="lazy">
            <div class="game-info">
                <div class="game-title">${repack.parsedTitle}</div>
                ${repack.version ? `<div class="game-meta">Version: <span>${repack.version}</span></div>` : ''}
                <a href="${repack.link}" target="_blank">Download →</a>
            </div>
        `;
        repacksContainer.appendChild(card);
    });
}

// Setup pagination
function setupPagination() {
    const activeTab = document.querySelector('.tab-content.active').id;
    const items = activeTab === 'steam' ? filteredGames : filteredRepacks;
    const paginationContainer = document.getElementById(activeTab === 'steam' ? 'pagination' : 'repacksPagination');
    
    if (!paginationContainer) return;
    
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
    createPlanets();
    loadGames();
}

// Start the application
initialize();