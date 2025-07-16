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
  Building2, 
  Users, 
  ArrowLeft,
  TrendingUp,
  Target,
  ExternalLink,
  MapPin,
  Briefcase
} from "lucide-react";
import { apiClient } from "../api-client";
import type { Connection, User } from "@/types";

interface CompanyAnalytics {
  name: string;
  connectionCount: number;
  topTitles: string[];
  locations: string[];
  averageStrength: number;
  connections: Connection[];
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyAnalytics[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyAnalytics[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

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
      
      const connections = connectionsResult.data || [];
      const companiesAnalytics = analyzeCompanies(connections);
      setCompanies(companiesAnalytics);
    } catch (error) {
      console.error("Failed to load companies data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompanies = (connections: Connection[]): CompanyAnalytics[] => {
    const companyMap = new Map<string, Connection[]>();
    
    connections.forEach(connection => {
      if (connection.connection_company) {
        const company = connection.connection_company;
        if (!companyMap.has(company)) {
          companyMap.set(company, []);
        }
        companyMap.get(company)!.push(connection);
      }
    });

    const analytics: CompanyAnalytics[] = [];
    
    companyMap.forEach((companyConnections, companyName) => {
      const titles = companyConnections
        .filter(c => c.connection_title)
        .map(c => c.connection_title!)
        .filter((title, index, arr) => arr.indexOf(title) === index)
        .slice(0, 5);

      const locations = companyConnections
        .filter(c => c.connection_location)
        .map(c => c.connection_location!)
        .filter((location, index, arr) => arr.indexOf(location) === index)
        .slice(0, 3);

      const strengths = companyConnections
        .filter(c => c.relationship_strength)
        .map(c => c.relationship_strength!);
      
      const averageStrength = strengths.length > 0 
        ? strengths.reduce((a, b) => a + b, 0) / strengths.length 
        : 0;

      analytics.push({
        name: companyName,
        connectionCount: companyConnections.length,
        topTitles: titles,
        locations: locations,
        averageStrength: averageStrength,
        connections: companyConnections,
      });
    });

    return analytics.sort((a, b) => b.connectionCount - a.connectionCount);
  };

  const filterCompanies = () => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.topTitles.some(title => title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      company.locations.some(location => location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCompanies(filtered);
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 4) return "text-green-600";
    if (strength >= 3) return "text-blue-600";
    if (strength >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 4) return "Strong";
    if (strength >= 3) return "Good";
    if (strength >= 2) return "Moderate";
    return "Weak";
  };

  const totalConnections = companies.reduce((sum, company) => sum + company.connectionCount, 0);
  const averageConnectionsPerCompany = companies.length > 0 ? Math.round(totalConnections / companies.length) : 0;
  const topCompany = companies.length > 0 ? companies[0] : null;

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
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
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
            <h1 className="text-3xl font-bold mb-2 text-gradient">Company Analytics</h1>
            <p className="text-muted-foreground">
              Discover career opportunities within companies where your network already works
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                    <p className="text-2xl font-bold text-gradient">{companies.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Connected Professionals</p>
                    <p className="text-2xl font-bold text-gradient">{totalConnections}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg per Company</p>
                    <p className="text-2xl font-bold text-gradient">{averageConnectionsPerCompany}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Top Company</p>
                    <p className="text-sm font-bold text-gradient truncate">
                      {topCompany ? topCompany.name : "None"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topCompany ? `${topCompany.connectionCount} connections` : ""}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies by name, job titles, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glassmorphism"
              />
            </div>
          </div>

          {/* Companies List */}
          {filteredCompanies.length === 0 ? (
            <Card className="glassmorphism">
              <CardContent className="p-12 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {companies.length === 0 ? "No company data available" : "No matching companies"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {companies.length === 0 
                    ? "Import your connections to see company analytics and discover opportunities."
                    : "Try adjusting your search terms to find different companies."
                  }
                </p>
                {companies.length === 0 && (
                  <Link href="/upload">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Import Connections
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredCompanies.map((company, index) => (
                <Card key={company.name} className="glassmorphism floating-animation" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg">
                            {getCompanyInitials(company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">{company.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {company.connectionCount} connections
                            </span>
                            {company.averageStrength > 0 && (
                              <span className={`flex items-center ${getStrengthColor(company.averageStrength)}`}>
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {getStrengthLabel(company.averageStrength)} relationships
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {Math.round((company.connectionCount / totalConnections) * 100)}% of network
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Connection Strength */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Network Strength
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Relationship Quality</span>
                            <span className={getStrengthColor(company.averageStrength)}>
                              {company.averageStrength > 0 ? company.averageStrength.toFixed(1) : "N/A"}/5
                            </span>
                          </div>
                          <Progress 
                            value={company.averageStrength * 20} 
                            className="h-2"
                          />
                        </div>
                      </div>

                      {/* Top Job Titles */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Job Titles
                        </h4>
                        <div className="space-y-1">
                          {company.topTitles.length > 0 ? (
                            company.topTitles.map((title, idx) => (
                              <Badge key={idx} variant="outline" className="mr-1 mb-1">
                                {title}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No titles available</p>
                          )}
                        </div>
                      </div>

                      {/* Locations */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Locations
                        </h4>
                        <div className="space-y-1">
                          {company.locations.length > 0 ? (
                            company.locations.map((location, idx) => (
                              <div key={idx} className="text-sm flex items-center">
                                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                {location}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No locations available</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {company.connectionCount} connection{company.connectionCount !== 1 ? 's' : ''} • 
                        Strong leverage for opportunities
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Connections
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          Find Jobs
                        </Button>
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