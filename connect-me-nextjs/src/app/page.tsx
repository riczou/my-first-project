import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Network, BarChart3, Users, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Network className="h-8 w-8 text-gradient" />
              <span className="text-xl font-bold text-gradient">ConnectMe</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="ghost" className="hover:bg-white/20">
                  Pricing
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-white/20">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300">
            ✨ Professional Network Intelligence
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 fade-in">
            Transform Your{" "}
            <span className="text-gradient">Professional Network</span>{" "}
            Into Career Opportunities
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover hidden job opportunities, analyze your network strength, and unlock career growth through AI-powered insights and connection intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto">
                Start Your Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto glassmorphism hover:bg-white/20">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">25%</div>
              <div className="text-muted-foreground">Career Boost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">&lt; 1min</div>
              <div className="text-muted-foreground">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">89%</div>
              <div className="text-muted-foreground">Match Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">
              Intelligent Network Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leverage AI to understand your professional relationships and discover opportunities you never knew existed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 glassmorphism hover:scale-105 transition-transform duration-300 floating-animation">
              <Network className="h-12 w-12 text-blue-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Network Intelligence</h3>
              <p className="text-muted-foreground">
                Visualize and analyze your professional connections with advanced relationship mapping and strength scoring.
              </p>
            </Card>
            
            <Card className="p-8 glassmorphism hover:scale-105 transition-transform duration-300 floating-animation [animation-delay:0.5s]">
              <BarChart3 className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Company Analytics</h3>
              <p className="text-muted-foreground">
                Discover career opportunities within companies where your network already works and has influence.
              </p>
            </Card>
            
            <Card className="p-8 glassmorphism hover:scale-105 transition-transform duration-300 floating-animation [animation-delay:1s]">
              <Zap className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">AI Job Matching</h3>
              <p className="text-muted-foreground">
                Get personalized job recommendations based on your skills, experience, and network connections.
              </p>
            </Card>
            
            <Card className="p-8 glassmorphism hover:scale-105 transition-transform duration-300 floating-animation [animation-delay:1.5s]">
              <Users className="h-12 w-12 text-green-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Connection Insights</h3>
              <p className="text-muted-foreground">
                Understand relationship strengths, mutual connections, and identify key influencers in your network.
              </p>
            </Card>
            
            <Card className="p-8 glassmorphism hover:scale-105 transition-transform duration-300 floating-animation [animation-delay:2s]">
              <Shield className="h-12 w-12 text-orange-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Privacy First</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and secure. We never share your information without explicit consent.
              </p>
            </Card>
            
            <Card className="p-8 glassmorphism hover:scale-105 transition-transform duration-300 floating-animation [animation-delay:2.5s]">
              <Globe className="h-12 w-12 text-red-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Global Platform</h3>
              <p className="text-muted-foreground">
                Connect data from LinkedIn, Facebook, Twitter, and other professional platforms seamlessly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 glassmorphism gradient-border">
            <div className="bg-card/90 rounded-xl p-12 -m-[1px]">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gradient">
                Ready to Unlock Your Network&apos;s Potential?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have discovered hidden opportunities through intelligent network analysis.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-4 h-auto">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t glassmorphism">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Network className="h-6 w-6 text-gradient" />
            <span className="text-lg font-semibold text-gradient">ConnectMe</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 ConnectMe. Transform your professional network into career opportunities.
          </p>
        </div>
      </footer>
    </div>
  );
}
