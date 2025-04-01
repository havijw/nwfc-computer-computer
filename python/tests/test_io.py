from pathlib import Path

import pytest

from computer_computer.io import (
    normalize_tuple_str_field,
    read_course_data_from_tsv,
    read_student_data_from_tsv,
)


@pytest.mark.parametrize(
    "input",
    ["a,b,,c", ",,a,b", "a,b,", " , "],
)
def test_split_tuple_str_field(input: str):
    # Mostly making sure no whitespace-only strings get through
    for value in normalize_tuple_str_field(input):
        assert len(value) > 0


def test_read_course_data_from_tsv(data_dir: Path):
    courses = read_course_data_from_tsv(data_dir / "courses.tsv")
    print(courses)
    assert len(courses) > 0
    for course in courses:
        assert len(course.subject_areas) > 0
        assert len(course.teachers) > 0


def test_read_student_data_from_tsv(data_dir: Path):
    courses = read_course_data_from_tsv(data_dir / "courses.tsv")
    first_choices, second_choices = read_student_data_from_tsv(
        data_dir / "preferences.tsv", courses=courses
    )
    assert len(first_choices) > 0
    assert len(second_choices) > 0
    for student in first_choices:
        assert student in second_choices
        assert len(first_choices[student]) == 3
    for student in second_choices:
        assert student in first_choices
        assert len(second_choices[student]) == 3
