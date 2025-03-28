r"""A solver for the problem of scheduling students in courses at a school.

Formally, this is a linear optimization problem with constraints, i.e., a minimization problem of
the form
$$
    min_x c^\intercal x
$$
with constraints on $x$ of the form
$$
    b_\ell <= Ax <= b_u.
$$

For this specific problem, we have boolean decision variables $x_{sc}$ representing whether student
$s$ is assigned to course $c$. We impose linear constraints on these decision variables representing
various real-world constraints.
- Students must take exactly one course per period:
    $$
        \forall s \forall P \left[ \sum_{c \in P} x_{sc} = 1 \right]
    $$
    where $P$ is the set of all courses in a given period.
- Each course must have at most 12 students per teacher:
    $$
        \forall c \left[ \sum_s x_{sc} \leq 12 \cdot t_c \right]
    $$
    where $t_c$ is the number of teachers for course $c$.
- Each student who is a multilingual learner must have a course with an ESL specialist:
    $$
        \forall s \in \mathrm{ML} \left[ \sum_{c \in C_\mathrm{ESL}} x_{sc} \geq 1 \right]
    $$
    where $C_{\mathrm{ESL}}$ is the set of courses with an ESL specialist.

We also introduce a number of auxiliary variables that are used by the objective function in
the `get_optimal_course_assignments` method.
- The enrollment in each course, i.e., the number of students in the course):
    $$
        \forall c \left[ e_c = \sum_s x_{sc} \right]
    $$
"""

from collections import defaultdict
from collections.abc import Iterable, Mapping
from itertools import product

import numpy as np
from scipy.optimize import Bounds, LinearConstraint, milp

from computer_computer.models import Course, Student, SubjectArea


def get_period_groups(courses: Iterable[Course]) -> dict[int, list[Course]]:
    """Get groups of courses that occur during the same period.

    Returns:
        period_groups: A dictionary mapping periods to the list of courses with the period.
    """
    period_groups = defaultdict(list)
    for course in courses:
        period_groups[course.period].append(course)
    return dict(period_groups)


class ComputerComputerSolver:
    r"""Solver for the problem of scheduling students in courses at a school.

    When setting up the linear programming problem, variables are represented as positions in the
    vector $x$ of the expression $c^\intercalx$ to be minimized.

    Attributes:
        students (list[Student]): List of students to be placed in courses.
        courses (list[Course]): List of available courses.
        decision_variables (dict[tuple[Student, Course], int]): Positions of decision variables
            representing whether each student is assigned to each course.
        auxiliary_variables (list[int]): Positions of all auxiliary variables constructed for the
            objective function.
        constraints (list[LinearConstraint]): Constraints placed on the optimization problem
            representing various real-world constraints as well as definitions of auxiliary
            variables.
    """

    def __init__(self, students: Iterable[Student], courses: Iterable[Course]):
        """Defines the problem with decision and auxiliary variables and linear constraints."""
        self.students = list(students)
        self.courses = list(courses)
        period_groups = get_period_groups(self.courses)

        ############################################################
        #### Variables #############################################
        ############################################################
        # Variables are represented as positions in the vector `x` used in the optimization problem.
        # We define the positions of the decision variables and auxiliary variables, and define an
        # attribute with the total number of variables. This attribute should be used when setting
        # up coefficient vectors for constraints and the objective function.
        self.decision_variables = {
            (student, course): i
            for i, (student, course) in enumerate(product(self.students, self.courses))
        }
        # See comments in the constraints section to understand each kind of aux variable.
        self.course_size_aux_variables = {
            course: i + len(self.decision_variables) for i, course in enumerate(self.courses)
        }
        self.period_target_students_per_teacher_aux_variables = {
            period: i + len(self.decision_variables) + len(self.course_size_aux_variables)
            for i, period in enumerate(period_groups)
        }
        self.course_size_deviation_from_target_aux_variables = {
            course: i
            + len(self.decision_variables)
            + len(self.course_size_aux_variables)
            + len(self.period_target_students_per_teacher_aux_variables)
            for i, course in enumerate(self.courses)
        }

        self._total_variables = (
            len(self.decision_variables)
            + len(self.course_size_aux_variables)
            + len(self.period_target_students_per_teacher_aux_variables)
            + len(self.course_size_deviation_from_target_aux_variables)
        )

        ############################################################
        #### Constraints ###########################################
        ############################################################
        self.constraints: list[LinearConstraint] = []

        # Constraint: students must take exactly one course per period
        for period_group in period_groups.values():
            for student in self.students:
                constraint_coefficients = np.zeros(self._total_variables)
                for course in period_group:
                    constraint_coefficients[self.decision_variables[(student, course)]] = 1
                self.constraints.append(LinearConstraint(constraint_coefficients, lb=1, ub=1))

        # Constraint: maximum number of students per teacher in each course
        for course in self.courses:
            constraint_coefficients = np.zeros(self._total_variables)
            for student in self.students:
                constraint_coefficients[self.decision_variables[(student, course)]] = 1
            self.constraints.append(
                LinearConstraint(constraint_coefficients, ub=12 * len(course.teachers))
            )

        # Constraint: multilingual learners must have a course with an ESL specialist
        for student in self.students:
            if student.is_multilingual_learner:
                constraint_coefficients = np.zeros(self._total_variables)
                for course in self.courses:
                    if any(teacher.subject_area == SubjectArea.ESL for teacher in course.teachers):
                        constraint_coefficients[self.decision_variables[(student, course)]] = 1
                self.constraints.append(LinearConstraint(constraint_coefficients, lb=1))

        ############################################################
        #### Aux Variable Definitions ##############################
        ############################################################
        # Auxiliary variables are linear combinations of other decision variables. We create these
        # definitions as additional linear constraints so they are respected by the optimizer.

        # Aux variable: course size = # of students assigned to the course
        for course in self.courses:
            definition_coefficients = np.zeros(self._total_variables)
            definition_coefficients[self.course_size_aux_variables[course]] = 1
            for student in students:
                definition_coefficients[self.decision_variables[(student, course)]] = -1
            self.constraints.append(LinearConstraint(definition_coefficients, lb=0, ub=0))

        # Aux variable: target students/teacher ratio for all courses in the period
        #               = total students / total teachers in the period
        # We want students to be evenly distributed among courses, and this variable tells us how
        # many students each courses should have to achieve that.
        # Note: these variables do not depend on the decision variables, hence are constant.
        for period, course_group in period_groups.items():
            total_teachers = sum(len(course.teachers) for course in course_group)
            definition_coefficients = np.zeros(self._total_variables)
            definition_coefficients[
                self.period_target_students_per_teacher_aux_variables[period]
            ] = 1
            self.constraints.append(
                LinearConstraint(
                    definition_coefficients,
                    lb=len(self.students) / total_teachers,
                    ub=len(self.students) / total_teachers,
                )
            )

        # Aux variable: deviation of # students from the target # of students
        #               >= ABS(
        #                         (# students assigned to course)
        #                         - (# teachers for the course * target student/teacher ratio)
        #                  )
        # We linearize the absolute value as two separate constraints, since we can't use
        # conditionals in constraints. The solver will want to minimize the values of the deviation
        # variables, so it should assign them the actual absolute value.
        # NOTE: It is very important that in the objective function, these variables have the
        # **opposite** sign as the decision variable weights for choices! Otherwise, the above note
        # will not hold and the problem will be unbounded.
        for course in self.courses:
            definition_coefficients = np.zeros(self._total_variables)
            definition_coefficients[
                self.course_size_deviation_from_target_aux_variables[course]
            ] = 1

            # First constraint: assuming RHS of equation is positive
            definition_coefficients[self.course_size_aux_variables[course]] = -1
            definition_coefficients[
                self.period_target_students_per_teacher_aux_variables[course.period]
            ] = len(course.teachers)
            self.constraints.append(LinearConstraint(definition_coefficients, lb=0))

            # Second constraint: assuming LHS of equation is negative
            definition_coefficients[self.course_size_aux_variables[course]] = 1
            definition_coefficients[
                self.period_target_students_per_teacher_aux_variables[course.period]
            ] = -len(course.teachers)
            self.constraints.append(LinearConstraint(definition_coefficients, lb=0))

    @property
    def auxiliary_variables(self) -> list[int]:
        """List of all auxiliary variables. Provides no information about what they represent."""
        return (
            list(self.course_size_aux_variables.values())
            + list(self.period_target_students_per_teacher_aux_variables.values())
            + list(self.course_size_deviation_from_target_aux_variables.values())
        )

    def get_optimal_course_assignments(
        self,
        first_choice_courses: Mapping[Student, Iterable[Course]],
        second_choice_courses: Mapping[Student, Iterable[Course]],
        **kwargs,
    ) -> dict[Course, list[Student]]:
        """Find the optimal assignment of students to courses given student preferences.

        kwargs are passed to `scipy.optimize.milp` as `options`.

        Raises:
            RuntimeError: If the optimizer fails for any reason (infeasibility is most common).
        """
        # Objective function is designed for maximization problem, but `scipy.optimize.milp` works
        # with minimization problems, so these coefficients need to be made negative when passed
        # to `scipy.optimize.milp`.
        objective_function_coefficients = np.zeros(self._total_variables)

        # Objective: give students their preferred courses
        for student, first_choices in first_choice_courses.items():
            for course in first_choices:
                objective_function_coefficients[self.decision_variables[(student, course)]] = 2
        for student, second_choices in second_choice_courses.items():
            for course in second_choices:
                objective_function_coefficients[self.decision_variables[(student, course)]] = 1

        # Objective: minimize deviation from target ratio of students/teacher
        for course in self.courses:
            objective_function_coefficients[
                self.course_size_deviation_from_target_aux_variables[course]
            ] = -1

        # Decision variables are integral; auxiliary variables don't need to be
        integrality = np.zeros(self._total_variables, dtype=int)
        for variable in self.decision_variables.values():
            integrality[variable] = 1
        # Decision variables are bounded between 0 and 1; auxiliary variables are unbounded
        lower_bounds = np.zeros(self._total_variables)
        upper_bounds = np.zeros(self._total_variables)
        for variable in self.decision_variables.values():
            lower_bounds[variable] = 0
            upper_bounds[variable] = 1
        for variable in self.auxiliary_variables:
            lower_bounds[variable] = -np.inf
            upper_bounds[variable] = np.inf

        result = milp(
            -objective_function_coefficients,
            integrality=integrality,
            bounds=Bounds(lb=lower_bounds, ub=upper_bounds),
            constraints=self.constraints,
            options=kwargs,
        )
        if not result.success:
            if result.status == 1:
                # Iteration or time limit reached
                raise RuntimeError(
                    "Optimization timed out while trying to solve problem.\n"
                    f"Full message: {result.message}"
                )
            elif result.status == 2:
                # Problem is infeasible (results from incompatible constraints)
                raise RuntimeError(
                    "Optimization problem is infeasible, i.e., a solution does not exist\n"
                    f"Full message: {result.message}"
                )
            elif result.status == 3:
                # Problem is unbounded (objective function can be made arbitrarily small)
                raise RuntimeError(
                    "Optimization problem does not have a well-defined solution\n"
                    f"Full message: {result.message}"
                )
            elif result.status == 4:
                # Other
                raise RuntimeError(f"Optimization failed. \nFull message: {result.message}")

        course_assignments = defaultdict(list)
        for (student, course), i in self.decision_variables.items():
            if result.x[i]:
                course_assignments[course].append(student)
        return dict(course_assignments)
