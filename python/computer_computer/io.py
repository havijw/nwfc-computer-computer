"""Read collections of models from files."""

from collections.abc import Iterable, Sequence
import csv
from pathlib import Path

from computer_computer.models import Course, Student, Teacher


def read_students_tsv(students_file: Path) -> list[Student]:
    """Read a list of students from a TSV file."""
    with students_file.open(newline="") as tsv_file:
        student_reader = csv.reader(tsv_file, delimiter="\t")
        next(student_reader)  # Skip the header row
        field_names = list(Student.model_fields)
        return [Student.model_validate(dict(zip(field_names, row))) for row in student_reader]


def read_teachers_tsv(teachers_file: Path) -> list[Teacher]:
    """Read a list of teachers from a TSV file."""
    with teachers_file.open(newline="") as tsv_file:
        teacher_reader = csv.reader(tsv_file, delimiter="\t")
        next(teacher_reader)  # Skip the header row
        field_names = list(Teacher.model_fields)
        return [Teacher.model_validate(dict(zip(field_names, row))) for row in teacher_reader]


def read_courses_tsv(courses_file: Path, teachers: Sequence[Teacher]) -> list[Course]:
    """Read a list of courses from a TSV file."""
    with courses_file.open(newline="") as tsv_file:
        course_reader = csv.reader(tsv_file, delimiter="\t")
        next(course_reader)  # Skip the header row
        field_names = list(Course.model_fields)
        return [
            Course.model_validate(dict(zip(field_names, row)), context={"teachers": teachers})
            for row in course_reader
        ]


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

    with preferences_file.open(newline="") as tsv_file:
        preferences_reader = csv.reader(tsv_file, delimiter="\t")
        next(preferences_reader)  # Skip the header row
        for row in preferences_reader:
            try:
                student = names_to_students[row[0]]
            except KeyError as e:
                raise ValueError(f"Unrecognized student name: {row[0]}.") from e
            student_first_choices: list[Course] = []
            student_second_choices: list[Course] = []
            for period in range(1, (len(row) - 1) // 2 + 1):
                try:
                    student_first_choices.append(titles_to_courses[row[period * 2 - 1]])
                except KeyError as e:
                    raise ValueError(f"Unrecognized course title: {row[period * 2 - 1]}.") from e
                try:
                    student_second_choices.append(titles_to_courses[row[period * 2]])
                except KeyError as e:
                    raise ValueError(f"Unrecognized course title: {row[period * 2]}.") from e
            first_choices[student] = student_first_choices
            second_choices[student] = student_second_choices

    return first_choices, second_choices
