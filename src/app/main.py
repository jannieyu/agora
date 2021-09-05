from fastapi import FastAPI
from .spa import SPA

app = FastAPI()


@app.get("/api")
async def read_main():
    return {"Hello": "World!"}


app.mount(path="/", app=SPA(directory="./static"), name="SPA")
