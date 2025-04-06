"""File-based entrypoint function for the computer-computer solver."""

from pathlib import Path
from typing import Any

from computer_computer.io import (
    read_course_data_from_tsv,
    read_student_data_from_tsv,
)
from computer_computer.models import SolverConfiguration
from computer_computer.solver import ComputerComputerSolver


def get_optimal_course_assignments_from_files(
    courses_file: str,
    students_file: str,
    config: SolverConfiguration = SolverConfiguration(maximum_students_per_teacher=12),
) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
    """Read input data from files and determine optimal course assignments.

    Returns:
        assignments (list[tuple[dict[str, Any], list[dict[str, Any]]]]):
            List of `(course, students)` where `course` is a `Course` object dumped to a dictionary
            and `students` is a list of `Student` objects dumped to dictionaries.
    """
    courses = read_course_data_from_tsv(Path(courses_file))
    first_choices, second_choices = read_student_data_from_tsv(Path(students_file), courses=courses)
    students = list(first_choices.keys())
    solver = ComputerComputerSolver(students, courses, config=config)
    assignments = solver.get_optimal_course_assignments(first_choices, second_choices)
    return [
        (course._asdict(), [student._asdict() for student in students])
        for course, students in assignments.items()
    ]
