
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-800 text-white">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="text-2xl font-bold mb-2 md:mb-0">
          Sistema de Hotéis
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-blue-300 transition-colors">
                Início
              </Link>
            </li>
            <li>
              <a href="#about" className="hover:text-blue-300 transition-colors">
                Sobre
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-blue-300 transition-colors">
                Contato
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
