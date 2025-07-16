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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Network, 
  Search, 
  Filter, 
  Users, 
  Building2, 
  MapPin, 
  ArrowLeft,
  UserPlus,
  Upload,
  BarChart3,
  ExternalLink,
  Star
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import type { Connection, User } from "@/types";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterConnections();
  }, [searchTerm, connections]);

  const loadData = async () => {
    try {
      // BUSINESS FOCUS: Load from localStorage instead of complex auth
      const userSession = localStorage.getItem('user_session');
      const userConnections = localStorage.getItem('user_connections');
      
      if (!userSession) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userSession);
      setUser({
        id: 1,
        email: userData.email || 'user@example.com',
        username: userData.username || 'user',
        first_name: userData.first_name || 'Demo',
        last_name: userData.last_name || 'User',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Load connections from localStorage or use demo data
      if (userConnections) {
        const connections = JSON.parse(userConnections);
        // Transform to match Connection interface
        const transformedConnections = connections.map((conn: any, index: number) => ({
          id: index + 1,
          user_id: 1,
          platform_id: 1,
          connection_name: conn.name,
          connection_company: conn.company,
          connection_title: conn.title,
          connection_location: conn.location,
          relationship_strength: Math.floor(Math.random() * 5) + 1,
          mutual_connections_count: Math.floor(Math.random() * 10),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        setConnections(transformedConnections);
      } else {
        // Demo data if no upload yet
        setConnections([]);
      }
    } catch (error) {
      console.error("Failed to load connections:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const filterConnections = () => {
    if (!searchTerm.trim()) {
      setFilteredConnections(connections);
      return;
    }

    const filtered = connections.filter(connection =>
      connection.connection_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.connection_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.connection_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.connection_location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConnections(filtered);
  };

  const getConnectionInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getStrengthColor = (strength?: number) => {
    if (!strength) return "text-gray-400";
    if (strength >= 4) return "text-green-600";
    if (strength >= 3) return "text-blue-600";
    if (strength >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getStrengthLabel = (strength?: number) => {
    if (!strength) return "Unknown";
    if (strength >= 4) return "Strong";
    if (strength >= 3) return "Good";
    if (strength >= 2) return "Moderate";
    return "Weak";
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Navigation */}
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
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="glassmorphism">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
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
            <h1 className="text-3xl font-bold mb-2 text-gradient">Network Intelligence</h1>
            <p className="text-muted-foreground">
              Analyze and manage your professional connections with advanced insights
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
                    <p className="text-2xl font-bold text-gradient">{connections.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Companies</p>
                    <p className="text-2xl font-bold text-gradient">
                      {new Set(connections.filter(c => c.connection_company).map(c => c.connection_company)).size}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Strong Connections</p>
                    <p className="text-2xl font-bold text-gradient">
                      {connections.filter(c => (c.relationship_strength || 0) >= 4).length}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Locations</p>
                    <p className="text-2xl font-bold text-gradient">
                      {new Set(connections.filter(c => c.connection_location).map(c => c.connection_location)).size}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections by name, company, title, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glassmorphism"
              />
            </div>
            <div className="flex gap-2">
              <Link href="/upload">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </Link>
              <Link href="/connections/add">
                <Button variant="outline" className="glassmorphism">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </Link>
            </div>
          </div>

          {/* Connections List */}
          {filteredConnections.length === 0 ? (
            <Card className="glassmorphism">
              <CardContent className="p-12 text-center">
                <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {connections.length === 0 ? "No connections yet" : "No matching connections"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {connections.length === 0 
                    ? "Start building your professional network by importing your LinkedIn connections or adding them manually."
                    : "Try adjusting your search terms to find different connections."
                  }
                </p>
                {connections.length === 0 && (
                  <div className="flex gap-4 justify-center">
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Connections
                      </Button>
                    </Link>
                    <Link href="/connections/add">
                      <Button variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Manually
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Professional Network</span>
                  <Badge variant="secondary">{filteredConnections.length} connections</Badge>
                </CardTitle>
                <CardDescription>
                  Manage and analyze your professional relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company & Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Mutual</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConnections.map((connection) => (
                      <TableRow key={connection.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {getConnectionInitials(connection.connection_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{connection.connection_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Added {new Date(connection.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {connection.connection_company && (
                              <p className="font-medium">{connection.connection_company}</p>
                            )}
                            {connection.connection_title && (
                              <p className="text-sm text-muted-foreground">{connection.connection_title}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {connection.connection_location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-sm">{connection.connection_location}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getStrengthColor(connection.relationship_strength)}
                          >
                            {getStrengthLabel(connection.relationship_strength)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {connection.mutual_connections_count && connection.mutual_connections_count > 0 ? (
                            <span className="text-sm font-medium">
                              {connection.mutual_connections_count} mutual
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {connection.connection_profile_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a 
                                  href={connection.connection_profile_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}