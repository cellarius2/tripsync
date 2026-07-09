import { Link } from "react-router-dom";
import TravelBackground from "../trip/TravelBackground";

export default function FinalCta() {
  return (
    <section className="final-cta-section landing-final-cta-shell">
      <div className="final-cta-trip-background" aria-hidden="true">
        <TravelBackground />
      </div>

      <div className="landing-bottom-container">
        <div className="final-cta final-cta-deep-red">
          <div className="final-cta-route" aria-hidden="true" />
          <div className="final-cta-plane" aria-hidden="true" />

          <h2>Pronto para decolar?</h2>

          <p>
            Junte seu grupo e transforme planos em memórias.
          </p>

          <Link to="/register">
            Começar agora
          </Link>
        </div>
      </div>
    </section>
  );
}
