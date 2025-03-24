"""Datatypes for the computer computer system."""

from enum import StrEnum, auto

from pydantic import BaseModel


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

    def __hash__(self):
        return hash((self.title, self.period))


class Student(BaseModel):
    name: str
    is_multilingual_learner: bool

    def __hash__(self):
        return hash((self.name, self.is_multilingual_learner))
