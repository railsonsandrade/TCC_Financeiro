with open('backend/app/api/routes/telegram.py', 'r', encoding='utf-8') as f: content = f.read()
content = content.replace('from app.schemas.copilot import CopilotMessage', '')
content = content.replace('from app.api.routes.copilot import get_financial_context, call_ai_api', 'from app.api.routes.copilot import get_financial_context, call_ai_api, CopilotMessage')
with open('backend/app/api/routes/telegram.py', 'w', encoding='utf-8') as f: f.write(content)
