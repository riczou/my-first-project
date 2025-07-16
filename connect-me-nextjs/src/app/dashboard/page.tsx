"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Network, 
  Users, 
  Building2, 
  FileText, 
  ArrowRight, 
  Upload, 
  UserPlus, 
  BarChart3,
  Target,
  LogOut,
  Loader2
} from "lucide-react";
import { apiClient } from "../api-client";
import type { User, DashboardStats } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    connectionsCount: 0,
    companiesCount: 0,
    resumesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // BUSINESS FOCUS: Demo mode with mock user data
      const mockUser = {
        id: 1,
        email: 'demo@connectme.com',
        username: 'demo_user',
        first_name: 'Demo',
        last_name: 'User',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const mockStats = {
        connectionsCount: 145,
        companiesCount: 23,
        resumesCount: 2
      };

      setUser(mockUser);
      setStats(mockStats);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Redirect to upload page (core value) instead of login
      router.push("/upload");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glassmorphism p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold">Loading Dashboard</h3>
            <p className="text-muted-foreground text-center">
              Analyzing your professional network...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const getMatchRate = () => {
    return stats.resumesCount > 0 ? "89%" : "0%";
  };

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
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.first_name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 fade-in">
              Welcome back, <span className="text-gradient">{user.first_name}</span>!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your intelligent networking dashboard is ready to unlock career opportunities through your connections
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Network Intelligence */}
            <Link href="/connections">
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 cursor-pointer floating-animation">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Network className="h-12 w-12 text-blue-600" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Network Intelligence</CardTitle>
                  <CardDescription>
                    View and analyze your professional network with advanced insights and relationship mapping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gradient">{stats.connectionsCount}</div>
                      <div className="text-sm text-muted-foreground">Connections</div>
                    </div>
                    <Badge variant="secondary">Explore</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Company Analytics */}
            <Link href="/companies">
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 cursor-pointer floating-animation [animation-delay:0.5s]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Building2 className="h-12 w-12 text-purple-600" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Company Analytics</CardTitle>
                  <CardDescription>
                    Discover career opportunities within companies where your network already works
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gradient">{stats.companiesCount}</div>
                      <div className="text-sm text-muted-foreground">Companies</div>
                    </div>
                    <Badge variant="secondary">Analyze</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* AI Job Matching */}
            <Link href="/jobs">
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 cursor-pointer floating-animation [animation-delay:1s]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Target className="h-12 w-12 text-indigo-600" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>AI Job Matching</CardTitle>
                  <CardDescription>
                    Get personalized job recommendations based on your skills and network connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gradient">{getMatchRate()}</div>
                      <div className="text-sm text-muted-foreground">Match Rate</div>
                    </div>
                    <Badge variant="secondary">Match</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Data Import */}
            <Link href="/upload">
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 cursor-pointer floating-animation [animation-delay:1.5s]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Upload className="h-12 w-12 text-green-600" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Data Import</CardTitle>
                  <CardDescription>
                    Instantly upload and process your LinkedIn connections for immediate insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gradient">&lt; 1min</div>
                      <div className="text-sm text-muted-foreground">Processing</div>
                    </div>
                    <Badge variant="secondary">Upload</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Expand Network */}
            <Link href="/connections/add">
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 cursor-pointer floating-animation [animation-delay:2s]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <UserPlus className="h-12 w-12 text-orange-600" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Expand Network</CardTitle>
                  <CardDescription>
                    Manually add high-value connections to maximize your career opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gradient">+25%</div>
                      <div className="text-sm text-muted-foreground">Opportunity Boost</div>
                    </div>
                    <Badge variant="secondary">Add</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Analytics */}
            <Link href="/analytics">
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 cursor-pointer floating-animation [animation-delay:2.5s]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <BarChart3 className="h-12 w-12 text-red-600" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Network Analytics</CardTitle>
                  <CardDescription>
                    Deep dive into network patterns, growth trends, and optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gradient">Advanced</div>
                      <div className="text-sm text-muted-foreground">Insights</div>
                    </div>
                    <Badge variant="secondary">Explore</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Account Overview */}
          <Card className="glassmorphism">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-gradient">Account Overview</CardTitle>
                  <CardDescription>Your ConnectMe profile and settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="font-semibold">{user.first_name} {user.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="font-semibold">{user.username}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.is_active ? "default" : "destructive"}>
                        {user.is_active ? "✓ Active" : "✗ Inactive"}
                      </Badge>
                      {user.is_verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral Banner */}
          <Card className="mt-8 glassmorphism gradient-border">
            <div className="bg-card/90 rounded-xl p-8 -m-[1px]">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-gradient">
                  💰 Earn Free Months by Referring Friends
                </h3>
                <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
                  Get 1 month free for every friend who subscribes • Unlock premium rewards • Build your referral streak
                </p>
                <Link href="/referrals">
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Start Earning Rewards
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}