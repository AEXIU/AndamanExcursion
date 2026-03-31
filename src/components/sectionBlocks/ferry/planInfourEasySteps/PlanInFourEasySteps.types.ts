export interface PlanInFourEasyStepsContent {
  title: string;
  specialWord: string;
  steps: Step[];
  description: string;
}

export interface Step {
  title: string;
  description: string;
  icon: string;
}