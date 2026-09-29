# Musical Script Analyzer

Python scripts that parse a musical's script and report how much each character speaks, broken down by scene and by song. Built to help with casting and rehearsal planning.

**Tech:** Python, pypdf, BeautifulSoup

## Scripts

| Script | Input | What it does |
| --- | --- | --- |
| `pdf_converter.py` | PDF script | Extracts and cleans the text (removes page numbers, tidies character names) |
| `lineCounter.py` | Plain-text script | Counts speaking turns per character, split into scenes and songs |
| `lineCounterScene.py` | Plain-text script | Counts characters spoken per character, per scene |
| `sbxCounter.py` | `.sbx` script file | Counts words per character, per scene |

## Usage

```bash
pip install pypdf beautifulsoup4
python sbxCounter.py
```

Each script's input filename is set as a default argument or constant near the top/bottom of the file.

## Sample output

`Output_Scenes.csv` and `Output_Songs.csv` show the per-character breakdown produced from the included `.sbx` script.
