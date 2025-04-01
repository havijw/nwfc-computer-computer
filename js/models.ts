// See /python/computer_computer/models.py

export interface Student {
  name: string;
  is_multilingual_learner: boolean;
}

export interface Course {
  title: string;
  period: number;
  subject_areass: string[];
  teachers: string[];
}

export interface PyodideFileInfo {
  path: string;
  isLoaded: boolean;
}

export interface SolverInputFiles {
  courses: PyodideFileInfo;
  students: PyodideFileInfo;
}
