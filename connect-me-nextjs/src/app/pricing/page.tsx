"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Network, 
  Check, 
  Star, 
  Users, 
  Building2, 
  Zap, 
  Shield, 
  Globe, 
  Target,
  Sparkles,
  Crown,
  Rocket
} from "lucide-react";

interface PricingTier {
  name: string;
  icon: any;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  cta: string;
  color: string;
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      name: "Free",
      icon: Users,
      description: "Perfect for getting started with network analysis",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Up to 50 connections",
        "Basic network analytics",
        "Company insights",
        "Connection strength tracking",
        "CSV import/export",
        "Email support"
      ],
      limitations: [
        "Limited to 50 connections",
        "Basic analytics only",
        "No AI job matching",
        "No advanced recommendations"
      ],
      cta: "Get Started Free",
      color: "gray"
    },
    {
      name: "Professional",
      icon: Target,
      description: "For ambitious professionals ready to leverage their network",
      monthlyPrice: 29,
      annualPrice: 24, // $288/year vs $348/year - 17% savings
      features: [
        "Unlimited connections",
        "Advanced network analytics",
        "AI-powered job matching",
        "Network health scoring",
        "Growth trend analysis",
        "Company opportunity mapping",
        "Introduction pathway finder",
        "Priority email support",
        "Network optimization tips",
        "Industry benchmarking"
      ],
      popular: true,
      cta: "Start Professional",
      color: "blue"
    },
    {
      name: "Executive",
      icon: Crown,
      description: "For executives and business leaders maximizing ROI",
      monthlyPrice: 79,
      annualPrice: 66, // $792/year vs $948/year - 16% savings
      features: [
        "Everything in Professional",
        "Team collaboration tools",
        "White-label reports",
        "API access for integrations",
        "Custom analytics dashboards",
        "Board member identification",
        "Executive network mapping",
        "Strategic partnership finder",
        "Personal networking coach",
        "24/7 priority support",
        "Custom data exports",
        "Advanced security features"
      ],
      cta: "Go Executive",
      color: "purple"
    },
    {
      name: "Enterprise",
      icon: Building2,
      description: "Custom solutions for organizations and teams",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Everything in Executive",
        "Unlimited team members",
        "Advanced admin controls",
        "Custom integrations",
        "On-premise deployment",
        "Dedicated account manager",
        "Custom training sessions",
        "SLA guarantees",
        "Advanced compliance",
        "Custom analytics",
        "Bulk data processing",
        "Enterprise security"
      ],
      cta: "Contact Sales",
      color: "gold"
    }
  ];

  const getPrice = (tier: PricingTier) => {
    if (tier.monthlyPrice === 0) return "Free";
    return isAnnual ? `$${tier.annualPrice}` : `$${tier.monthlyPrice}`;
  };

  const getSavings = (tier: PricingTier) => {
    if (tier.monthlyPrice === 0) return null;
    const annualTotal = tier.annualPrice * 12;
    const monthlyTotal = tier.monthlyPrice * 12;
    const savings = monthlyTotal - annualTotal;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  const getButtonVariant = (tier: PricingTier) => {
    if (tier.popular) return "default";
    if (tier.name === "Free") return "outline";
    return "outline";
  };

  const getCardClassName = (tier: PricingTier) => {
    let baseClass = "glassmorphism relative transition-all duration-300 hover:scale-105 h-full";
    if (tier.popular) {
      baseClass += " ring-2 ring-blue-500 ring-opacity-50 shadow-xl";
    }
    return baseClass;
  };

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

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300">
              <Sparkles className="h-4 w-4 mr-2" />
              Choose Your Network Intelligence Plan
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 fade-in">
              Unlock Your Network&apos;s{" "}
              <span className="text-gradient">True Potential</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your professional relationships into career opportunities with AI-powered insights and strategic networking intelligence.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </span>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Save up to 17%
              </Badge>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingTiers.map((tier) => {
              const IconComponent = tier.icon;
              const savings = getSavings(tier);
              
              return (
                <Card key={tier.name} className={getCardClassName(tier)}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${
                        tier.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        tier.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        tier.color === 'gold' ? 'from-yellow-500 to-orange-500' :
                        'from-gray-400 to-gray-500'
                      }`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-sm px-2">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Pricing */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-4xl font-bold text-gradient">
                          {getPrice(tier)}
                        </span>
                        {tier.monthlyPrice > 0 && (
                          <span className="text-muted-foreground">
                            /{isAnnual ? 'month' : 'month'}
                          </span>
                        )}
                      </div>
                      
                      {isAnnual && savings && (
                        <div className="mt-2">
                          <span className="text-sm text-green-600 font-medium">
                            Save ${savings.amount} annually ({savings.percentage}% off)
                          </span>
                        </div>
                      )}
                      
                      {!isAnnual && tier.monthlyPrice > 0 && (
                        <div className="mt-1">
                          <span className="text-sm text-muted-foreground">
                            ${tier.monthlyPrice * 12} billed annually
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      
                      {tier.limitations && (
                        <div className="pt-2 border-t border-muted/30">
                          {tier.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start space-x-3 opacity-60">
                              <div className="h-4 w-4 rounded-full border border-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      {tier.name === "Enterprise" ? (
                        <Button 
                          variant={getButtonVariant(tier)}
                          className="w-full h-12"
                          asChild
                        >
                          <a href="mailto:sales@connectme.com">
                            {tier.cta}
                          </a>
                        </Button>
                      ) : (
                        <Link href={tier.name === "Free" ? "/register" : "/register"}>
                          <Button 
                            variant={getButtonVariant(tier)}
                            className={`w-full h-12 ${tier.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
                          >
                            {tier.cta}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <Card className="glassmorphism mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Why ConnectMe?</CardTitle>
              <CardDescription>
                The only platform that transforms your network into actionable career intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">AI-Powered Intelligence</h3>
                  <p className="text-muted-foreground text-sm">
                    Our advanced algorithms analyze relationship patterns, identify opportunities, and provide strategic recommendations tailored to your career goals.
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Privacy & Security First</h3>
                  <p className="text-muted-foreground text-sm">
                    Enterprise-grade security with encrypted data storage. Your network information is protected with the highest industry standards.
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Proven Results</h3>
                  <p className="text-muted-foreground text-sm">
                    Users report 25% faster job placements and 40% more interview opportunities through strategic network leverage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Calculator */}
          <Card className="glassmorphism mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Calculate Your Network ROI</CardTitle>
              <CardDescription>
                See how ConnectMe pays for itself through better career opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gradient">$75K</div>
                  <div className="text-sm text-muted-foreground">Average salary increase</div>
                  <div className="text-xs text-muted-foreground">From better job placements</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gradient">6 months</div>
                  <div className="text-sm text-muted-foreground">Faster job placement</div>
                  <div className="text-xs text-muted-foreground">Compared to traditional methods</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gradient">25,900%</div>
                  <div className="text-sm text-muted-foreground">ROI on Professional plan</div>
                  <div className="text-xs text-muted-foreground">If you land just one better job</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="glassmorphism">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at your next billing cycle.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Is my data secure?</h4>
                    <p className="text-sm text-muted-foreground">
                      Absolutely. We use enterprise-grade encryption and never share your personal network data. Your privacy is our top priority.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How does the AI job matching work?</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes your skills, experience, and network connections to identify job opportunities where you have the highest chance of success.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Can I import from multiple platforms?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! Import from LinkedIn, upload CSV files, or add connections manually. We support all major professional platforms.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                    <p className="text-sm text-muted-foreground">
                      Our Free plan lets you experience ConnectMe with up to 50 connections. Upgrade anytime to unlock the full potential.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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