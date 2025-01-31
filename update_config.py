import os
import json
import re

def read_config(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Extract everything before and after the polygonLayers array
        pattern = r'(.*?polygonLayers\s*:\s*\[)([^\]]*?)(\].*)'
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            raise ValueError("Could not find polygonLayers in config")
        return match.group(1), match.group(3)

def write_config(file_path, prefix, suffix, polygon_layers):
    # Format the polygon layers as JavaScript
    layers_str = '\n'
    for layer in polygon_layers:
        layers_str += ' ' * 8 + '{\n'
        layers_str += ' ' * 12 + f'name: "{layer["name"]}",\n'
        layers_str += ' ' * 12 + f'file: "{layer["file"]}"\n'
        layers_str += ' ' * 8 + '},\n'
    
    # Remove the trailing comma from the last entry if there are entries
    if polygon_layers:
        layers_str = layers_str.rstrip(',\n') + '\n'
    
    # Combine everything
    new_content = prefix + layers_str + suffix
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def update_polygon_layers(config_path, kmls_dir):
    # Read existing config structure
    prefix, suffix = read_config(config_path)
    
    # Get list of KML files
    kml_files = sorted([f for f in os.listdir(kmls_dir) if f.lower().endswith('.kml')])
    
    # Create new polygon layers
    polygon_layers = []
    for kml_file in kml_files:
        name = os.path.splitext(kml_file)[0]  # Remove .kml extension
        name = name.replace('_', ' ')  # Replace underscores with spaces
        polygon_layers.append({
            'name': name,
            'file': f'data/KMLs/{kml_file}'
        })
    
    # Write updated config
    write_config(config_path, prefix, suffix, polygon_layers)

if __name__ == '__main__':
    config_path = 'config.js'
    kmls_dir = 'data/KMLs'
    update_polygon_layers(config_path, kmls_dir)
    print("Config file updated successfully!")
