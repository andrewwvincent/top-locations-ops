const config = {
    style: 'mapbox://styles/mapbox/streets-v12',
    accessToken: 'pk.eyJ1IjoiYW5kcmV3LXZpbmNlbnQiLCJhIjoiY202OW4wNm5yMGlubzJtcTJmMnBxb2x1cSJ9.jrR3Ucv9Nvtc-T_7aKIQCg',
    CSV: '../data/locations.csv',
    center: [-98.5795, 39.8283], // [lng, lat]
    zoom: 4,
    title: 'Dynamic Heatmaps - Wealth Distribution',
    description: 'Dynamic heatmaps showing wealth distribution across cities',
    sideBarInfo: ["Location_Name"],
    popupInfo: ["Location_Name"],
    polygonLayers: [         
        {
            name: "AK - Anchorage",
            coordinates: [-149.9003, 61.2181],
            zoom: 10
        },
        {
            name: "AZ - Phoenix",
            coordinates: [-112.0740, 33.4484],
            zoom: 10
        },
        {
            name: "CA - Bay Area",
            coordinates: [-122.4194, 37.7749],
            zoom: 9
        },
        {
            name: "CA - Los Angeles",
            coordinates: [-118.2437, 34.0522],
            zoom: 10
        },
        {
            name: "CA - Sacramento",
            coordinates: [-121.4944, 38.5816],
            zoom: 10
        },
        {
            name: "CA - San Diego",
            coordinates: [-117.1611, 32.7157],
            zoom: 10
        },
        {
            name: "CA - Santa Barbara",
            coordinates: [-119.6982, 34.4208],
            zoom: 11
        },
        {
            name: "CO - Aspen",
            coordinates: [-106.8175, 39.1911],
            zoom: 12
        },
        {
            name: "CO - Denver",
            coordinates: [-104.9903, 39.7392],
            zoom: 10
        },
        {
            name: "CO - Fort Collins",
            coordinates: [-105.0844, 40.5853],
            zoom: 11
        },
        {
            name: "CT - Hartford",
            coordinates: [-72.6851, 41.7658],
            zoom: 11
        },
        {
            name: "CT - Stamford",
            coordinates: [-73.5387, 41.0534],
            zoom: 11
        },
        {
            name: "FL - Jacksonville",
            coordinates: [-81.6557, 30.3322],
            zoom: 10
        },
        {
            name: "FL - Orlando",
            coordinates: [-81.3789, 28.5384],
            zoom: 10
        },
        {
            name: "FL - Tampa",
            coordinates: [-82.4572, 27.9506],
            zoom: 10
        },
        {
            name: "FL - West Palm Beach",
            coordinates: [-80.0534, 26.7153],
            zoom: 11
        },
        {
            name: "GA - Atlanta",
            coordinates: [-84.3880, 33.7490],
            zoom: 10
        },
        {
            name: "IA - Cedar Rapids",
            coordinates: [-91.6656, 41.9779],
            zoom: 11
        },
        {
            name: "IA - Des Moines",
            coordinates: [-93.6037, 41.5868],
            zoom: 11
        },
        {
            name: "IL - Bloomington",
            coordinates: [-88.9937, 40.4842],
            zoom: 11
        },
        {
            name: "IL - Chicago",
            coordinates: [-87.6298, 41.8781],
            zoom: 10
        },
        {
            name: "IL - Springfield",
            coordinates: [-89.6501, 39.7817],
            zoom: 11
        },
        {
            name: "IN - Indianapolis",
            coordinates: [-86.1581, 39.7684],
            zoom: 10
        },
        {
            name: "KS - Kansas City",
            coordinates: [-94.5783, 39.0997],
            zoom: 10
        },
        {
            name: "MA - Boston",
            coordinates: [-71.0934, 42.3584],
            zoom: 11
        },
        {
            name: "MD - Baltimore",
            coordinates: [-76.6243, 39.2904],
            zoom: 10
        },
        {
            name: "MI - Detroit",
            coordinates: [-83.0457, 42.3314],
            zoom: 10
        },
        {
            name: "MN - Minneapolis",
            coordinates: [-93.2650, 44.9778],
            zoom: 10
        },
        {
            name: "MN - Rochester",
            coordinates: [-92.4638, 44.0225],
            zoom: 11
        },
        {
            name: "MO - St. Louis",
            coordinates: [-90.1969, 38.6270],
            zoom: 10
        },
        {
            name: "NC - Charlotte",
            coordinates: [-80.8431, 35.2271],
            zoom: 10
        },
        {
            name: "NC - Greensboro",
            coordinates: [-79.8193, 36.0726],
            zoom: 11
        },
        {
            name: "NC - Raleigh",
            coordinates: [-78.6382, 35.7796],
            zoom: 10
        },
        {
            name: "NJ - Newark",
            coordinates: [-74.1724, 40.7357],
            zoom: 11
        },
        {
            name: "NJ - Trenton",
            coordinates: [-74.7596, 40.2170],
            zoom: 11
        },
        {
            name: "NM - Santa Fe",
            coordinates: [-105.9378, 35.6869],
            zoom: 11
        },
        {
            name: "NV - Las Vegas",
            coordinates: [-115.1398, 36.1699],
            zoom: 10
        },
        {
            name: "NV - Reno",
            coordinates: [-119.8133, 39.5296],
            zoom: 10
        },
        {
            name: "NY - Albany",
            coordinates: [-73.7871, 42.6526],
            zoom: 11
        },
        {
            name: "NY - New York City",
            coordinates: [-74.0060, 40.7128],
            zoom: 10
        },
        {
            name: "OH - Cincinnati",
            coordinates: [-84.5120, 39.1031],
            zoom: 10
        },
        {
            name: "OH - Columbus",
            coordinates: [-82.9988, 39.9612],
            zoom: 10
        },
        {
            name: "OR - Portland",
            coordinates: [-122.6765, 45.5236],
            zoom: 10
        },
        {
            name: "PA - Philadelhpia",
            coordinates: [-75.1631, 39.9523],
            zoom: 10
        },
        {
            name: "PA - Pittsburgh",
            coordinates: [-80.0121, 40.4396],
            zoom: 10
        },
        {
            name: "SC - Charleston",
            coordinates: [-79.9307, 32.7765],
            zoom: 11
        },
        {
            name: "TN - Nashville",
            coordinates: [-86.7816, 36.1627],
            zoom: 10
        },
        {
            name: "TX - Austin",
            coordinates: [-97.7431, 30.2672],
            zoom: 10
        },
        {
            name: "TX - Dallas",
            coordinates: [-96.7969, 32.7767],
            zoom: 10
        },
        {
            name: "TX - Fort Worth",
            coordinates: [-97.3209, 32.7551],
            zoom: 10
        },
        {
            name: "TX - Houston",
            coordinates: [-95.3698, 29.7633],
            zoom: 9
        },
        {
            name: "UT - Salt Lake City",
            coordinates: [-111.8907, 40.7608],
            zoom: 10
        },
        {
            name: "VA - Charlottesville",
            coordinates: [-78.4767, 38.0293],
            zoom: 11
        },
        {
            name: "VA - Richmond",
            coordinates: [-77.4367, 37.5407],
            zoom: 10
        },
        {
            name: "VT - Burlington",
            coordinates: [-73.2121, 44.4759],
            zoom: 11
        },
        {
            name: "WA - Seattle",
            coordinates: [-122.3321, 47.6067],
            zoom: 10
        },
        {
            name: "Washington DC",
            coordinates: [-77.0365, 38.8951],
            zoom: 11
        },
        {
            name: "WI - Milwaukee",
            coordinates: [-87.9065, 43.0389],
            zoom: 10
        }
],
    defaultColors: {
        '250k': {
            '1500+': 'rgba(255, 59, 59, 0.4)',         // Bright red
            '1250-1500': 'rgba(255, 149, 5, 0.4)',    // Orange
            '1000-1250': 'rgba(255, 215, 0, 0.4)',    // Yellow
            '750-1000': 'rgba(76, 187, 23, 0.4)',     // Green
            '500-750': 'rgba(0, 102, 204, 0.4)',      // Blue
            '0-500': 'rgba(173, 216, 230, 0.4)'       // Light blue
        },
        '500k': {
            '1500+': 'rgba(102, 0, 153, 0.8)',        // Deep purple
            '1250-1500': 'rgba(255, 0, 255, 0.8)',    // Magenta
            '1000-1250': 'rgba(255, 128, 0, 0.8)',    // Orange
            '750-1000': 'rgba(0, 255, 0, 0.8)',       // Bright green
            '500-750': 'rgba(0, 128, 255, 0.8)',      // Sky blue
            '0-500': 'rgba(255, 255, 224, 0.8)'       // Light yellow
        }
    },
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
            size: 20,
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
        }
    ]
};
