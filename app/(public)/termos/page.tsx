import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso | Serra Privacy',
  description: 'Termos de Uso da plataforma Serra Privacy',
}

export default function TermosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/">
            <Image src="/logo-serra-privacy.png" alt="Serra Privacy" width={44} height={44} style={{ objectFit: 'contain' }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>Serra Privacy</span>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Termos de Uso</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 40 }}>Última atualização: junho de 2026</p>

        <Section title="1. Aceitação dos Termos">
          Ao acessar ou utilizar a plataforma Serra Privacy, você concorda com estes Termos de Uso. Se não concordar com qualquer disposição, não utilize a plataforma. O uso continuado após alterações nos Termos implica aceitação das novas condições.
        </Section>

        <Section title="2. Descrição do Serviço">
          A Serra Privacy é uma plataforma SaaS (Software as a Service) voltada à gestão de conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Os serviços incluem, entre outros: mapeamento de dados, gestão de incidentes, consentimentos, treinamentos, canal de denúncias, relatórios e documentação de compliance.
        </Section>

        <Section title="3. Cadastro e Conta">
          Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades realizadas com sua conta. Notifique imediatamente a Serra Privacy em caso de uso não autorizado.
        </Section>

        <Section title="4. Planos e Pagamento">
          O acesso à plataforma pode ser oferecido mediante planos pagos. Os valores, condições e periodicidade de cobrança são descritos na página de planos. A Serra Privacy reserva-se o direito de alterar preços mediante aviso prévio de 30 dias.
        </Section>

        <Section title="5. Uso Permitido">
          Você concorda em utilizar a plataforma exclusivamente para fins lícitos e em conformidade com a legislação vigente. É vedado:
          <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 2 }}>
            <li>Utilizar a plataforma para fins ilícitos ou fraudulentos</li>
            <li>Tentar acessar dados de outros clientes</li>
            <li>Realizar engenharia reversa, descompilar ou modificar o software</li>
            <li>Transmitir vírus, malware ou qualquer código malicioso</li>
            <li>Sobrecarregar intencionalmente a infraestrutura da plataforma</li>
          </ul>
        </Section>

        <Section title="6. Propriedade Intelectual">
          Todo o conteúdo, marca, interface, código-fonte e documentação da Serra Privacy são de propriedade exclusiva da empresa ou de seus licenciadores. Nenhum direito de propriedade intelectual é transferido ao usuário pelo uso da plataforma.
        </Section>

        <Section title="7. Dados do Cliente">
          Os dados inseridos na plataforma pelo cliente pertencem ao próprio cliente. A Serra Privacy atua como operadora de dados nos termos da LGPD e processa esses dados exclusivamente para a prestação dos serviços contratados, conforme descrito no Aviso de Privacidade.
        </Section>

        <Section title="8. Disponibilidade e Suporte">
          A Serra Privacy empenha-se em manter a plataforma disponível de forma contínua, mas não garante disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência. O suporte técnico é prestado pelos canais oficiais indicados na plataforma.
        </Section>

        <Section title="9. Limitação de Responsabilidade">
          A Serra Privacy não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes do uso ou impossibilidade de uso da plataforma, incluindo perda de dados ou lucros cessantes, salvo nos casos previstos em lei.
        </Section>

        <Section title="10. Rescisão">
          A Serra Privacy pode suspender ou encerrar o acesso à plataforma em caso de violação destes Termos. O cliente pode cancelar sua conta a qualquer momento por meio das configurações da plataforma ou solicitando ao suporte.
        </Section>

        <Section title="11. Alterações nos Termos">
          Estes Termos podem ser atualizados periodicamente. Notificaremos os usuários sobre alterações relevantes por e-mail ou por aviso na plataforma. O uso continuado após a notificação implica aceitação dos novos termos.
        </Section>

        <Section title="12. Foro e Lei Aplicável">
          Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de Petrópolis/RJ para dirimir quaisquer conflitos decorrentes deste instrumento, com renúncia a qualquer outro, por mais privilegiado que seja.
        </Section>

        <Section title="13. Contato">
          Para dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail{' '}
          <a href="mailto:serralgpd@gmail.com" style={{ color: '#2563EB' }}>serralgpd@gmail.com</a>.
        </Section>
      </main>

      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
        <p>© 2026 Serra Privacy. Todos os direitos reservados.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
          <a href="/docs/aviso_de_privacidade_serra_privacy.pdf" target="_blank" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacidade</a>
          <Link href="/termos" style={{ color: '#2563EB', textDecoration: 'none' }}>Termos</Link>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>{title}</h2>
      <p style={{ color: '#475569', lineHeight: 1.8, fontSize: 15 }}>{children}</p>
    </section>
  )
}
