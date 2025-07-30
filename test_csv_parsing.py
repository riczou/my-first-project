import csv
import io

# Simulate the exact same parsing logic as the backend
csv_data = """Notes:
This file contains connections from your LinkedIn network.
Learn more about exporting your connections.
First Name,Last Name,URL,Email Address,Company,Position,Connected On
DEBUG,TEST,https://test.url,debug@test.com,DebugCorp,Test Engineer,26 Jul 2025"""

print("Original CSV data:")
print(csv_data)
print("\n" + "="*50 + "\n")

# Process exactly like the backend
lines = csv_data.split('\n')
header_found = False
clean_lines = []
linkedin_format = False

for i, line in enumerate(lines):
    print(f"Line {i}: '{line.strip()}'")
    
    # Skip empty lines
    if not line.strip():
        continue
        
    # Detect LinkedIn format specifically by looking for the exact header pattern
    if not header_found and line.strip().startswith('First Name,Last Name'):
        print(f"  -> DETECTED LINKEDIN HEADER")
        header_found = True
        linkedin_format = True
        clean_lines.append(line)
        continue
    
    # Add data lines after header is found
    if header_found:
        print(f"  -> ADDING DATA LINE")
        clean_lines.append(line)

print(f"\nLinkedIn format detected: {linkedin_format}")
print(f"Clean lines: {clean_lines}")
print("\n" + "="*50 + "\n")

# Create CSV reader
clean_csv_data = '\n'.join(clean_lines)
print("Clean CSV data:")
print(clean_csv_data)
print("\n" + "="*50 + "\n")

csv_reader = csv.DictReader(io.StringIO(clean_csv_data))
print("CSV headers:", csv_reader.fieldnames)

for row_num, row in enumerate(csv_reader, start=2):
    print(f"Row {row_num}: {dict(row)}")
    
    if linkedin_format:
        # Handle LinkedIn specific field mapping  
        first = row.get('First Name', '')
        last = row.get('Last Name', '')
        name = f"{first or ''} {last or ''}".strip()
        company = row.get('Company', '')
        title = row.get('Position', '')
        email = row.get('Email Address', '')
        profile_url = row.get('URL', '')
        
        print(f"  Parsed: name='{name}', company='{company}', title='{title}', url='{profile_url}'")