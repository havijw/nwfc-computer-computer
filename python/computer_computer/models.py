"""Datatypes for the computer computer system."""

from typing import NamedTuple


class Student(NamedTuple):
    """Represents a student."""

    name: str
    """The student's name. Assumed to be unique."""

    required_subjects: tuple[str, ...]
    """Subject areas in which the student must take a course."""


class Course(NamedTuple):
    """Represents a course.

    The period and title attributes are assumed to uniquely identify a course.
    """

    period: int
    """The period during which the course is held."""

    title: str
    """The course's title."""

    subject_areas: tuple[str, ...]
    """Subject areas the course covers."""

    teachers: tuple[str, ...]
    """Names ot teachers who teach the course."""


class SolverConfiguration(NamedTuple):
    """Contains configuration options for the computer-computer solver."""

    maximum_students_per_teacher: int = 12
    """Absolute maximum number of students per teacher in each course.

    This setting is not used to set the _target_ number of students per course, which is
    calculated to achieve an even distribution of students between courses. This setting is absolute
    and will cause the solver to fail if set too low because there will not be enough slots for
    students among all the courses.
    """

    student_first_choice_preference_weight: float = 2.0
    """The weight given to students' first choice preferences during optimization.

    Controls the importance of first choice preferences. Should be higher than the second choice
    preference weight, otherwise second choices will be considered preferable to first choices by
    the solver.
    """

    student_second_choice_preference_weight: float = 1.0
    """The weight given to students' second choice preferences during optimization.

    Controls the importance of second choice preferences. Should be lower than the first choice
    preference weight, otherwise second choices will be considered preferable to first choices by
    the solver.
    """

    even_student_distribution_weight: float = 1.0
    """The weight given to having an even distribution of students per teacher during optimization.

    Controls the importance having a similar number of students per teacher between all courses.
    """
