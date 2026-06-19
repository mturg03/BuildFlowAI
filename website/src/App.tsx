import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Zap, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart3,
  ChevronRight,
  Play,
  Check
} from 'lucide-react'
import { motion } from 'framer-motion'

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500 transition-colors group">
    <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
)

const Step = ({ number, title, description }: any) => (
  <div className="flex flex-col items-center text-center px-4">
    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-blue-600/20">
      {number}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
)

const PricingCard = ({ tier, price, features, highlighted = false }: any) => (
  <div className={`p-8 rounded-3xl border ${highlighted ? 'bg-blue-600 border-blue-400 scale-105' : 'bg-gray-900 border-gray-800'}`}>
    <h3 className="text-xl font-bold mb-2">{tier}</h3>
    <div className="flex items-baseline mb-6">
      <span className="text-4xl font-bold">${price}</span>
      <span className={`text-sm ml-2 ${highlighted ? 'text-blue-100' : 'text-gray-400'}`}>/month</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature: string, i: number) => (
        <li key={i} className="flex items-center space-x-3">
          <Check size={18} className={highlighted ? 'text-blue-200' : 'text-blue-500'} />
          <span className={highlighted ? 'text-blue-50 text-opacity-90' : 'text-gray-300'}>{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-xl font-bold transition-all ${
      highlighted 
        ? 'bg-white text-blue-600 hover:bg-gray-100' 
        : 'bg-blue-600 text-white hover:bg-blue-500'
    }`}>
      Get Started
    </button>
  </div>
)

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [message, setMessage] = useState('')
  const [demoResponse, setDemoResponse] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    setIsTyping(true)
    setDemoResponse(null)
    
    // Simulate AI processing
    setTimeout(() => {
      setIsTyping(false)
      if (message.toLowerCase().includes('framing') || message.toLowerCase().includes('%')) {
        setDemoResponse("Engine detected timeline update: 'Framing' milestone progress updated to matches your message. Dashboard synchronized.")
      } else if (message.toLowerCase().includes('move') || message.toLowerCase().includes('change')) {
        setDemoResponse("Engine flagged potential Change Order. Out-of-scope work detected. Alert created for project manager review.")
      } else {
        setDemoResponse("Message received. Daily report entry generated and labor logs updated for today.")
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white font-sans">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-gray-800 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl italic">B</div>
            <span className="text-2xl font-bold tracking-tighter">BuildFlow <span className="text-blue-500">AI</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition-all font-bold">Launch Dashboard</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600 opacity-10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-blue-600 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              The Assistant for General Contractors
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              Your foremen just text.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">BuildFlow AI</span> handles the rest.
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Automate your jobsite admin without training your field workers. BuildFlow AI scans texts, voice notes, and emails to update timelines, catch change orders, and generate daily reports.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="w-full sm:w-auto px-10 py-4 bg-blue-600 rounded-full font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                Get Started for Free
              </button>
              <button className="w-full sm:w-auto px-10 py-4 border border-gray-800 rounded-full font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center space-x-2">
                <Play size={18} className="fill-current" />
                <span>Watch Demo</span>
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden aspect-video group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <div className="absolute top-4 left-4 z-20 flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-2xl">
                <Play size={32} fill="white" className="ml-1" />
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070" 
              alt="Construction jobsite" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
            />
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
          <span className="text-xl font-bold tracking-widest uppercase">ContractorX</span>
          <span className="text-xl font-bold tracking-widest uppercase">SteelBuild</span>
          <span className="text-xl font-bold tracking-widest uppercase">Mainline Builders</span>
          <span className="text-xl font-bold tracking-widest uppercase">Summit Commercial</span>
          <span className="text-xl font-bold tracking-widest uppercase">Apex Residential</span>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 italic tracking-tighter">Zero Training. Full Automation.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">BuildFlow AI works with the tools your foremen already use.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <Step 
              number="1" 
              title="Foreman Texts" 
              description="Foreman sends a text or voice note about the day's progress, issues, or requests." 
            />
            <Step 
              number="2" 
              title="AI Analyzes" 
              description="Our construction-trained LLM extracts timelines, labor, risks, and out-of-scope work." 
            />
            <Step 
              number="3" 
              title="Updates Flow" 
              description="Timeline, daily reports, and cost trackers are automatically updated in real-time." 
            />
            <Step 
              number="4" 
              title="PMs Act" 
              description="Project Managers get alerted to risks and change orders before they become problems." 
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold mb-4 tracking-tighter italic">Stop losing money on undocumented work.</h2>
              <p className="text-gray-400 text-lg">We turn jobsite chatter into structured data that protects your profit margin.</p>
            </div>
            <button className="text-blue-500 font-bold flex items-center hover:translate-x-2 transition-transform">
              Explore all features <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Clock} 
              title="Timeline Auto-Updates" 
              description="Text 'Framing is 50% done' and your schedule updates instantly. No manual data entry required." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Change Order Detection" 
              description="AI flags mentions of out-of-scope work, ensuring you bill for every change requested on site." 
            />
            <FeatureCard 
              icon={FileText} 
              title="Instant Daily Reports" 
              description="AI compiles foreman updates into professional daily reports, complete with labor counts and notes." 
            />
            <FeatureCard 
              icon={AlertTriangle} 
              title="Predictive Delay Monitoring" 
              description="Detect schedule risks early—whether it's material delays, weather warnings, or labor shortages." 
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Profitability Dashboard" 
              description="Real-time visibility into project health, labor overruns, and material costs vs. budget." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Safety & Compliance" 
              description="Automatically log safety incidents and compliance issues surfaced in daily communications." 
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 tracking-tighter italic">Try the AI Assistant.</h2>
            <p className="text-gray-400 text-lg mb-8">Type a typical foreman message below to see how BuildFlow AI processes it in real-time.</p>
            <form onSubmit={handleSimulate} className="relative mb-6">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Framing is 80% done at Oakridge. Owner asked to move lobby wall."
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <button 
                type="submit"
                disabled={isTyping || !message.trim()}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 px-4 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {isTyping ? <Clock className="animate-spin" size={20} /> : <ChevronRight size={24} />}
              </button>
            </form>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase font-bold">Try these:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setMessage("Foundation is complete, starting framing tomorrow.")} className="text-xs bg-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors">"Foundation is complete..."</button>
                <button onClick={() => setMessage("Material truck delayed by 2 days due to weather.")} className="text-xs bg-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors">"Material truck delayed..."</button>
                <button onClick={() => setMessage("Client requested to add 4 more outlets in the office.")} className="text-xs bg-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors">"Client requested change..."</button>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative min-h-[300px] flex flex-col shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-3xl" />
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">AI</div>
              <div>
                <p className="font-bold">BuildFlow Engine</p>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Processing</p>
              </div>
            </div>
            
            <div className="flex-1">
              {isTyping && (
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse" />
                </div>
              )}
              {demoResponse && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 p-6 rounded-2xl border border-blue-500/30"
                >
                  <div className="flex items-start space-x-3">
                    <Zap className="text-blue-500 mt-1 shrink-0" size={18} />
                    <p className="text-blue-50 leading-relaxed font-medium">
                      {demoResponse}
                    </p>
                  </div>
                </motion.div>
              )}
              {!isTyping && !demoResponse && (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-10">
                  <MessageSquare size={48} className="mb-4" />
                  <p>Send a message to see engine analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tighter italic">Simple, Transparent Pricing.</h2>
            <p className="text-gray-400 text-lg">Unlimited projects and daily reports on every plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Small Contractor" 
              price="299" 
              features={[
                "Up to 10 field workers",
                "Unlimited projects",
                "Daily report generation",
                "Basic change order detection",
                "Standard support"
              ]} 
            />
            <PricingCard 
              tier="Mid-Size" 
              price="799" 
              highlighted={true}
              features={[
                "Up to 50 field workers",
                "Everything in Small",
                "Advanced change order analysis",
                "Predictive delay monitoring",
                "Priority support",
                "Dashboard analytics"
              ]} 
            />
            <PricingCard 
              tier="Large Enterprise" 
              price="1,999" 
              features={[
                "Unlimited field workers",
                "Everything in Mid-Size",
                "Custom integrations (ERP/CRM)",
                "On-site onboarding",
                "Dedicated success manager",
                "SLA guarantees"
              ]} 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight italic">Ready to eliminate your jobsite paperwork?</h2>
              <p className="text-xl text-blue-100 mb-12 opacity-90 leading-relaxed">Join 500+ contractors saving 10+ hours per week on jobsite administration.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button className="w-full sm:w-auto px-12 py-5 bg-white text-blue-600 rounded-full font-black text-xl hover:bg-gray-100 transition-all shadow-xl">
                  Get Started Now
                </button>
                <button className="w-full sm:w-auto px-12 py-5 border-2 border-white text-white rounded-full font-black text-xl hover:bg-white/10 transition-all">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic">B</div>
              <span className="text-xl font-bold tracking-tighter tracking-widest uppercase italic">BuildFlow</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The AI assistant for general contractors. Automating the field-to-office gap since 2026.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-blue-500 italic">Product</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Change Log</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-blue-500 italic">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-blue-500 italic">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 BuildFlow AI Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FileText = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14.5 2 14.5 7.5 20 7.5" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
)

export default App
