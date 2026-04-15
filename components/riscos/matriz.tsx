'use client'

import Link from 'next/link'

// Célula da matriz colorida por score (prob × impacto)
function cellColor(prob: number, imp: number) {
  const s = prob * imp
  if (s >= 15) return 'bg-red-500'
  if (s >= 9) return 'bg-orange-400'
  if (s >= 4) return 'bg-yellow-300'
  return 'bg-green-300'
}

const PROB_LABELS = ['', 'Raro (1)', 'Improvável (2)', 'Possível (3)', 'Provável (4)', 'Quase certo (5)']
const IMP_LABELS = ['', 'Insignificante (1)', 'Menor (2)', 'Moderado (3)', 'Maior (4)', 'Catastrófico (5)']

export function RiscoMatriz({ itens }: { itens: any[] }) {
  // Agrupa riscos por (prob_inerente, imp_inerente)
  const mapa: Record<string, any[]> = {}
  for (const r of itens) {
    const key = `${r.inherent_probability}-${r.inherent_impact}`
    if (!mapa[key]) mapa[key] = []
    mapa[key].push(r)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Legenda de impacto (topo) */}
          <div className="flex mb-1">
            <div className="w-32 shrink-0" />
            {[1, 2, 3, 4, 5].map(imp => (
              <div key={imp} className="flex-1 text-center text-xs text-gray-500 px-1">
                <span className="hidden lg:inline">{IMP_LABELS[imp]}</span>
                <span className="lg:hidden">Imp {imp}</span>
              </div>
            ))}
          </div>

          {/* Linhas da matriz (prob de 5 → 1) */}
          {[5, 4, 3, 2, 1].map(prob => (
            <div key={prob} className="flex gap-1 mb-1 items-stretch">
              <div className="w-32 shrink-0 flex items-center justify-end pr-2">
                <span className="text-xs text-gray-500 text-right">
                  <span className="hidden lg:inline">{PROB_LABELS[prob]}</span>
                  <span className="lg:hidden">Prob {prob}</span>
                </span>
              </div>
              {[1, 2, 3, 4, 5].map(imp => {
                const key = `${prob}-${imp}`
                const cell = mapa[key] ?? []
                return (
                  <div
                    key={imp}
                    className={`flex-1 min-h-[72px] rounded-lg ${cellColor(prob, imp)} p-1.5 flex flex-col gap-1`}
                  >
                    {cell.map((r: any) => (
                      <Link key={r.id} href={`/risks/${r.id}`}>
                        <div className="bg-white/80 hover:bg-white text-xs rounded px-1.5 py-1 truncate text-gray-900 font-medium shadow-sm transition-colors cursor-pointer">
                          {r.title}
                        </div>
                      </Link>
                    ))}
                    {cell.length === 0 && (
                      <div className="flex-1 flex items-center justify-center opacity-0">·</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Label eixo X */}
          <div className="flex mt-1">
            <div className="w-32 shrink-0" />
            <div className="flex-1 text-center text-xs text-gray-400">← Impacto →</div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: 'bg-red-500', label: 'Crítico (≥15)' },
          { color: 'bg-orange-400', label: 'Alto (9–14)' },
          { color: 'bg-yellow-300', label: 'Médio (4–8)' },
          { color: 'bg-green-300', label: 'Baixo (1–3)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${l.color}`} />
            <span className="text-gray-600">{l.label}</span>
          </div>
        ))}
      </div>

      {itens.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">Nenhum risco cadastrado para exibir na matriz</p>
      )}
    </div>
  )
}
