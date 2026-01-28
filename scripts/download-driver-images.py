#!/usr/bin/env python3
"""
Script to download F1 driver images from URLs and organize them by driver name.
"""

import os
import re
import sys
import requests
from pathlib import Path
from urllib.parse import urlparse, unquote

# Driver code to name mapping (based on URL patterns)
DRIVER_CODE_MAP = {
    'jacdoo01': 'jack_doohan',
    'maxver01': 'max_verstappen',
    'chalec01': 'charles_leclerc',
    'carsai01': 'carlos_sainz',
    'lewham01': 'lewis_hamilton',
    'estoco01': 'esteban_ocon',
    'piegas01': 'pierre_gasly',
    'feralo01': 'fernando_alonso',
    'nichul01': 'nico_hulkenberg',
    'olibea01': 'oliver_bearman',
    'isahad01': 'isaac_hadjar',
    'andant01': 'andrea_kim_antonelli',
    'gabbor01': 'gabriel_bortoleto',
    # From path patterns
    'Russell': 'george_russell',
    'Norris': 'lando_norris',
    'Piastri': 'oscar_piastri',
    'Stroll': 'lance_stroll',
    'Albon': 'alexander_albon',
    'Perez': 'sergio_perez',
    'Magnussen': 'kevin_magnussen',
    'Ricciardo': 'daniel_ricciardo',
    'Bottas': 'valtteri_bottas',
    'Zhou': 'guanyu_zhou',
    'Sargeant': 'logan_sargeant',
}

# URLs to download
IMAGE_URLS = [
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/jacdoo01.png?v=1741600637',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/maxver01.png?v=1741598967',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/chalec01.png?v=1741603184',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/carsai01.png?v=1741599407',
    'https://cdn.racingnews365.com/Riders/Russell/_570x570_crop_center-center_none/f1_2024_gr_mer_lg.png?v=1708704486',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/lewham01.png?v=1741603184',
    'https://cdn.racingnews365.com/Riders/Norris/_570x570_crop_center-center_none/f1_2024_ln_mcl_lg.png?v=1708704433',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/estoco01.png?v=1741603185',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/piegas01.png?v=1741603185',
    'https://cdn.racingnews365.com/Riders/Piastri/_570x570_crop_center-center_none/f1_2024_op_mcl_lg.png?v=1708704433',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/feralo01.png?v=1741603186',
    'https://cdn.racingnews365.com/Riders/Stroll/_570x570_crop_center-center_none/f1_2024_ls_ast_lg.png?v=1708704434',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/nichul01.png?v=1741603187',
    'https://cdn.racingnews365.com/Riders/Albon/_570x570_crop_center-center_none/f1_2024_aa_wil.png?v=1708704435',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/Tsunoda-red-bull-cutout-2.png?v=1743599672',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/lawson-cutout-2025-vcarb.png?v=1743592990',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/olibea01.png?v=1741603188',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/colapinto-cutout.png?v=1746690735',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/isahad01.png?v=1741603189',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/andant01.png?v=1741603189',
    'https://cdn.racingnews365.com/_570x570_crop_center-center_none/gabbor01.png?v=1741603190',
    'https://cdn.racingnews365.com/Riders/Perez/_570x570_crop_center-center_none/f1_2024_sp_red_lg.png?v=1708703879',
    'https://cdn.racingnews365.com/Riders/Magnussen/_570x570_crop_center-center_none/f1_2024_km_haa_lg.png?v=1708703246',
    'https://cdn.racingnews365.com/Riders/Ricciardo/_570x570_crop_center-center_none/f1_2024_dr_rbv_lg.png?v=1708703607',
    'https://cdn.racingnews365.com/Riders/Bottas/_570x570_crop_center-center_none/f1_2024_vb_sta_lg.png?v=1708704221',
    'https://cdn.racingnews365.com/Riders/Zhou/_570x570_crop_center-center_none/f1_2024_zg_sta_lg.png?v=1708704282',
    'https://cdn.racingnews365.com/Riders/Sargeant/_570x570_crop_center-center_none/f1_2024_ls_wil_lg.png?v=1708704613',
]


def extract_driver_name(url: str) -> str:
    """Extract driver name from URL."""
    # Remove query parameters
    url_without_query = url.split('?')[0]
    
    # Try to extract from path (e.g., /Riders/Russell/)
    path_match = re.search(r'/Riders/([^/]+)/', url_without_query)
    if path_match:
        rider_name = path_match.group(1)
        return DRIVER_CODE_MAP.get(rider_name, rider_name.lower().replace(' ', '_'))
    
    # Try to extract from filename patterns
    filename = os.path.basename(url_without_query)
    
    # Handle special cases like "Tsunoda-red-bull-cutout-2.png"
    if 'tsunoda' in filename.lower():
        return 'yuki_tsunoda'
    if 'lawson' in filename.lower():
        return 'liam_lawson'
    if 'colapinto' in filename.lower():
        return 'franco_colapinto'
    
    # Extract driver code (e.g., "jacdoo01", "maxver01")
    code_match = re.search(r'([a-z]{3,8}\d{2})', filename.lower())
    if code_match:
        code = code_match.group(1)
        return DRIVER_CODE_MAP.get(code, code)
    
    # Fallback: use filename without extension
    name = os.path.splitext(filename)[0]
    return name.lower().replace('-', '_').replace(' ', '_')


def download_image(url: str, output_dir: Path) -> bool:
    """Download a single image from URL."""
    try:
        # Extract driver name
        driver_name = extract_driver_name(url)
        
        # Get file extension from URL
        parsed = urlparse(url)
        path = unquote(parsed.path)
        ext = os.path.splitext(path)[1] or '.png'
        
        # Create filename
        filename = f"{driver_name}{ext}"
        filepath = output_dir / filename
        
        # Skip if already exists
        if filepath.exists():
            print(f"⏭️  Skipping {filename} (already exists)")
            return True
        
        # Download image
        print(f"⬇️  Downloading {filename}...", end=' ', flush=True)
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        
        # Save image
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        file_size = len(response.content) / 1024  # KB
        print(f"✅ ({file_size:.1f} KB)")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def main():
    """Main function."""
    # Determine output directory (relative to project root)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    output_dir = project_root / 'frontend' / 'public' / 'driver-images'
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Output directory: {output_dir}")
    print(f"📥 Downloading {len(IMAGE_URLS)} images...\n")
    
    # Download all images
    success_count = 0
    failed_count = 0
    
    for url in IMAGE_URLS:
        if download_image(url, output_dir):
            success_count += 1
        else:
            failed_count += 1
    
    # Summary
    print(f"\n{'='*50}")
    print(f"✅ Successfully downloaded: {success_count}")
    if failed_count > 0:
        print(f"❌ Failed: {failed_count}")
    print(f"📁 Images saved to: {output_dir}")
    print(f"{'='*50}")


if __name__ == '__main__':
    main()
