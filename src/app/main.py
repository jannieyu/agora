from fastapi import FastAPI, Depends
from dataclasses import dataclass
from dataclasses_json import dataclass_json, LetterCase
from .decorators import get
from .spa import SPA

app = FastAPI()


@dataclass
class _AnimalType:
    species: str
    color: str


@dataclass
class _Animal:
    name: str
    animal_type: _AnimalType


@get(app, "/api", _Animal)
def read_main(args: _Animal) -> dict[str, str]:
    print(args)
    return {"Hello": "World!"}


app.mount(path="/", app=SPA(directory="./static"), name="SPA")
