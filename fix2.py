import re
with open('backend/app/api/routes/telegram.py', 'r', encoding='utf-8') as f: content = f.read()
content = re.sub(r'expirado\.\*[\r\n]+Gere', 'expirado.*\\\\n\\\\nGere', content)
content = re.sub(r'vinculação:[\r\n]+1\.', 'vinculação:\\\\n1.', content)
content = re.sub(r'Telegram[\r\n]+2\.', 'Telegram\\\\n2.', content)
content = re.sub(r'PatarIA\*[\r\n]+\{res', 'PatarIA*\\\\n\\\\n{res', content)
with open('backend/app/api/routes/telegram.py', 'w', encoding='utf-8') as f: f.write(content)
