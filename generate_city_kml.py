import pandas as pd
import numpy as np
from pathlib import Path
from itertools import combinations
import os

def calculate_kids_columns(df):
    """Calculate the number of kids in households above income thresholds."""
    # Calculate total kids percentage (ages 5-14)
    kids_percentage = df['CDA04V002'] + df['CDA04V003']
    
    # Calculate household percentages
    households_250k_plus = df['CYC01V017'] + df['CYC01V018']
    households_500k_plus = df['CYC01V018']
    
    # Calculate number of kids in each income bracket
    df['# Kids >$250k'] = df['CYA01V001'] * kids_percentage * households_250k_plus
    df['# Kids >$500k'] = df['CYA01V001'] * kids_percentage * households_500k_plus
    
    return df

def assign_bucket(value):
    """Assign a bucket label based on the value."""
    if value >= 1500:
        return "1500+ Kids"
    elif 1250 <= value < 1500:
        return "1250-1500 Kids"
    elif 1000 <= value < 1250:
        return "1000-1250 Kids"
    elif 750 <= value < 1000:
        return "750-1000 Kids"
    elif 500 <= value < 750:
        return "500-750 Kids"
    else:
        return "<500 Kids"

def create_bucket_columns(df):
    """Create bucket columns based on the calculated values."""
    df['$250k Bucket'] = df['# Kids >$250k'].apply(assign_bucket)
    df['$500k Bucket'] = df['# Kids >$500k'].apply(assign_bucket)
    return df

def calculate_point_spacing(df):
    """Calculate the spacing between points in the dataset for both latitude and longitude."""
    # Sort points by latitude and longitude
    df_lat_sorted = df.sort_values('Latitude')
    df_lon_sorted = df.sort_values('Longitude')
    
    # Calculate differences between consecutive points
    lat_diffs = np.abs(df_lat_sorted['Latitude'].diff().dropna())
    lon_diffs = np.abs(df_lon_sorted['Longitude'].diff().dropna())
    
    # Get the most common spacing (mode) for both lat and lon
    def get_common_spacing(diffs, tolerance=1e-6):
        # Round to handle floating point imprecision
        rounded_diffs = np.round(diffs / tolerance) * tolerance
        unique_diffs, counts = np.unique(rounded_diffs, return_counts=True)
        # Filter out zero or very small differences that might be noise
        valid_diffs = unique_diffs[unique_diffs > tolerance]
        if len(valid_diffs) == 0:
            return 0.015  # fallback to a reasonable default
        valid_counts = counts[unique_diffs > tolerance]
        return valid_diffs[valid_counts.argmax()]
    
    lat_spacing = get_common_spacing(lat_diffs)
    lon_spacing = get_common_spacing(lon_diffs)
    
    # Return half the spacing in each direction to create squares centered on points
    return lat_spacing / 2, lon_spacing / 2

def create_square(lat, lon, size_lat, size_lon):
    """Create coordinates for a rectangle around a point using different lat/lon sizes."""
    return [
        (lon - size_lon, lat - size_lat),
        (lon + size_lon, lat - size_lat),
        (lon + size_lon, lat + size_lat),
        (lon - size_lon, lat + size_lat),
        (lon - size_lon, lat - size_lat)
    ]

def coords_to_kml(coords):
    """Convert coordinates to KML coordinate string."""
    return ' '.join(f'{lon:.4f},{lat:.4f},0' for lon, lat in coords)

def create_kml_content(features, square_size_lat, square_size_lon):
    """Create KML content for a set of features."""
    kml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<kml xmlns="http://www.opengis.net/kml/2.2">',
           '<Document>']
    
    # Add style information
    kml.extend([
        '<Style id="style_default">',
        '<PolyStyle>',
        '<color>660066cc</color>',  # Blue with transparency
        '<outline>0</outline>',
        '</PolyStyle>',
        '</Style>'
    ])
    
    # Add polygons with data
    for row in features:
        coords = create_square(row['Latitude'], row['Longitude'], square_size_lat, square_size_lon)
        value_250k = 0 if pd.isna(row['value_250k']) else int(round(row['value_250k']))
        value_500k = 0 if pd.isna(row['value_500k']) else int(round(row['value_500k']))
        name = row['Name']
        
        polygon = [
            '<Placemark>',
            '<styleUrl>#style_default</styleUrl>',
            f'<name>{name}</name>',
            f'<data name="kids_250k">{value_250k}</data>',
            f'<data name="kids_500k">{value_500k}</data>',
            '<Polygon>',
            '<outerBoundaryIs>',
            '<LinearRing>',
            f'<coordinates>{coords_to_kml(coords)}</coordinates>',
            '</LinearRing>',
            '</outerBoundaryIs>',
            '</Polygon>',
            '</Placemark>'
        ]
        kml.extend(polygon)
    
    kml.extend(['</Document>', '</kml>'])
    return '\n'.join(kml)

def write_kml_file(filename, features, square_size_lat, square_size_lon):
    """Write KML content to a file."""
    kml_content = create_kml_content(features, square_size_lat, square_size_lon)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(kml_content)

def points_overlap(p1, p2, min_spacing):
    """Check if two points overlap given minimum spacing requirements."""
    EPSILON = 1e-10  # Small value for floating point comparison
    dx = abs(p1[0] - p2[0])
    dy = abs(p1[1] - p2[1])
    return (dx < min_spacing[0] - EPSILON and dy < min_spacing[1] - EPSILON)

def check_overlapping_points(df, square_size_lat, square_size_lon):
    """Check for points that are closer than twice the square size (which would cause overlap)."""
    points = list(zip(df['Latitude'], df['Longitude']))
    min_spacing = (2 * square_size_lat, 2 * square_size_lon)
    for (lat1, lon1), (lat2, lon2) in combinations(points, 2):
        if points_overlap((lon1, lat1), (lon2, lat2), min_spacing):
            print(f"Warning: Found overlapping points:")
            print(f"Point 1: ({lat1}, {lon1})")
            print(f"Point 2: ({lat2}, {lon2})")
            print(f"Difference: ({abs(lat1 - lat2)}, {abs(lon1 - lon2)})")
            print(f"Minimum spacing: {min_spacing}")

def process_city(input_file, output_kml_dir):
    """Process a single city's demographics file and create KML."""
    # Create output directory if it doesn't exist
    os.makedirs(output_kml_dir, exist_ok=True)
    
    # Determine output KML filename
    city_name = os.path.splitext(os.path.basename(input_file))[0].split('_Demographics')[0]
    output_kml = os.path.join(output_kml_dir, f"{city_name}.kml")
    
    # Skip if KML already exists
    if os.path.exists(output_kml):
        print(f"Skipping {city_name} - KML file already exists")
        return
    
    print(f"\nProcessing {input_file}...")
    
    # Read and process demographics
    df = pd.read_csv(input_file)
    df = calculate_kids_columns(df)
    df = create_bucket_columns(df)
    
    # Calculate point spacing
    square_size_lat, square_size_lon = calculate_point_spacing(df)
    
    # Prepare features for KML
    features = []
    for _, row in df.iterrows():
        feature = {
            'Latitude': row['Latitude'],
            'Longitude': row['Longitude'],
            'Name': str(row['Name']),
            'value_250k': row['# Kids >$250k'],
            'value_500k': row['# Kids >$500k']
        }
        features.append(feature)
    
    # Check for overlapping points
    check_overlapping_points(df, square_size_lat, square_size_lon)
    
    # Create output KML file
    write_kml_file(output_kml, features, square_size_lat, square_size_lon)
    print(f"Created KML file: {output_kml}")

def main():
    # Define paths
    base_path = Path(__file__).parent
    input_dir = base_path / "data/demographics"
    output_dir = base_path / "data/KMLs"
    
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process all CSV files in the demographics directory
    for file_path in input_dir.glob("*_Demographics*.csv"):
        process_city(file_path, output_dir)

if __name__ == "__main__":
    main()
