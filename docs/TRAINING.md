# Módulo de Treinamentos (trilha LGPD)

Implementa a trilha "Treinamento LGPD" descrita em _Estrutura do Treinamento LGPD_ e
_Quizzes e Banco de Questões_ (v1.0, outubro de 2026): 3 módulos, 12 vídeos, quiz de
4 perguntas por vídeo, avaliação final com 15 questões sorteadas de um banco de 50 e
certificado com código de verificação.

## Jornada

| Perfil | Onde | O que faz |
|---|---|---|
| Colaborador (aluno) | `/trainings/track` | Assiste aos vídeos, faz os quizzes, a avaliação final e emite o certificado |
| Empresa/admin/DPO (gestor) | `/trainings` | Acompanha progresso, nota e conclusão; exporta CSV (`/trainings/report`) |
| Qualquer pessoa | `/certificates/verify?code=SP-...` | Confere a autenticidade de um certificado (nome mascarado) |

Regras: progressão linear (vídeo → quiz → próximo vídeo), vídeo concluído com 90% realmente
assistido (avançar o vídeo não conta), quiz aprovado com 3 de 4, avaliação final com 11 de 15
(70%), novo sorteio a cada tentativa, gabarito comentado só ao final.

## Arquitetura

```
lib/training/
  domain/          regras puras (progressão, tempo assistido, correção, sorteio, certificado)
  application/     casos de uso + portas (interfaces de repositório, auditoria, e-mail, relógio)
  infrastructure/  adaptadores Supabase, composição (training-module.ts) e sessão
app/actions/training.ts         server actions (validação com zod)
app/(dashboard)/trainings/...   telas do aluno e do gestor
components/training/            componentes de UI (identidade escura da trilha)
tests/unit, tests/integration   Vitest (`npm test`)
```

As tabelas de progresso só são gravadas pelo servidor com a service role, depois das regras de
negócio. O gabarito (`training_answer_keys`) não tem policy de leitura, então nunca chega ao
navegador antes da correção. Por isso o módulo exige `SUPABASE_SERVICE_ROLE_KEY` (ver
`docs/AMBIENTES.md`).

## Banco

- `supabase/migrations/056_training_track.sql`: tabelas, índices e RLS.
- `supabase/migrations/057_training_track_content.sql`: conteúdo oficial (módulos, vídeos,
  48 perguntas de quiz e 50 do banco).

Parâmetros da trilha ficam em `training_tracks` (nota mínima, tentativas, carga horária,
validade do certificado) e `training_modules.final_exam_question_count` (sorteio por módulo).

## Publicar um vídeo

Enquanto `training_videos.video_url` for `null`, a página mostra "Vídeo em produção" com a
mensagem principal e o aluno confirma a leitura para seguir ao quiz. Quando o vídeo estiver
hospedado:

```sql
update public.training_videos
set video_url = 'https://...',          -- arquivo/stream reproduzível em <video>
    captions_url = 'https://....vtt',   -- legenda em português (opcional)
    transcript = '...'                  -- roteiro oficial (aba Transcrição)
where position = 1;
```

A partir daí o controle de 90% assistido passa a valer para esse vídeo. Se a hospedagem
escolhida exigir player próprio (iframe do Vimeo, Bunny ou Cloudflare), basta criar um
componente equivalente ao `components/training/video-player.tsx` que chame a mesma
server action `recordVideoWatchAction`.

## Pendências conhecidas

- Vídeos, legendas e transcrições (aguardando gravação e definição da hospedagem).
- E-mail automático do certificado: a plataforma ainda não tem provedor de e-mail
  transacional; `PendingEmailCertificateNotifier` só registra no log.
- Painel administrativo Serra (CRUD de conteúdo): por enquanto o conteúdo é editado via SQL.
- Parâmetros a confirmar: nota mínima, limite de tentativas, carga horária (60 min
  provisórios) e validade do certificado.
