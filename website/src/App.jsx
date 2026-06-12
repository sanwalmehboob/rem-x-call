import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardPreview from './components/DashboardPreview';
import Features from './components/Features';
import DarkFeatures from './components/DarkFeatures';
import Stats from './components/Stats';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Features />
      <DarkFeatures />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
