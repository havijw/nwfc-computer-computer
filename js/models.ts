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
