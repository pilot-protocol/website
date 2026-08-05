import type { SolutionFunnel, SolutionStory } from '../../data/solutionStories';
import type { SolutionProfile } from '../../data/solutions';

export interface SolutionExperienceProps {
  solution: SolutionProfile;
  story: SolutionStory;
  funnel: SolutionFunnel;
  turnstileSiteKey?: string;
}
