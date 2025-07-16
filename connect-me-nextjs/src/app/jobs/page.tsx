"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Network, 
  Search, 
  Target, 
  Users, 
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  TrendingUp,
  Star,
  Building2,
  Upload,
  FileText
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Connection, User } from "@/types";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary?: string;
  description: string;
  matchScore: number;
  connectionMatches: Connection[];
  postedDate: string;
  skills: string[];
  isRemote: boolean;
}

export default function JobsPage() {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobMatch[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResume, setHasResume] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, jobMatches]);

  const loadData = async () => {
    try {
      if (!apiClient.isAuthenticated()) {
        router.push("/login");
        return;
      }

      const [userResult, connectionsResult, resumesResult] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getConnections(),
        apiClient.getResumes(),
      ]);

      if (userResult.error) {
        router.push("/login");
        return;
      }

      setUser(userResult.data!);
      const connectionsData = connectionsResult.data || [];
      setConnections(connectionsData);
      setHasResume((resumesResult.data || []).length > 0);
      
      // Generate mock job matches based on connections
      const matches = generateJobMatches(connectionsData);
      setJobMatches(matches);
    } catch (error) {
      console.error("Failed to load jobs data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const generateJobMatches = (connections: Connection[]): JobMatch[] => {
    const companies = [...new Set(connections.filter(c => c.connection_company).map(c => c.connection_company!))];
    const titles = [...new Set(connections.filter(c => c.connection_title).map(c => c.connection_title!))];
    
    const mockJobs: JobMatch[] = [
      {
        id: "1",
        title: "Senior Software Engineer",
        company: "TechCorp Inc",
        location: "San Francisco, CA",
        type: "Full-time",
        experience: "5+ years",
        salary: "$120k - $160k",
        description: "We're looking for a senior software engineer to join our growing team. You'll work on cutting-edge technologies and lead architectural decisions.",
        matchScore: 89,
        connectionMatches: connections.filter(c => c.connection_company === "TechCorp Inc").slice(0, 3),
        postedDate: "2 days ago",
        skills: ["React", "TypeScript", "Node.js", "Python"],
        isRemote: true,
      },
      {
        id: "2",
        title: "Product Manager",
        company: "InnovateLabs",
        location: "New York, NY",
        type: "Full-time",
        experience: "3+ years",
        salary: "$100k - $140k",
        description: "Lead product strategy and work cross-functionally to deliver exceptional user experiences. Perfect for someone passionate about technology products.",
        matchScore: 76,
        connectionMatches: connections.filter(c => c.connection_title?.includes("Product")).slice(0, 2),
        postedDate: "1 week ago",
        skills: ["Product Strategy", "Analytics", "User Research", "Agile"],
        isRemote: false,
      },
      {
        id: "3",
        title: "Data Scientist",
        company: "DataFlow Solutions",
        location: "Seattle, WA",
        type: "Full-time",
        experience: "2+ years",
        salary: "$95k - $130k",
        description: "Join our data science team to build machine learning models and derive insights from large datasets. Great opportunity for growth.",
        matchScore: 82,
        connectionMatches: connections.filter(c => c.connection_title?.includes("Data") || c.connection_title?.includes("Engineer")).slice(0, 4),
        postedDate: "3 days ago",
        skills: ["Python", "Machine Learning", "SQL", "Statistics"],
        isRemote: true,
      }
    ];

    // Add more jobs based on user's connections
    if (companies.length > 0) {
      const additionalJobs = companies.slice(0, 5).map((company, index) => ({
        id: `company-${index}`,
        title: `${titles[index % titles.length] || "Software Engineer"}`,
        company: company,
        location: "Various",
        type: "Full-time",
        experience: "2+ years",
        description: `Exciting opportunity at ${company}. Your network connections give you a strong advantage for this position.`,
        matchScore: Math.floor(Math.random() * 30) + 60, // 60-90
        connectionMatches: connections.filter(c => c.connection_company === company).slice(0, 2),
        postedDate: `${Math.floor(Math.random() * 7) + 1} days ago`,
        skills: ["Leadership", "Communication", "Technical Skills"],
        isRemote: Math.random() > 0.5,
      }));
      mockJobs.push(...additionalJobs);
    }

    return mockJobs.sort((a, b) => b.matchScore - a.matchScore);
  };

  const filterJobs = () => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobMatches);
      return;
    }

    const filtered = jobMatches.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredJobs(filtered);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Network className="h-8 w-8 text-gradient" />
                <span className="text-xl font-bold text-gradient">ConnectMe</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="glassmorphism">
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const highMatchJobs = filteredJobs.filter(job => job.matchScore >= 80);
  const averageMatchScore = filteredJobs.length > 0 
    ? Math.round(filteredJobs.reduce((sum, job) => sum + job.matchScore, 0) / filteredJobs.length)
    : 0;

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
            <h1 className="text-3xl font-bold mb-2 text-gradient">AI Job Matching</h1>
            <p className="text-muted-foreground">
              Discover personalized job opportunities based on your skills and network connections
            </p>
          </div>

          {/* Resume Upload Banner */}
          {!hasResume && (
            <Card className="glassmorphism border-yellow-500/20 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-12 w-12 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">
                        Upload Your Resume for Better Matches
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get more accurate job recommendations by uploading your resume for AI analysis
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Matches</p>
                    <p className="text-2xl font-bold text-gradient">{filteredJobs.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Match (&gt;80%)</p>
                    <p className="text-2xl font-bold text-gradient">{highMatchJobs.length}</p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Match Score</p>
                    <p className="text-2xl font-bold text-gradient">{averageMatchScore}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Network Leverage</p>
                    <p className="text-2xl font-bold text-gradient">{connections.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, location, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glassmorphism"
              />
            </div>
          </div>

          {/* Job Matches */}
          {filteredJobs.length === 0 ? (
            <Card className="glassmorphism">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {jobMatches.length === 0 ? "No job matches available" : "No matching jobs found"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {jobMatches.length === 0 
                    ? "Build your network and upload your resume to discover personalized job opportunities."
                    : "Try adjusting your search terms to find different opportunities."
                  }
                </p>
                {jobMatches.length === 0 && (
                  <div className="flex gap-4 justify-center">
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Import Connections
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <Card key={job.id} className="glassmorphism floating-animation" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={`ml-4 ${getMatchColor(job.matchScore)} border-current`}
                          >
                            {job.matchScore}% match
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-muted-foreground">
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {job.company}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.postedDate}
                          </span>
                          {job.isRemote && (
                            <Badge variant="secondary">Remote</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Job Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {job.type}
                        </div>
                        <div>
                          <span className="font-medium">Experience:</span> {job.experience}
                        </div>
                        {job.salary && (
                          <div>
                            <span className="font-medium">Salary:</span> {job.salary}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground">{job.description}</p>

                      {/* Skills */}
                      <div>
                        <h4 className="font-medium mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {job.skills.map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Network Connections */}
                      {job.connectionMatches.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Your Network Advantage ({job.connectionMatches.length} connections)
                          </h4>
                          <div className="flex space-x-2">
                            {job.connectionMatches.slice(0, 3).map((connection, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                    {connection.connection_name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-muted-foreground">{connection.connection_name}</span>
                              </div>
                            ))}
                            {job.connectionMatches.length > 3 && (
                              <span className="text-sm text-muted-foreground">
                                +{job.connectionMatches.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Match Score Breakdown */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Match Quality</span>
                          <span className={`font-medium ${getMatchColor(job.matchScore)}`}>
                            {getMatchLabel(job.matchScore)}
                          </span>
                        </div>
                        <Progress value={job.matchScore} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {job.connectionMatches.length > 0 
                            ? `Strong network leverage • ${job.connectionMatches.length} connection${job.connectionMatches.length !== 1 ? 's' : ''}`
                            : "Apply directly or build connections first"
                          }
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Job
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}