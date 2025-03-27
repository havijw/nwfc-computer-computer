from pathlib import Path

from computer_computer.io import read_courses_tsv, read_students_tsv, read_teachers_tsv
from computer_computer.solver import ComputerComputerSolver


def test_computer_computer_solver(data_dir: Path):
    students = read_students_tsv(data_dir / "students.tsv")
    teachers = read_teachers_tsv(data_dir / "teachers.tsv")
    courses = read_courses_tsv(data_dir / "courses.tsv", teachers=teachers)
    solver = ComputerComputerSolver(students, courses)
    solver.get_optimal_course_assignments({}, {})
