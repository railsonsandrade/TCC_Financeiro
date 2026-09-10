from fastapi.testclient import TestClient; from app.main import app; client = TestClient(app); res = client.get('/api/v1/telegram/status'); print(res.status_code, res.text)
