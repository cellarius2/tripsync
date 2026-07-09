const features = [
  ["GR", "Grupos de viagem", "Crie espaços separados para cada roteiro e mantenha todo mundo alinhado."],
  ["R$", "Metas financeiras", "Acompanhe quanto o grupo pretende gastar e quanto cada pessoa já guardou."],
  ["OK", "Checklists inteligentes", "Organize tarefas práticas conforme o tipo da viagem."],
  ["DOC", "Documentos", "Centralize passagens, reservas e comprovantes importantes."],
  ["VOT", "Votações", "Decida hospedagem, passeios e prioridades com votos simples."],
  ["DEC", "Histórico de decisões", "Guarde o que foi combinado para ninguém se perder depois."],
  ["NOT", "Notificações", "Receba lembretes sobre pendências, despesas e decisões."],
  ["R$", "Despesas compartilhadas", "Registre custos e veja o impacto no planejamento financeiro."],
];

export default function FeatureCards() {
  return (
    <section id="recursos" className="features-section">
      <div className="landing-container">
        <div className="features-panel">
          <div className="landing-section-heading features-heading">
            <p className="landing-eyebrow">Recursos</p>
            <h2>Tudo o que você precisa para uma viagem inesquecível</h2>
            <p>
              Centralize o planejamento do grupo em uma experiência simples, visual e colaborativa.
            </p>
          </div>

          <div className="feature-grid">
            {features.map(([icon, title, text]) => (
              <article key={title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  {icon}
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
