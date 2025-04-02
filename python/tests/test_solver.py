from pathlib import Path

from computer_computer.io import read_course_data_from_tsv, read_student_data_from_tsv
from computer_computer.solver import ComputerComputerSolver


def test_computer_computer_solver(data_dir: Path):
    courses = read_course_data_from_tsv(data_dir / "courses.tsv")
    first_choices, second_choices = read_student_data_from_tsv(
        data_dir / "preferences.tsv", courses=courses
    )
    students = list(first_choices.keys())
    solver = ComputerComputerSolver(students, courses)
    course_assignments = solver.get_optimal_course_assignments(first_choices, second_choices)
    for course in courses:
        assert course in course_assignments
        assert len(course_assignments[course]) > 0
