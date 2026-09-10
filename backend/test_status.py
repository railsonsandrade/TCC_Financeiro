from app.utils.database import db; from app.services.telegram_service import TelegramService; ts = TelegramService(); print('Status:', ts.get_status(1))
