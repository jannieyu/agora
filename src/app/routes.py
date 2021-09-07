from dataclasses import dataclass
from .decorators import CamelModel, route


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


@route("/api", _Animal, _Response)
def read_main(args: _Animal) -> _Response:
    print(args)
    response = _Response(he_llo="wor_ld")
    return response
