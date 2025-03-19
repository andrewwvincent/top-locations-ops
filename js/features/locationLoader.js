// Import config
import { config } from '../../config.js';

let map; // Will be initialized from main script
let popup; // Global popup for hover states
let activeStatusFilters = new Set(['#Location', '#Active', '#No-Contract', '#Negotiations']); // Track active status filters

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
    createStatusFilters();
    loadLocationLayers();
}

// Create location filters in HTML
function createLocationFilters() {
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
        checkbox.checked = true; // Always checked by default
        checkbox.addEventListener('change', () => toggleLocationLayer(layer.id));

        // Create shape preview using SVG
        const shapeContainer = document.createElement('span');
        shapeContainer.style.cssText = `
            display: inline-flex;
            align-items: center;
            margin-right: 6px;
            vertical-align: middle;
        `;

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.style.display = 'block';

        let shapePath;
        if (layer.defaultShape === 'circle') {
            shapePath = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            shapePath.setAttribute('cx', '8');
            shapePath.setAttribute('cy', '8');
            shapePath.setAttribute('r', '6');
        } else if (layer.defaultShape === 'square') {
            shapePath = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shapePath.setAttribute('x', '2');
            shapePath.setAttribute('y', '2');
            shapePath.setAttribute('width', '12');
            shapePath.setAttribute('height', '12');
        } else if (layer.defaultShape === 'star') {
            shapePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const starPoints = [];
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = 8 + 6 * Math.cos(angle);
                const y = 8 + 6 * Math.sin(angle);
                const innerAngle = angle + Math.PI / 5;
                const innerX = 8 + 2.5 * Math.cos(innerAngle);
                const innerY = 8 + 2.5 * Math.sin(innerAngle);
                if (i === 0) {
                    starPoints.push(`M ${x} ${y}`);
                } else {
                    starPoints.push(`L ${x} ${y}`);
                }
                starPoints.push(`L ${innerX} ${innerY}`);
            }
            starPoints.push('Z');
            shapePath.setAttribute('d', starPoints.join(' '));
        } else if (layer.defaultShape === 'triangle') {
            shapePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            shapePath.setAttribute('d', 'M 8 2 L 14 14 L 2 14 Z');
        }

        shapePath.setAttribute('fill', '#888888'); // Use a neutral gray for shape preview
        shapePath.setAttribute('stroke', '#000');
        shapePath.setAttribute('stroke-width', '2');

        svg.appendChild(shapePath);
        shapeContainer.appendChild(svg);

        const label = document.createElement('label');
        label.htmlFor = `location-${layer.id}`;
        label.textContent = layer.name;
        label.style.verticalAlign = 'middle';

        filterContainer.appendChild(checkbox);
        filterContainer.appendChild(shapeContainer);
        filterContainer.appendChild(label);
        locationFilters.appendChild(filterContainer);
    });

    locationSection.appendChild(locationFilters);
    filterForm.appendChild(locationSection);
}

// Create status filters in HTML
function createStatusFilters() {
    const filterForm = document.getElementById('filter-form');

    // Create status filters section
    const statusSection = document.createElement('div');
    statusSection.className = 'status-controls';
    statusSection.innerHTML = '<h3>Status Filters</h3>';

    // Create container for status filters with grey background
    const statusFilters = document.createElement('div');
    statusFilters.className = 'status-filters';
    statusFilters.style.cssText = `
        background-color: #f8f8f8;
        border-radius: 4px;
        padding: 10px;
    `;

    // Define status types and their labels
    const statusTypes = [
        { id: 'Active', label: 'Active Location' },
        { id: 'Negotiations', label: 'In Discussions' },
        { id: 'Location', label: 'Potential Partner' },
        { id: 'No-Contract', label: 'Partnership Rejected' }
    ];

    // Create filters for each status type
    statusTypes.forEach(status => {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'status-filter';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `status-${status.id}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => toggleStatusFilter(status.id, e.target.checked));

        // Create color preview box
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
            display: inline-block;
            width: 12px;
            height: 12px;
            background-color: ${config.statusColors['#' + status.id]};
            border: 1px solid #000000;
            margin-right: 6px;
            vertical-align: middle;
        `;

        const label = document.createElement('label');
        label.htmlFor = `status-${status.id}`;
        label.textContent = status.label;
        label.style.verticalAlign = 'middle';

        filterContainer.appendChild(checkbox);
        filterContainer.appendChild(colorBox);
        filterContainer.appendChild(label);
        statusFilters.appendChild(filterContainer);
    });

    statusSection.appendChild(statusFilters);
    filterForm.appendChild(statusSection);
}

// Toggle status filter
function toggleStatusFilter(statusId, isVisible) {
    const styleUrl = `#${statusId}`;
    if (isVisible) {
        activeStatusFilters.add(styleUrl);
    } else {
        activeStatusFilters.delete(styleUrl);
    }

    // Update visibility for all layers
    config.locationLayers.forEach(layer => {
        const layerId = `layer-${layer.id}`;
        if (map.getLayer(layerId)) {
            const locationEnabled = document.getElementById(`location-${layer.id}`).checked;
            const visibility = locationEnabled ? 'visible' : 'none';
            map.setLayoutProperty(layerId, 'visibility', visibility);

            if (visibility === 'visible') {
                // Filter features based on active status filters
                const filter = ['in', ['get', 'styleUrl'], ['literal', Array.from(activeStatusFilters)]];
                map.setFilter(layerId, filter);
            }
        }
    });
}

// Toggle location layer
function toggleLocationLayer(layerId) {
    const fullLayerId = `layer-${layerId}`;
    if (map.getLayer(fullLayerId)) {
        const isVisible = document.getElementById(`location-${layerId}`).checked;
        map.setLayoutProperty(fullLayerId, 'visibility', isVisible ? 'visible' : 'none');
        
        if (isVisible) {
            // Re-apply status filters when showing layer
            const filter = ['in', ['get', 'styleUrl'], ['literal', Array.from(activeStatusFilters)]];
            map.setFilter(fullLayerId, filter);
        }
    }
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

                // Add layer for points
                const layerId = `layer-${layer.id}`;

                // Create icons for each status color
                Object.entries(config.statusColors).forEach(([status, color]) => {
                    // Create icon with the status color and shape
                    // Remove the '#' from status since KML uses styleUrl format: <styleUrl>#Location</styleUrl>
                    const statusId = status.slice(1);
                    const iconId = `${layer.defaultShape}-${statusId}`;
                    if (!map.hasImage(iconId)) {
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
                        ctx.fillStyle = color; // Use the status color
                        ctx.strokeStyle = '#000000';
                        ctx.lineWidth = (layer.defaultShape === 'star' || layer.defaultShape === 'triangle') ? 3 : 2;

                        switch (layer.defaultShape) {
                            case 'square':
                                ctx.fillRect(padding, padding, size - 2 * padding, size - 2 * padding);
                                ctx.strokeRect(padding, padding, size - 2 * padding, size - 2 * padding);
                                break;

                            case 'star':
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
                                const height = size - 2 * padding;
                                const side = height * 2 / Math.sqrt(3);
                                const top = padding;
                                const bottom = size - padding;
                                const middle = size / 2;
                                
                                ctx.beginPath();
                                ctx.moveTo(middle, top);
                                ctx.lineTo(middle + side/2, bottom);
                                ctx.lineTo(middle - side/2, bottom);
                                ctx.closePath();
                                ctx.fill();
                                ctx.stroke();
                                break;

                            case 'circle':
                            default:
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
                    }
                });

                // Add symbol layer for the points
                map.addLayer({
                    id: layerId,
                    type: 'symbol',
                    source: sourceId,
                    layout: {
                        'symbol-placement': 'point',
                        'icon-image': [
                            'concat',
                            layer.defaultShape,
                            '-',
                            // Remove the '#' from styleUrl since our icons are named without it
                            ['slice', ['get', 'styleUrl'], 1]
                        ],
                        'icon-size': config.defaultShapeSizes[layer.defaultShape] / 50,
                        'icon-allow-overlap': true
                    },
                    filter: ['in', ['get', 'styleUrl'], ['literal', Array.from(activeStatusFilters)]]
                });

                // Add hover effect
                map.on('mouseenter', layerId, (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    if (e.features.length > 0) {
                        updatePopup(e.features[0]);
                    }
                });

                map.on('mouseleave', layerId, () => {
                    map.getCanvas().style.cursor = '';
                    popup.remove();
                });
            })
            .catch(error => console.error(`Error loading KML for ${layer.id}:`, error));
    });
}

// Helper function to update popup
function updatePopup(feature) {
    const coordinates = feature.geometry.coordinates.slice();
    const name = feature.properties.name;
    const description = feature.properties.description;

    // Format popup content
    const content = `
        <div class="popup-content">
            <h4>${name}</h4>
            ${description ? `<p>${description}</p>` : ''}
        </div>
    `;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(coordinates[0]) > 180) {
        coordinates[0] += coordinates[0] > 0 ? -360 : 360;
    }

    popup.setLngLat(coordinates)
        .setHTML(content)
        .addTo(map);
}
