# -*- coding: utf-8 -*-
import re
with open('backend/app/api/routes/telegram_handle_message.py', 'r', encoding='utf-8') as f: content = f.read()
content = content.replace('\\n', '\\\\n')
with open('backend/app/api/routes/telegram.py', 'r', encoding='utf-8') as f: orig = f.read()
pattern = re.compile(r'async def _handle_message.*?# ─── Endpoints', re.DOTALL)
new_content = pattern.sub(content + '\\n\\n# ─── Endpoints', orig)
with open('backend/app/api/routes/telegram.py', 'w', encoding='utf-8') as f: f.write(new_content)
