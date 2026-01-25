import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Eligibility from './pages/Eligibility';
import Calculator from './pages/Calculator';
import FAQ from './pages/FAQ';
import About from './pages/About';
import { Logo } from './constants';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className={`${isActive('/') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition`}>Home</Link>
            <Link to="/eligibility" className={`${isActive('/eligibility') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition`}>Eligibility</Link>
            <Link to="/calculator" className={`${isActive('/calculator') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition`}>Cost Calculator</Link>
            <Link to="/about" className={`${isActive('/about') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition`}>About</Link>
            <Link to="/faq" className={`${isActive('/faq') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition`}>FAQ</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Logo />
          <p className="mt-4 text-slate-400 max-w-sm">
            Helping parents in England navigate the complex world of childcare funding. Accurate, impartial, and always free.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/eligibility" className="hover:text-teal-400">Eligibility Checker</Link></li>
            <li><Link to="/calculator" className="hover:text-teal-400">Cost Calculator</Link></li>
            <li><Link to="/about" className="hover:text-teal-400">About Us</Link></li>
            <li><Link to="/faq" className="hover:text-teal-400">Common Questions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Official Sources</h4>
          <ul className="space-y-2">
            <li><a href="https://www.gov.uk/free-childcare-if-working" className="hover:text-teal-400" target="_blank" rel="noopener noreferrer">GOV.UK Funding</a></li>
            <li><a href="https://www.childcarechoices.gov.uk" className="hover:text-teal-400" target="_blank" rel="noopener noreferrer">Childcare Choices</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center">
        &copy; {new Date().getFullYear()} Childcare Checker. This is an independent tool for illustrative purposes.
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;