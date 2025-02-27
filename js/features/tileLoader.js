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
            if (metadata) {
                checkVisibleTiles();
            }
        }, 100);
    });

    map.on('moveend', () => {
        if (moveEndTimeout) {
            clearTimeout(moveEndTimeout);
        }
        if (metadata) {
            checkVisibleTiles();
        }
    });

    // Load metadata and initialize UI once map is ready
    map.on('load', async () => {
        try {
            // Load metadata first
            metadata = await loadMetadata();
            
            // Then check visible tiles
            if (metadata) {
                checkVisibleTiles();
            }
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    });
}

// Load metadata and initialize tile loading
async function loadMetadata() {
    try {
        const response = await fetch('data/tiles/metadata.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading metadata:', error);
        return null;
    }
}

// Load a specific tile
async function loadTile(gridRef) {
    try {
        const sourceId = `source-${gridRef}`;
        const layerId = `layer-${gridRef}`;

        // Only load if not already loaded
        if (!loadedTiles.has(gridRef)) {
            // Add source
            map.addSource(sourceId, {
                type: 'geojson',
                data: `data/tiles/${gridRef}.geojson`
            });

            // Add main layer for colors
            map.addLayer({
                'id': layerId,
                'type': 'fill',
                'source': sourceId,
                'paint': {
                    'fill-color': 'rgba(0, 0, 0, 0)',
                    'fill-opacity': 0.8,
                    'fill-outline-color': 'rgba(0, 0, 0, 0.2)'
                }
            });

            loadedTiles.add(gridRef);
        }

        updateLayerColors(map, sourceId, layerId);
    } catch (error) {
        console.error('Error loading tile:', error);
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
    if (!metadata || !map) {
        console.warn('Metadata or map not yet initialized');
        return;
    }

    try {
        const bounds = map.getBounds();
        const visibleGrids = Object.keys(metadata.grids).filter(gridRef => {
            return isGridVisible(metadata.grids[gridRef].bounds, bounds);
        });

        // Load new tiles that are visible
        visibleGrids.forEach(async (gridRef) => {
            if (!loadedTiles.has(gridRef)) {
                await loadTile(gridRef);
            }
        });

        // Unload tiles that are no longer visible
        Array.from(loadedTiles).forEach(gridRef => {
            if (!visibleGrids.includes(gridRef)) {
                unloadTile(gridRef);
            }
        });
    } catch (error) {
        console.error('Error in checkVisibleTiles:', error);
    }
}

function updateFilters() {
    const income200kCategories = document.getElementById('income200k-categories');
    const income250kCategories = document.getElementById('income250k-categories');
    const income500kCategories = document.getElementById('income500k-categories');

    filters = {
        '500k': {
            enabled: document.getElementById('income500k-parent').checked,
            categories: {},
            colors: Array.from(income500kCategories.querySelectorAll('.color-box')).map(box => {
                const color = window.getComputedStyle(box).backgroundColor;
                // Remove any existing opacity
                return color.replace(/rgba?\(([^)]+)\)/, (_, p1) => {
                    const parts = p1.split(',').map(p => p.trim());
                    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
                });
            })
        },
        '250k': {
            enabled: document.getElementById('income250k-parent').checked,
            categories: {},
            colors: Array.from(income250kCategories.querySelectorAll('.color-box')).map(box => box.style.backgroundColor)
        },
        '200k': {
            enabled: document.getElementById('income200k-parent').checked,
            categories: {},
            colors: Array.from(document.getElementById('income200k-categories').querySelectorAll('.color-box')).map(box => box.style.backgroundColor)
        },
        '150k': {
            enabled: document.getElementById('income150k-parent').checked,
            categories: {},
            colors: Array.from(document.getElementById('income150k-categories').querySelectorAll('.color-box')).map(box => box.style.backgroundColor)
        }
    };

    // Update category states
    ['500k', '250k', '200k', '150k'].forEach(level => {
        const categories = document.getElementById(`income${level}-categories`);
        categories.querySelectorAll('.category-item').forEach((item, index) => {
            const checkbox = item.querySelector('.category-checkbox');
            const label = item.querySelector('.category-label').textContent;
            filters[level].categories[label] = checkbox.checked;
        });
    });
}

function updateLayerColors(map, sourceId, layerId) {
    try {
        // Helper function to safely get element state
        const getElementState = (id) => {
            const element = document.getElementById(id);
            return element ? element.checked : false;
        };

        // Helper function to safely get color boxes
        const getColorBoxes = (id) => {
            const container = document.getElementById(id);
            return container ? Array.from(container.querySelectorAll('.color-box'))
                .map(box => window.getComputedStyle(box).backgroundColor) : [];
        };

        // Get current filter states and colors
        const filters = {
            '500k': {
                enabled: getElementState('income500k-parent'),
                colors: getColorBoxes('income500k-categories')
            },
            '250k': {
                enabled: getElementState('income250k-parent'),
                colors: getColorBoxes('income250k-categories')
            },
            '200k': {
                enabled: getElementState('income200k-parent'),
                colors: getColorBoxes('income200k-categories')
            },
            '150k': {
                enabled: getElementState('income150k-parent'),
                colors: getColorBoxes('income150k-categories')
            }
        };

        // Ensure we have colors for each level before proceeding
        if (!filters['500k'].colors.length || !filters['250k'].colors.length || !filters['200k'].colors.length || !filters['150k'].colors.length) {
            console.warn('Some color elements not found, using fallback colors');
            const fallbackColors = ['rgba(255,0,0,0.8)', 'rgba(255,165,0,0.8)', 'rgba(255,255,0,0.8)', 
                                  'rgba(0,255,0,0.8)', 'rgba(0,0,255,0.8)'];
            if (!filters['500k'].colors.length) filters['500k'].colors = fallbackColors;
            if (!filters['250k'].colors.length) filters['250k'].colors = fallbackColors;
            if (!filters['200k'].colors.length) filters['200k'].colors = fallbackColors;
            if (!filters['150k'].colors.length) filters['150k'].colors = fallbackColors;
        }

        // Set up color expression for solid colors
        const colorExpression = [
            'case',
            // If 500k is enabled and has >500 kids
            ['all',
                ['boolean', filters['500k'].enabled],
                ['>', ['get', 'kids_500k'], 500]
            ],
            ['step', 
                ['get', 'kids_500k'],
                'rgba(0, 0, 0, 0)',
                500, filters['500k'].colors[4],
                750, filters['500k'].colors[3],
                1000, filters['500k'].colors[2],
                1250, filters['500k'].colors[1],
                1500, filters['500k'].colors[0]
            ],
            // If 250k is enabled and has >500 kids
            ['all',
                ['boolean', filters['250k'].enabled],
                ['>', ['get', 'kids_250k'], 500]
            ],
            ['step', 
                ['get', 'kids_250k'],
                'rgba(0, 0, 0, 0)',
                500, filters['250k'].colors[4],
                750, filters['250k'].colors[3],
                1000, filters['250k'].colors[2],
                1250, filters['250k'].colors[1],
                1500, filters['250k'].colors[0]
            ],
            // If 200k is enabled and has >500 kids
            ['all',
                ['boolean', filters['200k'].enabled],
                ['>', ['get', 'kids_200k'], 500]
            ],
            ['step', 
                ['get', 'kids_200k'],
                'rgba(0, 0, 0, 0)',
                500, filters['200k'].colors[4],
                750, filters['200k'].colors[3],
                1000, filters['200k'].colors[2],
                1250, filters['200k'].colors[1],
                1500, filters['200k'].colors[0]
            ],
            // If 150k is enabled and has >500 kids
            ['all',
                ['boolean', filters['150k'].enabled],
                ['>', ['get', 'kids_150k'], 500]
            ],
            ['step', 
                ['get', 'kids_150k'],
                'rgba(0, 0, 0, 0)',
                500, filters['150k'].colors[4],
                750, filters['150k'].colors[3],
                1000, filters['150k'].colors[2],
                1250, filters['150k'].colors[1],
                1500, filters['150k'].colors[0]
            ],
            // Default: transparent
            'rgba(0, 0, 0, 0)'
        ];

        // Update the layer properties
        if (map.getLayer(layerId)) {
            // Update main layer colors
            map.setPaintProperty(layerId, 'fill-color', colorExpression);
        } else {
            console.warn(`Layer ${layerId} not found`);
        }
    } catch (error) {
        console.error('Error in updateLayerColors:', error);
    }
}

// Check if a grid's bounds intersect with the viewport bounds
function isGridVisible(gridBounds, viewportBounds) {
    if (!gridBounds || !viewportBounds) return false;
    
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

        // Set up collapse functionality
        document.querySelectorAll('.income-header').forEach(header => {
            // Prevent checkbox clicks from triggering collapse
            header.querySelector('input[type="checkbox"]').addEventListener('click', (e) => {
                e.stopPropagation();
            });

            header.addEventListener('click', (e) => {
                // Don't collapse if clicking the checkbox
                if (e.target.type === 'checkbox') return;
                
                const categories = header.nextElementSibling;
                header.classList.toggle('collapsed');
                categories.classList.toggle('collapsed');
            });
        });
    });
}
