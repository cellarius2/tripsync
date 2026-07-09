const benefits = [
  ["Colaboração em tempo real", "Todos participam das decisões e acompanham cada detalhe."],
  ["Controle financeiro", "Acompanhe gastos, contribuições e metas do grupo."],
  ["Organização completa", "Checklists, documentos, decisões e orçamento em um só lugar."],
  ["Viagens sem preocupação", "Mais transparência, menos confusão e mais experiências."],
];

export default function BenefitsStrip() {
  return (
    <section className="benefits-strip border-y border-[color:var(--border)] bg-[color:var(--surface-soft)]/75">
      <div className="landing-container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(([title, text]) => (
          <article key={title} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-5 shadow-sm backdrop-blur">
            <h2 className="font-semibold text-[color:var(--text)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
