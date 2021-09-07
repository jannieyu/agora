from fastapi import FastAPI
from fastapi_sqlalchemy import DBSessionMiddleware, db
from dataclasses import dataclass
from .spa import SPA
from .decorators import CamelModel, get

app = FastAPI()
app.add_middleware(DBSessionMiddleware, db_url="postgresql://")


@dataclass
class _AnimalType:
    species: str
    color: str


@dataclass
class _Animal:
    name: str
    animal_type: _AnimalType


class _Response(CamelModel):
    he_llo: str


@get(app, "/api", _Animal, _Response)
def read_main(args: _Animal) -> _Response:
    print(args)
    response = _Response(he_llo="wor_ld")
    return response


app.mount(path="/", app=SPA(directory="./static"), name="SPA")
