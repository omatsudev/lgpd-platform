import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LOCKED_FEATURE_CONTENT, type LockedFeatureKey } from '@/lib/locked-feature-content'
import { Lock } from 'lucide-react'

export function LockedFeature({ moduleKey }: { moduleKey: LockedFeatureKey }) {
  const content = LOCKED_FEATURE_CONTENT[moduleKey]

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{content.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{content.description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-gray-700">
            <Lock className="h-5 w-5 text-gray-400" />O que você poderia fazer aqui
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-gray-600">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500">
            Esse recurso é exclusivo para administradores e DPO. Fale com o administrador da sua
            empresa para solicitar acesso.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
