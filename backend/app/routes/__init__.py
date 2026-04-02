from .auth import bp as auth_bp
from .profile import bp as profile_bp
from .size_estimation import bp as size_estimation_bp
from .wardrobe import bp as wardrobe_bp
from .search import bp as search_bp
from .recommendations import bp as recommendations_bp

__all__ = [
    "auth_bp",
    "profile_bp",
    "size_estimation_bp",
    "wardrobe_bp",
    "search_bp",
    "recommendations_bp",
]

bp = auth_bp
