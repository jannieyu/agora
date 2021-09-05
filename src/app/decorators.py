from fastapi.applications import FastAPI
from fastapi.param_functions import Depends
from dataclasses_json import dataclass_json, LetterCase
from typing import cast, Any, Callable, TypeVar


F = TypeVar("F", bound=Callable[[Any], Any])
A = TypeVar("A", bound=Any)
R = TypeVar("R", bound=Any)


def get(app: FastAPI, url: str, arg_class: A, response_class: R) -> Callable[[F], F]:
    class _Arguments:
        def __init__(self, data: A):
            self.data = dataclass_json(letter_case=LetterCase.CAMEL)(
                arg_class
            ).from_json(data)

    res = dataclass_json(letter_case=LetterCase.CAMEL)(response_class)

    def inner(func: F) -> F:
        typed_func = lambda args=Depends(_Arguments): res.to_json(func(args.data))
        return cast(F, app.get(url)(typed_func))

    return inner
