// Map configuration
export const config = {
    style: 'mapbox://styles/mapbox/streets-v12',
    accessToken: 'pk.eyJ1IjoiYW5kcmV3LXZpbmNlbnQiLCJhIjoiY202OW4wNm5yMGlubzJtcTJmMnBxb2x1cSJ9.jrR3Ucv9Nvtc-T_7aKIQCg',
    CSV: '../data/locations.csv',
    center: [-97.7431, 30.2672], // Austin coordinates
    zoom: 11,
    title: 'Heatmaps - Number of Children from Households above Different Income Levels',
    description: 'Heatmaps of density of children ages 5-14 from households above different income levels in the United States.',
    sideBarInfo: ["Location_Name"],
    popupInfo: ["Location_Name"],
    locationLayers: [
        {
            id: 'redline',
            name: 'Redline Athletics Locations',
            file: 'data/redline_locations.kml',
            color: '#FF0000',  // Red
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        },
        {
            id: 'D1',
            name: 'D1 Training Locations',
            file: 'data/d1_locations.kml',
            color: '#6f6f6f',  // Light Grey
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        },
        {
            id: 'Fusion Academy',
            name: 'Fusion Academy Locations',
            file: 'data/fusion_academy_locations.kml',
            color: '#832891',  // Purple
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        }
    ]
};
