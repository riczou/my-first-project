"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  Network, 
  ArrowLeft,
  TrendingUp,
  Users,
  Building2,
  MapPin,
  Target,
  Star,
  Award,
  Zap,
  Globe,
  Calendar,
  DollarSign
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import type { Connection, User } from "@/types";

interface NetworkAnalytics {
  healthScore: number;
  diversityScore: number;
  strengthScore: number;
  growthRate: number;
  totalValue: number;
  recommendations: string[];
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [analytics, setAnalytics] = useState<NetworkAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!apiClient.isAuthenticated()) {
        router.push("/login");
        return;
      }

      const [userResult, connectionsResult] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getConnections(),
      ]);

      if (userResult.error) {
        router.push("/login");
        return;
      }

      setUser(userResult.data!);
      const connectionsData = connectionsResult.data || [];
      setConnections(connectionsData);
      
      // Calculate analytics
      const analyticsData = calculateNetworkAnalytics(connectionsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNetworkAnalytics = (connections: Connection[]): NetworkAnalytics => {
    if (connections.length === 0) {
      return {
        healthScore: 0,
        diversityScore: 0,
        strengthScore: 0,
        growthRate: 0,
        totalValue: 0,
        recommendations: [
          "Start building your network by importing LinkedIn connections",
          "Add high-value connections manually",
          "Focus on quality over quantity"
        ]
      };
    }

    // Calculate health score based on various factors
    const companiesCount = new Set(connections.filter(c => c.connection_company).map(c => c.connection_company)).size;
    const locationsCount = new Set(connections.filter(c => c.connection_location).map(c => c.connection_location)).size;
    const avgStrength = connections.filter(c => c.relationship_strength).reduce((sum, c) => sum + (c.relationship_strength || 0), 0) / Math.max(1, connections.filter(c => c.relationship_strength).length);
    
    const diversityScore = Math.min(100, (companiesCount * 5) + (locationsCount * 3));
    const strengthScore = avgStrength * 20;
    const sizeScore = Math.min(40, connections.length * 0.8);
    const healthScore = (diversityScore * 0.4) + (strengthScore * 0.4) + (sizeScore * 0.2);

    // Estimate network value (rough calculation)
    const totalValue = connections.length * 150 + (companiesCount * 300) + (connections.filter(c => (c.relationship_strength || 0) >= 4).length * 500);

    const recommendations = generateRecommendations(connections, healthScore);

    return {
      healthScore: Math.round(healthScore),
      diversityScore: Math.round(diversityScore),
      strengthScore: Math.round(strengthScore),
      growthRate: Math.round(Math.random() * 25 + 10), // Mock growth rate
      totalValue,
      recommendations
    };
  };

  const generateRecommendations = (connections: Connection[], healthScore: number): string[] => {
    const recommendations = [];
    
    if (healthScore < 30) {
      recommendations.push("Focus on building stronger relationships with existing connections");
      recommendations.push("Add connections from diverse industries to expand opportunities");
    } else if (healthScore < 60) {
      recommendations.push("Strengthen relationships with key industry leaders");
      recommendations.push("Connect with professionals in growing sectors");
    } else if (healthScore < 80) {
      recommendations.push("Leverage your strong network for job opportunities");
      recommendations.push("Consider mentoring others to expand influence");
    } else {
      recommendations.push("Your network is exceptionally strong - time to monetize!");
      recommendations.push("Consider advisory roles or board positions");
    }

    const companies = new Set(connections.filter(c => c.connection_company).map(c => c.connection_company));
    if (companies.size < 10) {
      recommendations.push("Diversify across more companies for better opportunities");
    }

    return recommendations.slice(0, 4);
  };

  const getCompanyDistribution = (): ChartData[] => {
    const companyCount = new Map<string, number>();
    connections.forEach(conn => {
      if (conn.connection_company) {
        companyCount.set(conn.connection_company, (companyCount.get(conn.connection_company) || 0) + 1);
      }
    });

    return Array.from(companyCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  };

  const getStrengthDistribution = (): ChartData[] => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
    const strengthLabels = ['Weak (1)', 'Fair (2)', 'Good (3)', 'Strong (4)', 'Excellent (5)'];
    const distribution = [0, 0, 0, 0, 0];
    
    connections.forEach(conn => {
      const strength = conn.relationship_strength || 1;
      distribution[strength - 1]++;
    });

    return distribution.map((value, index) => ({
      name: strengthLabels[index],
      value,
      color: colors[index]
    }));
  };

  const getGrowthData = (): ChartData[] => {
    // Mock growth data - in real app, this would come from historical data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseGrowth = Math.max(1, Math.floor(connections.length / 6));
    
    return months.map((month, index) => ({
      name: month,
      value: baseGrowth * (index + 1) + Math.floor(Math.random() * 20)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glassmorphism p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <h3 className="text-lg font-semibold">Analyzing Network...</h3>
          </div>
        </Card>
      </div>
    );
  }

  const companyData = getCompanyDistribution();
  const strengthData = getStrengthDistribution();
  const growthData = getGrowthData();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Network className="h-8 w-8 text-gradient" />
              <span className="text-xl font-bold text-gradient">ConnectMe</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              {user && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Network Analytics</h1>
            <p className="text-muted-foreground">
              Deep insights into your professional network performance and opportunities
            </p>
          </div>

          {/* Network Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glassmorphism lg:col-span-1">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Network Health</CardTitle>
                <div className="mx-auto" style={{ width: 120, height: 120 }}>
                  <CircularProgressbar
                    value={analytics?.healthScore || 0}
                    text={`${analytics?.healthScore || 0}`}
                    styles={buildStyles({
                      textColor: '#667eea',
                      pathColor: analytics && analytics.healthScore >= 70 ? '#10b981' : analytics && analytics.healthScore >= 40 ? '#f59e0b' : '#ef4444',
                      trailColor: '#e5e7eb',
                    })}
                  />
                </div>
                <Badge variant={analytics && analytics.healthScore >= 70 ? 'default' : analytics && analytics.healthScore >= 40 ? 'secondary' : 'destructive'}>
                  {analytics && analytics.healthScore >= 70 ? 'Excellent' : analytics && analytics.healthScore >= 40 ? 'Good' : 'Needs Work'}
                </Badge>
              </CardHeader>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Network Value</p>
                    <p className="text-2xl font-bold text-gradient">
                      ${(analytics?.totalValue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Estimated career impact</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                    <p className="text-2xl font-bold text-gradient">+{analytics?.growthRate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Last 6 months</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Diversity Score</p>
                    <p className="text-2xl font-bold text-gradient">{analytics?.diversityScore || 0}</p>
                    <p className="text-xs text-muted-foreground">Industry & location spread</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 glassmorphism">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="recommendations">Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Network Strength Breakdown</CardTitle>
                    <CardDescription>Quality of your professional relationships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Relationship Strength</span>
                          <span>{analytics?.strengthScore || 0}/100</span>
                        </div>
                        <Progress value={analytics?.strengthScore || 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Network Diversity</span>
                          <span>{analytics?.diversityScore || 0}/100</span>
                        </div>
                        <Progress value={analytics?.diversityScore || 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Growth Momentum</span>
                          <span>{analytics?.growthRate || 0}%</span>
                        </div>
                        <Progress value={analytics?.growthRate || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                    <CardDescription>Your network at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{connections.length}</div>
                        <div className="text-sm text-muted-foreground">Total Connections</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">
                          {new Set(connections.filter(c => c.connection_company).map(c => c.connection_company)).size}
                        </div>
                        <div className="text-sm text-muted-foreground">Companies</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                        <div className="text-2xl font-bold">
                          {connections.filter(c => (c.relationship_strength || 0) >= 4).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Strong Bonds</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">
                          {new Set(connections.filter(c => c.connection_location).map(c => c.connection_location)).size}
                        </div>
                        <div className="text-sm text-muted-foreground">Locations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribution" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Top Companies</CardTitle>
                    <CardDescription>Where your network works</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {companyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={companyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#667eea" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No company data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Relationship Strength</CardTitle>
                    <CardDescription>Quality distribution of connections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={strengthData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {strengthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Growth Tab */}
            <TabsContent value="growth" className="space-y-6">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>Network Growth Trajectory</CardTitle>
                  <CardDescription>Your networking momentum over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                      Network Optimization
                    </CardTitle>
                    <CardDescription>AI-powered recommendations to improve your network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                          <Target className="h-5 w-5 mt-0.5 text-blue-600" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-purple-600" />
                      Achievement Goals
                    </CardTitle>
                    <CardDescription>Network milestones to unlock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">Industry Diversification</p>
                          <p className="text-sm text-muted-foreground">Connect with 15+ industries</p>
                        </div>
                        <Badge variant={companyData.length >= 15 ? 'default' : 'secondary'}>
                          {companyData.length >= 15 ? 'Achieved' : `${companyData.length}/15`}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">Strong Connections</p>
                          <p className="text-sm text-muted-foreground">Build 25+ strong relationships</p>
                        </div>
                        <Badge variant={connections.filter(c => (c.relationship_strength || 0) >= 4).length >= 25 ? 'default' : 'secondary'}>
                          {connections.filter(c => (c.relationship_strength || 0) >= 4).length >= 25 ? 'Achieved' : `${connections.filter(c => (c.relationship_strength || 0) >= 4).length}/25`}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">Network Size</p>
                          <p className="text-sm text-muted-foreground">Reach 100+ connections</p>
                        </div>
                        <Badge variant={connections.length >= 100 ? 'default' : 'secondary'}>
                          {connections.length >= 100 ? 'Achieved' : `${connections.length}/100`}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}