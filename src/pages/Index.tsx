
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import RotatingImageShowcase from '@/components/home/RotatingImageShowcase';
import ProductShowcase from '@/components/home/ProductShowcase';
import HowItWorks from '@/components/home/HowItWorks';
import AboutUs from '@/components/home/AboutUs';
import FaqSection from '@/components/home/FaqSection';

const Index = () => {
  console.log('Index component rendering');
  const location = useLocation();

  useEffect(() => {
    console.log('Index useEffect running');
    // Check if there's a section to scroll to in the location state
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        const element = document.querySelector(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Clear the state to prevent scrolling again on future renders
          window.history.replaceState({}, document.title);
        }
      }, 100); // Small delay to ensure DOM is fully rendered
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <RotatingImageShowcase />
        <div id="products">
          <ProductShowcase />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="about-us">
          <AboutUs />
        </div>
        <div id="faq">
          <FaqSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
