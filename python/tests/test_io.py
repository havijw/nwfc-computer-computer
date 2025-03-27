from pathlib import Path

from computer_computer.io import (
    read_courses_tsv,
    read_preferences_tsv,
    read_students_tsv,
    read_teachers_tsv,
)
from computer_computer.models import Course, Student, SubjectArea, Teacher


def test_read_students_tsv(data_dir: Path):
    students = read_students_tsv(data_dir / "students.tsv")
    assert len(students) > 0
    for student in students:
        assert isinstance(student, Student)
        assert len(student.name) > 0
    assert any(student.is_multilingual_learner for student in students)


def test_read_teachers_tsv(data_dir: Path):
    teachers = read_teachers_tsv(data_dir / "teachers.tsv")
    assert len(teachers) > 0
    for teacher in teachers:
        assert isinstance(teacher, Teacher)
        assert len(teacher.name) > 0
        assert isinstance(teacher.subject_area, SubjectArea)


def test_read_courses_tsv(data_dir: Path):
    teachers = read_teachers_tsv(data_dir / "teachers.tsv")
    courses = read_courses_tsv(data_dir / "courses.tsv", teachers=teachers)
    assert len(courses) > 0
    for course in courses:
        assert isinstance(course, Course)
        assert len(course.title) > 0
        assert len(course.subject_areas) > 0
        assert len(course.teachers) > 0
        assert len(course.teachers) > 0


def test_read_preferences_tsv(data_dir: Path):
    students = read_students_tsv(data_dir / "students.tsv")
    teachers = read_teachers_tsv(data_dir / "teachers.tsv")
    courses = read_courses_tsv(data_dir / "courses.tsv", teachers=teachers)
    first_preferences, second_preferences = read_preferences_tsv(
        data_dir / "preferences.tsv", students=students, courses=courses
    )
    for student in students:
        assert student in first_preferences
        assert len(first_preferences[student]) == 3
        assert student in second_preferences
        assert len(second_preferences[student]) == 3
