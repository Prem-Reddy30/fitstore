import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
    tagline: "New Arrival Collection",
    title: "Unleash Your Potential",
    highlight: "Potential",
    subtitle: "Premium gear, apparel, and supplements designed for those who refuse to settle.",
    link: "/products"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1920&q=80",
    tagline: "Top Tier Nutrition",
    title: "Fuel Your Gains",
    highlight: "Protein",
    subtitle: "High-quality whey, pre-workouts, and recovery supplements to push your limits.",
    link: "/products?category=supplements"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1920&q=80",
    tagline: "Performance Wear",
    title: "Train In Style",
    highlight: "Apparel",
    subtitle: "Breathable t-shirts, compression sleeves, and comfortable gym wear.",
    link: "/products?category=tshirts"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1920&q=80",
    tagline: "Heavy Duty",
    title: "Build Your Home Gym",
    highlight: "Equipment",
    subtitle: "Dumbbells, kettlebells, and machines built to last a lifetime.",
    link: "/products?category=equipment"
  }
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  return (
    <section className="relative h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-10"></div>
          <img 
            src={slide.image} 
            alt={slide.title} 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8s] ${index === current ? 'scale-110' : 'scale-100'}`}
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <div className={`transform transition-all duration-1000 delay-300 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="mb-4 inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/50 text-primary font-bold text-sm uppercase tracking-widest backdrop-blur-sm">
                {slide.tagline}
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-6 uppercase tracking-tight leading-tight text-white">
                {slide.title.replace(slide.highlight, '')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                  {slide.highlight}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
                {slide.subtitle}
              </p>
              <Link to={slide.link} className="inline-flex group/btn relative bg-primary hover:bg-emerald-500 text-white px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1">
                Shop Now 
                <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide} 
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide} 
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === current ? 'bg-primary scale-125 w-8' : 'bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
