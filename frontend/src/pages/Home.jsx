import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const images = [
    "/hmbg.jpg",
    "/hmbgg.jpg",
    "/hmbrg.jpg",
    "/hmgn.jpg",
    "/hmmbg.jpg",
    "/study.jpg"
  ];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#94B4C1] selection:text-[#132440]">
      <Navbar />

      <main>
        {/* HERO SECTION - Carousel */}
        <div className="relative w-full min-h-screen flex items-center overflow-hidden">
          {/* Detailed Image Slideshow */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 z-0 bg-cover bg-top"
              style={{ backgroundImage: `url('${images[index]}')` }}
            >
              {/* Overlay Gradient inside each slide to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent"></div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
            <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-primary leading-[1.1]">
                Build your progress, <br />
                <span className="text-secondary">one smart day</span> at a time.
              </h1>

              <p className="text-xl md:text-2xl text-text-primary font-medium leading-relaxed max-w-lg">
                Stuck? Let’s do this better. Together. <br />
                <span className="text-accent font-black italic mt-2 block">— with PrepYou</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-5 pt-6">
                <Link
                  to="/login"
                  className="px-10 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-brand-ink hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-brand-indigo/30 text-center"
                >
                  Get Started
                </Link>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 bg-white/80 backdrop-blur-md text-primary font-bold rounded-2xl border border-secondary/30 hover:bg-white transition-all duration-300"
                >
                  How it works
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 bg-brand-mist relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-brand-mist to-brand-mist opacity-50"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                Your Path to <span className="text-accent">Mastery</span>
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto font-medium">
                No confusion, just clear steps. Here is how PrepYou transforms your study routine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Set Your Goal",
                  desc: "Define your exam, target score, or skill. The more specific, the better.",
                  icon: "🎯",
                  color: "bg-indigo-50 text-indigo-600"
                },
                {
                  step: "02",
                  title: "Get AI Plan",
                  desc: "Our engine builds a day-by-day roadmap tailored to your pace and deadline.",
                  icon: "🤖",
                  color: "bg-purple-50 text-purple-600"
                },
                {
                  step: "03",
                  title: "Execute & Track",
                  desc: "Follow daily tasks, log detailed progress, and watch your skills grow.",
                  icon: "📈",
                  color: "bg-teal-50 text-teal-600"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-brand-indigo/5 border border-white hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden"
                >
                  <div className={`absolute -top-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-10 transition-opacity bg-primary rounded-full blur-2xl`}></div>
                  <div className={`absolute top-6 right-8 text-6xl font-black text-gray-100 group-hover:text-primary/10 transition-colors pointer-events-none`}>{item.step}</div>

                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="text-text-muted font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION - sample.jpg */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-secondary rounded-[3rem] rotate-3 transform translate-x-4 translate-y-4 -z-10"></div>
              <img
                src="/sample.jpg"
                alt="Modern study setup"
                className="rounded-[3rem] shadow-2xl w-full h-[600px] object-cover"
              />
            </div>

            {/* Text Side */}
            <div className="space-y-10 order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-black text-primary leading-tight">
                Smarter learning,<br />
                <span className="text-accent">better results.</span>
              </h2>
              <p className="text-text-primary text-xl leading-relaxed">
                Stop guessing what to study. Our AI analyzes your pace, weak areas, and goals to build the perfect schedule for you daily.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Intelligent Planning", desc: "Adaptive daily roadmaps" },
                  { label: "Progress Tracking", desc: "Visual growth metrics" },
                  { label: "Focus Timer", desc: "Deep work sessions" },
                  { label: "Daily Journaling", desc: "Reflective learning" }
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-brand-cloud rounded-3xl border border-secondary/10 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                    <div className="text-primary font-black text-lg mb-1 group-hover:text-accent transition-colors">{feature.label}</div>
                    <div className="text-secondary text-sm font-medium">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RESOURCES / FINAL CTA - last banner.jpg */}
        <section className="relative py-40 overflow-hidden flex items-center justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/last banner.jpg"
              alt="Study Resources"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/90"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white space-y-10">
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Everything you need <br /> to ace that exam.
            </h2>
            <p className="text-secondary text-xl md:text-2xl max-w-3xl mx-auto text-indigo-200">
              From mock tests to summarized notes, PrepYou organizes your entire study material ecosystem in one place.
            </p>

            <div className="pt-8">
              <Link to="/login" className="inline-block px-12 py-6 bg-accent text-white font-black text-xl rounded-2xl shadow-[0_20px_50px_rgba(227,100,90,0.3)] hover:bg-white hover:text-accent hover:scale-105 transition-all duration-300">
                Start Your Journey Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-white border-t border-secondary/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-text-muted font-medium text-sm">
            &copy; {new Date().getFullYear()} PrepYou.
          </p>
          <div className="flex gap-8 text-sm font-bold text-text-primary">
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-accent transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
