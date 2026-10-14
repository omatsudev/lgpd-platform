import type { NextStep } from '@/lib/training/domain/progression'

export const trackRoutes = {
  dashboard: '/trainings/track',
  module: (moduleId: string) => `/trainings/track/modules/${moduleId}`,
  video: (videoId: string) => `/trainings/track/videos/${videoId}`,
  quiz: (videoId: string) => `/trainings/track/videos/${videoId}/quiz`,
  exam: '/trainings/track/exam',
  certificate: '/trainings/track/certificate',
}

export function nextStepHref(step: NextStep): string {
  switch (step.type) {
    case 'video':
      return trackRoutes.video(step.videoId)
    case 'quiz':
      return trackRoutes.quiz(step.videoId)
    case 'final_exam':
      return trackRoutes.exam
    case 'certificate':
      return trackRoutes.certificate
  }
}
