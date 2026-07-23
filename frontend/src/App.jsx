import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import History from './pages/History';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plants/:id" element={<Detail />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
