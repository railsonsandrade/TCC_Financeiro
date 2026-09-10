from app.main import app; [print(r.path) for r in app.routes if hasattr(r, 'path')]; print('---'); [print(r.path) for r in app.router.routes if hasattr(r, 'path')]
