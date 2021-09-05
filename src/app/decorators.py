from fastapi.applications import FastAPI
from fastapi.param_functions import Depends
from dataclasses_json import dataclass_json, LetterCase
from typing import cast, Any, Callable, TypeVar


F = TypeVar("F", bound=Callable[[Any], Any])
C = TypeVar("C", bound=Any)


def get(app: FastAPI, url: str, arg_class: C) -> Callable[[F], F]:
    class _Arguments:
        def __init__(self, data: C):
            self.data = dataclass_json(letter_case=LetterCase.CAMEL)(
                arg_class
            ).from_json(data)

    def inner(func: F) -> F:
        typed_func = lambda args=Depends(_Arguments): func(args.data)
        return cast(F, app.get(url)(typed_func))

    return inner
