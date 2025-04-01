"""Read collections of models from files."""

from collections.abc import Iterable
import csv
from pathlib import Path

from computer_computer.models import Course, Student


def normalize_str_field(value: str) -> str:
    """Strip extra whitespace and make the value lowercase."""
    return value.strip()


def normalize_tuple_str_field(value: str) -> tuple[str, ...]:
    """Split list of strings by commas and normalize each value in the list."""
    all_values = [normalize_str_field(v) for v in value.split(",")]
    return tuple(v for v in all_values if len(v) > 0)


def read_course_data_from_tsv(course_file: Path) -> list[Course]:
    """Read a list of courses from a TSV file."""
    with course_file.open(newline="") as tsv_file:
        course_reader = csv.reader(tsv_file, delimiter="\t")
        next(course_reader)  # Skip the header row
        courses: list[Course] = []
        for row in course_reader:
            if len(row) != len(Course._fields):
                raise ValueError(
                    "Row has wrong number of fields\n"
                    f"Row: {'\t'.join(row)}\n"
                    f"Expected fields: {Course._fields}"
                )
            period_str, title, subject_areas_str, teachers_str = row
            period = int(period_str)
            title = normalize_str_field(title)
            subject_areas = tuple(a.upper() for a in normalize_tuple_str_field(subject_areas_str))
            teachers = normalize_tuple_str_field(teachers_str)
            courses.append(
                Course(period=period, title=title, subject_areas=subject_areas, teachers=teachers)
            )
        return courses


def read_student_data_from_tsv(
    student_file: Path, courses: Iterable[Course]
) -> tuple[dict[Student, list[Course]], dict[Student, list[Course]]]:
    """Read list of students with their first and second choice courses for each period.

    Returns:
        preferences (tuple[dict[Student, list[Course]], dict[Student, list[Course]]])
            Tuple containing dictionaries that map students to courses, representing students' first
            and second choices for each period.
    """
    first_choices: dict[Student, list[Course]] = {}
    second_choices: dict[Student, list[Course]] = {}

    titles_to_courses = {(course.period, course.title.lower()): course for course in courses}

    with student_file.open(newline="") as tsv_file:
        student_reader = csv.reader(tsv_file, delimiter="\t")
        next(student_reader)  # Skip the header row
        for row in student_reader:
            student_name_str, requirements_str, *preferences = row
            student_name = normalize_str_field(student_name_str)
            requirements = tuple(r.upper() for r in normalize_tuple_str_field(requirements_str))
            student = Student(name=student_name, required_subjects=requirements)
            first_choices[student] = []
            second_choices[student] = []
            for period, (first_choice, second_choice) in enumerate(
                zip(preferences[::2], preferences[1::2]), start=1
            ):
                try:
                    first_choices[student].append(
                        titles_to_courses[period, normalize_str_field(first_choice).lower()]
                    )
                except KeyError as e:
                    raise ValueError(
                        f"Unrecognized course title for period {period}: {first_choice}"
                    ) from e
                try:
                    second_choices[student].append(
                        titles_to_courses[period, normalize_str_field(second_choice).lower()]
                    )
                except KeyError as e:
                    raise ValueError(
                        f"Unrecognized course title for period {period}: {second_choice}"
                    ) from e
        return first_choices, second_choices
