// Global variables
let map;
let currentCity = null;
let loadedTiles = new Set();
let visibleTiles = new Set(); // Track currently visible tiles
let loadingTiles = new Set(); // Track tiles currently being loaded
let tileLoadStartTimes = new Map(); // Track when each tile started loading
let metadata = null;
let filters = null; // Will be initialized in initializeFilterStates
let currentlyLoadingTiles = new Set();
let moveEndTimeout = null;
const TILE_LOAD_TIMEOUT = 5000; // 5 seconds timeout for tile loading

// Base URL for tile data - change this based on environment
const BASE_URL = window.location.href.includes('github.io') 
    ? '/dynamic-microschool-heatmaps'  // GitHub Pages path (with leading slash)
    : ''; // Local development path

// Initialize the map
function initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmV3LXZpbmNlbnQiLCJhIjoiY202OW4wNm5yMGlubzJtcTJmMnBxb2x1cSJ9.jrR3Ucv9Nvtc-T_7aKIQCg';
    
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/basic-v9',
        center: [-97.7431, 30.2672], // Austin coordinates
        zoom: 9
    });

    // Add geocoder control
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: 'us',
        types: 'place,locality,neighborhood'
    });

    map.addControl(geocoder);
    map.addControl(new mapboxgl.NavigationControl());

    // Add map event handlers
    map.on('move', () => {
        if (moveEndTimeout) {
            clearTimeout(moveEndTimeout);
        }
        moveEndTimeout = setTimeout(() => {
            checkVisibleTiles();
        }, 100);
    });

    map.on('moveend', () => {
        if (moveEndTimeout) {
            clearTimeout(moveEndTimeout);
        }
        checkVisibleTiles();
    });

    // Load metadata and initialize UI once map is ready
    map.on('load', async () => {
        try {
            metadata = await loadMetadata();
            checkVisibleTiles();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    });
}

// Load metadata and initialize tile loading
async function loadMetadata() {
    try {
        const response = await fetch(`${BASE_URL}/data/wealth_tiles/metadata.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const metadata = await response.json();
        return metadata;
    } catch (error) {
        console.error('Error loading metadata:', error);
        return null;
    }
}

// Load a specific tile
async function loadTile(gridRef) {
    if (loadedTiles.has(gridRef)) {
        return; // Already loaded
    }

    // Check if tile has been loading too long
    if (loadingTiles.has(gridRef)) {
        const startTime = tileLoadStartTimes.get(gridRef);
        if (startTime && (Date.now() - startTime) > TILE_LOAD_TIMEOUT) {
            console.log(`Tile ${gridRef} load timeout, retrying...`);
            loadingTiles.delete(gridRef);
            tileLoadStartTimes.delete(gridRef);
        } else {
            return; // Still loading within timeout
        }
    }

    loadingTiles.add(gridRef);
    tileLoadStartTimes.set(gridRef, Date.now());
    
    try {
        const sourceId = `source-${gridRef}`;
        const layerId = `layer-${gridRef}`;

        if (map.getSource(sourceId)) {
            loadedTiles.add(gridRef);
            return;
        }

        const response = await fetch(`${BASE_URL}/data/tiles/${gridRef}.geojson`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: data
            });

            map.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': 'rgba(0, 0, 0, 0)',
                    'fill-opacity': 0.8,
                    'fill-outline-color': 'rgba(0, 0, 0, 0.2)'
                }
            });
            
            loadedTiles.add(gridRef);
            updateLayerColors(map, sourceId, layerId);
        }
    } catch (error) {
        console.error(`Error loading tile ${gridRef}:`, error);
    } finally {
        loadingTiles.delete(gridRef);
        tileLoadStartTimes.delete(gridRef);
    }
}

// Unload a tile and remove its layers
function unloadTile(gridRef) {
    const sourceId = `source-${gridRef}`;
    const layerId = `layer-${gridRef}`;

    try {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        }
    } catch (error) {
        console.error(`Error unloading tile ${gridRef}:`, error);
    }
    loadedTiles.delete(gridRef);
}

// Check which tiles need to be loaded based on viewport
function checkVisibleTiles() {
    if (!metadata || !map) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const newVisibleTiles = new Set();

    // Check which tiles are visible
    Object.keys(metadata.grids).forEach(gridId => {
        const grid = metadata.grids[gridId];
        if (isGridVisible(grid.bounds, bounds)) {
            newVisibleTiles.add(gridId);
            loadTile(gridId);
        }
    });

    // Unload tiles that are no longer visible
    Array.from(loadedTiles).forEach(gridId => {
        if (!newVisibleTiles.has(gridId)) {
            unloadTile(gridId);
        }
    });

    visibleTiles = newVisibleTiles;
}

function updateFilters() {
    const income250kCategories = document.getElementById('income250k-categories');
    const income500kCategories = document.getElementById('income500k-categories');

    filters = {
        '250k': {
            enabled: document.getElementById('income250k-parent').checked,
            categories: {},
            colors: Array.from(income250kCategories.querySelectorAll('.color-box')).map(box => box.style.backgroundColor)
        },
        '500k': {
            enabled: document.getElementById('income500k-parent').checked,
            categories: {},
            colors: Array.from(income500kCategories.querySelectorAll('.color-box')).map(box => box.style.backgroundColor)
        }
    };

    // Update category states
    ['250k', '500k'].forEach(level => {
        const categories = document.getElementById(`income${level}-categories`);
        categories.querySelectorAll('.category-item').forEach((item, index) => {
            const checkbox = item.querySelector('.category-checkbox');
            const label = item.querySelector('.category-label').textContent;
            filters[level].categories[label] = checkbox.checked;
        });
    });
}

function updateLayerColors(map, sourceId, layerId) {
    updateFilters();

    // Build the color expression based on both income levels
    const colorExpression = [
        'case',
        // If 500k is enabled and both 500k and 250k have more than 500 kids
        ['all',
            ['boolean', filters['500k'].enabled],
            ['>', ['get', 'kids_500k'], 500],
            ['>', ['get', 'kids_250k'], 500]
        ],
        // Use 500k color stops
        ['step', 
            ['get', 'kids_500k'],
            'rgba(0, 0, 0, 0)',
            500, filters['500k'].colors[4],  // 500-750
            750, filters['500k'].colors[3],  // 750-1000
            1000, filters['500k'].colors[2], // 1000-1250
            1250, filters['500k'].colors[1], // 1250-1500
            1500, filters['500k'].colors[0]  // 1500+
        ],
        // Otherwise, if 250k is enabled and has >500 kids
        ['all',
            ['boolean', filters['250k'].enabled],
            ['>', ['get', 'kids_250k'], 500]
        ],
        // Use 250k color stops
        ['step', 
            ['get', 'kids_250k'],
            'rgba(0, 0, 0, 0)',
            500, filters['250k'].colors[4],  // 500-750
            750, filters['250k'].colors[3],  // 750-1000
            1000, filters['250k'].colors[2], // 1000-1250
            1250, filters['250k'].colors[1], // 1250-1500
            1500, filters['250k'].colors[0]  // 1500+
        ],
        // Default: transparent
        'rgba(0, 0, 0, 0)'
    ];

    map.setPaintProperty(layerId, 'fill-color', colorExpression);
}

// Check if a grid's bounds intersect with the viewport bounds
function isGridVisible(gridBounds, viewportBounds) {
    return viewportBounds.getWest() <= gridBounds.max_lon && 
           viewportBounds.getEast() >= gridBounds.min_lon &&
           viewportBounds.getSouth() <= gridBounds.max_lat && 
           viewportBounds.getNorth() >= gridBounds.min_lat;
}

// Initialize the map
export function init() {
    initializeMap();

    // Document ready handler
    document.addEventListener('DOMContentLoaded', function() {
        // Set up event listeners for filter changes
        document.querySelectorAll('.parent-checkbox, .category-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                Array.from(loadedTiles).forEach(gridId => {
                    const sourceId = `source-${gridId}`;
                    const layerId = `layer-${gridId}`;
                    updateLayerColors(map, sourceId, layerId);
                });
            });
        });
    });
}
