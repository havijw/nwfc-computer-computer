from pathlib import Path

from computer_computer.file_entrypoint import get_optimal_course_assignments_from_files


def test_get_optimal_course_assignments_from_files(data_dir: Path):
    students_file = data_dir / "students.tsv"
    teachers_file = data_dir / "teachers.tsv"
    courses_file = data_dir / "courses.tsv"
    preferences_file = data_dir / "preferences.tsv"

    assignments = get_optimal_course_assignments_from_files(
        students_file, teachers_file, courses_file, preferences_file
    )
    assert len(assignments) > 0
    for course, students in assignments:
        assert "title" in course
        assert "period" in course
        assert "subject_areas" in course
        assert "teachers" in course

        for student in students:
            assert "name" in student
            assert "is_multilingual_learner" in student
