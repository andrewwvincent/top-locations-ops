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
    locationLayers: [
        {
            id: 'redline',
            name: 'Redline Athletics Locations',
            file: 'data/redline_locations.kml',
            color: '#FF0000',  // Red
            defaultShape: 'circle',  // Default shape if no matching styleUrl
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': 'circle',  // Use circle shape for #Location styleUrl
                '#Active': 'star',  // Use star shape for #Active styleUrl
                '#No-Contract': 'square',  // Use square shape for #No-Contract styleUrl
                '#Fusion': 'triangle' // Use triangle shape for #Fusion styleUrl
            }
        },
        {
            id: 'D1',
            name: 'D1 Training Locations',
            file: 'data/d1_locations.kml',
            color: '#6f6f6f',  // Light Grey
            defaultShape: 'circle',
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': 'circle',  // Use circle shape for #Location styleUrl
                '#Active': 'star',  // Use star shape for #Active styleUrl
                '#No-Contract': 'square',  // Use square shape for #No-Contract styleUrl
                '#Fusion': 'triangle' // Use triangle shape for #Fusion styleUrl
            }
        },
        {
            id: 'Fusion Academy',
            name: 'Fusion Academy Locations',
            file: 'data/fusion_academy_locations.kml',
            color: '#832891',  // Purple
            defaultShape: 'square',  // Default to square for unmatched styleUrls
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': 'circle',  // Use circle shape for #Location styleUrl
                '#Active': 'star',  // Use star shape for #Active styleUrl
                '#No-Contract': 'square',  // Use square shape for #No-Contract styleUrl
                '#Fusion': 'triangle' // Use triangle shape for #Fusion styleUrl
            }
        },
        {
            id: 'Individual Partnerships',
            name: 'Individual Partnerships',
            file: 'data/partner.kml',
            color: '#0000FF',  // Blue
            defaultShape: 'circle',  // Default to square for unmatched styleUrls
            defaultChecked: false,
            defaultLabels: false,
            styles: {
                '#Location': 'circle',  // Use circle shape for #Location styleUrl
                '#Active': 'star',  // Use star shape for #Active styleUrl
                '#No-Contract': 'square',  // Use square shape for #No-Contract styleUrl
                '#Fusion': 'triangle' // Use triangle shape for #Fusion styleUrl
            }
        }
    ]
};
