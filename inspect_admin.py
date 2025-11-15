from pathlib import Path
text = Path('src/pages/Admin.tsx').read_text(encoding='utf-8', errors='ignore')
needle = 'Switch checked'
idx = text.find(needle)
if idx != -1:
    start = max(0, idx-200)
    end = idx + 400
    print(text[start:end])
