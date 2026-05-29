import re
from collections import defaultdict

def analyze_script(filename="script_yuh_rev1.txt"):
    """
    Reads a script file, counts total characters per speaker,
    and also tracks character count broken down by scene.
    """
    # Dictionary to store total character count for each character
    total_character_counts = defaultdict(int)
    
    # Dictionary to store character count per scene: {'Scene 1.1': {'NATE': 150, 'ROSIE': 80}, ...}
    scene_character_counts = defaultdict(lambda: defaultdict(int))
    
    current_character = None
    current_scene = "PRE-SCRIPT" # Default scene for metadata at the top

    # Pattern for Character Names: Allows capital letters, numbers, spaces, and periods.
    CHARACTER_NAME_PATTERN = re.compile(r'^[A-Z0-9\s\.]{2,40}$')

    # Pattern to detect a new scene header (e.g., "Scene 1.1:" or "Scene 1.2: Hatch Bay")
    # This specifically looks for "Scene X.Y:"
    SCENE_PATTERN = re.compile(r'^Scene\s+(\d+\.\d+):')

    # List of Character Names that are part of the team/group
    NAMED_GROUPS = [
        "ALL HITBIKERS", 
        "SPACE CANOER ERIN", 
        "SPACE CANOER AARON",
        "HITBIKERS MEMBER 1",
        "HITBIKERS MEMBER 2",
        "HITBIKERS MEMBER 3",
        "HITBIKERS MEMBER 4",
        "HITBIKER BIK-HER",
        "HITBIKER GILBERT",
        "HITBIKER MARIANA GILBERT",
        "SPACE CANOER FLARE FAN",
        "SPACE CANOER 1",
        "SPACE CANOER 2",
        "SPACE CANOER 3",
        "SPACE CANOER 4",
        "SPACEY JANE",
        "GOSSIP 1",
        "GOSSIP 2",
        "GOSSIP 3",
        "GOSSIP 4"
    ]
    
    GROUP_SPEAKER = "ALL HITBIKERS"


    def is_stage_direction(line):
        """Checks if a line is a stage direction enclosed in parentheses or brackets or starts with a song cue."""
        return (line.startswith('(') and line.endswith(')')) or \
               (line.startswith('[') and line.endswith(']')) or \
               line.startswith('*') or \
               line.startswith('Song') # Catches Song cues like "Song 2"

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()

                if not line:
                    current_character = None
                    continue

                # 1. Check for a new scene
                scene_match = SCENE_PATTERN.match(line)
                if scene_match:
                    current_scene = scene_match.group(1)
                    current_character = None # Reset character for the new scene
                    continue

                if is_stage_direction(line):
                    current_character = None
                    continue
                
                # 2. Check for a new character header
                if CHARACTER_NAME_PATTERN.match(line):
                    name = line.split(':')[0].strip()
                    
                    if name in NAMED_GROUPS:
                        if name == "ALL HITBIKERS":
                            current_character = GROUP_SPEAKER
                        else:
                            current_character = name
                    else:
                        current_character = name
                    
                    continue
                
                # 3. Count dialogue
                if current_character and current_scene != "PRE-SCRIPT":
                    count = len(line)
                    # Accumulate total count
                    total_character_counts[current_character] += count
                    # Accumulate scene-specific count
                    scene_character_counts[current_scene][current_character] += count
    
    except FileNotFoundError:
        print(f"Error: The file '{filename}' was not found. Please check the name and location.")
        return

    # 4. Print results
    print_results(total_character_counts, scene_character_counts)


def print_results(total_character_counts, scene_character_counts):
    """Formats and prints the analysis results."""

    all_characters = sorted(total_character_counts.keys())
    total_script_chars = sum(total_character_counts.values())

    print("\n" + "=" * 80)
    print("🎭 MUSICAL SCRIPT CHARACTER WORKLOAD ANALYSIS 🎭")
    print("=" * 80)

    ## A. Total Character Breakdown (Alphabetical)
    print("\n## 🎤 Total Character Count (Alphabetical)")
    print("-" * 50)
    print(f"{'CHARACTER':<25}{'TOTAL CHARACTERS':>15}{'% OF TOTAL':>15}")
    print("-" * 55)

    for character in all_characters:
        count = total_character_counts[character]
        percentage = (count / total_script_chars) * 100 if total_script_chars else 0
        print(f"{character:<25}{count:>15,}{percentage:>14.1f}%")

    print("-" * 55)
    print(f"{'TOTAL SCRIPT DIALOGUE':<25}{total_script_chars:>15,}{100.0:>14.1f}%")
    print("-" * 50)

    ## B. Breakdown by Scene
    print("\n## 🎬 Character Count Breakdown by Scene")
    print("This table shows the character count for each character, broken down by scene.")
    
    # Prepare column headers: Scene columns + Total column
    scene_keys = sorted(scene_character_counts.keys())
    
    # Calculate the overall total characters for each character across all scenes
    character_totals = {char: sum(scene_character_counts[scene].get(char, 0) for scene in scene_keys) 
                        for char in all_characters}

    # Dynamic Header Generation
    header = f"{'CHARACTER':<20}"
    header_separator = "-" * 20
    
    for scene in scene_keys:
        header += f"{scene:>8}"
        header_separator += "-" * 8
        
    header += f"{'TOTAL':>10}"
    header_separator += "-" * 10
    
    print("\n" + header)
    print(header_separator)

    # Print Data Rows
    for character in all_characters:
        row = f"{character:<20}"
        
        # Print count for each scene
        for scene in scene_keys:
            count = scene_character_counts[scene].get(character, 0)
            row += f"{count:>8,}"

        # Print total count for the character
        row += f"{character_totals[character]:>10,}"
        print(row)
    
    print(header_separator)
    
    # Print Scene Totals Row
    scene_totals_row = f"{'SCENE TOTALS':<20}"
    grand_total_check = 0
    for scene in scene_keys:
        scene_total = sum(scene_character_counts[scene].values())
        scene_totals_row += f"{scene_total:>8,}"
        grand_total_check += scene_total
    
    scene_totals_row += f"{grand_total_check:>10,}"
    print(scene_totals_row)
    print(header_separator)


# Execute the function
analyze_script()