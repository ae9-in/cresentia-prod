import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { BookOpen, Award, TrendingUp, ArrowRight, PlayCircle, Users, Clock, CheckCircle, Star, Zap, Target, Mail, Twitter, Linkedin, Github } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans text-white overflow-x-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FF5F1F]/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10 relative z-20">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleGetStarted}>
          <div className="w-10 h-10 rounded-full bg-[#FF5F1F] flex items-center justify-center shadow-[0_0_15px_rgba(255,95,31,0.4)] group-hover:shadow-[0_0_25px_rgba(255,95,31,0.6)] transition-shadow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#FF5F1F] tracking-tight">Crescentia</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <button onClick={handleGetStarted} className="text-gray-300 hover:text-[#FF5F1F] transition-colors font-medium text-sm tracking-wide">Courses</button>
          <button onClick={handleGetStarted} className="text-gray-300 hover:text-[#FF5F1F] transition-colors font-medium text-sm tracking-wide">Dashboard</button>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white transition-colors font-medium text-sm tracking-wide">Log in</button>
          <button onClick={handleGetStarted} className="px-6 py-2.5 rounded-full bg-[#FF5F1F] hover:bg-[#e6551c] hover:shadow-[0_0_20px_rgba(255,95,31,0.5)] text-white font-medium text-sm tracking-wide transition-all">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative">
        <div className="max-w-5xl w-full flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 cursor-pointer hover:bg-white/10 transition-colors" onClick={handleGetStarted}>
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF5F1F] shadow-[0_0_8px_#FF5F1F]"></span>
            <span className="text-sm text-gray-200 tracking-widest uppercase font-semibold">Enroll for the new course added this week</span>
          </div>

          <h1 className="text-6xl md:text-[5.5rem] font-sans font-extrabold leading-[1.05] mb-8 drop-shadow-2xl tracking-tight">
            <span className="text-[#e8e8e8]">Master new skills</span>
            <br />
            <span className="text-[#1a56db]">with Crescentia</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl tracking-wide">
            Join thousands of learners and unlock your potential with curated paths, personalized dashboards, and verified certificates that stand out.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
            <button onClick={handleGetStarted} className="px-10 py-5 rounded-full bg-[#FF5F1F] hover:bg-[#e6551c] hover:shadow-[0_0_30px_rgba(255,95,31,0.6)] text-white font-bold text-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 w-full sm:w-auto">
              Start Learning Now <ArrowRight className="w-6 h-6" />
            </button>
            <button onClick={handleGetStarted} className="px-10 py-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 w-full sm:w-auto">
              <PlayCircle className="w-6 h-6 text-[#FF5F1F]" /> View Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl w-full mt-32">
          <div className="text-left cursor-pointer group" onClick={handleGetStarted}>
            <div className="w-12 h-12 rounded-xl bg-[#2A4A4A] flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-1">
              <TrendingUp className="w-6 h-6 text-[#4FD1C5]" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Personalized<br/>Dashboard</h3>
            <p className="text-gray-400 leading-relaxed text-sm">Pick up from where you left off with smart progress tracking and tailored recommendations.</p>
          </div>

          <div className="text-left cursor-pointer group" onClick={handleGetStarted}>
            <div className="w-12 h-12 rounded-xl bg-[#2A4A5A] flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-1">
              <BookOpen className="w-6 h-6 text-[#4FC3F7]" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Curated Paths</h3>
            <p className="text-gray-400 leading-relaxed text-sm">Browse focused course paths built for real-world roles by industry experts.</p>
          </div>

          <div className="text-left cursor-pointer group" onClick={handleGetStarted}>
            <div className="w-12 h-12 rounded-xl bg-[#2A4A3A] flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-1">
              <Award className="w-6 h-6 text-[#69F0AE]" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Verified Certificates</h3>
            <p className="text-gray-400 leading-relaxed text-sm">Download branded certificates after every completion to showcase your achievements.</p>
          </div>
        </div>

        {/* Multiple Courses Section */}
        <div className="max-w-7xl w-full mt-32 mb-12 text-left">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Jump back in</h2>
              <p className="text-gray-400">Pick up where you left off or explore new topics.</p>
            </div>
            <button onClick={handleGetStarted} className="hidden md:flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors">
              View all courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group" onClick={handleGetStarted}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="UI Design"
                className="w-full h-[320px] object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-4 bg-[#232323] p-4 rounded-xl border border-white/5 shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#00A896] flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base">Introduction to UI Design</p>
                    <p className="text-[#00A896] text-xs font-medium mt-0.5">Continue learning</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group" onClick={handleGetStarted}>
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Web Development"
                className="w-full h-[320px] object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-4 bg-[#232323] p-4 rounded-xl border border-white/5 shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#00A896] flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base">Advanced React Patterns</p>
                    <p className="text-[#00A896] text-xs font-medium mt-0.5">Start course</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group" onClick={handleGetStarted}>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Data Science"
                className="w-full h-[320px] object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-4 bg-[#232323] p-4 rounded-xl border border-white/5 shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#E64A19] flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base">Data Science Fundamentals</p>
                    <p className="text-[#E64A19] text-xs font-medium mt-0.5">Start course</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl w-full mt-40 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="cursor-pointer group" onClick={handleGetStarted}>
              <div className="text-4xl md:text-5xl font-bold text-[#FF5F1F] mb-2 group-hover:scale-110 transition-transform">10K+</div>
              <p className="text-gray-400 text-sm">Active Learners</p>
            </div>
            <div className="cursor-pointer group" onClick={handleGetStarted}>
              <div className="text-4xl md:text-5xl font-bold text-[#4FC3F7] mb-2 group-hover:scale-110 transition-transform">500+</div>
              <p className="text-gray-400 text-sm">Expert Courses</p>
            </div>
            <div className="cursor-pointer group" onClick={handleGetStarted}>
              <div className="text-4xl md:text-5xl font-bold text-[#69F0AE] mb-2 group-hover:scale-110 transition-transform">95%</div>
              <p className="text-gray-400 text-sm">Success Rate</p>
            </div>
            <div className="cursor-pointer group" onClick={handleGetStarted}>
              <div className="text-4xl md:text-5xl font-bold text-[#FF5F1F] mb-2 group-hover:scale-110 transition-transform">24/7</div>
              <p className="text-gray-400 text-sm">Support Available</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <section className="w-full flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="max-w-7xl w-full">
            <div className="flex flex-col items-center justify-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose Crescentia?
              </h2>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Join thousands of learners who have transformed their careers with our platform
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#FF5F1F]/50 transition-all group" onClick={handleGetStarted}>
              <div className="w-14 h-14 rounded-xl bg-[#FF5F1F]/10 flex items-center justify-center mb-6 group-hover:bg-[#FF5F1F]/20 transition-colors">
                <Users className="w-7 h-7 text-[#FF5F1F]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Instructors</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Learn from industry professionals with years of real-world experience in their fields.</p>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#4FC3F7]/50 transition-all group" onClick={handleGetStarted}>
              <div className="w-14 h-14 rounded-xl bg-[#4FC3F7]/10 flex items-center justify-center mb-6 group-hover:bg-[#4FC3F7]/20 transition-colors">
                <Clock className="w-7 h-7 text-[#4FC3F7]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Learn at Your Pace</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Flexible learning schedules that fit your lifestyle. Study anytime, anywhere.</p>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#69F0AE]/50 transition-all group" onClick={handleGetStarted}>
              <div className="w-14 h-14 rounded-xl bg-[#69F0AE]/10 flex items-center justify-center mb-6 group-hover:bg-[#69F0AE]/20 transition-colors">
                <CheckCircle className="w-7 h-7 text-[#69F0AE]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hands-On Projects</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Build real-world projects that showcase your skills to potential employers.</p>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#FF5F1F]/50 transition-all group" onClick={handleGetStarted}>
              <div className="w-14 h-14 rounded-xl bg-[#FF5F1F]/10 flex items-center justify-center mb-6 group-hover:bg-[#FF5F1F]/20 transition-colors">
                <Star className="w-7 h-7 text-[#FF5F1F]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Industry Recognition</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Earn certificates recognized by top companies and boost your career prospects.</p>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#4FC3F7]/50 transition-all group" onClick={handleGetStarted}>
              <div className="w-14 h-14 rounded-xl bg-[#4FC3F7]/10 flex items-center justify-center mb-6 group-hover:bg-[#4FC3F7]/20 transition-colors">
                <Zap className="w-7 h-7 text-[#4FC3F7]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Learning</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Engage with quizzes, assignments, and peer discussions for better retention.</p>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#69F0AE]/50 transition-all group" onClick={handleGetStarted}>
              <div className="w-14 h-14 rounded-xl bg-[#69F0AE]/10 flex items-center justify-center mb-6 group-hover:bg-[#69F0AE]/20 transition-colors">
                <Target className="w-7 h-7 text-[#69F0AE]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Career Support</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Get guidance on resume building, interview prep, and job placement assistance.</p>
            </div>
          </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <div className="max-w-7xl w-full mt-40 mb-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Learners Say</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Real stories from people who transformed their careers with Crescentia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#FF5F1F]/50 transition-all" onClick={handleGetStarted}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FF5F1F] text-[#FF5F1F]" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">"Crescentia helped me transition from marketing to web development. The courses are practical and the support is amazing!"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF5F1F] to-[#e6551c] flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <p className="font-semibold">Sarah Martinez</p>
                  <p className="text-sm text-gray-400">Full Stack Developer</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#4FC3F7]/50 transition-all" onClick={handleGetStarted}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#4FC3F7] text-[#4FC3F7]" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">"The best investment I've made in my career. The instructors are knowledgeable and the content is always up-to-date."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4FC3F7] to-[#3ba3d7] flex items-center justify-center text-white font-bold">
                  JC
                </div>
                <div>
                  <p className="font-semibold">James Chen</p>
                  <p className="text-sm text-gray-400">Data Scientist</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#69F0AE]/50 transition-all" onClick={handleGetStarted}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#69F0AE] text-[#69F0AE]" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">"I landed my dream job thanks to the skills I learned here. The certificates really made a difference in my applications."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#69F0AE] to-[#4ade80] flex items-center justify-center text-white font-bold">
                  EP
                </div>
                <div>
                  <p className="font-semibold">Emily Parker</p>
                  <p className="text-sm text-gray-400">UX Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl w-full mt-40 mb-12">
          <div className="bg-gradient-to-r from-[#FF5F1F] to-[#e6551c] rounded-3xl p-12 text-center cursor-pointer hover:shadow-[0_0_40px_rgba(255,95,31,0.4)] transition-all" onClick={handleGetStarted}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">Join thousands of learners and take the first step towards your dream career today.</p>
            <button onClick={handleGetStarted} className="px-12 py-4 rounded-full bg-white text-[#FF5F1F] hover:bg-gray-100 font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 mx-auto">
              Get Started for Free <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 relative z-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#FF5F1F] flex items-center justify-center shadow-[0_0_15px_rgba(255,95,31,0.4)]">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#FF5F1F] tracking-tight">Crescentia</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Empowering learners worldwide with quality education and industry-recognized certifications.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#FF5F1F]/20 border border-white/10 flex items-center justify-center transition-all group">
                  <Twitter className="w-5 h-5 text-gray-400 group-hover:text-[#FF5F1F]" />
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#FF5F1F]/20 border border-white/10 flex items-center justify-center transition-all group">
                  <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-[#FF5F1F]" />
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#FF5F1F]/20 border border-white/10 flex items-center justify-center transition-all group">
                  <Github className="w-5 h-5 text-gray-400 group-hover:text-[#FF5F1F]" />
                </a>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Platform</h3>
              <ul className="space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Browse Courses</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Learning Paths</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Certifications</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Pricing</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">For Business</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">About Us</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Careers</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Blog</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Press</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Help Center</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Community</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-400 hover:text-[#FF5F1F] transition-colors text-sm">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <div className="max-w-md">
              <h3 className="text-white font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest courses and updates.</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5F1F]/50 transition-colors"
                    onClick={handleGetStarted}
                  />
                </div>
                <button onClick={handleGetStarted} className="px-6 py-3 rounded-xl bg-[#FF5F1F] hover:bg-[#e6551c] text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(255,95,31,0.5)]">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Crescentia. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-500 hover:text-[#FF5F1F] text-sm transition-colors">Terms</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-500 hover:text-[#FF5F1F] text-sm transition-colors">Privacy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }} className="text-gray-500 hover:text-[#FF5F1F] text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
