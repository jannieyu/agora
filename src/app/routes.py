from dataclasses import dataclass
from .decorators import CamelModel


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


def read_main(args: _Animal) -> _Response:
    print(args)
    response = _Response(he_llo="wor_ld")
    return response


ROUTES = [("/api", read_main, _Animal, _Response)]
