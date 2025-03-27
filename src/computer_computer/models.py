"""Datatypes for the computer computer system."""

from enum import StrEnum, auto
from typing import Any

from pydantic import BaseModel, ValidationInfo, field_validator


class Student(BaseModel):
    name: str
    is_multilingual_learner: bool

    def __hash__(self):
        return hash((self.name, self.is_multilingual_learner))


class SubjectArea(StrEnum):
    ELA = auto()
    MATH = auto()
    SCIENCE = auto()
    SOCIAL_STUDIES = auto()
    FOREIGN_LANGUAGE = auto()
    ESL = auto()


class Teacher(BaseModel):
    name: str
    subject_area: SubjectArea

    def __hash__(self):
        return hash((self.name, self.subject_area))


class Course(BaseModel):
    title: str
    period: int
    subject_areas: list[SubjectArea]
    teachers: list[Teacher]

    @field_validator("subject_areas", mode="before")
    @classmethod
    def split_strings_on_commas(cls, value: Any) -> Any:
        if isinstance(value, str):
            if "," in value:
                return value.split(",")
            return [value]
        return value

    @field_validator("teachers", mode="before")
    @classmethod
    def get_teachers_by_names(cls, value: Any, info: ValidationInfo) -> Any:
        if isinstance(value, str):
            if "," in value:
                names = value.split(",")
            else:
                names = [value]
            teachers_in_context = info.context.get("teachers", [])
            teachers_from_names = []
            for name in names:
                try:
                    teachers_from_names.append(
                        [t for t in teachers_in_context if t.name == name][0]
                    )
                except IndexError as e:
                    raise ValueError(
                        f"Unrecognized teacher name: {name}. Ensure complete list of teachers is "
                        "passed to model validation with context={'teachers': [...]}."
                    ) from e
            return teachers_from_names
        return value

    def __hash__(self):
        return hash((self.title, self.period))
