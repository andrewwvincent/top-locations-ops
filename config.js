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
            name: "Aspen",
            file: "data/Aspen_Demographics_Kids__$250k_HH_Income_Demographics_Dynamic.kml"
        },
        {
            name: "Atlanta",
            file: "data/Atlanta Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Bay Area",
            file: "data/Bay Area Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Charleston",
            file: "data/Charleston Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Charlotte",
            file: "data/Charlotte Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Chicago",
            file: "data/Chicago Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Dallas",
            file: "data/Dallas_Demographics_Kids__$250k_HH_Income_Demographics_Dynamic.kml"
        },
        {
            name: "Denver",
            file: "data/Denver_Demographics_Kids__$250k_HH_Income_Demographics_Dynamic.kml"
        },
        {
            name: "Fort Worth",
            file: "data/Fort_Worth_Demographics_Kids__$250k_HH_Income_Demographics_Dynamic.kml"
        },
        {
            name: "Houston",
            file: "data/Houston Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "NYC - 10 Mins",
            file: "data/NYC_-_10_Mins_Demographics_Kids__$250k_HH_Income_Demographics_Dynamic.kml"
        },
        {
            name: "NYC - 20 Mins",
            file: "data/NYC_Demographics_Kids__$250k_HH_Income_Demographics_Dynamic.kml"
        },
        {
            name: "Orlando",
            file: "data/Orlando Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Phoenix",
            file: "data/Phoenix Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Santa Barbara",
            file: "data/Santa Barbara Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "Tampa",
            file: "data/Tampa Demographics_Demographics_Dynamic.kml"
        },
        {
            name: "West Palm Beach",
            file: "data/West_Palm_Beach_Demographics_Kids__$250k_HH_Income_Demographics_Dynamic.kml"
        }
    ],
    defaultColors: {
        '250k': {
            '1500+': 'rgba(255, 59, 59, 0.4)',         // Bright red
            '1250-1500': 'rgba(255, 149, 5, 0.4)',    // Orange
            '1000-1250': 'rgba(255, 215, 0, 0.4)',    // Gold/Yellow
            '750-1000': 'rgba(76, 187, 23, 0.4)',     // Bright green
            '500-750': 'rgba(0, 120, 255, 0.4)',      // Sky blue
            '0-500': 'rgba(173, 216, 230, 0.4)'      // Light blue
        },
        '500k': {
            '1500+': 'rgba(102, 0, 153, 0.8)',         // Dark purple
            '1250-1500': 'rgba(186, 85, 211, 0.8)',   // Medium purple
            '1000-1250': 'rgba(220, 20, 60, 0.8)',    // Deep red
            '750-1000': 'rgba(255, 140, 0, 0.8)',     // Dark orange
            '500-750': 'rgba(255, 215, 0, 0.8)',      // Gold
            '0-500': 'rgba(255, 255, 224, 0.8)'      // Light yellow
        }
    }
};
