import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import Brand from "../common/Brand";

const navItems = [
  ["Recursos", "#recursos"],
  ["Como funciona", "#como-funciona"],
  ["Sobre nós", "#sobre"],
];

export default function LandingNavbar() {
  return (
    <header className="landing-header sticky top-0 z-40">
      <nav className="app-header-inner landing-nav" aria-label="Navegação principal">
        <a href="#topo" className="nav-brand" aria-label="Voltar para o topo da landing TripSync">
          <Brand />
        </a>

        <div className="nav-links">
          {navItems.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          <Link to="/login" className="landing-login-button">
            Entrar
          </Link>
        </div>
      </nav>
    </header>
  );
}
