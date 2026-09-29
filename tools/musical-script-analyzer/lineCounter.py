import re
from collections import defaultdict

def analyze_gatsby_script(filename="script yuh (Rev 1) (1).txt"):
    """
    Parses the script to match the 'Ground Truth' methodology:
    - Separates Scene Lines from Song Lines.
    - Removes [source] tags.
    - Counts number of speaking turns per character.
    """
    
    # --- Data Stores ---
    # { 'Scene 1.1': { 'NATE': 5, 'ROSIE': 3 }, ... } (speaking turn counts)
    scene_data = defaultdict(lambda: defaultdict(int))
    
    # { 'Song 1': { 'NATE': 10 }, ... } (speaking turn counts)
    song_data = defaultdict(lambda: defaultdict(int))
    
    # --- State Variables ---
    current_context_name = "Start" # e.g., "1.1" or "Song 1"
    is_song_mode = False           # True if we are in a song, False if in a scene
    current_speaker = None
    speaker_has_spoken = False     # Track if current speaker has started speaking

    # --- Regex Patterns ---
    
    # 1. Source Tag Removal: Matches ""
    SOURCE_PATTERN = re.compile(r'<[^>]+>')
    
    # 2. Context Headers
    # Matches "Scene 1.1" or "1.1" at start of line
    SCENE_HEADER = re.compile(r'^(?:Scene\s+)?(\d+\.\d+)', re.IGNORECASE)
    # Matches "Song 1" or "Song 2:"
    SONG_HEADER = re.compile(r'^Song\s+(\d+)', re.IGNORECASE)
    
    # 3. Speaker Detection
    # Logic: Look for lines that are UPPERCASE (allowing numbers/dots for 'FIRST YEAR 1')
    # Must be at least 2 chars long.
    # Exclude common non-speaker uppercase words like "INT.", "EXT."
    SPEAKER_PATTERN = re.compile(r'^([A-Z0-9\s\.\-\']+)$')
    
    # Words to ignore if they appear in all caps (not characters)
    IGNORE_KEYWORDS = {"INT.", "EXT.", "THE END", "BLACKOUT", "ACT", "SCENE"}

    with open(filename, 'r', encoding='utf-8') as f:
        for line in f:
            # --- A. Cleanup ---
            # Remove tags anywhere in the line
            line = SOURCE_PATTERN.sub('', line).strip()
            
            # Skip empty lines
            if not line:
                continue

            # --- B. Context Switching ---
            
            # Check for Scene Header (e.g. "1.1" or "Scene 1.1")
            scene_match = SCENE_HEADER.match(line)
            if scene_match:
                current_context_name = scene_match.group(1) # Just "1.1"
                is_song_mode = False
                current_speaker = None
                speaker_has_spoken = False
                continue

            # Check for Song Header (e.g. "Song 2")
            song_match = SONG_HEADER.match(line)
            if song_match:
                current_context_name = f"Song {song_match.group(1)}"
                is_song_mode = True
                current_speaker = None
                speaker_has_spoken = False
                continue

            # --- C. Speaker Detection ---
            
            # Check if line is a Speaker Header
            if SPEAKER_PATTERN.match(line):
                # Double check it's not a stage direction or scene header
                if any(keyword in line for keyword in IGNORE_KEYWORDS):
                    current_speaker = None
                    continue
                
                # Check for " - " format (e.g. "RENEESE - STUDENT 1")
                # We usually want the first part as the actor/key
                if " - " in line:
                    clean_name = line.split(" - ")[0].strip()
                else:
                    clean_name = line
                
                current_speaker = clean_name
                speaker_has_spoken = False  # Reset for new speaker
                continue # Don't count the name itself as a line

            # --- D. Speaking Turn Counting ---
            
            if current_speaker:
                # Ignore stage directions in parentheses
                if line.startswith('(') or line.endswith(')'):
                    continue
                
                # Ignore stage directions in brackets
                if line.startswith('[') or line.endswith(']'):
                    continue
                
                # If we made it here, it's a valid spoken/sung line!
                # Count only the first line of dialogue for this speaking turn
                if not speaker_has_spoken:
                    if is_song_mode:
                        song_data[current_context_name][current_speaker] += 1
                    else:
                        scene_data[current_context_name][current_speaker] += 1
                    speaker_has_spoken = True

    return scene_data, song_data

def print_percentages(scene_data, song_data):
    """Prints percentage of speaking turns per character."""
    
    # Combine all speaking turns from scenes and songs
    total_turns_by_speaker = defaultdict(int)
    
    # Add scene turns
    for scene in scene_data.values():
        for speaker, count in scene.items():
            total_turns_by_speaker[speaker] += count
    
    # Add song turns
    for song in song_data.values():
        for speaker, count in song.items():
            total_turns_by_speaker[speaker] += count
    
    # Calculate total speaking turns in script
    total_turns = sum(total_turns_by_speaker.values())
    
    if total_turns == 0:
        print("No dialogue found in script.")
        return
    
    # Sort by turn count (descending)
    sorted_speakers = sorted(total_turns_by_speaker.items(), key=lambda x: x[1], reverse=True)
    
    # Print results
    print("="*60)
    print("🎭 SPEAKING TURNS PERCENTAGES")
    print("="*60)
    print(f"{'CHARACTER':<30} | {'TURNS':<10} | {'PERCENTAGE':<10}")
    print("-" * 60)
    
    for speaker, count in sorted_speakers:
        percentage = (count / total_turns) * 100
        print(f"{speaker:<30} | {count:<10} | {percentage:>6.2f}%")
    
    print("-" * 60)
    print(f"{'TOTAL':<30} | {total_turns:<10} | {'100.00%':>10}")
    print("="*60)

# --- Run ---
scene_data, song_data = analyze_gatsby_script()
print_percentages(scene_data, song_data)