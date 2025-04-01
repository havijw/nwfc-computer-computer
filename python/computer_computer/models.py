"""Datatypes for the computer computer system."""

from typing import NamedTuple


class Student(NamedTuple):
    """Represents a student.

    Attributes:
        name (str): The student's name. Assumed to be unique.
        requires_subjects (list[str]): Subject areas the student must take at least one course in.
    """

    name: str
    """The student's name. Assumed to be unique."""

    required_subjects: tuple[str, ...]
    """Subject areas the student must take at least one course in."""


class Course(NamedTuple):
    """Represents a course.

    Attributes:
        title (str): The title of the course.
        period (int): The period during which the course is held.
        subject_areas (list[str]): Broad subject areas the course covers.
        teachers (list[str]): Teachers teaching the course.
    """

    period: int
    """The period during which the course is held."""

    title: str
    """The course's title."""

    subject_areas: tuple[str, ...]
    """Subject areas the course covers."""

    teachers: tuple[str, ...]
    """Names ot teachers who teach the course."""
