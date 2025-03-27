"""File-based entrypoint function for the computer-computer solver."""

from pathlib import Path
from typing import Any

from computer_computer.io import (
    read_courses_tsv,
    read_preferences_tsv,
    read_students_tsv,
    read_teachers_tsv,
)
from computer_computer.solver import ComputerComputerSolver


def get_optimal_course_assignments_from_files(
    students_file: str, teachers_file: str, courses_file: str, preferences_file: str
) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
    """Read input data from files and determine optimal course assignments.

    Returns:
        assignments (list[tuple[dict[str, Any], list[dict[str, Any]]]]):
            List of `(course, students)` where `course` is a `Course` object dumped to a dictionary
            and `students` is a list of `Student` objects dumped to dictionaries.
    """
    students = read_students_tsv(Path(students_file))
    teachers = read_teachers_tsv(Path(teachers_file))
    courses = read_courses_tsv(Path(courses_file), teachers=teachers)
    first_choices, second_choices = read_preferences_tsv(
        Path(preferences_file), students=students, courses=courses
    )
    solver = ComputerComputerSolver(students, courses)
    assignments = solver.get_optimal_course_assignments(first_choices, second_choices)
    return [
        (course.model_dump(mode="json"), [student.model_dump(mode="json") for student in students])
        for course, students in assignments.items()
    ]
