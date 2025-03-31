import Hero from '../components/Hero';
import Features from '../components/Features';
import Plans from '../components/Plans';
import HowItWorks from '../components/HowItWorks';
import Partners from '../components/Partners';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <div className="bg-white">
      <Hero />
      <Features />
      <Plans />
      <HowItWorks />
      <Partners />
      <Contact />
    </div>
  );
};

export default Home; 