# Load Celery app only when broker is configured (avoids requiring celery/redis for migrations)
try:
    from .celery import app as celery_app
    __all__ = ("celery_app",)
except (ImportError, Exception):
    __all__ = ()
