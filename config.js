// Map configuration
export const config = {
    style: 'mapbox://styles/mapbox/streets-v12',
    accessToken: 'pk.eyJ1IjoiYW5kcmV3LXZpbmNlbnQiLCJhIjoiY202OW4wNm5yMGlubzJtcTJmMnBxb2x1cSJ9.jrR3Ucv9Nvtc-T_7aKIQCg',
    CSV: '../data/locations.csv',
    center: [-97.7431, 30.2672], // Austin coordinates
    zoom: 7.5, // Moderately zoomed in on Austin
    title: 'Heatmaps - Number of Children from Households above Different Income Levels',
    description: 'Heatmaps of density of children ages 5-14 from households above different income levels in the United States.',
    sideBarInfo: ["Location_Name"],
    popupInfo: ["Location_Name"],
    token: 'pk.eyJ1IjoiYW5kcmV3d3ZpbmNlbnQiLCJhIjoiY2xkdzZ1ejB4MHRxbDN2bzZ0ZGNvMnY5YiJ9.zqIgFE8xhfvgRqR1GQgK_Q',
    container: 'map',
    defaultShapeSizes: {
        circle: 8,
        square: 8,
        star: 10,
        triangle: 10,
        diamond: 9,
        hexagon: 9,
        pentagon: 9,
        cross: 10
    },
    defaultStrokeWidths: {
        circle: 2,      // Base stroke width for simple shapes
        square: 2,      // Match circle stroke width
        star: 2.5,      // Slightly thicker for complex shapes
        triangle: 2.5,  // Match star stroke width
        diamond: 2,     // Match simple shape stroke width
        hexagon: 2,     // Match simple shape stroke width
        pentagon: 2,    // Match simple shape stroke width
        cross: 2.5      // Match complex shape stroke width
    },
    iconConfig: {
        canvasSize: 32,       // Size of the canvas for map icons
        displaySize: 18,      // Base size for calculations
        mapIconScale: 1,   // Scale factor for icons on the map
        padding: 4,           // Padding around shapes
        strokeScale: 0.5     // Scale factor for stroke widths (smaller = thinner strokes)
    },
    // Define status colors
    statusColors: {
        '#Location': '#f8ea01',    // Yellow for potential partners
        '#Active': '#039147',      // Green for active locations
        '#Negotiations': '#023a9b', // Blue for negotiations
        '#No-Contract': '#db050d'  // Red for no contract
    },

    // List of major cities/metro areas for quick navigation
    cities: [
        {name: 'AZ - Phoenix', coordinates: [-112.0969, 33.4686], zoom: 10},
        {name: 'CA - Santa Barbara', coordinates: [-119.7173, 34.4241], zoom: 11},
        {name: 'FL - Orlando', coordinates: [-81.3871, 28.5431], zoom: 11},
        {name: 'FL - Tampa', coordinates: [-82.5072, 27.9518], zoom: 10},
        {name: 'NC - Charlotte', coordinates: [-80.8448, 35.2361], zoom: 10},
        {name: 'NY - NYC', coordinates: [-73.9685, 40.7543], zoom: 12},
        {name: 'TX - Fort Worth', coordinates: [-97.3225, 32.7657], zoom: 10},
        {name: 'TX - Houston', coordinates: [-95.3809, 29.7722], zoom: 9.5},

        

    ],

    locationLayers: [
        {
            id: 'redline',
            name: 'Redline Athletics Locations',
            file: 'data/redline_locations.kml',
            defaultShape: 'circle',  // This location uses circles
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': '#4CAF50',   // Each status has its own color
                '#Active': '#2196F3',
                '#No-Contract': '#FFC107',
                '#Fusion': '#9C27B0'
            }
        },
        {
            id: 'D1',
            name: 'D1 Training Locations',
            file: 'data/d1_locations.kml',
            defaultShape: 'diamond',    // This location uses stars
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': '#4CAF50',
                '#Active': '#2196F3',
                '#No-Contract': '#FFC107',
                '#Fusion': '#9C27B0'
            }
        },
        {
            id: 'Fusion Academy',
            name: 'Fusion Academy Locations',
            file: 'data/fusion_academy_locations.kml',
            defaultShape: 'square',  // This location uses squares
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': '#4CAF50',
                '#Active': '#2196F3',
                '#No-Contract': '#FFC107',
                '#Fusion': '#9C27B0'
            }
        },
        {
            id: 'Individual Partnerships',
            name: 'Individual Partnerships',
            file: 'data/partner.kml',
            defaultShape: 'triangle',  // This location uses triangles
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': '#4CAF50',
                '#Active': '#2196F3',
                '#No-Contract': '#FFC107',
                '#Fusion': '#9C27B0'
            }
        }
    ]
};
