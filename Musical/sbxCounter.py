import os
import re
from bs4 import BeautifulSoup
from collections import Counter, defaultdict
from typing import Dict, List, Optional

def normalize_character_name(raw_name: str) -> str:
    if not raw_name:
        return "UNKNOWN"
    return raw_name.get_text(strip=True).upper()

def clean_dialogue_text(text: str) -> str:
    # Remove content inside square brackets or parentheses (stage directions)
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    return text.strip()

def parse_sbx_by_scene(file_path: str) -> Dict[str, Counter]:
    """
    Parses .sbx and returns a dictionary:
    {
       "Scene 1": Counter({'GATSBY': 120, 'NATE': 90}),
       "Scene 2": Counter({'ROSIE': 50}),
       ...
    }
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The file {file_path} was not found.")

    # Data structure: Key = Scene Name, Value = Counter of words per character
    scene_data = defaultdict(Counter)
    
    current_scene = "Unknown Scene" 
    current_speaker: Optional[str] = None

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        all_divs = soup.find_all('div')

        for div in all_divs:
            classes = div.get('class', [])
            
            # Case 1: Scene Header Detected
            if 'divtype0' in classes:
                # Extract scene info. Often format is "Scene name" or just data-scene="1"
                raw_scene_name = div.get_text(strip=True)
                scene_num = div.get('data-scene', '?')
                
                if raw_scene_name:
                    current_scene = f"Scene {scene_num}: {raw_scene_name}"
                else:
                    current_scene = f"Scene {scene_num}"
                    
                # Reset speaker when changing scenes to prevent bleed-over
                current_speaker = None

            # Case 2: Character Name
            elif 'divtype3' in classes:
                current_speaker = normalize_character_name(div)
                
            # Case 3: Dialogue
            elif 'divtype5' in classes:
                raw_text = div.get_text(strip=True)
                clean_text = clean_dialogue_text(raw_text)
                words = [w for w in clean_text.split() if w]
                
                if current_speaker and words:
                    # Add to the Counter for the CURRENT scene
                    scene_data[current_scene][current_speaker] += len(words)

    except Exception as e:
        print(f"An error occurred: {e}")
        return {}

    return scene_data

def print_scene_report(scene_data: Dict[str, Counter]):
    """
    Prints a formatted report for every scene.
    """
    # Sort scenes by their numeric index if possible, otherwise alphabetical
    # This lambda tries to extract the integer from "Scene X" for sorting
    def sort_key(s):
        try:
            return int(re.search(r'Scene (\d+)', s).group(1))
        except:
            return 999

    sorted_scenes = sorted(scene_data.keys(), key=sort_key)

    for scene in sorted_scenes:
        counts = scene_data[scene]
        total_scene_words = sum(counts.values())
        
        if total_scene_words == 0:
            continue # Skip empty scenes

        print(f"\n{'='*30}")
        print(f"{scene} (Total Words: {total_scene_words})")
        print(f"{'='*30}")
        print(f"{'CHARACTER':<35} | {'WORDS':<5}")
        print("-" * 43)
        
        for char, count in counts.most_common():
            print(f"{char:<35} | {count:<5}")

if __name__ == "__main__":
    FILENAME = "The_Gatsby_Rev_1_v1.sbx"
    
    print(f"Breaking down: {FILENAME} by scene...\n")
    data = parse_sbx_by_scene(FILENAME)
    print_scene_report(data)