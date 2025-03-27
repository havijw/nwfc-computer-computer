"""Read collections of models from files."""

from collections.abc import Iterable, Sequence
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


def read_courses_tsv(courses_file: Path, teachers: Sequence[Teacher]) -> list[Course]:
    """Read a list of courses from a CSV file."""
    with courses_file.open(newline="") as csv_file:
        course_reader = csv.DictReader(csv_file, delimiter="\t")
        return [Course.model_validate(row, context={"teachers": teachers}) for row in course_reader]


def read_preferences_tsv(
    preferences_file: Path, students: Iterable[Student], courses: Iterable[Course]
) -> tuple[dict[Student, list[Course]], dict[Student, list[Course]]]:
    """Read student course preferences from file.

    Returns:
        preferences (tuple[dict[Student, Course], dict[Student, Course]]):
            Tuple containing dictionaries that map students to courses, representing students'
            first and second choices.
    """
    first_choices: dict[Student, list[Course]] = {}
    second_choices: dict[Student, list[Course]] = {}

    names_to_students = {student.name: student for student in students}
    titles_to_courses = {course.title: course for course in courses}

    with preferences_file.open(newline="") as csv_file:
        preferences_reader = csv.DictReader(csv_file, delimiter="\t")
        for row in preferences_reader:
            try:
                student = names_to_students[row["student"]]
            except KeyError as e:
                raise ValueError(f"Unrecognized student name: {row['student']}.") from e
            student_first_choices: list[Course] = []
            student_second_choices: list[Course] = []
            for period in range(1, 4):
                try:
                    student_first_choices.append(titles_to_courses[row[f"first_choice{period}"]])
                except KeyError as e:
                    raise ValueError(
                        f"Unrecognized course title: {row[f'first_choice{period}']}."
                    ) from e
                try:
                    student_second_choices.append(titles_to_courses[row[f"second_choice{period}"]])
                except KeyError as e:
                    raise ValueError(
                        f"Unrecognized course title: {row[f'second_choice{period}']}."
                    ) from e
            first_choices[student] = student_first_choices
            second_choices[student] = student_second_choices

    return first_choices, second_choices
