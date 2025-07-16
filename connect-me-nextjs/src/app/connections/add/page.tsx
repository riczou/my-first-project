"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Network, 
  ArrowLeft,
  UserPlus,
  Building2,
  MapPin,
  Briefcase,
  Star,
  CheckCircle,
  Loader2,
  Users
} from "lucide-react";
import { apiClient } from "../api-client";
import type { User } from "@/types";

interface ConnectionForm {
  connection_name: string;
  connection_company: string;
  connection_title: string;
  connection_location: string;
  connection_profile_url: string;
  relationship_strength: number;
  mutual_connections_count: number;
  platform_id: number;
}

export default function AddConnectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ConnectionForm>({
    connection_name: "",
    connection_company: "",
    connection_title: "",
    connection_location: "",
    connection_profile_url: "",
    relationship_strength: 3,
    mutual_connections_count: 0,
    platform_id: 1, // Default to LinkedIn
  });
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
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
    } catch (error) {
      console.error("Failed to load user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ConnectionForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.connection_name.trim()) {
      return "Connection name is required";
    }
    
    if (formData.connection_profile_url && !isValidUrl(formData.connection_profile_url)) {
      return "Please enter a valid URL";
    }
    
    return null;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    try {
      const result = await apiClient.createConnection(formData);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      // Redirect after showing success
      setTimeout(() => {
        router.push("/connections");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getConnectionInitials = () => {
    return formData.connection_name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStrengthLabel = (strength: number) => {
    switch (strength) {
      case 1: return "Acquaintance";
      case 2: return "Colleague";
      case 3: return "Professional";
      case 4: return "Close Contact";
      case 5: return "Mentor/Friend";
      default: return "Professional";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glassmorphism p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold">Loading...</h3>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="glassmorphism max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connection Added!</h2>
            <p className="text-muted-foreground mb-6">
              {formData.connection_name} has been successfully added to your professional network.
            </p>
            <div className="space-y-3">
              <Link href="/connections">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  View All Connections
                </Button>
              </Link>
              <Link href="/connections/add">
                <Button variant="outline" className="w-full">
                  Add Another Connection
                </Button>
              </Link>
            </div>
          </CardContent>
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
              <Link href="/connections">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Connections
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Add New Connection</h1>
            <p className="text-muted-foreground">
              Expand your professional network by adding a valuable contact
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Connection Details
                  </CardTitle>
                  <CardDescription>
                    Fill in the information about your professional contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Required Fields */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="connection_name" className="text-base font-medium">
                          Full Name *
                        </Label>
                        <Input
                          id="connection_name"
                          value={formData.connection_name}
                          onChange={(e) => handleInputChange('connection_name', e.target.value)}
                          placeholder="e.g., John Doe"
                          className="glassmorphism mt-2"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="connection_company" className="text-base font-medium">
                            Company
                          </Label>
                          <div className="relative mt-2">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="connection_company"
                              value={formData.connection_company}
                              onChange={(e) => handleInputChange('connection_company', e.target.value)}
                              placeholder="e.g., TechCorp Inc"
                              className="glassmorphism pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="connection_title" className="text-base font-medium">
                            Job Title
                          </Label>
                          <div className="relative mt-2">
                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="connection_title"
                              value={formData.connection_title}
                              onChange={(e) => handleInputChange('connection_title', e.target.value)}
                              placeholder="e.g., Software Engineer"
                              className="glassmorphism pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="connection_location" className="text-base font-medium">
                          Location
                        </Label>
                        <div className="relative mt-2">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="connection_location"
                            value={formData.connection_location}
                            onChange={(e) => handleInputChange('connection_location', e.target.value)}
                            placeholder="e.g., San Francisco, CA"
                            className="glassmorphism pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="connection_profile_url" className="text-base font-medium">
                          Profile URL
                        </Label>
                        <Input
                          id="connection_profile_url"
                          type="url"
                          value={formData.connection_profile_url}
                          onChange={(e) => handleInputChange('connection_profile_url', e.target.value)}
                          placeholder="e.g., https://linkedin.com/in/johndoe"
                          className="glassmorphism mt-2"
                        />
                      </div>
                    </div>

                    {/* Relationship Details */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Relationship Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="relationship_strength" className="text-base font-medium">
                            Relationship Strength
                          </Label>
                          <Select 
                            value={formData.relationship_strength.toString()} 
                            onValueChange={(value) => handleInputChange('relationship_strength', parseInt(value))}
                          >
                            <SelectTrigger className="glassmorphism mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Acquaintance</SelectItem>
                              <SelectItem value="2">2 - Colleague</SelectItem>
                              <SelectItem value="3">3 - Professional</SelectItem>
                              <SelectItem value="4">4 - Close Contact</SelectItem>
                              <SelectItem value="5">5 - Mentor/Friend</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="mutual_connections_count" className="text-base font-medium">
                            Mutual Connections
                          </Label>
                          <Input
                            id="mutual_connections_count"
                            type="number"
                            min="0"
                            value={formData.mutual_connections_count}
                            onChange={(e) => handleInputChange('mutual_connections_count', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="glassmorphism mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Connection...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add to Network
                          </>
                        )}
                      </Button>
                      <Link href="/connections">
                        <Button type="button" variant="outline" className="w-full sm:w-auto">
                          Cancel
                        </Button>
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Preview and Tips */}
            <div className="space-y-6">
              {/* Connection Preview */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <CardDescription>
                    How this connection will appear in your network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {formData.connection_name ? getConnectionInitials() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {formData.connection_name || "Connection Name"}
                      </h3>
                      {formData.connection_title && (
                        <p className="text-sm text-muted-foreground truncate">
                          {formData.connection_title}
                        </p>
                      )}
                      {formData.connection_company && (
                        <p className="text-sm text-muted-foreground truncate">
                          {formData.connection_company}
                        </p>
                      )}
                      {formData.connection_location && (
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {formData.connection_location}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{getStrengthLabel(formData.relationship_strength)}</span>
                        </div>
                        {formData.mutual_connections_count > 0 && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm">{formData.mutual_connections_count} mutual</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="glassmorphism border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
                    💡 Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Quality over quantity:</strong> Focus on adding meaningful professional relationships rather than collecting contacts.
                  </div>
                  <div>
                    <strong>Stay updated:</strong> Keep connection information current to maximize networking opportunities.
                  </div>
                  <div>
                    <strong>Relationship strength:</strong> Accurately rating relationships helps our AI provide better job match recommendations.
                  </div>
                  <div>
                    <strong>LinkedIn profiles:</strong> Including LinkedIn URLs helps identify mutual connections and company insights.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}