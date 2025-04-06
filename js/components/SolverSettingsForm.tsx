import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { defaultSolverConfiguration, SolverConfiguration } from "../models";

/** Form that sets solver configuration values. */
export default function SolverSettingsForm({
  config,
  setConfig,
}: {
  config: SolverConfiguration;
  setConfig: React.Dispatch<React.SetStateAction<SolverConfiguration>>;
}) {
  const handleNewMaximumStudentsPerTeacher = (_event: Event, newValue: number) => {
    setConfig((config) => ({
      ...config,
      maximum_students_per_teacher: newValue,
    }));
  };

  const handleNewStudentFirstChoicePreferenceWeight = (
    _event: Event,
    newValue: number,
  ) => {
    setConfig((config) => ({
      ...config,
      student_first_choice_preference_weight: newValue,
    }));
  };

  const handleNewStudentSecondChoicePreferenceWeight = (
    _event: Event,
    newValue: number,
  ) => {
    setConfig((config) => ({
      ...config,
      student_second_choice_preference_weight: newValue,
    }));
  };

  const handleNewEvenDistributionWeight = (_event: Event, newValue: number) => {
    setConfig((config) => ({
      ...config,
      even_student_distribution_weight: newValue,
    }));
  };

  return (
    <Box sx={{ width: "300px", padding: "2rem" }}>
      <Stack spacing={3}>
        <Typography variant="h5" gutterBottom>
          Solver Settings
        </Typography>
        <Box>
          <Typography id="max-students-slider-label" gutterBottom>
            Maximum students per teacher
          </Typography>
          <Typography variant="caption" component="p">
            The absolute maximum number of students per teacher in each course. Will
            cause the solver to fail if set too low.
          </Typography>
          <Slider
            aria-labelledby="max-students-slider-label"
            valueLabelDisplay="auto"
            // @ts-expect-error The onChange function signature expects an array to be
            // possible, but that's to handle range sliders, and doesn't apply here.
            onChange={handleNewMaximumStudentsPerTeacher}
            value={config.maximum_students_per_teacher}
            min={0}
            max={20}
            step={0.5}
            marks={[
              { value: 0, label: "0" },
              { value: 20, label: "20" },
            ]}
          />
        </Box>
        <Box>
          <Typography id="first-choice-weight-slider-label" gutterBottom>
            First choice preference weight
          </Typography>
          <Typography variant="caption" component="p">
            Importance of first choice preferences. Should be higher than second choice
            preference weight, otherwise second choices will be considered preferable to
            first choices.
          </Typography>
          <Slider
            aria-labelledby="first-choice-weight-slider-label"
            valueLabelDisplay="auto"
            // @ts-expect-error The onChange function signature expects an array to be
            // possible, but that's to handle range sliders, and doesn't apply here.
            onChange={handleNewStudentFirstChoicePreferenceWeight}
            value={config.student_first_choice_preference_weight}
            min={0}
            max={5}
            step={0.1}
            marks={[
              { value: 0, label: "0" },
              { value: 5, label: "5" },
            ]}
          />
        </Box>
        <Box>
          <Typography id="second-choice-weight-slider-label" gutterBottom>
            Second choice preference weight
          </Typography>
          <Typography variant="caption" component="p">
            Importance of second choice preferences. Should be lower than first choice
            preference weight, otherwise second choices will be considered preferable to
            first choices.
          </Typography>
          <Slider
            aria-labelledby="second-choice-weight-slider-label"
            valueLabelDisplay="auto"
            // @ts-expect-error The onChange function signature expects an array to be
            // possible, but that's to handle range sliders, and doesn't apply here.
            onChange={handleNewStudentSecondChoicePreferenceWeight}
            value={config.student_second_choice_preference_weight}
            min={0}
            max={5}
            step={0.1}
            marks={[
              { value: 0, label: "0" },
              { value: 5, label: "5" },
            ]}
          />
        </Box>
        <Box>
          <Typography id="even-distribution-weight-slider-label" gutterBottom>
            Even student distribution weight
          </Typography>
          <Typography variant="caption" component="p">
            Importance of evenly distributing students among teachers.
          </Typography>
          <Slider
            aria-labelledby="even-distribution-weight-slider-label"
            valueLabelDisplay="auto"
            // @ts-expect-error The onChange function signature expects an array to be
            // possible, but that's to handle range sliders, and doesn't apply here.
            onChange={handleNewEvenDistributionWeight}
            value={config.even_student_distribution_weight}
            min={0}
            max={5}
            step={0.1}
            marks={[
              { value: 0, label: "0" },
              { value: 5, label: "5" },
            ]}
          />
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setConfig(defaultSolverConfiguration());
          }}
          startIcon={<RefreshIcon />}
        >
          Reset all fields
        </Button>
      </Stack>
    </Box>
  );
}
