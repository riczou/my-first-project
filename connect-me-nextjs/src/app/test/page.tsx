"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Network, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Server,
  Database,
  Users,
  Building2
} from "lucide-react";
import { apiClient } from "../api-client";

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Backend Health Check", status: 'loading', message: "Checking..." },
    { name: "Authentication", status: 'loading', message: "Testing login..." },
    { name: "Connections API", status: 'loading', message: "Fetching connections..." },
    { name: "Companies API", status: 'loading', message: "Fetching companies..." },
    { name: "Platforms API", status: 'loading', message: "Fetching platforms..." },
  ]);

  useEffect(() => {
    runTests();
  }, []);

  const updateTest = (index: number, status: 'success' | 'error', message: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ));
  };

  const runTests = async () => {
    // Test 1: Backend Health Check
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        const data = await response.json();
        updateTest(0, 'success', `Backend is healthy: ${data.status}`, data);
      } else {
        updateTest(0, 'error', `Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      updateTest(0, 'error', `Cannot connect to backend: ${error}`);
    }

    // Test 2: Authentication (try with demo credentials)
    try {
      const loginResult = await apiClient.login({ username: 'demo_user', password: 'demo123' });
      if (loginResult.error) {
        updateTest(1, 'error', `Login failed: ${loginResult.error}`);
      } else {
        updateTest(1, 'success', 'Demo login successful', loginResult.data);
        
        // If login successful, run authenticated tests
        await runAuthenticatedTests();
      }
    } catch (error) {
      updateTest(1, 'error', `Authentication error: ${error}`);
    }
  };

  const runAuthenticatedTests = async () => {
    // Test 3: Connections API
    try {
      const connectionsResult = await apiClient.getConnections();
      if (connectionsResult.error) {
        updateTest(2, 'error', `Connections API failed: ${connectionsResult.error}`);
      } else {
        updateTest(2, 'success', `Found ${connectionsResult.data?.length || 0} connections`, connectionsResult.data);
      }
    } catch (error) {
      updateTest(2, 'error', `Connections API error: ${error}`);
    }

    // Test 4: Companies API
    try {
      const companiesResult = await apiClient.getCompanyAnalytics();
      if (companiesResult.error) {
        updateTest(3, 'error', `Companies API failed: ${companiesResult.error}`);
      } else {
        updateTest(3, 'success', 'Companies API working', companiesResult.data);
      }
    } catch (error) {
      updateTest(3, 'error', `Companies API error: ${error}`);
    }

    // Test 5: Platforms API
    try {
      const platformsResult = await apiClient.getPlatforms();
      if (platformsResult.error) {
        updateTest(4, 'error', `Platforms API failed: ${platformsResult.error}`);
      } else {
        updateTest(4, 'success', `Found ${platformsResult.data?.length || 0} platforms`, platformsResult.data);
      }
    } catch (error) {
      updateTest(4, 'error', `Platforms API error: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const allTestsComplete = tests.every(test => test.status !== 'loading');
  const allTestsPassed = tests.every(test => test.status === 'success');
  const failedTests = tests.filter(test => test.status === 'error').length;

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
          </div>
        </div>
      </nav>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient">System Integration Test</h1>
            <p className="text-muted-foreground">
              Testing connectivity between Next.js frontend and FastAPI backend
            </p>
          </div>

          {/* Overall Status */}
          {allTestsComplete && (
            <Alert className={`mb-8 ${allTestsPassed ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-center">
                {allTestsPassed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <AlertDescription className="flex-1">
                  {allTestsPassed 
                    ? "🎉 All integration tests passed! Your Next.js app is successfully connected to the FastAPI backend."
                    : `❌ ${failedTests} test(s) failed. Check the details below for troubleshooting.`
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Test Results */}
          <div className="space-y-4">
            {tests.map((test, index) => (
              <Card key={index} className="glassmorphism">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(test.status)}
                      <span>{test.name}</span>
                    </CardTitle>
                    <Badge variant={
                      test.status === 'success' ? 'default' : 
                      test.status === 'error' ? 'destructive' : 'secondary'
                    }>
                      {test.status}
                    </Badge>
                  </div>
                  <CardDescription>{test.message}</CardDescription>
                </CardHeader>
                {test.data && (
                  <CardContent>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium mb-2">
                        View Response Data
                      </summary>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          {allTestsComplete && (
            <div className="mt-8 text-center space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  asChild
                >
                  <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
                    <Server className="h-6 w-6" />
                    <span className="text-sm">API Docs</span>
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  asChild
                >
                  <a href="http://localhost:8000/health" target="_blank" rel="noopener noreferrer">
                    <Database className="h-6 w-6" />
                    <span className="text-sm">Health Check</span>
                  </a>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => window.location.reload()}
                >
                  <Loader2 className="h-6 w-6" />
                  <span className="text-sm">Rerun Tests</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  asChild
                >
                  <a href="/dashboard">
                    <Network className="h-6 w-6" />
                    <span className="text-sm">Dashboard</span>
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Environment Info */}
          <Card className="glassmorphism mt-8">
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Frontend:</strong> Next.js 15 + TypeScript + Tailwind + shadcn/ui
                </div>
                <div>
                  <strong>Backend:</strong> FastAPI + Python + SQLite
                </div>
                <div>
                  <strong>Frontend URL:</strong> http://localhost:3000
                </div>
                <div>
                  <strong>Backend URL:</strong> http://localhost:8000
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}