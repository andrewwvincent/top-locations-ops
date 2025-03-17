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

        // Create pin preview that matches the map shape
        const pinPreview = document.createElement('span');
        pinPreview.className = 'pin-preview';
        const isSquare = layer.defaultShape === 'square' || Object.values(layer.styles || {}).includes('square');
        pinPreview.style.cssText = `
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: ${isSquare ? '2px' : '50%'};
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
                    const styleUrl = placemark.getElementsByTagName('styleUrl')[0]?.textContent || '';
                    
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
                            description: cleanDescription,
                            styleUrl: styleUrl
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

                // Add layer for points based on shape type
                const layerId = `layer-${layer.id}`;
                
                // Get the shape type for this feature based on styleUrl
                const getShapeType = (feature) => {
                    const styleUrl = feature.properties.styleUrl;
                    return layer.styles[styleUrl] || layer.defaultShape || 'circle';
                };

                // Group features by shape type
                const featuresByShape = features.reduce((acc, feature) => {
                    const shape = getShapeType(feature);
                    if (!acc[shape]) {
                        acc[shape] = [];
                    }
                    acc[shape].push(feature);
                    return acc;
                }, {});

                // Create a layer for each shape type
                Object.entries(featuresByShape).forEach(([shape, shapeFeatures], index) => {
                    const shapeLayerId = `${layerId}-${shape}`;
                    const shapeSource = `${sourceId}-${shape}`;

                    // Add source for this shape type
                    map.addSource(shapeSource, {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: shapeFeatures
                        }
                    });

                    // Create icons for different shapes if they don't exist
                    const createShapeIcon = (shape, color) => {
                        const iconId = `${shape}-${color.replace('#', '')}`;
                        if (map.hasImage(iconId)) return iconId;

                        const size = 100; // Base size for the icon
                        const canvas = document.createElement('canvas');
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        const center = size / 2;
                        const padding = 2;

                        // Clear the canvas
                        ctx.clearRect(0, 0, size, size);

                        // Set up common styles
                        ctx.fillStyle = color;
                        ctx.strokeStyle = '#000000';
                        ctx.lineWidth = 2;

                        switch (shape) {
                            case 'square':
                                // Draw square
                                ctx.fillRect(padding, padding, size - 2 * padding, size - 2 * padding);
                                ctx.strokeRect(padding, padding, size - 2 * padding, size - 2 * padding);
                                break;

                            case 'star':
                                // Draw 5-pointed star
                                const outerRadius = size / 2 - padding;
                                const innerRadius = outerRadius * 0.4;
                                ctx.beginPath();
                                for (let i = 0; i < 10; i++) {
                                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                                    const angle = (i * Math.PI) / 5 - Math.PI / 2;
                                    const x = center + radius * Math.cos(angle);
                                    const y = center + radius * Math.sin(angle);
                                    if (i === 0) ctx.moveTo(x, y);
                                    else ctx.lineTo(x, y);
                                }
                                ctx.closePath();
                                ctx.fill();
                                ctx.stroke();
                                break;

                            case 'triangle':
                                // Draw equilateral triangle
                                const height = size - 2 * padding;
                                const side = height * 2 / Math.sqrt(3);
                                const top = padding;
                                const bottom = size - padding;
                                const middle = size / 2;
                                
                                ctx.beginPath();
                                ctx.moveTo(middle, top); // Top point
                                ctx.lineTo(middle + side/2, bottom); // Bottom right
                                ctx.lineTo(middle - side/2, bottom); // Bottom left
                                ctx.closePath();
                                ctx.fill();
                                ctx.stroke();
                                break;

                            case 'circle':
                            default:
                                // Draw circle
                                ctx.beginPath();
                                ctx.arc(center, center, (size - 2 * padding) / 2, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.stroke();
                                break;
                        }

                        map.addImage(iconId, {
                            width: size,
                            height: size,
                            data: ctx.getImageData(0, 0, size, size).data
                        });

                        return iconId;
                    };

                    // Get shape type and create icon
                    const shapeType = getShapeType(shapeFeatures[0]);
                    const iconId = createShapeIcon(shapeType, layer.color);
                    const defaultSize = config.defaultShapeSizes[shapeType] || 8;

                    // Add symbol layer for the shape
                    map.addLayer({
                        id: shapeLayerId,
                        type: 'symbol',
                        source: shapeSource,
                        layout: {
                            'symbol-placement': 'point',
                            'icon-image': iconId,
                            'icon-size': defaultSize / 50, // Adjust size based on default
                            'icon-allow-overlap': true
                        },
                        paint: {
                            'icon-opacity': 1 // No transparency
                        }
                    });

                    // Add hover state
                    let currentFeature = null;
                    let isHovering = false;

                    map.on('mouseenter', shapeLayerId, (e) => {
                        isHovering = true;
                        const features = map.queryRenderedFeatures(e.point, { layers: [shapeLayerId] });
                        if (!features.length) return;

                        map.getCanvas().style.cursor = 'pointer';
                        // No opacity change on hover since we want full opacity always

                        currentFeature = features[0];
                        updatePopup(currentFeature);
                    });

                    map.on('mouseleave', shapeLayerId, () => {
                        isHovering = false;
                        map.getCanvas().style.cursor = '';
                        popup.remove();
                    });
                });
            })
            .catch(error => {
                console.error(`Error loading KML file for ${layer.id}:`, error);
            });
    });
}

// Toggle layer visibility
function toggleLocationLayer(layerId) {
    const shapes = ['circle', 'square', 'star', 'triangle'];
    shapes.forEach(shape => {
        const shapeLayerId = `layer-${layerId}-${shape}`;
        if (map.getLayer(shapeLayerId)) {
            const visibility = map.getLayoutProperty(shapeLayerId, 'visibility');
            const newVisibility = visibility === 'visible' ? 'none' : 'visible';
            map.setLayoutProperty(shapeLayerId, 'visibility', newVisibility);
        }
    });
}

// Helper function to update popup
function updatePopup(feature) {
    if (!feature) return;
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

    // Ensure the popup is added only once
    if (!popup.isOpen()) {
        popup.setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
    } else {
        popup.setLngLat(coordinates)
            .setHTML(popupContent);
    }
}
