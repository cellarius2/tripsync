const questions = [
  [
    "O TripSync é gratuito?",
    "Nesta versão de portfólio, o TripSync será apresentado como totalmente gratuito.",
  ],
  [
    "Funciona para viagens nacionais e internacionais?",
    "Sim. A plataforma adapta checklists e categorias conforme o tipo da viagem.",
  ],
  [
    "O aplicativo já existe?",
    "Sim! É possível baixar para dispositivos Android.",
  ],
  [
    "Posso planejar mais de uma viagem?",
    "Sim. Cada viagem funciona como um espaço próprio, parecido com um círculo ou workspace.",
  ],
];

export default function FaqSection() {
  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <div className="faq-heading">
          <p className="faq-kicker">FAQ</p>
          <h2 className="faq-title">Perguntas frequentes</h2>
        </div>

        <div className="faq-grid">
          {questions.map(([title, text]) => (
            <article key={title} className="faq-card">
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}