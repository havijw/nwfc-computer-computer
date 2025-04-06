// See /python/computer_computer/models.py

/** Represents a student. */
export interface Student {
  /** The student's name. */
  name: string;

  /** Subject areas in which the student must take a course. */
  required_subjects: string[];
}

/** Represents a course. */
export interface Course {
  /** The title of the course. */
  title: string;

  /** The period during which the course is held. */
  period: number;

  /** Subject areas the course covers. */
  subject_areass: string[];

  /** Names of teachers who teach the course. */
  teachers: string[];
}

/** Contains configuration options for the computer-computer solver. */
export interface SolverConfiguration {
  /** Absolute maximum number of students per teacher in each course.
   *
   * This setting is not used to set the _target_ number of students per course, which
   * is calculated to achieve an even distribution of students between courses. This
   * setting is absolute and will cause the solver to fail if set too low because there will not be enough slots for students among all the courses.
   */
  maximum_students_per_teacher: number;

  /** The weight given to students' first choice preferences during optimization.
   *
   * Controls the importance of first choice preferences. Should be higher than the
   * second choice preference weight, otherwise second choices will be considered
   * preferable to first choices by the solver.
   */
  student_first_choice_preference_weight: number;

  /** The weight given to students' second cohice preferences during optimization.
   *
   * Controls the importance of second choice preferences. Should be lower than the
   * first choice preference weight, otherwise second choices will be considered
   * preferable to first choices by the solver.
   */
  student_second_choice_preference_weight: number;

  /** The weight given to having an even distribution of students per teacher during
   *  optimization.
   *
   * Controls the importance of having a similar number of students per teacher between
   * all courses.s
   */
  even_student_distribution_weight: number;
}

export function defaultSolverConfiguration(): SolverConfiguration {
  return {
    maximum_students_per_teacher: 12,
    student_first_choice_preference_weight: 2.0,
    student_second_choice_preference_weight: 1.0,
    even_student_distribution_weight: 1.0,
  };
}
