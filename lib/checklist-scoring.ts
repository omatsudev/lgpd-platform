// Checklist compliance scoring logic
// Used by both dashboard and report pages

import { CHECKLIST } from '@/lib/checklist-items'

export type ChecklistScore = {
  total: number           // total applicable items
  completed: number       // items marked completed
  notApplicable: number   // items marked n/a (excluded from score)
  percentage: number      // 0-100 (completed / effective)
}

export function scoreChecklist(checklistItems: { item_key: string; status: string }[]): ChecklistScore {
  const total = CHECKLIST.reduce((acc, c) => acc + c.items.length, 0)
  const statusMap: Record<string, string> = {}
  for (const i of checklistItems) statusMap[i.item_key] = i.status

  const notApplicable = CHECKLIST.reduce(
    (acc, c) => acc + c.items.filter((i) => statusMap[i.key] === 'not_applicable').length,
    0,
  )
  const completed = CHECKLIST.reduce(
    (acc, c) => acc + c.items.filter((i) => statusMap[i.key] === 'completed').length,
    0,
  )
  const effective = total - notApplicable
  const percentage = effective > 0 ? Math.round((completed / effective) * 100) : 100

  return { total, completed, notApplicable, percentage }
}
