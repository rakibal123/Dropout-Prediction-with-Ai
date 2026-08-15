import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Users,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  PieChart,
  ClipboardList,
  Zap,
  LayoutDashboard,
  Lock,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-outfit bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-16 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-base font-bold text-primary">
                  <span>AI-Driven Education Intelligence</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-xl mx-auto lg:mx-0">
                  Predict Student Dropout Risk Using <span className="text-primary italic">Behavior Data</span>
                </h1>
                <p className="mx-auto max-w-lg text-lg text-muted-foreground lg:mx-0">
                  Identify at-risk students early and take action to ensure every learner achieves their full potential.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg min-w-[160px] border-primary/20 hover:bg-primary/10">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 min-w-[160px] bg-gradient-to-r from-primary to-blue-600 border-none">
                      Register
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative justify-center lg:justify-end flex">
                <div className="absolute -inset-10 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                <Card className="relative w-full max-w-md overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl border-t-primary/20">
                  <CardContent className="p-0">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          Live Prediction Feed
                        </h3>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">Real-time</span>
                      </div>
                      <div className="space-y-6">
                        {[
                          { name: "Rafiq Ahmed", risk: "Low", h: 92, c: "bg-risk-low" },
                          { name: "Sumaiya Akter", risk: "High", h: 42, c: "bg-risk-high" },
                          { name: "Tanvir Hossain", risk: "Medium", h: 68, c: "bg-risk-medium" },
                        ].map((item, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{item.name}</span>
                              <span className={item.risk === "High" ? "text-risk-high" : item.risk === "Medium" ? "text-risk-medium" : "text-risk-low"}>
                                {item.risk} Risk
                              </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                              <div className={`h-full ${item.c}`} style={{ width: `${item.h}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-border flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-2 text-primary">
                          <Zap className="h-4 w-4 fill-primary/20" />
                          Analytics Active
                        </div>
                        <div className="opacity-80">ID: SDRPS-2026-X</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/[0.02]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto italic">Transforming raw behavior data into actionable academic insights in three simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-[2.25rem] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />
              {[
                { step: "01", title: "Enter Data", desc: "Input student attendance, engagement levels, and social behavior metrics into the system.", icon: ClipboardList },
                { step: "02", title: "Predict Risk", desc: "Our AI engine analyzes the behavior patterns to calculate a precise dropout risk score.", icon: BrainCircuit },
                { step: "03", title: "Get Insights", desc: "Access comprehensive dashboards with personalized intervention strategies for each at-risk student.", icon: PieChart },
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4 group">
                  <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500 ease-out border border-white/10">
                    <item.icon className="h-9 w-9" />
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur-md rounded-full px-4 py-1 border border-white/5 mx-auto">
                    <span className="text-[10px] font-black text-primary tracking-widest">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-600/5 blur-[120px]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Our Core Features</h2>
              <p className="text-slate-400">Comprehensive tools built to safeguard student futures.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Behavior-based prediction", desc: "Analyze interaction patterns beyond grades to find hidden risks.", icon: TrendingUp, color: "bg-blue-500/10 text-blue-400" },
                { title: "Visual risk charts", desc: "Clearly visualize institutional trends with interactive heatmaps.", icon: BarChart3, color: "bg-purple-500/10 text-purple-400" },
                { title: "Early warning system", desc: "Get automated alerts before performance turns into withdrawal.", icon: ShieldCheck, color: "bg-orange-500/10 text-orange-400" },
                { title: "Secure login", desc: "Enterprise-grade security protecting sensitive student behavior data.", icon: Lock, color: "bg-emerald-500/10 text-emerald-400" },
              ].map((f, i) => (
                <Card key={i} className="border-white/5 bg-slate-900/40 backdrop-blur-sm hover:border-primary/50 hover:bg-slate-900/60 transition-all duration-500 group">
                  <CardContent className="p-8 space-y-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight text-white">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 relative overflow-hidden bg-slate-900/20">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2 bg-primary/5 blur-[120px]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  <Users className="mr-2 h-4 w-4" />
                  About Us
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                  Empowering Education Through <span className="text-primary italic">Data</span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  The Student Dropout Risk Prediction System (SDRPS) was built with a singular mission: to ensure no student falls through the cracks. By leveraging advanced machine learning and behavioral analytics, we provide educators with the foresight needed to intervene before it's too late.
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    "Research-backed prediction models",
                    "Privacy-first data architecture",
                    "Dedicated to student success"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-slate-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur-[40px] opacity-20 animate-pulse" />
                <Card className="relative border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { label: "Accuracy Rate", value: "94%", icon: BrainCircuit },
                        { label: "Students Monitored", value: "50k+", icon: Users },
                        { label: "Institutions", value: "120+", icon: GraduationCap },
                        { label: "Early Interventions", value: "15k+", icon: ShieldCheck },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors">
                          <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 relative">
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-600/5 blur-[120px]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Get In Touch</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Have questions about implementing SDRPS at your institution? We're here to help.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="border-white/5 bg-slate-900/40 backdrop-blur-sm lg:col-span-1">
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">Email Us</p>
                          <p className="text-sm text-slate-400">support@dropoutrisk.org.bd</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">Call Us</p>
                          <p className="text-sm text-slate-400">+8801531396247</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">Location</p>
                          <p className="text-sm text-slate-400">Rohomotpur, Mymensingh, Bangladesh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-white/5 bg-slate-900/40 backdrop-blur-sm lg:col-span-2">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">First Name</label>
                        <input className="flex h-12 w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Last Name</label>
                        <input className="flex h-12 w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Email Address</label>
                      <input type="email" className="flex h-12 w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Message</label>
                      <textarea className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="How can we help you?" />
                    </div>
                    <Button type="button" className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary opacity-5" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            <h2 className="text-3xl font-bold sm:text-5xl">Ready to secure your students' future?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Join hundreds of institutions using SDRPS to improve retention and learning outcomes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-10">Create Instituion Account</Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-10">Request Demo</Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">DropoutRisk</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced behavioral analytics for modern educational institutions.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-foreground">About</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Mission</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Team</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Research</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-foreground">Contact</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> support@dropoutrisk.org.bd</li>
                <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +8801531396247</li>
                <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Rohomotpur, Mymensingh, Bangladesh</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} SDRPS - Student Dropout Risk Prediction System.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mock Activity Icon
function Activity({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
