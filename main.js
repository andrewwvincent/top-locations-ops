// Global variables
let map;
let currentCity = null;
let loadedTiles = new Set();
let metadata = null;
let currentlyLoadingTiles = new Set();

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
        const response = await fetch('data/tiles/metadata.json');
        metadata = await response.json();
        console.log('Metadata loaded:', metadata);
    } catch (error) {
        console.error('Error loading metadata:', error);
    }
}

// Load a specific tile
function loadTile(gridRef) {
    const layerId = `layer-${gridRef}`;
    const sourceId = `source-${gridRef}`;

    // Check if tile is already loaded or layer exists
    if (loadedTiles.has(gridRef)) {
        console.log(`Tile ${gridRef} already loaded`);
        return;
    }

    // Check if layer already exists
    if (map.getLayer(layerId)) {
        console.log(`Layer ${layerId} already exists`);
        loadedTiles.add(gridRef); // Mark as loaded since layer exists
        return;
    }

    console.log(`Loading tile ${gridRef}...`);
    
    // Load the GeoJSON for this grid reference
    fetch(`data/tiles/${gridRef}.geojson`)
        .then(response => response.json())
        .then(data => {
            // Remove existing source if it exists
            if (map.getSource(sourceId)) {
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }
                map.removeSource(sourceId);
            }

            // Add the source
            map.addSource(sourceId, {
                type: 'geojson',
                data: data
            });

            // Add a new layer for this tile with no fill or border initially
            map.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': 'rgba(0, 0, 0, 0)',
                    'fill-opacity': 0
                }
            });

            console.log(`Successfully loaded tile ${gridRef}`);
            loadedTiles.add(gridRef);

            // Apply current filters to the new layer
            validateAndApplyFilters();
        })
        .catch(error => {
            console.error(`Error loading tile ${gridRef}:`, error);
            // Clean up any partial state on error
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
            }
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
            }
        });
}

// Check which tiles need to be loaded based on viewport
function checkVisibleTiles() {
    if (!metadata || !map) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
    // Only load tiles when zoomed in enough
    if (zoom < 6) {
        console.log('Zoom level too low for loading tiles');
        return;
    }

    // Check each grid's bounds against the viewport
    for (const [gridRef, info] of Object.entries(metadata.grids)) {
        const gridBounds = info.bounds;
        
        // Check if grid intersects with viewport
        if (bounds.getWest() <= gridBounds.max_lon && 
            bounds.getEast() >= gridBounds.min_lon &&
            bounds.getSouth() <= gridBounds.max_lat && 
            bounds.getNorth() >= gridBounds.min_lat) {
            
            loadTile(gridRef);
        }
    }
}

// Initialize the map
function initializeMap() {
    console.log('Initializing map...');
    mapboxgl.accessToken = config.accessToken;
    
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/basic-v9',
        center: [-98.5795, 39.8283],
        zoom: 7,  // Start zoomed in enough to see tiles
        preserveDrawingBuffer: true
    });

    // Wait for both style and map to be loaded
    map.on('style.load', () => {
        console.log('Style loaded');
    });

    map.on('load', async () => {
        console.log('Map loaded, initializing tile system...');
        await loadMetadata();
        
        // Add move end listener for loading tiles
        map.on('moveend', checkVisibleTiles);
        
        // Initialize other components
        loadLocationData();
        initializeLocationFilters();
        setupFilterEventListeners();
        setupMapInteractions();
    });
}

// Initialize filter states
function initializeFilterStates() {
    // Get parent checkboxes
    const parent250k = document.querySelector('#income250k-parent');
    const parent500k = document.querySelector('#income500k-parent');

    // Set 500k checked, 250k unchecked by default
    if (parent250k) parent250k.checked = false;
    if (parent500k) parent500k.checked = true;

    // Initialize category checkboxes
    document.querySelectorAll('.category-checkbox').forEach((checkbox) => {
        const parentGroup = checkbox.closest('.categories-container');
        const allCheckboxesInGroup = parentGroup.querySelectorAll('.category-checkbox');
        const isLastInGroup = checkbox === allCheckboxesInGroup[allCheckboxesInGroup.length - 1];
        
        // Set all checkboxes to checked except for the last ones in each group (0-500 buckets)
        checkbox.checked = !isLastInGroup;

        // Hide 250k group initially since parent is unchecked
        if (parentGroup.id === 'income250k-categories') {
            parentGroup.style.display = 'none';
        }
    });

    // Apply initial filters
    validateAndApplyFilters();
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
    if (!map) return;
    
    loadedTiles.forEach(gridRef => {
        const layerId = `layer-${gridRef}`;
        if (map.getLayer(layerId)) {
            // Build the Mapbox GL style expressions for the filters
            let filterExpressions = [];
            let colorExpressions = ['case'];
            
            // Add 500k filters first (higher priority)
            filters.income500k.forEach(f => {
                if (f.enabled) {
                    const expression = [
                        'all',
                        ['>=', ['to-number', ['get', 'kids_500k'], 0], f.min],
                        ['<=', ['to-number', ['get', 'kids_500k'], 0], f.max]
                    ];
                    filterExpressions.push(expression);
                    colorExpressions.push(expression);
                    colorExpressions.push(f.color);
                }
            });

            // Add 250k filters second (lower priority)
            filters.income250k.forEach(f => {
                if (f.enabled) {
                    const expression = [
                        'all',
                        ['>=', ['to-number', ['get', 'kids_250k'], 0], f.min],
                        ['<=', ['to-number', ['get', 'kids_250k'], 0], f.max]
                    ];
                    filterExpressions.push(expression);
                    colorExpressions.push(expression);
                    colorExpressions.push(f.color);
                }
            });

            // Add default color at the end
            colorExpressions.push('rgba(0, 0, 0, 0)');

            // Update the layer's filter and color
            if (filterExpressions.length > 0) {
                map.setFilter(layerId, ['any', ...filterExpressions]);
                map.setPaintProperty(layerId, 'fill-color', colorExpressions);
                map.setPaintProperty(layerId, 'fill-opacity', 0.7);
                map.setPaintProperty(layerId, 'fill-outline-color', 'rgba(0, 0, 0, 0)'); // No borders
            } else {
                // If no filters active, hide all features
                map.setFilter(layerId, ['==', ['get', 'kids_500k'], -1]); // Always false condition
                map.setPaintProperty(layerId, 'fill-opacity', 0);
            }
        }
    });
}

// Setup filter event listeners
function setupFilterEventListeners() {
    // Parent checkbox listeners
    const parent250k = document.querySelector('#income250k-parent');
    const parent500k = document.querySelector('#income500k-parent');

    if (parent250k) {
        parent250k.addEventListener('change', () => {
            const group = document.querySelector('#income250k-categories');
            if (group) {
                group.style.display = parent250k.checked ? 'block' : 'none';
                
                // When parent is checked, restore previous child states (except 0-500)
                if (parent250k.checked) {
                    const checkboxes = group.querySelectorAll('.category-checkbox');
                    checkboxes.forEach((checkbox, index) => {
                        // Set all to checked except the last one (0-500)
                        checkbox.checked = (index < checkboxes.length - 1);
                    });
                }
            }
            validateAndApplyFilters();
        });
    }

    if (parent500k) {
        parent500k.addEventListener('change', () => {
            const group = document.querySelector('#income500k-categories');
            if (group) {
                group.style.display = parent500k.checked ? 'block' : 'none';
            }
            validateAndApplyFilters();
        });
    }

    // Category checkbox listeners
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', validateAndApplyFilters);
    });

    // Range input listeners
    document.querySelectorAll('.range-min, .range-max').forEach(input => {
        input.addEventListener('change', () => {
            updateFilterRanges();
            validateAndApplyFilters();
        });
    });
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
                min: parseInt(minInput.value) || 0,
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
                min: parseInt(minInput.value) || 0,
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
    // No interactions needed
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

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    
    // Setup city selection listener
    const citySelect = document.getElementById('city-select');
    if (citySelect) {
        citySelect.addEventListener('change', (e) => {
            loadCity(e.target.value);
        });
    }
});
