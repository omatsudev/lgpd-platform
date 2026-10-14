import 'server-only'

import { notFound, redirect } from 'next/navigation'
import { TrainingError } from '../domain/errors'

/** Maps domain errors to navigation: locked content goes back to the track, unknown ids 404. */
export async function guardTrainingPage<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load()
  } catch (error) {
    if (error instanceof TrainingError) {
      if (error.code === 'NOT_FOUND') notFound()
      redirect('/trainings/track')
    }
    throw error
  }
}
