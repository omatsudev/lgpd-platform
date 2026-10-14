/** The authenticated learner, resolved by the presentation layer from the session. */
export type LearnerContext = {
  userId: string
  email: string
  name: string
  companyId: string
  companyName: string
}
