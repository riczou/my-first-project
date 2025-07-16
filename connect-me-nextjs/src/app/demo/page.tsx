"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDemo } from "@/components/demo/UploadDemo";
import { NetworkVisualization } from "@/components/demo/NetworkVisualization";
import { JobMatchingDemo } from "@/components/demo/JobMatchingDemo";
import { 
  ArrowLeft, 
  Network, 
  BarChart3, 
  Users, 
  Zap, 
  Upload,
  Eye,
  Sparkles
} from "lucide-react";

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<{ [key: string]: boolean }>({
    upload: false,
    network: false,
    analytics: false,
    connections: false,
    jobs: false,
  });

  const toggleDemo = (demoId: string) => {
    setActiveDemo(prev => ({
      ...prev,
      [demoId]: !prev[demoId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Network className="h-8 w-8 text-gradient" />
              <span className="text-xl font-bold text-gradient">ConnectMe</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="hover:bg-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
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

      {/* Demo Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300">
            <Eye className="mr-2 h-4 w-4" />
            Live Product Demo
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            See ConnectMe In Action
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Watch how ConnectMe transforms your professional network data into actionable career insights in just minutes.
          </p>
        </div>
      </section>

      {/* Demo Features Tabs */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8 glassmorphism">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center space-x-2">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </TabsTrigger>
            </TabsList>

            {/* Upload Demo */}
            <TabsContent value="upload">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-6 w-6 text-blue-600" />
                    <span>Quick Upload Process</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Interactive Upload Demo */}
                    <UploadDemo 
                      isPlaying={activeDemo.upload} 
                      onToggle={() => toggleDemo('upload')}
                    />

                    {/* Features List */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">What you'll see:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Drag & Drop LinkedIn CSV</p>
                            <p className="text-sm text-muted-foreground">Simple file upload process</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Automatic Data Processing</p>
                            <p className="text-sm text-muted-foreground">AI analyzes your connections instantly</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">Privacy Protection</p>
                            <p className="text-sm text-muted-foreground">Your data stays secure throughout</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Visualization Demo */}
            <TabsContent value="network">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Network className="h-6 w-6 text-purple-600" />
                    <span>Network Visualization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Interactive Network Visualization */}
                    <NetworkVisualization 
                      isPlaying={activeDemo.network} 
                      onToggle={() => toggleDemo('network')}
                    />

                    {/* Network Features */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Network Intelligence:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Interactive Network Map</p>
                            <p className="text-sm text-muted-foreground">Visualize connection relationships</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Strength Scoring</p>
                            <p className="text-sm text-muted-foreground">AI-powered relationship analysis</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Company Clusters</p>
                            <p className="text-sm text-muted-foreground">Group connections by organization</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Demo */}
            <TabsContent value="analytics">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                    <span>Analytics Dashboard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Analytics Visualization */}
                    <Card className="relative h-96 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                      <div className="absolute inset-0 p-6">
                        {!activeDemo.analytics ? (
                          <div className="h-full flex items-center justify-center">
                            <Button 
                              onClick={() => toggleDemo('analytics')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              View Analytics Demo
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold">Company Distribution</h3>
                              <Button onClick={() => toggleDemo('analytics')} variant="outline" size="sm">
                                Reset
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {[
                                { company: "Google", count: 45, color: "bg-blue-500" },
                                { company: "Microsoft", count: 32, color: "bg-green-500" },
                                { company: "Apple", count: 28, color: "bg-gray-600" },
                                { company: "Amazon", count: 21, color: "bg-orange-500" },
                                { company: "Meta", count: 18, color: "bg-blue-600" }
                              ].map((item, i) => (
                                <div key={item.company} className="animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 200}ms` }}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>{item.company}</span>
                                    <span>{item.count} connections</span>
                                  </div>
                                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                      style={{ width: `${(item.count / 45) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-sm font-medium text-green-800 dark:text-green-200">Key Insights</div>
                              <ul className="text-xs text-green-700 dark:text-green-300 mt-2 space-y-1">
                                <li>• 68% of your network is in tech companies</li>
                                <li>• Strong presence in FAANG companies</li>
                                <li>• 23% growth in enterprise connections</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Analytics Features */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Powerful Analytics:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <BarChart3 className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Company Distribution</p>
                            <p className="text-sm text-muted-foreground">See where your network works</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <BarChart3 className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Industry Insights</p>
                            <p className="text-sm text-muted-foreground">Identify industry concentrations</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <BarChart3 className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Growth Trends</p>
                            <p className="text-sm text-muted-foreground">Track network expansion over time</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connection Insights Demo */}
            <TabsContent value="connections">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-orange-600" />
                    <span>Connection Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Connection Insights Visualization */}
                    <Card className="relative h-96 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                      <div className="absolute inset-0 p-6 overflow-y-auto">
                        {!activeDemo.connections ? (
                          <div className="h-full flex items-center justify-center">
                            <Button 
                              onClick={() => toggleDemo('connections')}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              View Connection Insights
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold">Top Influencers</h3>
                              <Button onClick={() => toggleDemo('connections')} variant="outline" size="sm">
                                Reset
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {[
                                { name: "Sarah Chen", title: "VP Engineering", company: "Google", strength: 95, mutuals: 12 },
                                { name: "Michael Rodriguez", title: "Product Director", company: "Microsoft", strength: 89, mutuals: 8 },
                                { name: "Emily Zhang", title: "Design Lead", company: "Apple", strength: 87, mutuals: 15 },
                                { name: "David Kim", title: "Engineering Manager", company: "Netflix", strength: 82, mutuals: 6 }
                              ].map((person, i) => (
                                <Card key={person.name} className={`p-3 animate-in slide-in-from-right duration-500 ${i % 2 === 0 ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`} style={{ animationDelay: `${i * 300}ms` }}>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {person.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">{person.name}</div>
                                      <div className="text-xs text-muted-foreground">{person.title} at {person.company}</div>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">Strength: {person.strength}%</Badge>
                                        <Badge variant="outline" className="text-xs">{person.mutuals} mutuals</Badge>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Connection Features */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Deep Insights:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Mutual Connections</p>
                            <p className="text-sm text-muted-foreground">Find shared connections and introductions</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Influence Mapping</p>
                            <p className="text-sm text-muted-foreground">Identify key influencers in your network</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Relationship Strength</p>
                            <p className="text-sm text-muted-foreground">AI-powered connection scoring</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Job Matching Demo */}
            <TabsContent value="jobs">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-indigo-600" />
                    <span>AI Job Matching</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Interactive Job Matching Demo */}
                    <JobMatchingDemo 
                      isPlaying={activeDemo.jobs} 
                      onToggle={() => toggleDemo('jobs')}
                    />

                    {/* Job Features */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Smart Job Discovery:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <Zap className="h-5 w-5 text-indigo-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Network-Powered Matching</p>
                            <p className="text-sm text-muted-foreground">Jobs where you have connections</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Zap className="h-5 w-5 text-indigo-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Referral Opportunities</p>
                            <p className="text-sm text-muted-foreground">Direct paths to hiring managers</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Zap className="h-5 w-5 text-indigo-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Match Scoring</p>
                            <p className="text-sm text-muted-foreground">AI-calculated compatibility ratings</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 glassmorphism gradient-border">
            <div className="bg-card/90 rounded-xl p-12 -m-[1px]">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gradient">
                Ready to Transform Your Network?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                See these features in action with your own professional network data. Get started in less than 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-4 h-auto">
                    Start Free Analysis
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto glassmorphism hover:bg-white/20">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}