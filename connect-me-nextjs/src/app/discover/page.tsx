"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  ArrowLeft,
  Search,
  Users,
  Github,
  Twitter,
  Linkedin,
  Globe,
  BookOpen,
  Award,
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Zap,
  Eye,
  Plus,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import type { User } from "@/types";

interface PlatformProfile {
  platform: 'github' | 'twitter' | 'linkedin' | 'scholar' | 'company';
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  verified: boolean;
  lastActive: string;
  mutualConnections: number;
  connectionStrength: number;
  potentialValue: number;
}

interface DiscoverySource {
  name: string;
  icon: any;
  description: string;
  dataTypes: string[];
  status: 'active' | 'coming_soon' | 'premium';
  color: string;
}

export default function DiscoverPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveries, setDiscoveries] = useState<PlatformProfile[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
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

      const userResult = await apiClient.getCurrentUser();
      if (userResult.error) {
        router.push("/login");
        return;
      }

      setUser(userResult.data!);
      
      // Generate mock discovery data
      const mockDiscoveries = generateMockDiscoveries();
      setDiscoveries(mockDiscoveries);
    } catch (error) {
      console.error("Failed to load discovery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDiscoveries = (): PlatformProfile[] => {
    return [
      {
        platform: 'github',
        username: 'alexsmith',
        displayName: 'Alex Smith',
        bio: 'Senior Software Engineer at TechCorp, Open Source Enthusiast',
        followers: 1250,
        following: 340,
        verified: true,
        lastActive: '2 days ago',
        mutualConnections: 12,
        connectionStrength: 85,
        potentialValue: 92
      },
      {
        platform: 'twitter',
        username: 'sarah_dev',
        displayName: 'Sarah Wilson',
        bio: 'Product Manager | AI Ethics | Speaker',
        followers: 8900,
        following: 1200,
        verified: true,
        lastActive: '1 hour ago',
        mutualConnections: 8,
        connectionStrength: 78,
        potentialValue: 88
      },
      {
        platform: 'linkedin',
        username: 'michael-chen',
        displayName: 'Michael Chen',
        bio: 'VP of Engineering at StartupCo | Angel Investor',
        followers: 5600,
        following: 890,
        verified: true,
        lastActive: '3 hours ago',
        mutualConnections: 15,
        connectionStrength: 91,
        potentialValue: 95
      },
      {
        platform: 'scholar',
        username: 'dr-emily-wang',
        displayName: 'Dr. Emily Wang',
        bio: 'Research Scientist | Machine Learning | 50+ Publications',
        followers: 450,
        following: 120,
        verified: true,
        lastActive: '1 week ago',
        mutualConnections: 3,
        connectionStrength: 82,
        potentialValue: 87
      }
    ];
  };

  const discoverySources: DiscoverySource[] = [
    {
      name: 'GitHub',
      icon: Github,
      description: 'Find developers through open source collaborations, followers, and repository contributors',
      dataTypes: ['Collaborators', 'Followers', 'Organization Members', 'Contributors'],
      status: 'active',
      color: 'bg-gray-900'
    },
    {
      name: 'Academic Papers',
      icon: BookOpen,
      description: 'Discover co-authors, researchers, and academics in your field through publications',
      dataTypes: ['Co-authors', 'Citations', 'Research Collaborations', 'Conference Attendees'],
      status: 'active',
      color: 'bg-blue-600'
    },
    {
      name: 'Professional Networks',
      icon: Linkedin,
      description: 'Public profiles, company directories, and professional associations',
      dataTypes: ['Public Profiles', 'Company Employees', 'Alumni Networks', 'Industry Groups'],
      status: 'active',
      color: 'bg-blue-700'
    },
    {
      name: 'Social Media',
      icon: Twitter,
      description: 'Industry conversations, thought leaders, and professional interactions',
      dataTypes: ['Industry Hashtags', 'Professional Lists', 'Conference Speakers', 'Thought Leaders'],
      status: 'premium',
      color: 'bg-black'
    },
    {
      name: 'Business Records',
      icon: Building2,
      description: 'Board members, company partnerships, and business relationships',
      dataTypes: ['Board Members', 'SEC Filings', 'Patent Co-inventors', 'Business Partnerships'],
      status: 'coming_soon',
      color: 'bg-green-600'
    },
    {
      name: 'Speaking Circuit',
      icon: Award,
      description: 'Conference speakers, podcast guests, and industry award recipients',
      dataTypes: ['Conference Speakers', 'Podcast Guests', 'Award Recipients', 'Industry Events'],
      status: 'coming_soon',
      color: 'bg-purple-600'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return Github;
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'scholar': return BookOpen;
      case 'company': return Building2;
      default: return Globe;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'github': return 'text-gray-900';
      case 'twitter': return 'text-black';
      case 'linkedin': return 'text-blue-700';
      case 'scholar': return 'text-blue-600';
      case 'company': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getValueColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 75) return 'text-blue-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredDiscoveries = discoveries.filter(discovery =>
    discovery.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discovery.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glassmorphism p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <h3 className="text-lg font-semibold">Discovering Connections...</h3>
          </div>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold mb-2 text-gradient">Discovery Engine</h1>
            <p className="text-muted-foreground">
              Find valuable connections across professional platforms using AI-powered discovery
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for people, skills, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glassmorphism"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 glassmorphism">
              <TabsTrigger value="overview">Discovery Sources</TabsTrigger>
              <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
              <TabsTrigger value="insights">Network Insights</TabsTrigger>
            </TabsList>

            {/* Discovery Sources Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
                    AI-Powered Discovery Sources
                  </CardTitle>
                  <CardDescription>
                    Legal, publicly available data sources we use to find valuable connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discoverySources.map((source) => {
                      const IconComponent = source.icon;
                      return (
                        <Card key={source.name} className="glassmorphism relative">
                          {source.status !== 'active' && (
                            <div className="absolute top-2 right-2">
                              <Badge variant={source.status === 'premium' ? 'default' : 'secondary'}>
                                {source.status === 'premium' ? 'Premium' : 'Soon'}
                              </Badge>
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${source.color}`}>
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                              <CardTitle className="text-lg">{source.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">{source.description}</p>
                            <div className="space-y-1">
                              {source.dataTypes.map((type, index) => (
                                <div key={index} className="flex items-center text-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2" />
                                  {type}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Smart Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Recommended Connections</CardTitle>
                      <CardDescription>
                        High-value professionals you should connect with based on AI analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredDiscoveries.map((profile, index) => {
                          const PlatformIcon = getPlatformIcon(profile.platform);
                          return (
                            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    {profile.displayName.split(' ').map(n => n.charAt(0)).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold">{profile.displayName}</h3>
                                    <PlatformIcon className={`h-4 w-4 ${getPlatformColor(profile.platform)}`} />
                                    {profile.verified && <Star className="h-3 w-3 text-yellow-500" />}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate max-w-md">
                                    {profile.bio}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                    <span>{profile.followers.toLocaleString()} followers</span>
                                    <span>{profile.mutualConnections} mutual connections</span>
                                    <span>Active {profile.lastActive}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getValueColor(profile.potentialValue)}`}>
                                    {profile.potentialValue}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Value Score</div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Discovery Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gradient">1,247</div>
                        <div className="text-sm text-muted-foreground">Potential Connections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gradient">89</div>
                        <div className="text-sm text-muted-foreground">High-Value Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gradient">156</div>
                        <div className="text-sm text-muted-foreground">Mutual Connections</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Connection Goals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Industry Leaders</span>
                          <span>12/15</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Technical Experts</span>
                          <span>8/10</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Startup Founders</span>
                          <span>3/5</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Network Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Cross-Platform Analysis</CardTitle>
                    <CardDescription>How your network spans different platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Linkedin className="h-5 w-5 text-blue-700" />
                          <span>LinkedIn</span>
                        </div>
                        <span className="font-semibold">342 connections</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Github className="h-5 w-5 text-gray-900" />
                          <span>GitHub</span>
                        </div>
                        <span className="font-semibold">89 followers</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Twitter className="h-5 w-5 text-black" />
                          <span>Twitter</span>
                        </div>
                        <span className="font-semibold">156 following</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span>Academic</span>
                        </div>
                        <span className="font-semibold">23 co-authors</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Network Opportunities</CardTitle>
                    <CardDescription>Areas for strategic network expansion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">Venture Capital</h4>
                        <p className="text-sm text-muted-foreground">Connect with 5+ VCs for funding opportunities</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <h4 className="font-semibold text-green-700 dark:text-green-300">AI Research</h4>
                        <p className="text-sm text-muted-foreground">Expand academic connections in ML/AI field</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">International Markets</h4>
                        <p className="text-sm text-muted-foreground">Build connections in European tech hubs</p>
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