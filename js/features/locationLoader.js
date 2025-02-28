// Import config
import { config } from '../../config.js';

let map; // Will be initialized from main script
let popup; // Global popup for hover states

// Initialize location loader
export function initLocationLoader(mapInstance) {
    map = mapInstance;
    
    // Create popup
    popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 15,
        className: 'location-popup',
        anchor: 'bottom',
        maxWidth: '300px'
    });

    createLocationFilters();
    loadLocationLayers();
}

// Create location filters in HTML
function createLocationFilters() {
    const sidebar = document.querySelector('.sidebar-content');
    const filterForm = document.getElementById('filter-form');

    // Create location filters section
    const locationSection = document.createElement('div');
    locationSection.className = 'location-controls';
    locationSection.innerHTML = '<h3>Location Filters</h3>';

    // Create container for location filters
    const locationFilters = document.createElement('div');
    locationFilters.className = 'location-filters';

    // Create filters for each location layer
    config.locationLayers.forEach(layer => {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'location-filter';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `location-${layer.id}`;
        checkbox.checked = true; // Default to checked
        checkbox.addEventListener('change', () => toggleLocationLayer(layer.id));

        // Create pin preview
        const pinPreview = document.createElement('span');
        pinPreview.className = 'pin-preview';
        pinPreview.style.cssText = `
            display: inline-block;
            width: ${layer.size || 12}px;
            height: ${layer.size || 12}px;
            border-radius: 50%;
            background-color: ${layer.color};
            border: 1.5px solid #000000;
            margin-right: 6px;
            vertical-align: middle;
            box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        `;

        const label = document.createElement('label');
        label.htmlFor = `location-${layer.id}`;
        label.textContent = layer.name;
        label.style.verticalAlign = 'middle';

        filterContainer.appendChild(checkbox);
        filterContainer.appendChild(pinPreview);
        filterContainer.appendChild(label);
        locationFilters.appendChild(filterContainer);
    });

    locationSection.appendChild(locationFilters);
    filterForm.appendChild(locationSection);
}

// Load KML layers
function loadLocationLayers() {
    config.locationLayers.forEach(layer => {
        // Load KML file
        fetch(layer.file)
            .then(response => response.text())
            .then(kmlText => {
                const parser = new DOMParser();
                const kml = parser.parseFromString(kmlText, 'text/xml');
                
                // Extract coordinates and properties from KML
                const placemarks = kml.getElementsByTagName('Placemark');
                const features = Array.from(placemarks).map(placemark => {
                    const coordinates = placemark.getElementsByTagName('coordinates')[0].textContent
                        .trim()
                        .split(',')
                        .map(Number);

                    const nTag = placemark.getElementsByTagName('n')[0];
                    const title = nTag ? nTag.textContent : '';
                    const description = placemark.getElementsByTagName('description')[0]?.textContent || '';
                    
                    // Remove CDATA wrapper if present
                    const cleanDescription = description.replace(/^\[CDATA\[|\]\]$/g, '').trim();

                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [coordinates[0], coordinates[1]]
                        },
                        properties: {
                            name: title,
                            description: cleanDescription
                        }
                    };
                });

                // Create GeoJSON source
                const sourceId = `source-${layer.id}`;
                map.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: features
                    }
                });

                // Add layer for points
                const layerId = `layer-${layer.id}`;
                map.addLayer({
                    id: layerId,
                    type: 'circle',
                    source: sourceId,
                    paint: {
                        'circle-radius': layer.size / 2 || 8,
                        'circle-color': layer.color,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#000000',
                        'circle-radius-transition': {
                            duration: 200
                        },
                        'circle-stroke-width-transition': {
                            duration: 200
                        },
                        'circle-stroke-opacity': 0.8
                    }
                });

                // Add hover state
                map.on('mouseenter', layerId, (e) => {
                    map.setPaintProperty(layerId, 'circle-radius', (layer.size / 2 || 8) + 2);
                    map.setPaintProperty(layerId, 'circle-stroke-width', 2);
                    map.setPaintProperty(layerId, 'circle-stroke-opacity', 1);
                    map.getCanvas().style.cursor = 'pointer';

                    // Show popup for the specific feature being hovered
                    const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
                    if (!features.length) return;

                    const feature = features[0];
                    const coordinates = feature.geometry.coordinates.slice();
                    const name = feature.properties.name;
                    const description = feature.properties.description;

                    // Format popup content with better HTML structure
                    const popupContent = `
                        <div class="location-popup-content">
                            <h3>${name}</h3>
                            ${description ? `<p>${description}</p>` : ''}
                        </div>
                    `;

                    popup.setLngLat(coordinates)
                        .setHTML(popupContent)
                        .addTo(map);
                });

                map.on('mousemove', layerId, (e) => {
                    const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
                    if (!features.length) {
                        popup.remove();
                        return;
                    }

                    const feature = features[0];
                    const coordinates = feature.geometry.coordinates.slice();
                    const name = feature.properties.name;
                    const description = feature.properties.description;

                    // Format popup content with better HTML structure
                    const popupContent = `
                        <div class="location-popup-content">
                            <h3>${name}</h3>
                            ${description ? `<p>${description}</p>` : ''}
                        </div>
                    `;

                    popup.setLngLat(coordinates)
                        .setHTML(popupContent)
                        .addTo(map);
                });

                map.on('mouseleave', layerId, () => {
                    map.setPaintProperty(layerId, 'circle-radius', layer.size / 2 || 8);
                    map.setPaintProperty(layerId, 'circle-stroke-width', 1.5);
                    map.setPaintProperty(layerId, 'circle-stroke-opacity', 0.8);
                    map.getCanvas().style.cursor = '';
                    popup.remove();
                });

                // Add layer for labels if enabled
                if (layer.defaultLabels) {
                    const labelLayerId = `label-${layer.id}`;
                    map.addLayer({
                        id: labelLayerId,
                        type: 'symbol',
                        source: sourceId,
                        layout: {
                            'text-field': ['get', 'name'],
                            'text-offset': [0, 1.5],
                            'text-anchor': 'top',
                            'text-size': 12
                        },
                        paint: {
                            'text-color': '#000000',
                            'text-halo-color': '#FFFFFF',
                            'text-halo-width': 1.5
                        }
                    });
                }
            })
            .catch(error => console.error(`Error loading KML for ${layer.id}:`, error));
    });
}

// Toggle layer visibility
function toggleLocationLayer(layerId) {
    const visibility = document.getElementById(`location-${layerId}`).checked ? 'visible' : 'none';
    map.setLayoutProperty(`layer-${layerId}`, 'visibility', visibility);
    
    // Also toggle label layer if it exists
    if (map.getLayer(`label-${layerId}`)) {
        map.setLayoutProperty(`label-${layerId}`, 'visibility', visibility);
    }
}
