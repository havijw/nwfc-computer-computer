"""Datatypes for the computer computer system."""

from typing import NamedTuple


class Student(NamedTuple):
    """Represents a student.

    Attributes:
        name (str): The student's name. Assumed to be unique.
        requires_subjects (tuple[str, ...]): Subject areas in which the student must take a course.
    """

    name: str
    """The student's name. Assumed to be unique."""

    required_subjects: tuple[str, ...]
    """Subject areas in which the student must take a course."""


class Course(NamedTuple):
    """Represents a course.

    The period and title attributes are assumed to uniquely identify a course.

    Attributes:
        period (int): The period during which the course is held.
        title (str): The title of the course.
        subject_areas (tuple[str, ...]): Subject areas the course covers.
        teachers (tuple[str, ...]): Names ot teachers who teach the course
    """

    period: int
    """The period during which the course is held."""

    title: str
    """The course's title."""

    subject_areas: tuple[str, ...]
    """Subject areas the course covers."""

    teachers: tuple[str, ...]
    """Names ot teachers who teach the course."""
