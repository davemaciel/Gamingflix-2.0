from pathlib import Path
text = Path('src/pages/Admin.tsx').read_text(encoding='utf-8', errors='ignore')
needle = 'get_all_users_for_admin'
idx = text.find(needle)
if idx != -1:
    start = max(0, idx-120)
    end = idx + 220
    print(text[start:end])
