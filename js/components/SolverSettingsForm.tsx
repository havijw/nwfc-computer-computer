import { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { defaultSolverConfiguration, SolverConfiguration } from "../models";

/** Component to wrap label, description, and slider input for a config field. */
function SolverConfigFieldSlider({
  title,
  description,
  sliderLabelID,
  value,
  handleChange,
  sliderMin,
  sliderMax,
  sliderStep,
}: {
  title: string;
  description: string;
  sliderLabelID: string;
  value: number;
  handleChange: (event: Event, newValue: number) => void;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
}) {
  const [descriptionShown, setDescriptionShown] = useState(false);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0}>
        <Typography id={sliderLabelID + "-slider-label"}>{title}</Typography>
        <IconButton
          title="Show description"
          aria-label="Show description"
          onClick={() => {
            setDescriptionShown((descriptionShown) => !descriptionShown);
          }}
          sx={{ padding: "4px" }}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Collapse in={descriptionShown}>
        <Typography variant="caption" component="p">
          {description}
        </Typography>
      </Collapse>
      <Slider
        aria-labelledby={sliderLabelID + "-slider-label"}
        valueLabelDisplay="auto"
        value={value}
        // @ts-expect-error The onChange function signature expects an array to be
        // possible, but that's to handle range sliders, and doesn't apply here.
        onChange={handleChange}
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        marks={[
          { value: sliderMin, label: sliderMin },
          { value: value, label: value },
          { value: sliderMax, label: sliderMax },
        ]}
      />
    </Box>
  );
}

/** Form that sets solver configuration values. */
export default function SolverSettingsForm({
  config,
  setConfig,
  closePanel,
}: {
  config: SolverConfiguration;
  setConfig: React.Dispatch<React.SetStateAction<SolverConfiguration>>;
  closePanel: () => void;
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
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Solver Settings
          </Typography>
          <IconButton aria-label="close" onClick={closePanel} sx={{ margin: "-8px" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <SolverConfigFieldSlider
          title="Maximum students per teacher"
          description="The absolute maximum number of students per teacher in each course. Will cause the solver to fail if set too low."
          sliderLabelID="max-students"
          value={config.maximum_students_per_teacher}
          handleChange={handleNewMaximumStudentsPerTeacher}
          sliderMin={0}
          sliderMax={20}
          sliderStep={0.5}
        />
        <SolverConfigFieldSlider
          title="First choice weight"
          description="Importance of first choice student preferences. Should be higher than second choice preference weight, otherwise second choices will be considered preferable to first choices."
          sliderLabelID="first-choice-weight"
          value={config.student_first_choice_preference_weight}
          handleChange={handleNewStudentFirstChoicePreferenceWeight}
          sliderMin={0}
          sliderMax={5}
          sliderStep={0.1}
        />
        <SolverConfigFieldSlider
          title="Second choice weight"
          description="Importance of second choice student preferences. Should be lower than first choice preference weight, otherwise second choices will be considered preferable to first choices."
          sliderLabelID="second-choice-weight"
          value={config.student_second_choice_preference_weight}
          handleChange={handleNewStudentSecondChoicePreferenceWeight}
          sliderMin={0}
          sliderMax={5}
          sliderStep={0.1}
        />
        <SolverConfigFieldSlider
          title="Even student distribution weight"
          description="Importance of evenly distributing students among teachers."
          sliderLabelID="even-distribution-weight"
          value={config.even_student_distribution_weight}
          handleChange={handleNewEvenDistributionWeight}
          sliderMin={0}
          sliderMax={5}
          sliderStep={0.1}
        />
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
