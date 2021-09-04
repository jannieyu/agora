import os
from typing import Tuple, Optional

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()


class SinglePageApplication(StaticFiles):
    """Acts similar to the bripkens/connect-history-api-fallback
    NPM package."""

    def __init__(self, directory: str, index="index.html") -> None:
        self.index = index

        # set html=True to resolve the index even when no
        # the base path is passed in
        super().__init__(directory=directory, packages=None, html=True, check_dir=True)

    async def lookup_path(self, path: str) -> Tuple[str, Optional[os.stat_result]]:
        """Returns the index file when no match is found.

        Args:
            path (str): Resource path.

        Returns:
            [tuple[str, os.stat_result]]: Always retuens a full path and stat result.
        """
        full_path, stat_result = await super().lookup_path(path)

        # if a file cannot be found
        if stat_result is None:
            return await super().lookup_path(self.index)

        return (full_path, stat_result)


@app.get("/api")
async def read_main():
    return {"Hello": "World!"}


app.mount(path="/", app=SinglePageApplication(directory="static"), name="SPA")
