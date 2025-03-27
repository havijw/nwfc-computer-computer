"""Read collections of models from files."""

import csv
from pathlib import Path

from computer_computer.models import Course, Student, Teacher


def read_students_tsv(students_file: Path) -> list[Student]:
    """Read a list of students from a CSV file."""
    with students_file.open(newline="") as csv_file:
        student_reader = csv.DictReader(csv_file, delimiter="\t")
        return [Student.model_validate(row) for row in student_reader]


def read_teachers_tsv(teachers_file: Path) -> list[Teacher]:
    """Read a list of teachers from a CSV file."""
    with teachers_file.open(newline="") as csv_file:
        teacher_reader = csv.DictReader(csv_file, delimiter="\t")
        return [Teacher.model_validate(row) for row in teacher_reader]


def read_courses_tsv(courses_file: Path, teachers: list[Teacher]) -> list[Course]:
    """Read a list of courses from a CSV file."""
    with courses_file.open(newline="") as csv_file:
        course_reader = csv.DictReader(csv_file, delimiter="\t")
        return [Course.model_validate(row, context={"teachers": teachers}) for row in course_reader]
