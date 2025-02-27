// Core map functionality
export class MapCore {
    constructor(config) {
        this.config = config;
        this.map = null;
        this.geocoder = null;
        this.moveEndTimeout = null;
        this.onTileCheckNeeded = null;  // Callback for when tiles need to be checked

        // Austin, TX coordinates and zoom level
        this.initialView = {
            center: [-97.7431, 30.2672],
            zoom: 10
        };
    }

    initialize() {
        mapboxgl.accessToken = this.config.accessToken;
        
        this.map = new mapboxgl.Map({
            container: 'map',
            style: this.config.style,
            center: this.initialView.center,
            zoom: this.initialView.zoom,
            minZoom: 4,
            maxZoom: 12
        });

        this.initializeControls();
        this.setupEventListeners();

        return this.map;
    }

    initializeControls() {
        // Add navigation control first
        this.map.addControl(new mapboxgl.NavigationControl());

        // Add geocoder control with retry
        const initGeocoder = () => {
            if (typeof MapboxGeocoder !== 'undefined') {
                try {
                    const geocoder = new MapboxGeocoder({
                        accessToken: mapboxgl.accessToken,
                        mapboxgl: mapboxgl,
                        countries: 'us',
                        types: 'place,locality,neighborhood'
                    });
                    this.map.addControl(geocoder);
                } catch (error) {
                    console.error('Error initializing MapboxGeocoder:', error);
                }
            } else {
                // Retry after a short delay
                setTimeout(initGeocoder, 100);
            }
        };

        // Start geocoder initialization
        initGeocoder();
    }

    setupEventListeners() {
        // Handle map movement
        this.map.on('move', () => {
            if (this.moveEndTimeout) {
                clearTimeout(this.moveEndTimeout);
            }
            this.moveEndTimeout = setTimeout(() => {
                if (this.onTileCheckNeeded) {
                    this.onTileCheckNeeded();
                }
            }, 100);
        });

        this.map.on('moveend', () => {
            if (this.moveEndTimeout) {
                clearTimeout(this.moveEndTimeout);
            }
            if (this.onTileCheckNeeded) {
                this.onTileCheckNeeded();
            }
        });
    }

    // Register callback for tile check events
    onTilesNeedCheck(callback) {
        this.onTileCheckNeeded = callback;
    }

    // Layer management methods
    addLayer(layerId, sourceId, data) {
        if (!this.map.getSource(sourceId)) {
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: data
            });
        }

        if (!this.map.getLayer(layerId)) {
            this.map.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': 'rgba(0, 0, 0, 0)',
                    'fill-opacity': 0.8,
                    'fill-outline-color': 'rgba(0, 0, 0, 0.2)'
                }
            });
        }
    }

    removeLayer(layerId, sourceId) {
        try {
            if (this.map.getLayer(layerId)) {
                this.map.removeLayer(layerId);
            }
            if (this.map.getSource(sourceId)) {
                this.map.removeSource(sourceId);
            }
        } catch (error) {
            console.error(`Error removing layer/source: ${error}`);
        }
    }

    // Map state methods
    getBounds() {
        try {
            return this.map.getBounds();
        } catch (error) {
            // Return a default bounds for globe projection or error cases
            return {
                getWest: () => -180,
                getEast: () => 180,
                getSouth: () => -85,
                getNorth: () => 85
            };
        }
    }

    getZoom() {
        return this.map.getZoom();
    }

    isStyleLoaded() {
        return this.map.isStyleLoaded();
    }

    setPaintProperty(layerId, property, value) {
        if (this.map.getLayer(layerId)) {
            this.map.setPaintProperty(layerId, property, value);
        }
    }
}
