import 'server-only'

import { headers } from 'next/headers'
import type { TrainingDependencies } from '../application/ports'
import { AcknowledgePendingVideo } from '../application/use-cases/acknowledge-pending-video'
import { CheckVideoQuizAnswer } from '../application/use-cases/check-video-quiz-answer'
import { GetCompanyTrainingReport } from '../application/use-cases/get-company-training-report'
import { GetFinalExam } from '../application/use-cases/get-final-exam'
import { GetLearnerCertificate } from '../application/use-cases/get-learner-certificate'
import { GetTrackOverview } from '../application/use-cases/get-track-overview'
import { GetVideoLesson } from '../application/use-cases/get-video-lesson'
import { GetVideoQuiz } from '../application/use-cases/get-video-quiz'
import { RecordVideoWatch } from '../application/use-cases/record-video-watch'
import { StartFinalExam } from '../application/use-cases/start-final-exam'
import { SubmitFinalExam } from '../application/use-cases/submit-final-exam'
import { SubmitVideoQuiz } from '../application/use-cases/submit-video-quiz'
import { VerifyCertificate } from '../application/use-cases/verify-certificate'
import { AuditLogAdapter } from './audit-log-adapter'
import { PendingEmailCertificateNotifier } from './pending-email-certificate-notifier'
import { getServiceClient } from './supabase/service-client'
import { SupabaseLearnerRepository } from './supabase/supabase-learner-repository'
import { SupabaseTrainingContentRepository } from './supabase/supabase-training-content-repository'
import { cryptoRandom, systemClock } from './system'

export const LGPD_TRACK_SLUG = 'lgpd-awareness'

/** Composition root: wires the use cases to Supabase for the current request. */
export async function createTrainingModule() {
  const client = getServiceClient()
  const deps: TrainingDependencies = {
    trackSlug: LGPD_TRACK_SLUG,
    content: new SupabaseTrainingContentRepository(client),
    learners: new SupabaseLearnerRepository(client),
    audit: new AuditLogAdapter(client, await headers()),
    notifier: new PendingEmailCertificateNotifier(),
    clock: systemClock,
    random: cryptoRandom,
  }

  return {
    getTrackOverview: new GetTrackOverview(deps),
    getVideoLesson: new GetVideoLesson(deps),
    recordVideoWatch: new RecordVideoWatch(deps),
    acknowledgePendingVideo: new AcknowledgePendingVideo(deps),
    getVideoQuiz: new GetVideoQuiz(deps),
    checkVideoQuizAnswer: new CheckVideoQuizAnswer(deps),
    submitVideoQuiz: new SubmitVideoQuiz(deps),
    getFinalExam: new GetFinalExam(deps),
    startFinalExam: new StartFinalExam(deps),
    submitFinalExam: new SubmitFinalExam(deps),
    getLearnerCertificate: new GetLearnerCertificate(deps),
    verifyCertificate: new VerifyCertificate(deps),
    getCompanyTrainingReport: new GetCompanyTrainingReport(deps),
  }
}
