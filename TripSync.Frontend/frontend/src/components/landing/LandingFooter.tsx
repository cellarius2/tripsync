import Brand from "../common/Brand";

const footerLinks = [
  ["Recursos", "#recursos"],
  ["Como funciona", "#como-funciona"],
  ["Sobre nós", "#sobre"],
];

const contactLinks = [
  ["GitHub", "https://github.com/cellarius2"],
  ["LinkedIn", "https://linkedin.com"],
  ["E-mail", "mailto:emilycellarius2@gmail.com"],
];

export default function LandingFooter() {
  return (
    <footer className="landing-footer-clean">
      <div className="landing-footer-clean-inner">
        <div className="landing-footer-clean-brand">
          <Brand compact />
        </div>

        <div className="landing-footer-clean-column">
          <p className="landing-footer-clean-title">MAPA</p>

          <div className="landing-footer-clean-links">
            {footerLinks.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="landing-footer-clean-column">
          <p className="landing-footer-clean-title">CONTATO</p>

          <div className="landing-footer-clean-links landing-footer-contact-links">
            {contactLinks.map(([label, href]) => (
              <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
                <span className="landing-footer-link-icon" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="landing-footer-copyright">© 2025 TripSync. Todos os direitos reservados.</p>
    </footer>
  );
}
