"""Datatypes for the computer computer system."""

from enum import StrEnum, auto
from typing import Any

from pydantic import BaseModel, ValidationInfo, field_validator


class Student(BaseModel):
    """Represents a student.

    Attributes:
        name (str): The student's name. Assumed to be unique.
        is_multilingual_learner (bool): Whether the student is a multilingual (ESL) learner.
    """

    name: str
    """The student's name. Assumed to be unique."""

    is_multilingual_learner: bool
    """Whether the student is a multilingual (ESL) learner."""

    def __hash__(self):
        """Hash the model by name, which should uniquely identify it."""
        return hash(self.name)


class SubjectArea(StrEnum):
    """Enumeration of broad subject areas for teacher specialties and courses."""

    ELA = auto()
    """English Language Arts"""

    MATH = auto()
    """Math"""

    SCIENCE = auto()
    """Science"""

    SOCIAL_STUDIES = auto()
    """Social studies"""

    FOREIGN_LANGUAGE = auto()
    """Foreign language"""

    ESL = auto()
    """English as a Second Language"""


class Teacher(BaseModel):
    """Represents a teacher.

    Attributes:
        name (str): The teacher's name. Assumed to be unique.
        subject_area (SubjectArea): The subject area the teacher specializes in.
    """

    name: str
    """The teacher's name. Assumed to be unique."""

    subject_area: SubjectArea
    """The subject area the teacher specializes in."""

    def __hash__(self):
        """Hash the model by name and subject area, which should uniquely identify it."""
        return hash((self.name, self.subject_area))


class Course(BaseModel):
    """Represents a course.

    Attributes:
        title (str): The title of the course.
        period (int): The period during which the course is held.
        subject_areas (list[SubjectArea]): Broad subject areas the course covers.
        teachers (list[Teacher]): Teachers teaching the course.
    """

    period: int
    """The period during which the course is held."""

    title: str
    """The course's title."""

    subject_areas: list[SubjectArea]
    """Broad subject areas the course covers."""

    teachers: list[Teacher]
    """Teachers teaching the course."""

    @field_validator("subject_areas", mode="before")
    @classmethod
    def split_strings_on_commas(cls, value: Any) -> Any:
        """Splits a comma-separated string into a list of subject areas.

        Args:
            value (Any): The value to be validated.

        Returns:
            validated (Any): If `value` is a string, a list of strings assuming `value` is a
                comma-separated list. Otherwise, returns `value`.
        """
        if isinstance(value, str):
            if "," in value:
                return value.split(",")
            return [value]
        return value

    @field_validator("teachers", mode="before")
    @classmethod
    def get_teachers_by_names(cls, value: Any, info: ValidationInfo) -> Any:
        """Gets teacher objects by their names.

        Args:
            value (Any): The value to be validated.
            info (ValidationInfo): Validation information, including a `.context` attribute that is
                populated by the `context` keyword argument in validation class methods. The context
                should include a list of `Teacher` objects which will be matched against the
                comma-separated names in `value`.

        Returns:
            validated (Any): If `value` is a string, a list of `Teacher` instances assuming `value`
                is a comma-separated list of names of teachers provided by `info.context`.

        Raises:
            ValueError: If a teacher name does not belong to any teacher given by the context.
        """
        if isinstance(value, str):
            if "," in value:
                names = value.split(",")
            else:
                names = [value]
            if info.context is None:
                teachers_in_context = []
            else:
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
        """Hash the model by title and period, which should uniquely identify it."""
        return hash((self.title, self.period))
