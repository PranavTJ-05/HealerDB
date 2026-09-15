"""
Legacy configuration import bridge for backward compatibility.
All core settings are now maintained in `src.core.settings`.
"""
from src.core.settings import AppSettings, settings

__all__ = ["AppSettings", "settings"]
