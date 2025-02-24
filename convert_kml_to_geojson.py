import os
import json
from xml.dom import minidom

def get_element_by_tagname(parent, tag_name):
    """Get element by tag name, handling namespaces."""
    elements = parent.getElementsByTagName(tag_name)
    if not elements:
        # Try with namespace
        elements = parent.getElementsByTagNameNS("http://www.opengis.net/kml/2.2", tag_name)
    return elements

def extract_coordinates(polygon_element):
    """Extract coordinates from a KML polygon element."""
    coordinates_element = get_element_by_tagname(polygon_element, 'coordinates')[0]
    coordinates_text = coordinates_element.childNodes[0].data.strip()
    
    # Parse coordinates into list of [lon, lat] pairs
    coords = []
    for coord in coordinates_text.split():
        lon, lat, _ = map(float, coord.split(','))
        coords.append([lon, lat])
    
    return coords

def coords_to_key(coords):
    """Convert coordinates list to a string key for comparison."""
    return ';'.join(f"{c[0]},{c[1]}" for c in coords)

def process_kml_file(kml_path, city_name, coord_data):
    """Process a single KML file and update the coordinate data dictionary."""
    dom = minidom.parse(kml_path)
    placemarks = get_element_by_tagname(dom, 'Placemark')
    print(f"Found {len(placemarks)} placemarks in {city_name}")
    processed = 0
    
    for placemark in placemarks:
        # Get data elements (lowercase 'data')
        data_elements = get_element_by_tagname(placemark, 'data')
        kids_250k = 0
        kids_500k = 0
        
        for data_element in data_elements:
            name = data_element.getAttribute('name')
            if data_element.childNodes:
                value = int(data_element.childNodes[0].data.strip())
                if name == 'kids_250k':
                    kids_250k = value
                elif name == 'kids_500k':
                    kids_500k = value
        
        # Get polygon coordinates
        polygon_elements = get_element_by_tagname(placemark, 'Polygon')
        if not polygon_elements:
            continue
            
        try:
            coordinates = extract_coordinates(polygon_elements[0])
            coord_key = coords_to_key(coordinates)
            
            # If coordinates already exist, skip this one
            if coord_key in coord_data:
                continue
            
            # Create new feature for unique coordinates
            coord_data[coord_key] = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [coordinates]
                },
                'properties': {
                    'kids_250k': kids_250k,
                    'kids_500k': kids_500k
                }
            }
            processed += 1
            
        except Exception as e:
            print(f"Error processing placemark in {city_name}: {str(e)}")
            continue
    
    print(f"Successfully processed {processed} features for {city_name}")

def convert_kmls_to_geojson(kml_dir, output_file):
    # Dictionary to store unique coordinate data
    coord_data = {}
    
    # Process each KML file
    for kml_file in os.listdir(kml_dir):
        if kml_file.endswith('.kml'):
            city_name = os.path.splitext(kml_file)[0].replace('_', ' ')
            kml_path = os.path.join(kml_dir, kml_file)
            
            try:
                process_kml_file(kml_path, city_name, coord_data)
            except Exception as e:
                print(f"Error processing {kml_file}: {str(e)}")
    
    # Create the final GeoJSON feature collection
    geojson = {
        'type': 'FeatureCollection',
        'features': list(coord_data.values())
    }
    
    # Write to file
    with open(output_file, 'w') as f:
        json.dump(geojson, f)
    
    print(f"\nTotal unique features: {len(coord_data)}")

if __name__ == '__main__':
    kml_dir = 'data/KMLs'
    output_file = 'data/all_cities.geojson'
    convert_kmls_to_geojson(kml_dir, output_file)
