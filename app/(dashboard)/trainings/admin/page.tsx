import { moveModule } from '@/app/actions/training-admin'
import { TrackForm } from '@/components/training-admin/track-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminTrack, listModules } from '@/lib/training/infrastructure/supabase/training-content-admin'
import { isTrainingContentAdmin } from '@/lib/training/infrastructure/session'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowDown, ArrowUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TrainingAdminPage() {
  const { companyId, role } = await getUserCompany()
  if (!isTrainingContentAdmin(companyId, role)) notFound()

  const track = await getAdminTrack()
  if (!track) notFound()

  const modules = await listModules(track.id)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Editar conteúdo do treinamento
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Trilha, módulos, vídeos e banco de perguntas da trilha de LGPD
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações da trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackForm track={track} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Módulos ({modules.length})</CardTitle>
          <Link href={`/trainings/admin/modules/new?trackId=${track.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo módulo
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {modules.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhum módulo cadastrado</p>
          )}
          {modules.map((m, index) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm">
                  {m.position}. {m.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {m.final_exam_question_count} questões sorteadas na avaliação final
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <form action={moveModule}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button variant="ghost" size="sm" disabled={index === 0} type="submit">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <form action={moveModule}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === modules.length - 1}
                    type="submit"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <Link href={`/trainings/admin/modules/${m.id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
