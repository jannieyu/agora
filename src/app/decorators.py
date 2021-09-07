from fastapi.applications import FastAPI
from fastapi.param_functions import Depends
from dataclasses_json import dataclass_json, LetterCase
from typing import cast, Any, Callable, TypeVar
from pydantic import BaseModel
from humps import camelize


def to_camel(string: str) -> str:
    return cast(str, camelize(string))


class CamelModel(BaseModel):
    class Config:
        alias_generator = to_camel
        allow_population_by_field_name = True


F = TypeVar("F", bound=Callable[[Any], Any])
A = TypeVar("A", bound=Any)
R = TypeVar("R", bound=Any)


ROUTES = []


def route(url: str, arg_class: A, response_model: R) -> Callable[[F], F]:
    def inner(func: F) -> F:
        ROUTES.append((url, func, arg_class, response_model))
        return func

    return inner


def get(app: FastAPI, url: str, arg_class: A, response_model: R) -> Callable[[F], F]:
    class _Arguments:
        def __init__(self, data: A):
            self.data = dataclass_json(letter_case=LetterCase.CAMEL)(
                arg_class
            ).from_json(data)

    def inner(func: F) -> F:
        typed_func = lambda args=Depends(_Arguments): func(args.data)
        return cast(F, app.get(url, response_model=response_model)(typed_func))

    return inner
