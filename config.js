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
            name: "Albany",
            file: "data/KMLs/Albany.kml"
        },
        {
            name: "Anchorage",
            file: "data/KMLs/Anchorage.kml"
        },
        {
            name: "Aspen",
            file: "data/KMLs/Aspen.kml"
        },
        {
            name: "Atlanta",
            file: "data/KMLs/Atlanta.kml"
        },
        {
            name: "Austin",
            file: "data/KMLs/Austin.kml"
        },
        {
            name: "Baltimore",
            file: "data/KMLs/Baltimore.kml"
        },
        {
            name: "Bay Area",
            file: "data/KMLs/Bay_Area.kml"
        },
        {
            name: "Bloomington IL",
            file: "data/KMLs/Bloomington_IL.kml"
        },
        {
            name: "Boston",
            file: "data/KMLs/Boston.kml"
        },
        {
            name: "Burlington VT",
            file: "data/KMLs/Burlington_VT.kml"
        },
        {
            name: "Cedar Rapids IA",
            file: "data/KMLs/Cedar_Rapids_IA.kml"
        },
        {
            name: "Charleston",
            file: "data/KMLs/Charleston.kml"
        },
        {
            name: "Charlotte",
            file: "data/KMLs/Charlotte.kml"
        },
        {
            name: "Charlottesville",
            file: "data/KMLs/Charlottesville.kml"
        },
        {
            name: "Chicago",
            file: "data/KMLs/Chicago.kml"
        },
        {
            name: "Cincinnati",
            file: "data/KMLs/Cincinnati.kml"
        },
        {
            name: "Columbus OH",
            file: "data/KMLs/Columbus_OH.kml"
        },
        {
            name: "Dallas",
            file: "data/KMLs/Dallas.kml"
        },
        {
            name: "Denver",
            file: "data/KMLs/Denver.kml"
        },
        {
            name: "Des Moines",
            file: "data/KMLs/Des_Moines.kml"
        },
        {
            name: "Detroit",
            file: "data/KMLs/Detroit.kml"
        },
        {
            name: "Fort Collins CO",
            file: "data/KMLs/Fort_Collins_CO.kml"
        },
        {
            name: "Fort Worth",
            file: "data/KMLs/Fort_Worth.kml"
        },
        {
            name: "Hartford CT",
            file: "data/KMLs/Hartford_CT.kml"
        },
        {
            name: "Houston",
            file: "data/KMLs/Houston.kml"
        },
        {
            name: "Indianapolis",
            file: "data/KMLs/Indianapolis.kml"
        },
        {
            name: "Jacksonville",
            file: "data/KMLs/Jacksonville.kml"
        },
        {
            name: "Las Vegas",
            file: "data/KMLs/Las_Vegas.kml"
        },
        {
            name: "Los Angeles",
            file: "data/KMLs/Los_Angeles.kml"
        },
        {
            name: "Milwaukee",
            file: "data/KMLs/Milwaukee.kml"
        },
        {
            name: "Minneapolis",
            file: "data/KMLs/Minneapolis.kml"
        },
        {
            name: "NYC",
            file: "data/KMLs/NYC.kml"
        },
        {
            name: "Nashville",
            file: "data/KMLs/Nashville.kml"
        },
        {
            name: "Newark",
            file: "data/KMLs/Newark.kml"
        },
        {
            name: "Orlando",
            file: "data/KMLs/Orlando.kml"
        },
        {
            name: "Philadelhpia",
            file: "data/KMLs/Philadelhpia.kml"
        },
        {
            name: "Phoenix",
            file: "data/KMLs/Phoenix.kml"
        },
        {
            name: "Portland OR",
            file: "data/KMLs/Portland_OR.kml"
        },
        {
            name: "Raleigh",
            file: "data/KMLs/Raleigh.kml"
        },
        {
            name: "Reno",
            file: "data/KMLs/Reno.kml"
        },
        {
            name: "Richmond",
            file: "data/KMLs/Richmond.kml"
        },
        {
            name: "Rochester MN",
            file: "data/KMLs/Rochester_MN.kml"
        },
        {
            name: "Sacramento",
            file: "data/KMLs/Sacramento.kml"
        },
        {
            name: "Salt Lake City",
            file: "data/KMLs/Salt_Lake_City.kml"
        },
        {
            name: "San Diego",
            file: "data/KMLs/San_Diego.kml"
        },
        {
            name: "Santa Barbara",
            file: "data/KMLs/Santa_Barbara.kml"
        },
        {
            name: "Santa Fe",
            file: "data/KMLs/Santa_Fe.kml"
        },
        {
            name: "Seattle",
            file: "data/KMLs/Seattle.kml"
        },
        {
            name: "Springfield IL",
            file: "data/KMLs/Springfield_IL.kml"
        },
        {
            name: "St. Louis",
            file: "data/KMLs/St._Louis.kml"
        },
        {
            name: "Stamford",
            file: "data/KMLs/Stamford.kml"
        },
        {
            name: "Tampa",
            file: "data/KMLs/Tampa.kml"
        },
        {
            name: "Trenton",
            file: "data/KMLs/Trenton.kml"
        },
        {
            name: "Washington DC",
            file: "data/KMLs/Washington_DC.kml"
        },
        {
            name: "West Palm Beach",
            file: "data/KMLs/West_Palm_Beach.kml"
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
