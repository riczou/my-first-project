"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Network, 
  Upload, 
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Users,
  Building2,
  MapPin,
  Loader2
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import type { User } from "@/types";

interface UploadResult {
  totalRows: number;
  successfulImports: number;
  errors: string[];
  connections: Array<{
    name: string;
    company?: string;
    title?: string;
    location?: string;
  }>;
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // BUSINESS FOCUS: Simple session check instead of complex auth
      const userSession = localStorage.getItem('user_session');
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
    } catch (error) {
      console.error("Failed to load user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const simulateUpload = async (file: File): Promise<UploadResult> => {
    // Simulate file processing
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0]?.split(',') || [];
    
    // Mock processing with progress updates
    const totalRows = lines.length - 1; // Excluding header
    let processedRows = 0;
    const connections = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate processing time
      
      const row = lines[i].split(',');
      processedRows++;
      setUploadProgress((processedRows / totalRows) * 100);

      if (row.length >= 1 && row[0].trim()) {
        connections.push({
          name: row[0]?.trim() || `Connection ${i}`,
          company: row[1]?.trim() || undefined,
          title: row[2]?.trim() || undefined,
          location: row[3]?.trim() || undefined,
        });
      } else {
        errors.push(`Row ${i}: Missing name`);
      }
    }

    return {
      totalRows,
      successfulImports: connections.length,
      errors: errors.slice(0, 5), // Limit error display
      connections: connections.slice(0, 10), // Show first 10 for preview
    };
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Process the CSV upload
      const result = await simulateUpload(selectedFile);
      setUploadResult(result);
      
      // BUSINESS FOCUS: Store connections locally for immediate filtering/analysis
      // TODO: Later store in Supabase for persistence
      const userSession = localStorage.getItem('user_session');
      if (userSession) {
        const userData = JSON.parse(userSession);
        const userConnections = {
          ...userData,
          connections: result.connections,
          upload_date: new Date().toISOString(),
          total_connections: result.successfulImports
        };
        localStorage.setItem('user_session', JSON.stringify(userConnections));
        localStorage.setItem('user_connections', JSON.stringify(result.connections));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      "Name,Company,Title,Location",
      "John Doe,TechCorp Inc,Software Engineer,San Francisco CA",
      "Jane Smith,InnovateLabs,Product Manager,New York NY",
      "Mike Johnson,DataFlow Solutions,Data Scientist,Seattle WA",
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'linkedin_connections_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Import Your Connections</h1>
            <p className="text-muted-foreground">
              Upload your LinkedIn connections CSV file for instant network analysis
            </p>
          </div>

          {!uploadResult ? (
            <div className="space-y-8">
              {/* Instructions */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    How to Export Your LinkedIn Connections
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to get your connections data from LinkedIn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Go to LinkedIn Data Export</p>
                        <p className="text-sm text-muted-foreground">
                          Visit LinkedIn → Settings & Privacy → Data Privacy → Get a copy of your data
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Select "Connections"</p>
                        <p className="text-sm text-muted-foreground">
                          Choose only the "Connections" data type and request your archive
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Download and Upload</p>
                        <p className="text-sm text-muted-foreground">
                          LinkedIn will email you the file. Extract the Connections.csv and upload it here
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      onClick={downloadSampleCSV}
                      className="w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Sample CSV Format
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Area */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>Upload Your CSV File</CardTitle>
                  <CardDescription>
                    Drag and drop your LinkedIn connections CSV file or click to browse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-16 w-16 mx-auto mb-4 ${dragActive ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{selectedFile.name}</span>
                          <Badge variant="secondary">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                        
                        {uploading ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Processing your connections...</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                            <p className="text-sm text-muted-foreground">
                              {Math.round(uploadProgress)}% complete
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Button 
                              onClick={handleUpload}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Process Connections
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              Click to start analyzing your network
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          {dragActive ? 'Drop your CSV file here' : 'Choose your CSV file'}
                        </h3>
                        <p className="text-muted-foreground">
                          Supports CSV files up to 10MB
                        </p>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Button variant="outline" className="pointer-events-none">
                            Browse Files
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Upload Results */
            <div className="space-y-8">
              {/* Success Summary */}
              <Card className="glassmorphism border-green-500/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <CardTitle className="text-green-700 dark:text-green-300">
                        Import Successful!
                      </CardTitle>
                      <CardDescription>
                        Your connections have been processed and added to your network
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gradient mb-1">
                        {uploadResult.totalRows}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {uploadResult.successfulImports}
                      </div>
                      <div className="text-sm text-muted-foreground">Successfully Imported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {uploadResult.errors.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Errors (if any) */}
              {uploadResult.errors.length > 0 && (
                <Alert className="border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Some records couldn't be imported:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview of Imported Connections */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Imported Connections Preview</span>
                    <Badge variant="secondary">
                      Showing {Math.min(uploadResult.connections.length, 10)} of {uploadResult.successfulImports}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Here's a preview of your newly imported professional network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadResult.connections.map((connection, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {connection.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{connection.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {connection.company && (
                              <span className="flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {connection.company}
                              </span>
                            )}
                            {connection.title && (
                              <span>{connection.title}</span>
                            )}
                            {connection.location && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {connection.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                  <CardDescription>
                    Explore your network and discover opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/connections">
                      <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-blue-600" />
                        <span className="font-medium">View Network</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Analyze your connections and relationships
                        </span>
                      </Button>
                    </Link>
                    <Link href="/companies">
                      <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                        <Building2 className="h-8 w-8 text-purple-600" />
                        <span className="font-medium">Company Insights</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Discover opportunities by company
                        </span>
                      </Button>
                    </Link>
                    <Link href="/jobs">
                      <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-green-600" />
                        <span className="font-medium">Find Jobs</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Get AI-powered job recommendations
                        </span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}