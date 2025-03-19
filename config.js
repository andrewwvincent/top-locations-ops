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
        triangle: 10
    },
    // Define status colors
    statusColors: {
        '#Location': '#f8ea01',    // Yellow for potential partners
        '#Active': '#039147',      // Green for active locations
        '#Negotiations': '#023a9b', // Blue for negotiations
        '#No-Contract': '#db050d' // Red for no contract
    },
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
            defaultShape: 'star',    // This location uses stars
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
