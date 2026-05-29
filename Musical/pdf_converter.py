import re
from pypdf import PdfReader

def convert_pdf_to_clean_text(input_pdf="HAMLENG_Script_Rev_1.pdf", output_txt="formatted_script.txt"):
    """
    Reads the HAMLENG PDF, cleans up formatting (removes page numbers, 
    fixes brackets around names), and saves a clean .txt file.
    """
    
    print(f"📄 Reading {input_pdf}...")
    
    try:
        reader = PdfReader(input_pdf)
        clean_lines = []
        
        # Patterns to remove or clean
        # 1. Page numbers (e.g., "1.", "10", "--- PAGE 2 ---")
        PAGE_NUM_PATTERN = re.compile(r'^\s*(?:\d+\.?|--- PAGE \d+ ---)\s*$', re.IGNORECASE)
        
        # 2. Names in brackets (e.g., "[HOWARD]" -> "HOWARD")
        BRACKET_NAME_PATTERN = re.compile(r'^\[([A-Z0-9\s\.\,\'-]+)\]\s*$')
        
        # 3. Source tags (if they exist in the raw text)
        SOURCE_TAG_PATTERN = re.compile(r'<[^>]+>')

        for page in reader.pages:
            text = page.extract_text()
            
            if not text:
                continue
                
            lines = text.splitlines()
            
            for line in lines:
                line = line.strip()
                
                # Skip empty lines
                if not line:
                    continue
                
                # Remove tags if present
                line = SOURCE_TAG_PATTERN.sub('', line).strip()
                
                # Skip Page Numbers
                if PAGE_NUM_PATTERN.match(line):
                    continue
                
                # Fix [NAME] -> NAME
                # This makes it easier for your counting script to detect the character
                bracket_match = BRACKET_NAME_PATTERN.match(line)
                if bracket_match:
                    line = bracket_match.group(1) # Replaces "[HOWARD]" with "HOWARD"
                
                # Append the clean line
                clean_lines.append(line)
        
        # Save to file
        with open(output_txt, "w", encoding="utf-8") as f:
            f.write("\n".join(clean_lines))
            
        print(f"✅ Success! Clean script saved to: {output_txt}")
        print("🚀 You can now run your line counting script on this file.")

    except FileNotFoundError:
        print(f"❌ Error: Could not find {input_pdf}. Make sure it is in this folder.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

# Run the converter
convert_pdf_to_clean_text()