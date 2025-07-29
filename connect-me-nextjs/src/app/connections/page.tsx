"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Network, 
  Search, 
  Users, 
  Building2, 
  MapPin, 
  ArrowLeft,
  UserPlus,
  Upload,
  BarChart3,
  ExternalLink,
  Star,
  CheckCircle,
  LogOut,
  Filter,
  SortAsc,
  SortDesc,
  Mail,
  Phone,
  Calendar,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { apiClient } from "@/lib/api-client";
import type { Connection } from "@/types";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterByCompany, setFilterByCompany] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [lastImportCount, setLastImportCount] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortConnections();
  }, [searchTerm, connections, sortBy, sortOrder, filterByCompany]);

  // Add a refresh function for manual data reloading
  const refreshConnections = async () => {
    console.log('🔄 Manual refresh triggered...');
    setLoading(true);
    await loadData();
  };

  // Delete all connections function
  const deleteAllConnections = async () => {
    setDeletingAll(true);
    
    try {
      console.log('🗑️ Deleting all connections...');
      const result = await apiClient.deleteAllConnections();
      
      if (result.error) {
        console.error('❌ Failed to delete connections:', result.error);
        return;
      }
      
      console.log('✅ Successfully deleted all connections:', result.data);
      
      // Clear local state
      setConnections([]);
      setFilteredConnections([]);
      
      // Show success notification
      console.log(`🎉 Deleted ${result.data?.deleted_count} connections`);
      
    } catch (error) {
      console.error('💥 Error deleting connections:', error);
    } finally {
      setDeletingAll(false);
    }
  };

  // Listen for storage events or custom events for data updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'connections_updated') {
        console.log('📢 Detected connections update, refreshing...');
        refreshConnections();
      }
    };

    const handleCustomRefresh = (event: any) => {
      console.log('📢 Custom refresh event received...', event.detail);
      if (event.detail?.imported_count) {
        setLastImportCount(event.detail.imported_count);
        // Clear the notification after 5 seconds
        setTimeout(() => setLastImportCount(null), 5000);
      }
      refreshConnections();
    };

    // Also check for page visibility changes (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 Page visible again, checking for updates...');
        const lastUpdate = localStorage.getItem('last_connections_update');
        const lastCheck = localStorage.getItem('last_connections_check') || '0';
        
        if (lastUpdate && parseInt(lastUpdate) > parseInt(lastCheck)) {
          console.log('🔄 Data updated while away, refreshing...');
          refreshConnections();
          localStorage.setItem('last_connections_check', Date.now().toString());
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('refresh-connections', handleCustomRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refresh-connections', handleCustomRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Loading connections data...');
      console.log('🔍 AUTH DEBUG: apiClient.isAuthenticated():', apiClient.isAuthenticated());
      console.log('🔍 AUTH DEBUG: localStorage authToken:', typeof window !== 'undefined' ? localStorage.getItem('authToken') : 'SSR');
      console.log('🔍 AUTH DEBUG: user from context:', user);
      
      // Load connections from backend API
      const response = await apiClient.getConnections();
      
      if (response.error) {
        console.error('❌ Failed to fetch connections from API:', response.error);
        console.log('🔍 FALLBACK: Setting connections to empty array due to API error');
        
        // If authentication error, redirect to login
        if (response.error.includes('Not authenticated') || response.error.includes('401')) {
          console.log('🔄 Authentication error detected, redirecting to login...');
          // Clear any stale tokens
          apiClient.clearToken();
          // Redirect to login
          window.location.href = '/login';
          return;
        }
        
        setConnections([]);
      } else if (response.data) {
        console.log('✅ Successfully loaded connections from backend:', response.data.length);
        
        console.log('🔍 DETAILED CONNECTION DATA:');
        console.log('  📊 Total connections fetched:', response.data.length);
        
        if (response.data.length > 0) {
          console.log('  🔍 First 3 connections from backend:');
          response.data.slice(0, 3).forEach((conn, index) => {
            console.log(`    Connection ${index + 1}:`, {
              id: conn.id,
              name: conn.connection_name,
              company: conn.connection_company,
              title: conn.connection_title,
              url: conn.connection_profile_url,
              location: conn.connection_location,
              strength: conn.relationship_strength,
              created_at: conn.created_at,
              user_id: conn.user_id
            });
          });
          
          console.log('  🔍 Last 3 connections from backend (most recent):');
          response.data.slice(-3).forEach((conn, index) => {
            console.log(`    Recent ${index + 1}:`, {
              id: conn.id,
              name: conn.connection_name,
              company: conn.connection_company,
              title: conn.connection_title,
              url: conn.connection_profile_url,
              location: conn.connection_location,
              strength: conn.relationship_strength,
              created_at: conn.created_at,
              user_id: conn.user_id
            });
          });
        }
        
        console.log('🔍 SETTING STATE: About to set connections state with', response.data.length, 'connections');
        setConnections(response.data);
        
        // Also log what gets set in state
        setTimeout(() => {
          console.log('🔍 STATE VERIFICATION: Connections state after setting:', {
            length: connections.length,
            first_connection: connections[0] ? {
              id: connections[0].id,
              name: connections[0].connection_name
            } : 'none'
          });
        }, 100);
        
      } else {
        console.log('📭 No connections found in backend');
        console.log('🔍 SETTING STATE: Setting connections to empty array (no data)');
        setConnections([]);
      }
    } catch (error) {
      console.error("💥 Failed to load connections:", error);
      // Don't redirect on API errors, just show empty state
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortConnections = () => {
    console.log('🔍 FILTERING & SORTING: Processing connections...');
    console.log('  📊 Total connections:', connections.length);
    console.log('  🔎 Search term:', searchTerm);
    console.log('  🏢 Company filter:', filterByCompany);
    console.log('  📋 Sort by:', sortBy, sortOrder);

    let filtered = [...connections];

    // Apply search filter with improved precision and scoring
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Special debugging for "eric" searches
      if (searchLower === 'eric') {
        console.log('🔍 SPECIAL DEBUG FOR "eric" SEARCH:');
        console.log('  Total connections to search:', filtered.length);
        console.log('  First 10 connection names:');
        filtered.slice(0, 10).forEach((conn, idx) => {
          console.log(`    ${idx + 1}. "${conn.connection_name}"`);
        });
      }
      
      // Filter and add search scores for ranking
      const scoredConnections = filtered.map(connection => {
        const name = connection.connection_name?.toLowerCase() || '';
        const company = connection.connection_company?.toLowerCase() || '';
        const title = connection.connection_title?.toLowerCase() || '';
        const location = connection.connection_location?.toLowerCase() || '';
        
        let score = 0;
        let matches = false;
        
        // Escape special regex characters
        const escapedSearch = searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundaryRegex = new RegExp(`\\b${escapedSearch}\\b`, 'i');
        
        // Score 1000: Exact name match (highest priority)
        if (name === searchLower) {
          score += 1000;
          matches = true;
        }
        // Score 500: Name starts with search term
        else if (name.startsWith(searchLower)) {
          score += 500;
          matches = true;
        }
        // Score 300: Word boundary match in name
        else if (wordBoundaryRegex.test(name)) {
          score += 300;
          matches = true;
        }
        
        // Score 200: Company exact match
        if (company === searchLower) {
          score += 200;
          matches = true;
        }
        // Score 150: Company starts with
        else if (company.startsWith(searchLower)) {
          score += 150;
          matches = true;
        }
        // Score 100: Word boundary in company
        else if (wordBoundaryRegex.test(company)) {
          score += 100;
          matches = true;
        }
        
        // Score 75: Title starts with
        if (title.startsWith(searchLower)) {
          score += 75;
          matches = true;
        }
        // Score 50: Word boundary in title
        else if (wordBoundaryRegex.test(title)) {
          score += 50;
          matches = true;
        }
        
        // Score 25: Location matches
        if (location.startsWith(searchLower) || wordBoundaryRegex.test(location)) {
          score += 25;
          matches = true;
        }
        
        // For longer search terms (5+ chars), allow very limited partial matches
        // For shorter terms like "eric" (4 chars), be much more restrictive
        if (!matches && searchLower.length >= 5) {
          if (name.includes(searchLower)) {
            score += 10;
            matches = true;
          } else if (company.includes(searchLower)) {
            score += 5;
            matches = true;
          } else if (title.includes(searchLower) || location.includes(searchLower)) {
            score += 2;
            matches = true;
          }
        } else if (!matches && searchLower.length === 4) {
          // For 4-character searches like "eric", only allow partial matches in company/title
          // NOT in names to avoid matching "Frederick", "America", etc.
          if (company.includes(searchLower)) {
            score += 3;
            matches = true;
            if (searchLower === 'eric') {
              console.log(`      ⚠️ PARTIAL COMPANY MATCH: "${connection.connection_company}" contains "eric"`);
            }
          } else if (title.includes(searchLower)) {
            score += 1;
            matches = true;
            if (searchLower === 'eric') {
              console.log(`      ⚠️ PARTIAL TITLE MATCH: "${connection.connection_title}" contains "eric"`);
            }
          }
          // Explicitly NO partial name matching for 4-character searches
        }
        
        // Debug logging for eric matches
        if (searchLower === 'eric' && matches) {
          console.log(`    ✅ MATCH: "${connection.connection_name}" (score: ${score})`);
          console.log(`       Company: "${connection.connection_company || 'N/A'}"`);
          console.log(`       Title: "${connection.connection_title || 'N/A'}"`);
          console.log(`       Location: "${connection.connection_location || 'N/A'}"`);
        }
        
        return { ...connection, searchScore: score, matches };
      });
      
      // Filter out non-matches and sort by score
      filtered = scoredConnections
        .filter(item => item.matches)
        .sort((a, b) => b.searchScore - a.searchScore)
        .map(({ searchScore, matches, ...connection }) => connection);
      
      // Debug logging for search results
      console.log(`🔍 SEARCH DEBUG for "${searchTerm}":`);
      console.log('  Total matches found:', filtered.length);
      if (filtered.length > 0) {
        console.log('  Top 5 matches:');
        filtered.slice(0, 5).forEach((conn, idx) => {
          const matchedIn = scoredConnections.find(sc => sc.id === conn.id);
          console.log(`    ${idx + 1}. "${conn.connection_name}" (score: ${matchedIn?.searchScore})`);
          console.log(`       Company: "${conn.connection_company || 'N/A'}"`);
          console.log(`       Title: "${conn.connection_title || 'N/A'}"`);
        });
      }
    }

    // Apply company filter
    if (filterByCompany.trim() && filterByCompany !== "all") {
      filtered = filtered.filter(connection =>
        connection.connection_company?.toLowerCase().includes(filterByCompany.toLowerCase())
      );
    }

    // Apply sorting (skip if search is active as results are already ranked by relevance)
    if (!searchTerm.trim()) {
      filtered.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortBy) {
          case 'name':
            aValue = a.connection_name || '';
            bValue = b.connection_name || '';
            break;
          case 'company':
            aValue = a.connection_company || '';
            bValue = b.connection_company || '';
            break;
          case 'title':
            aValue = a.connection_title || '';
            bValue = b.connection_title || '';
            break;
          case 'location':
            aValue = a.connection_location || '';
            bValue = b.connection_location || '';
            break;
          case 'added':
            aValue = a.created_at || '';
            bValue = b.created_at || '';
            break;
          default:
            aValue = a.connection_name || '';
            bValue = b.connection_name || '';
        }

        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    console.log('  ✅ Final filtered/sorted results:', filtered.length);
    setFilteredConnections(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredConnections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConnections = filteredConnections.slice(startIndex, endIndex);

  // Get unique companies for filter dropdown
  const uniqueCompanies = Array.from(new Set(
    connections
      .map(conn => conn.connection_company)
      .filter(company => company && company.trim())
  )).sort();

  const getConnectionInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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
    <AuthGuard requireAuth={true}>
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
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
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
            
            {/* Success notification for new imports */}
            {lastImportCount && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 dark:text-green-300 font-medium">
                    Successfully imported {lastImportCount} new contact{lastImportCount !== 1 ? 's' : ''}!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glassmorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
                    <p className="text-2xl font-bold text-gradient">
                      {loading ? '...' : connections.length}
                      {connections.length > 0 && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({filteredConnections.length} shown)
                        </span>
                      )}
                    </p>
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

          {/* Enhanced Search and Filters */}
          <div className="space-y-4 mb-8">
            {/* Top row: Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, title, or location..."
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
                <Button 
                  variant="outline" 
                  onClick={refreshConnections}
                  disabled={loading}
                  className="glassmorphism"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Link href="/connections/add">
                  <Button variant="outline" className="glassmorphism">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Connection
                  </Button>
                </Link>
                {connections.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="glassmorphism border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                        disabled={deletingAll}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingAll ? 'Deleting...' : 'Delete All'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glassmorphism">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Delete All Connections
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all {connections.length} of your connections from your network.
                          <br /><br />
                          <strong>Are you absolutely sure you want to continue?</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteAllConnections}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          Yes, Delete All {connections.length} Connections
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Bottom row: Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterByCompany} onValueChange={setFilterByCompany}>
                  <SelectTrigger className="w-48 glassmorphism">
                    <SelectValue placeholder="Filter by company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    {uniqueCompanies.slice(0, 50).map(company => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 glassmorphism">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="added">Date Added</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground ml-auto">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredConnections.length)} of {filteredConnections.length} connections
              </div>
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
            <div className="space-y-6">
              {/* Connections Grid */}
              <div className="grid gap-4">
                {currentConnections.map((connection, index) => (
                  <Card key={connection.id} className="glassmorphism hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                            {getConnectionInitials(connection.connection_name)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Name and Title */}
                              <h3 className="font-semibold text-lg mb-1 truncate">
                                {connection.connection_name}
                              </h3>
                              {connection.connection_title && (
                                <p className="text-muted-foreground mb-2 text-sm">
                                  {connection.connection_title}
                                </p>
                              )}

                              {/* Company and Location */}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                {connection.connection_company && (
                                  <div className="flex items-center">
                                    <Building2 className="h-4 w-4 mr-1" />
                                    <span className="truncate">{connection.connection_company}</span>
                                  </div>
                                )}
                                {connection.connection_location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span className="truncate">{connection.connection_location}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>Added {new Date(connection.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Tags/Badges */}
                              <div className="flex flex-wrap gap-2">
                                {connection.relationship_strength && (
                                  <Badge variant="outline" className={getStrengthColor(connection.relationship_strength)}>
                                    <Star className="h-3 w-3 mr-1" />
                                    Strength: {connection.relationship_strength}/5
                                  </Badge>
                                )}
                                {connection.mutual_connections_count && connection.mutual_connections_count > 0 && (
                                  <Badge variant="outline">
                                    <Users className="h-3 w-3 mr-1" />
                                    {connection.mutual_connections_count} mutual
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {connection.connection_profile_url && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(connection.connection_profile_url, '_blank')}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="glassmorphism"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="glassmorphism"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
