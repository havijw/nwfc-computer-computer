// See /python/computer_computer/models.py

export interface Student {
  name: string;
  is_multilingual_learner: boolean;
}

export enum SubjectArea {
  ELA,
  MATH,
  SCIENCE,
  SOCIAL_STUDIES,
  FOREIGN_LANGUAGE,
  ESL,
}

export interface Teacher {
  name: string;
  subject_area: SubjectArea;
}

export interface Course {
  title: string;
  period: number;
  subject_areass: SubjectArea[];
  teachers: Teacher[];
}
