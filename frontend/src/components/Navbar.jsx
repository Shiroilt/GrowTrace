import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass-nav z-50 transition-all border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        <Link to="/" className="text-primary font-bold text-xl tracking-tight">growTrace</Link>
        <div className="flex space-x-6 text-sm font-medium">
          <Link to="/" className={`transition-colors ${isActive('/') ? 'text-primary' : 'text-secondary hover:text-primary'}`}>Plants</Link>
          <Link to="/history" className={`transition-colors ${isActive('/history') ? 'text-primary' : 'text-secondary hover:text-primary'}`}>History</Link>
          <Link to="/about" className={`transition-colors ${isActive('/about') ? 'text-primary' : 'text-secondary hover:text-primary'}`}>About</Link>
        </div>
      </div>
    </nav>
  );
}
