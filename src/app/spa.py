from fastapi.staticfiles import StaticFiles
from typing import Optional
import os


class SPA(StaticFiles):
    """Routes all unmatched requests to static/index.html"""

    def __init__(self, directory: str, index="index.html") -> None:
        self.index = index

        super().__init__(directory=directory, packages=None, html=True, check_dir=True)

    async def lookup_path(self, path: str) -> tuple[str, Optional[os.stat_result]]:
        full_path, stat_result = await super().lookup_path(path)

        # if a file cannot be found
        if stat_result is None and not path.startswith("api/"):
            return await super().lookup_path(self.index)

        return (full_path, stat_result)
