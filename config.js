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
            file: "data/KMLs/Anchorage.kml"
        },
        {
            name: "AZ - Phoenix",
            file: "data/KMLs/Phoenix.kml"
        },
        {
            name: "CA - Bay Area",
            file: "data/KMLs/Bay_Area.kml"
        },
        {
            name: "CA - Los Angeles",
            file: "data/KMLs/Los_Angeles.kml"
        },
        {
            name: "CA - Sacramento",
            file: "data/KMLs/Sacramento.kml"
        },
        {
            name: "CA - San Diego",
            file: "data/KMLs/San_Diego.kml"
        },
        {
            name: "CA - Santa Barbara",
            file: "data/KMLs/Santa_Barbara.kml"
        },
        {
            name: "CO - Aspen",
            file: "data/KMLs/Aspen.kml"
        },
        {
            name: "CO - Denver",
            file: "data/KMLs/Denver.kml"
        },
        {
            name: "CO - Fort Collins",
            file: "data/KMLs/Fort_Collins_CO.kml"
        },
        {
            name: "CT - Hartford",
            file: "data/KMLs/Hartford_CT.kml"
        },
        {
            name: "CT - Stamford",
            file: "data/KMLs/Stamford.kml"
        },
        {
            name: "FL - Jacksonville",
            file: "data/KMLs/Jacksonville.kml"
        },
        {
            name: "FL - Orlando",
            file: "data/KMLs/Orlando.kml"
        },
        {
            name: "FL - Tampa",
            file: "data/KMLs/Tampa.kml"
        },
        {
            name: "FL - West Palm Beach",
            file: "data/KMLs/West_Palm_Beach.kml"
        },
        {
            name: "GA - Atlanta",
            file: "data/KMLs/Atlanta.kml"
        },
        {
            name: "IA - Cedar Rapids",
            file: "data/KMLs/Cedar_Rapids_IA.kml"
        },
        {
            name: "IA - Des Moines",
            file: "data/KMLs/Des_Moines.kml"
        },
        {
            name: "IL - Bloomington",
            file: "data/KMLs/Bloomington_IL.kml"
        },
        {
            name: "IL - Chicago",
            file: "data/KMLs/Chicago.kml"
        },
        {
            name: "IL - Springfield",
            file: "data/KMLs/Springfield_IL.kml"
        },
        {
            name: "IN - Indianapolis",
            file: "data/KMLs/Indianapolis.kml"
        },
        {
            name: "KS - Kansas City",
            file: "data/KMLs/Kansas_City.kml"
        },
        {
            name: "MA - Boston",
            file: "data/KMLs/Boston.kml"
        },
        {
            name: "MD - Baltimore",
            file: "data/KMLs/Baltimore.kml"
        },
        {
            name: "MI - Detroit",
            file: "data/KMLs/Detroit.kml"
        },
        {
            name: "MN - Minneapolis",
            file: "data/KMLs/Minneapolis.kml"
        },
        {
            name: "MN - Rochester",
            file: "data/KMLs/Rochester_MN.kml"
        },
        {
            name: "MO - St. Louis",
            file: "data/KMLs/St._Louis.kml"
        },
        {
            name: "NC - Charlotte",
            file: "data/KMLs/Charlotte.kml"
        },
        {
            name: "NC - Greensboro",
            file: "data/KMLs/Greensboro.kml"
        },
        {
            name: "NC - Raleigh",
            file: "data/KMLs/Raleigh.kml"
        },
        {
            name: "NJ - Newark",
            file: "data/KMLs/Newark.kml"
        },
        {
            name: "NJ - Trenton",
            file: "data/KMLs/Trenton.kml"
        },
        {
            name: "NM - Santa Fe",
            file: "data/KMLs/Santa_Fe.kml"
        },
        {
            name: "NV - Las Vegas",
            file: "data/KMLs/Las_Vegas.kml"
        },
        {
            name: "NV - Reno",
            file: "data/KMLs/Reno.kml"
        },
        {
            name: "NY - Albany",
            file: "data/KMLs/Albany.kml"
        },
        {
            name: "NY - New York City",
            file: "data/KMLs/NYC.kml"
        },
        {
            name: "OH - Cincinnati",
            file: "data/KMLs/Cincinnati.kml"
        },
        {
            name: "OH - Columbus",
            file: "data/KMLs/Columbus_OH.kml"
        },
        {
            name: "OR - Portland",
            file: "data/KMLs/Portland_OR.kml"
        },
        {
            name: "PA - Philadelhpia",
            file: "data/KMLs/Philadelhpia.kml"
        },
        {
            name: "PA - Pittsburgh",
            file: "data/KMLs/Pittsburgh.kml"
        },
        {
            name: "SC - Charleston",
            file: "data/KMLs/Charleston.kml"
        },
        {
            name: "TN - Nashville",
            file: "data/KMLs/Nashville.kml"
        },
        {
            name: "TX - Austin",
            file: "data/KMLs/Austin.kml"
        },
        {
            name: "TX - Dallas",
            file: "data/KMLs/Dallas.kml"
        },
        {
            name: "TX - Fort Worth",
            file: "data/KMLs/Fort_Worth.kml"
        },
        {
            name: "TX - Houston",
            file: "data/KMLs/Houston.kml"
        },
        {
            name: "UT - Salt Lake City",
            file: "data/KMLs/Salt_Lake_City.kml"
        },
        {
            name: "VA - Charlottesville",
            file: "data/KMLs/Charlottesville.kml"
        },
        {
            name: "VA - Richmond",
            file: "data/KMLs/Richmond.kml"
        },
        {
            name: "VT - Burlington",
            file: "data/KMLs/Burlington_VT.kml"
        },
        {
            name: "WA - Seattle",
            file: "data/KMLs/Seattle.kml"
        },
        {
            name: "Washington DC",
            file: "data/KMLs/Washington_DC.kml"
        },
        {
            name: "WI - Milwaukee",
            file: "data/KMLs/Milwaukee.kml"
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
