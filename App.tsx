
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
            <Link to="/" className={`${isActive('/') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition text-sm font-medium`}>Home</Link>
            <Link to="/eligibility" className={`${isActive('/eligibility') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition text-sm font-medium`}>Eligibility</Link>
            <Link to="/calculator" className={`${isActive('/calculator') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition text-sm font-medium`}>Cost Calculator</Link>
            <Link to="/about" className={`${isActive('/about') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition text-sm font-medium`}>About</Link>
            <Link to="/faq" className={`${isActive('/faq') ? 'text-teal-600 font-semibold' : 'text-slate-600'} hover:text-teal-600 transition text-sm font-medium`}>FAQ</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Logo />
          <p className="mt-6 text-slate-400 max-w-sm leading-relaxed text-sm">
            Helping parents across the UK navigate the complex world of childcare funding. Comprehensive support for England, Scotland, Wales, and Northern Ireland.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Tools</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/eligibility" className="hover:text-teal-400 transition">Eligibility Checker</Link></li>
            <li><Link to="/calculator" className="hover:text-teal-400 transition">Cost Calculator</Link></li>
            <li><Link to="/faq" className="hover:text-teal-400 transition">Funding FAQ</Link></li>
            <li><Link to="/about" className="hover:text-teal-400 transition">Our Mission</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Official Links</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="https://www.childcarechoices.gov.uk" className="hover:text-teal-400 transition" target="_blank" rel="noopener noreferrer">Childcare Choices (UK)</a></li>
            <li><a href="https://www.gov.uk/browse/childcare-parenting/financial-help-children" className="hover:text-teal-400 transition" target="_blank" rel="noopener noreferrer">Gov.UK Financial Help</a></li>
            <li><a href="https://www.nidirect.gov.uk/articles/help-childcare-costs" className="hover:text-teal-400 transition" target="_blank" rel="noopener noreferrer">NI Direct Childcare</a></li>
            <li><a href="https://www.parentclub.scot/articles/funded-early-learning-and-childcare" className="hover:text-teal-400 transition" target="_blank" rel="noopener noreferrer">Parent Club Scotland</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-slate-800 text-xs text-center text-slate-500">
        &copy; {new Date().getFullYear()} Childcare Checker. This is an independent tool for informational purposes. <br className="md:hidden" /> Always confirm your eligibility with official government sources.
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
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
