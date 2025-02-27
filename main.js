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
    ? 'dynamic-microschool-heatmaps'  // GitHub Pages path (no leading slash)
    : ''; // Local development path

// Default colors for buckets
const defaultColors = [
    'rgba(255, 59, 59, 0.4)',   // Red
    'rgba(255, 149, 5, 0.4)',   // Orange
    'rgba(255, 215, 0, 0.4)',   // Yellow
    'rgba(76, 187, 23, 0.4)',   // Green
    'rgba(0, 102, 204, 0.4)',   // Blue
    'rgba(102, 0, 153, 0.4)'    // Purple
];

// Default bucket ranges
const defaultBucketRanges = [
    { min: 1500, max: Infinity, label: '1500+', enabled: true },
    { min: 1250, max: 1500, label: '1250-1500', enabled: true },
    { min: 1000, max: 1250, label: '1000-1250', enabled: true },
    { min: 750, max: 1000, label: '750-1000', enabled: true },
    { min: 500, max: 750, label: '500-750', enabled: true },
    { min: 0, max: 500, label: '0-500', enabled: false }
];

// Load metadata and initialize tile loading
async function loadMetadata() {
    try {
        const response = await fetch(`${BASE_URL ? `/${BASE_URL}` : ''}/data/wealth_tiles/metadata.json`);
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
    let loadedAny = false;
    
    // Get enabled filters first
    const enabledFilters = new Set();
    const parent250k = document.querySelector('#income250k-parent');
    const parent500k = document.querySelector('#income500k-parent');
    
    if (parent250k?.checked) enabledFilters.add('250k');
    if (parent500k?.checked) enabledFilters.add('500k');

    try {
        // First load enabled filters
        for (const income of Array.from(enabledFilters)) {
            const sourceId = `source-${income}-${gridRef}`;
            const layerId = `layer-${income}-${gridRef}`;

            if (map.getSource(sourceId)) {
                loadedAny = true;
                continue;
            }

            try {
                const response = await fetch(`${BASE_URL ? `/${BASE_URL}` : ''}/data/wealth_tiles/${income}/${gridRef}.geojson`);
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
                    
                    loadedAny = true;
                }
            } catch (error) {
                console.error(`Error loading tile ${gridRef} for ${income}: ${error}`);
            }
        }

        // Then load disabled filters
        for (const income of ['250k', '500k']) {
            if (enabledFilters.has(income)) continue;

            const sourceId = `source-${income}-${gridRef}`;
            const layerId = `layer-${income}-${gridRef}`;

            if (map.getSource(sourceId)) {
                loadedAny = true;
                continue;
            }

            try {
                const response = await fetch(`${BASE_URL ? `/${BASE_URL}` : ''}/data/wealth_tiles/${income}/${gridRef}.geojson`);
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
                    
                    loadedAny = true;
                }
            } catch (error) {
                console.error(`Error loading tile ${gridRef} for ${income}: ${error}`);
            }
        }

        // Apply filters and update state
        if (loadedAny) {
            loadedTiles.add(gridRef);
            validateAndApplyFilters();
        }
    } finally {
        // Always clean up loading state
        loadingTiles.delete(gridRef);
        tileLoadStartTimes.delete(gridRef);
    }
}

// Check which tiles need to be loaded based on viewport
function checkVisibleTiles() {
    if (!metadata || !map) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const newVisibleTiles = new Set();
    
    // Only load tiles when zoomed in enough
    if (zoom < 6) {
        cleanupInvisibleTiles(newVisibleTiles);
        return;
    }

    // Check for stuck tiles first
    for (const gridRef of loadingTiles) {
        const startTime = tileLoadStartTimes.get(gridRef);
        if (startTime && (Date.now() - startTime) > TILE_LOAD_TIMEOUT) {
            console.log(`Found stuck tile ${gridRef}, clearing state...`);
            loadingTiles.delete(gridRef);
            tileLoadStartTimes.delete(gridRef);
        }
    }

    // Check each grid's bounds against the viewport
    for (const [gridRef, info] of Object.entries(metadata.grids)) {
        const gridBounds = info.bounds;
        
        // Check if grid intersects with viewport
        if (bounds.getWest() <= gridBounds.max_lon && 
            bounds.getEast() >= gridBounds.min_lon &&
            bounds.getSouth() <= gridBounds.max_lat && 
            bounds.getNorth() >= gridBounds.min_lat) {
            
            newVisibleTiles.add(gridRef);
            
            // Load tile if not already loaded or stuck
            if (!loadedTiles.has(gridRef)) {
                loadTile(gridRef);
            }
        }
    }

    // Cleanup tiles that are no longer visible
    cleanupInvisibleTiles(newVisibleTiles);
    visibleTiles = newVisibleTiles;
}

// Cleanup tiles that are no longer visible
function cleanupInvisibleTiles(newVisibleTiles) {
    // Find tiles that are loaded but no longer visible
    for (const gridRef of loadedTiles) {
        if (!newVisibleTiles.has(gridRef)) {
            // Remove both income levels
            for (const income of ['250k', '500k']) {
                const sourceId = `source-${income}-${gridRef}`;
                const layerId = `layer-${income}-${gridRef}`;

                try {
                    // Remove layer first if it exists
                    if (map.getLayer(layerId)) {
                        map.removeLayer(layerId);
                    }
                    // Then remove source if it exists
                    if (map.getSource(sourceId)) {
                        map.removeSource(sourceId);
                    }
                } catch (error) {
                    console.error(`Error cleaning up tile ${gridRef} for ${income}: ${error}`);
                }
            }
            loadedTiles.delete(gridRef);
        }
    }
    
    // Update visible tiles set
    visibleTiles = newVisibleTiles;
}

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
            initializeUI();
            checkVisibleTiles();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    });
}

// Initialize all UI components
function initializeUI() {
    // Handle clicks on income headers
    document.querySelectorAll('.income-header').forEach(header => {
        header.addEventListener('click', (event) => {
            // Don't trigger if clicking the checkbox
            if (event.target.type === 'checkbox') return;
            
            const categories = header.nextElementSibling;
            categories.style.display = categories.style.display === 'none' ? 'block' : 'none';
        });
    });

    // Handle parent checkbox changes
    document.querySelectorAll('.parent-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const group = event.target.closest('.income-group');
            const categoryCheckboxes = group.querySelectorAll('.category-checkbox');
            categoryCheckboxes.forEach(child => child.checked = event.target.checked);
            validateAndApplyFilters();
        });
    });

    // Handle category checkbox changes
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', validateAndApplyFilters);
    });

    // Handle collapse button
    const collapseBtn = document.getElementById('collapse-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (collapseBtn && sidebar) {
        collapseBtn.addEventListener('click', () => {
            sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Initialize filters
    filters = initializeFilterStates();
    validateAndApplyFilters();
}

// Initialize filter states
function initializeFilterStates() {
    return {
        '500k': {
            enabled: true,
            categories: {
                '500-1000': true,
                '1000-2000': true,
                '2000plus': true
            }
        },
        '250k': {
            enabled: true,
            categories: {
                '500-1000': true,
                '1000-2000': true,
                '2000plus': true
            }
        }
    };
}

// Validate and apply filters
function validateAndApplyFilters() {
    // Get parent checkboxes
    const parent250k = document.querySelector('#income250k-parent');
    const parent500k = document.querySelector('#income500k-parent');

    // Build filters for both income levels
    const filters = {
        income250k: [],
        income500k: []
    };

    // Only collect 250k filters if parent is checked
    if (parent250k && parent250k.checked) {
        const categories = document.querySelectorAll('#income250k-categories .category-item');
        categories.forEach(category => {
            const checkbox = category.querySelector('.category-checkbox');
            if (checkbox && checkbox.checked) {
                const colorBox = category.querySelector('.color-box');
                const minInput = category.querySelector('.range-min');
                const maxInput = category.querySelector('.range-max');
                
                if (colorBox) {
                    filters.income250k.push({
                        min: parseInt(minInput?.value) || 0,
                        max: maxInput?.value ? parseInt(maxInput.value) : 999999,
                        color: colorBox.style.backgroundColor,
                        enabled: true
                    });
                }
            }
        });
    }

    // Only collect 500k filters if parent is checked
    if (parent500k && parent500k.checked) {
        const categories = document.querySelectorAll('#income500k-categories .category-item');
        categories.forEach(category => {
            const checkbox = category.querySelector('.category-checkbox');
            if (checkbox && checkbox.checked) {
                const colorBox = category.querySelector('.color-box');
                const minInput = category.querySelector('.range-min');
                const maxInput = category.querySelector('.range-max');
                
                if (colorBox) {
                    filters.income500k.push({
                        min: parseInt(minInput?.value) || 0,
                        max: maxInput?.value ? parseInt(maxInput.value) : 999999,
                        color: colorBox.style.backgroundColor,
                        enabled: true
                    });
                }
            }
        });
    }

    applyFiltersToMap(filters);
}

// Apply filters to visible tiles
function applyFiltersToMap(filters) {
    if (!filters) {
        console.error('No filters defined');
        return;
    }

    // Get all loaded tile layers
    loadedTiles.forEach(gridRef => {
        ['250k', '500k'].forEach(income => {
            const layerId = `layer-${income}-${gridRef}`;
            
            if (map.getLayer(layerId)) {
                let filterExpressions = [];
                const incomeFilters = filters[`income${income}`];
                
                // Only create color expressions if we have enabled filters
                if (incomeFilters && incomeFilters.length > 0) {
                    let colorExpressions = ['step', ['get', `kids_${income}`], 'rgba(0, 0, 0, 0)'];
                    
                    // Sort filters by min value
                    const sortedFilters = [...incomeFilters].sort((a, b) => a.min - b.min);
                    
                    sortedFilters.forEach(f => {
                        if (f.enabled) {
                            // Add filter expression
                            filterExpressions.push([
                                'all',
                                ['>=', ['get', `kids_${income}`], f.min],
                                ['<=', ['get', `kids_${income}`], f.max]
                            ]);

                            // Add color step
                            colorExpressions.push(f.min);
                            colorExpressions.push(f.color);
                        }
                    });

                    // Only set color property if we have filters
                    map.setPaintProperty(layerId, 'fill-color', colorExpressions);
                } else {
                    // If no filters, set transparent color
                    map.setPaintProperty(layerId, 'fill-color', 'rgba(0, 0, 0, 0)');
                }

                // Combine all filter expressions with OR
                const finalFilter = filterExpressions.length > 0 
                    ? ['any', ...filterExpressions]
                    : ['==', ['get', `kids_${income}`], -1]; // No match if no filters enabled

                // Apply the filters to the layer
                map.setFilter(layerId, finalFilter);
                map.setPaintProperty(layerId, 'fill-opacity', 0.8);
            }
        });
    });
}

// Document ready handler
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeMap();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
});
