
const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sistema de Hotéis</h3>
            <p className="text-sm text-blue-200">
              Encontre os melhores hotéis para a sua estadia com preços incríveis.
            </p>
          </div>
          <div id="contact">
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <p className="text-sm text-blue-200">Email: contato@sistemahoteis.com</p>
            <p className="text-sm text-blue-200">Telefone: (11) 3333-4444</p>
          </div>
          <div id="about">
            <h3 className="text-lg font-semibold mb-4">Sobre Nós</h3>
            <p className="text-sm text-blue-200">
              Somos uma plataforma dedicada a conectar viajantes com os melhores hotéis do Brasil.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-blue-800 text-center text-sm text-blue-300">
          <p>&copy; {new Date().getFullYear()} Sistema de Hotéis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
