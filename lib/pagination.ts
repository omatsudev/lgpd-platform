export const PAGE_SIZE = 20

export function parsePage(value: string | undefined): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : 1
}

export function pageRange(page: number, pageSize: number = PAGE_SIZE): [number, number] {
  const from = (page - 1) * pageSize
  return [from, from + pageSize - 1]
}

export function countTotalPages(count: number | null, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil((count ?? 0) / pageSize))
}
