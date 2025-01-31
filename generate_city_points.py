import pandas as pd
import numpy as np
import xlwt
import os
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)

def snap_to_grid(value, step_size=0.015, round_up=False):
    """Snap a value to the nearest grid point"""
    steps = value / step_size
    if round_up:
        return np.ceil(steps) * step_size
    return np.floor(steps) * step_size

def parse_coordinates(coord_str):
    """Parse coordinate string in format 'lat, long' to (lat, long)"""
    lat, lon = map(float, coord_str.strip().split(','))
    return lat, lon

def generate_grid_points(nw_lat, nw_lon, se_lat, se_lon, step_size=0.015):
    logging.info(f"Generating grid points between ({nw_lat}, {nw_lon}) and ({se_lat}, {se_lon})")
    
    # Snap northwest point to grid (round up for lat, down for lon to ensure coverage)
    grid_nw_lat = snap_to_grid(nw_lat, step_size, round_up=True)
    grid_nw_lon = snap_to_grid(nw_lon, step_size, round_up=False)
    
    # Snap southeast point to grid (round down for lat, up for lon to ensure coverage)
    grid_se_lat = snap_to_grid(se_lat, step_size, round_up=False)
    grid_se_lon = snap_to_grid(se_lon, step_size, round_up=True)
    
    logging.info(f"Snapped coordinates: NW({grid_nw_lat}, {grid_nw_lon}) SE({grid_se_lat}, {grid_se_lon})")
    
    # Calculate number of steps needed in each direction
    lat_steps = int(round(abs(grid_nw_lat - grid_se_lat) / step_size))
    lon_steps = int(round(abs(grid_se_lon - grid_nw_lon) / step_size))
    
    # Generate latitude and longitude ranges
    lats = np.linspace(grid_nw_lat, grid_se_lat, lat_steps + 1)
    longs = np.linspace(grid_nw_lon, grid_se_lon, lon_steps + 1)
    
    # Create grid points
    points = []
    for lat in lats:
        for lon in longs:
            points.append((round(lat, 6), round(lon, 6)))  # Round to 6 decimal places for consistency
    
    logging.info(f"Generated {len(points)} points")
    return points

def create_city_data(points):
    logging.info(f"Creating data for {len(points)} points")
    
    # Prepare data in the exact format needed
    data = []
    for i, (lat, lon) in enumerate(points, 1):
        data.append({
            'ID': str(i),  # Start IDs at 1
            'Name': str(i + 100000),  # Start Names at 100001
            'Address': '',  # Empty string for unused fields
            'City': '',
            'State': '',
            'Zip': '',
            'Latitude': f'{lat:.6f}',
            'Longitude': f'{lon:.6f}'
        })
    
    return data

def save_to_xls(data, output_path):
    logging.info(f"Creating Excel file: {output_path}")
    
    # Create new workbook and sheet
    wb = xlwt.Workbook()
    ws = wb.add_sheet('TAS')  # Use 'TAS' as sheet name to match template
    
    # Define text style (force text format for all cells)
    style = xlwt.XFStyle()
    style.num_format_str = '@'
    
    # Write headers
    headers = ['ID', 'Name', 'Address', 'City', 'State', 'Zip', 'Latitude', 'Longitude']
    for col, header in enumerate(headers):
        ws.write(0, col, header, style)
    
    # Write data
    for row, point in enumerate(data, 1):
        for col, header in enumerate(headers):
            ws.write(row, col, point[header], style)
        if row % 10 == 0:
            logging.info(f"Wrote {row} rows")
    
    # Save the file
    logging.info("Saving workbook...")
    wb.save(output_path)
    logging.info("Save complete")

def main():
    logging.info("Starting city points generation process")
    
    # Set up paths
    base_dir = Path(__file__).parent
    output_dir = base_dir / 'data' / 'lat long analysis'
    input_file = output_dir / 'lat_long_to_process.csv'
    
    logging.info(f"Reading city coordinates from: {input_file}")
    df = pd.read_csv(input_file)
    
    for _, row in df.iterrows():
        city_name = row['City Name']
        logging.info(f"\nProcessing {city_name}...")
        
        try:
            # Check if output file already exists
            output_path = output_dir / f"{city_name.replace(' ', '_')}_points.xls"
            if output_path.exists():
                logging.info(f"Skipping {city_name} - XLS file already exists")
                continue
            
            # Parse coordinates
            nw_lat, nw_lon = parse_coordinates(row['Northwest'])
            se_lat, se_lon = parse_coordinates(row['Southeast'])
            
            # Generate points
            points = generate_grid_points(nw_lat, nw_lon, se_lat, se_lon)
            
            # Create data
            city_data = create_city_data(points)
            
            # Save to Excel file
            save_to_xls(city_data, output_path)
            logging.info(f"Successfully processed {city_name}")
            
        except Exception as e:
            logging.error(f"Error processing {city_name}: {str(e)}")
            continue  # Continue with next city if one fails

if __name__ == "__main__":
    logging.info("=== Starting Script ===")
    try:
        main()
        logging.info("=== Script Completed Successfully ===")
    except Exception as e:
        logging.error(f"Script failed with error: {str(e)}")
        raise
