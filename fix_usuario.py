with open('backend/app/services/usuario_service.py', 'r', encoding='utf-8') as f: content = f.read()
content = content + '\\n' + new_method
with open('backend/app/services/usuario_service.py', 'w', encoding='utf-8') as f: f.write(content)
