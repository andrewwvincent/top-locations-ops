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
        const response = await fetch('data/wealth_tiles/metadata.json');
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
                const response = await fetch(`/data/wealth_tiles/${income}/${gridRef}.geojson`);
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
                const response = await fetch(`/data/wealth_tiles/${income}/${gridRef}.geojson`);
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
        zoom: 9 // Closer zoom for city view
    });

    // Load metadata and initialize UI once map is ready
    map.on('load', async () => {
        try {
            // Load metadata first
            metadata = await loadMetadata();
            
            // Initialize UI components
            initializeUI();
            
            // Start loading tiles immediately
            checkVisibleTiles();
            
            // Set up map event handlers
            setupMapEventHandlers();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    });
}

// Set up map event handlers
function setupMapEventHandlers() {
    // More responsive move handling - check tiles during movement
    map.on('move', () => {
        if (moveEndTimeout) {
            clearTimeout(moveEndTimeout);
        }
        moveEndTimeout = setTimeout(() => {
            checkVisibleTiles();
        }, 100); // Shorter timeout during movement
    });

    // Final check after movement ends
    map.on('moveend', () => {
        if (moveEndTimeout) {
            clearTimeout(moveEndTimeout);
        }
        checkVisibleTiles();
    });
}

// Initialize geocoder
function initializeGeocoder() {
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false
    });

    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
}

// Initialize city selector
function initializeCitySelector() {
    const citySelect = document.getElementById('city-select');
    if (citySelect) {
        citySelect.addEventListener('change', (e) => {
            loadCity(e.target.value);
        });
    }
}

// Initialize collapse button
function initializeCollapseButton() {
    const collapseBtn = document.getElementById('collapse-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (collapseBtn && sidebar) {
        collapseBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Initialize filter states
function initializeFilterStates() {
    const filters = {
        'income250k': [
            {
                min: 500,
                max: 750,
                enabled: true,
                color: 'rgba(255, 59, 59, 0.4)'
            },
            {
                min: 750,
                max: 1000,
                enabled: true,
                color: 'rgba(255, 165, 0, 0.4)'
            },
            {
                min: 1000,
                max: 2000,
                enabled: true,
                color: 'rgba(0, 120, 255, 0.4)'
            }
        ],
        'income500k': [
            {
                min: 500,
                max: 750,
                enabled: true,
                color: 'rgba(102, 0, 153, 0.8)'
            },
            {
                min: 750,
                max: 1000,
                enabled: true,
                color: 'rgba(255, 0, 255, 0.8)'
            },
            {
                min: 1000,
                max: 2000,
                enabled: true,
                color: 'rgba(255, 215, 0, 0.8)'
            }
        ]
    };

    return filters;
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

// Setup filter event listeners
function setupFilterEventListeners() {
    // Remove existing listeners first
    const filterContainer = document.querySelector('#filter-form');
    const clone = filterContainer.cloneNode(true);
    filterContainer.parentNode.replaceChild(clone, filterContainer);

    // Add new listeners
    clone.addEventListener('change', (event) => {
        // Match both parent and category checkboxes
        if (event.target.matches('.category-checkbox, #income250k-parent, #income500k-parent')) {
            // Clear loading states when filters change
            loadingTiles.clear();
            tileLoadStartTimes.clear();
            validateAndApplyFilters();
            // Recheck tiles after filter change
            checkVisibleTiles();
        }
    });

    clone.addEventListener('input', (event) => {
        if (event.target.matches('.range-min, .range-max')) {
            const debounceTimeout = setTimeout(() => {
                validateAndApplyFilters();
            }, 500);

            // Clean up timeout on next input
            event.target.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
            }, { once: true });
        }
    });
}

// Update UI based on current mode
function updateUIForMode() {
    const highWealthMetrics = document.querySelector('.high-wealth-metrics');
    const allMetricsGroups = document.querySelector('.all-metrics-groups');
    
    if (highWealthMetrics) highWealthMetrics.style.display = 'block';
    if (allMetricsGroups) allMetricsGroups.style.display = 'none';

    // Apply filters after changing mode
    validateAndApplyFilters();
}

// Initialize mode toggle
function initializeModeToggle() {
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.querySelector('.mode-label');
    
    if (modeToggle && modeLabel) {
        // Set initial state
        modeLabel.textContent = 'High-Wealth Mode';
        updateUIForMode();
    }
}

// Update filter ranges
function updateFilterRanges() {
    const ranges = {
        income250k: [],
        income500k: []
    };

    // Collect 250k ranges
    document.querySelectorAll('#income250k-categories .category-item').forEach(category => {
        const minInput = category.querySelector('.range-min');
        const maxInput = category.querySelector('.range-max');
        if (minInput && maxInput) {
            ranges.income250k.push({
                min: parseInt(minInput.value),
                max: maxInput.value ? parseInt(maxInput.value) : Infinity
            });
        }
    });

    // Collect 500k ranges
    document.querySelectorAll('#income500k-categories .category-item').forEach(category => {
        const minInput = category.querySelector('.range-min');
        const maxInput = category.querySelector('.range-max');
        if (minInput && maxInput) {
            ranges.income500k.push({
                min: parseInt(minInput.value),
                max: maxInput.value ? parseInt(maxInput.value) : Infinity
            });
        }
    });

    return ranges;
}

// Reset bucket values
function resetBucketValues() {
    const bucketRows = document.querySelectorAll('.bucket-row');
    
    bucketRows.forEach((row, index) => {
        const minInput = row.querySelector('.range-min');
        const maxInput = row.querySelector('.range-max');
        
        if (minInput && maxInput) {
            minInput.value = defaultBucketRanges[index].min;
            if (defaultBucketRanges[index].max === Infinity) {
                maxInput.value = '';
                maxInput.placeholder = 'No limit';
            } else {
                maxInput.value = defaultBucketRanges[index].max;
            }
        }
    });
    
    updateFilterRanges();
    validateAndApplyFilters();
}

// Setup map interactions
function setupMapInteractions() {
    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add scale control
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 150,
        unit: 'imperial'
    }), 'bottom-right');
}

// Load city list into dropdown
function loadCityList() {
    const citySelect = document.getElementById('city-select');
    if (!citySelect) return;

    // Clear existing options
    citySelect.innerHTML = '<option value="">Select a city...</option>';

    // Add options for each city
    config.polygonLayers.forEach(layer => {
        const option = document.createElement('option');
        option.value = layer.name;
        option.textContent = layer.name;
        citySelect.appendChild(option);
    });

    // Add change event listener
    citySelect.addEventListener('change', (e) => {
        const selectedCity = config.polygonLayers.find(layer => layer.name === e.target.value);
        if (selectedCity && selectedCity.coordinates) {
            map.flyTo({
                center: selectedCity.coordinates,
                zoom: selectedCity.zoom || 10,
                essential: true
            });
        }
    });
}

// Function to zoom to a specific city
function zoomToCity(cityName) {
    const source = map.getSource('all-cities');
    if (!source || !source._data) return;

    // Find all features for the selected city
    const cityFeatures = source._data.features.filter(f => f.properties.city === cityName);
    if (cityFeatures.length === 0) return;

    // Calculate the bounding box for all features in the city
    const bounds = new mapboxgl.LngLatBounds();
    cityFeatures.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach(coord => {
                    bounds.extend(coord);
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                    polygon[0].forEach(coord => {
                        bounds.extend(coord);
                    });
                });
            }
        }
    });

    // Zoom to the city bounds with padding
    map.fitBounds(bounds, {
        padding: 50,
        duration: 1000
    });
}

// Load city data and zoom to it
function loadCity(cityName) {
    if (!cityName) return;
    
    currentCity = cityName;
    zoomToCity(cityName);
    
    // Update URL parameters
    const url = new URL(window.location);
    url.searchParams.set('city', cityName);
    window.history.pushState({}, '', url);
}

// Create marker shapes
function createMarkerElement(layer) {
    const el = document.createElement('div');
    el.className = `location-marker ${layer.id}`;
    
    const size = layer.size || 16; // Default size if not specified
    
    // Common styles
    el.style.cursor = 'pointer';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.border = '2px solid black';
    el.style.backgroundColor = layer.color;
    
    switch (layer.shape) {
        case 'square':
            // Square is default
            break;
            
        case 'triangle':
            el.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
            break;
            
        case 'star':
            el.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            break;
            
        case 'circle':
        default:
            el.style.borderRadius = '50%';
            break;
    }
    
    return el;
}

// Load KML location data
async function loadLocationData() {
    // Clear existing markers
    if (window.locationMarkers) {
        window.locationMarkers.forEach(marker => marker.remove());
    }
    window.locationMarkers = [];

    for (const layer of config.locationLayers) {
        try {
            // Load and parse KML
            const response = await fetch(layer.file);
            const kmlText = await response.text();
            const kml = new DOMParser().parseFromString(kmlText, 'text/xml');
            const placemarks = kml.getElementsByTagName('Placemark');

            // Process each placemark
            Array.from(placemarks).forEach(placemark => {
                const pointElem = placemark.getElementsByTagName('Point')[0];
                if (!pointElem) return;
                
                const coordsElem = pointElem.getElementsByTagName('coordinates')[0];
                if (!coordsElem) return;
                
                const coords = coordsElem.textContent.trim().split(',');
                if (coords.length < 2) return;

                // Get name and description - try both 'name' and 'n' tags
                const nameElem = placemark.getElementsByTagName('name')[0] || placemark.getElementsByTagName('n')[0];
                const name = nameElem ? nameElem.textContent.trim() : '';

                // Get description
                const descElem = placemark.getElementsByTagName('description')[0];
                const description = descElem ? descElem.textContent.trim() : '';

                // Create marker with specified shape
                const el = createMarkerElement(layer);

                // Create marker
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([parseFloat(coords[0]), parseFloat(coords[1])])
                    .addTo(map);

                // Add popup if name exists
                if (name || description) {
                    const popupContent = name + (description ? `\n${description}` : '');
                    const popup = new mapboxgl.Popup({
                        closeButton: false,
                        closeOnClick: false
                    }).setText(popupContent);

                    marker.setPopup(popup);

                    // Show popup on hover
                    el.addEventListener('mouseenter', () => popup.addTo(map));
                    el.addEventListener('mouseleave', () => popup.remove());
                }

                // Store marker reference
                window.locationMarkers.push(marker);
                marker.layerId = layer.id;
                marker.getElement().style.display = layer.defaultChecked ? 'block' : 'none';
            });

        } catch (error) {
            console.error(`Error loading location data for ${layer.id}:`, error);
        }
    }
}

// Initialize location filters
function initializeLocationFilters() {
    const filterContainer = document.getElementById('location-filters');
    
    config.locationLayers.forEach(layer => {
        const row = document.createElement('div');
        row.className = 'filter-row';
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = layer.id;
        checkbox.checked = layer.defaultChecked;
        
        // Create label
        const label = document.createElement('label');
        label.htmlFor = layer.id;
        label.textContent = layer.name;
        
        // Add event listener
        checkbox.addEventListener('change', (e) => {
            const visibility = e.target.checked ? 'block' : 'none';
            // Update marker visibility
            window.locationMarkers
                .filter(marker => marker.layerId === layer.id)
                .forEach(marker => {
                    marker.getElement().style.display = visibility;
                });
        });
        
        // Assemble row
        row.appendChild(checkbox);
        row.appendChild(label);
        filterContainer.appendChild(row);
    });
}

// Initialize all UI components
function initializeUI() {
    // Initialize filters first
    filters = initializeFilterStates();
    setupFilterEventListeners();
    
    // Initialize other UI components
    initializeGeocoder();
    initializeCitySelector();
    initializeCollapseButton();
    initializeModeToggle();
    updateUIForMode();
    
    // Initialize map components
    setupMapInteractions();
    loadLocationData();
    initializeLocationFilters();
}

// Document ready handler
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeMap();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
});
