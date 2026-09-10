import re
with open('backend/app/api/routes/telegram.py', 'r', encoding='utf-8') as f: content = f.read()
content = re.sub(r'sucesso!\*[\r\n]+Agora', 'sucesso!*\\\\n\\\\nAgora', content)
with open('backend/app/api/routes/telegram.py', 'w', encoding='utf-8') as f: f.write(content)
