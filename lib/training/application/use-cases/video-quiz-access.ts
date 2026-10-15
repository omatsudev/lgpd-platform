import { locked, notFound } from '../../domain/errors'
import { findVideoState, type VideoState } from '../../domain/progression'
import { loadJourney, type Journey } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'

/** The quiz of a video opens once the video is watched, and stays open for retakes. */
export async function loadAccessibleQuiz(
  deps: TrainingDependencies,
  context: LearnerContext,
  videoId: string,
): Promise<{ journey: Journey; state: VideoState }> {
  const journey = await loadJourney(deps, context)
  const state = findVideoState(journey.progress, videoId)
  if (!state) throw notFound('Video')
  if (state.status !== 'quiz_pending' && state.status !== 'completed') throw locked('Quiz')
  return { journey, state }
}
