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
            id: 'pending-partner',
            name: 'Pending Partners',
            file: 'data/pending_partner.kml',
            color: '#FF0000',  // Red
            shape: 'circle',  // Options: circle, square, triangle, star
            size: 16, // Size in pixels
            defaultChecked: true,
            defaultLabels: false
        },
        {
            id: 'secondary-partners',
            name: 'Secondary Partners',
            file: 'data/secondary_partner.kml',
            color: '#0000FF',  // Blue
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        },
        {
            id: 'partners',
            name: 'Current Partners',
            file: 'data/partner.kml',
            color: '#00FF00',  // Green
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        },
        {
            id: 'targets',
            name: 'Potential Targets',
            file: 'data/target.kml',
            color: '#FF00FF',  // Purple
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        },
        {
            id: 'redline',
            name: 'Redline Athletics Locations',
            file: 'data/redline_locations.kml',
            color: '#FFA500',  // Orange
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        },
        {
            id: 'D1',
            name: 'D1 Training Locations',
            file: 'data/d1_locations.kml',
            color: '#808080',  // Grey
            shape: 'circle',
            size: 16,
            defaultChecked: false,
            defaultLabels: false
        }
    ]
};
