from pathlib import Path

from computer_computer.file_entrypoint import get_optimal_course_assignments_from_files


def test_get_optimal_course_assignments_from_files(data_dir: Path):
    courses_file = str(data_dir / "courses.tsv")
    students_file = str(data_dir / "preferences.tsv")

    assignments = get_optimal_course_assignments_from_files(courses_file, students_file)
    assert len(assignments) > 0
    for course, students in assignments:
        assert "title" in course
        assert "period" in course
        assert "subject_areas" in course
        assert "teachers" in course

        for student in students:
            assert "name" in student
            assert "required_subjects" in student
