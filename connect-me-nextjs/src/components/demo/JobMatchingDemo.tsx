"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Users, ExternalLink, Sparkles } from "lucide-react";

interface JobMatchingDemoProps {
  isPlaying: boolean;
  onToggle: () => void;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  match: number;
  connections: number;
  logo: string;
  referralPath: string[];
}

export function JobMatchingDemo({ isPlaying, onToggle }: JobMatchingDemoProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [visibleJobs, setVisibleJobs] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);

  const sampleJobs: Job[] = [
    {
      id: 1,
      title: "Senior Product Manager",
      company: "Google",
      location: "Mountain View, CA",
      match: 95,
      connections: 3,
      logo: "bg-blue-500",
      referralPath: ["Sarah Chen", "Product Director", "Hiring Manager"]
    },
    {
      id: 2,
      title: "Engineering Manager",
      company: "Microsoft",
      location: "Seattle, WA",
      match: 89,
      connections: 2,
      logo: "bg-green-500",
      referralPath: ["John Smith", "Engineering Director"]
    },
    {
      id: 3,
      title: "Design Lead",
      company: "Apple",
      location: "Cupertino, CA",
      match: 87,
      connections: 4,
      logo: "bg-gray-800",
      referralPath: ["Maria Garcia", "Design Manager", "Senior Designer", "Hiring Manager"]
    },
    {
      id: 4,
      title: "Data Scientist",
      company: "Netflix",
      location: "Los Gatos, CA",
      match: 82,
      connections: 1,
      logo: "bg-red-500",
      referralPath: ["Lisa Johnson"]
    }
  ];

  const analysisSteps = [
    "Scanning your network...",
    "Matching skills & experience...",
    "Finding referral paths...",
    "Calculating match scores...",
    "Ranking opportunities..."
  ];

  useEffect(() => {
    if (!isPlaying) {
      setJobs([]);
      setVisibleJobs(0);
      setAnalysisStep(0);
      return;
    }

    // Analysis phase
    const analysisInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(analysisInterval);
          // Start showing jobs
          setTimeout(() => {
            setJobs(sampleJobs);
            showJobsSequentially();
          }, 1000);
          return prev;
        }
      });
    }, 800);

    return () => {
      clearInterval(analysisInterval);
    };
  }, [isPlaying]);

  const showJobsSequentially = () => {
    let count = 0;
    const jobInterval = setInterval(() => {
      count++;
      setVisibleJobs(count);
      if (count >= sampleJobs.length) {
        clearInterval(jobInterval);
      }
    }, 600);
  };

  return (
    <Card className="relative h-96 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      <div className="absolute inset-0 p-6">
        {!isPlaying && jobs.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-indigo-600" />
              </div>
              <Button onClick={onToggle} className="bg-indigo-600 hover:bg-indigo-700">
                Start Job Matching Demo
              </Button>
            </div>
          </div>
        )}

        {isPlaying && jobs.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center space-y-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">AI Job Matching</h3>
              <p className="text-muted-foreground">{analysisSteps[analysisStep]}</p>
            </div>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= analysisStep ? 'bg-indigo-500' : 'bg-gray-300'
                  } transition-colors duration-300`}
                />
              ))}
            </div>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="h-full overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Personalized Job Matches</h3>
              <Button onClick={onToggle} variant="outline" size="sm">
                Restart Demo
              </Button>
            </div>
            
            {jobs.slice(0, visibleJobs).map((job, index) => (
              <Card 
                key={job.id} 
                className="p-4 animate-in slide-in-from-bottom duration-500 hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-12 h-12 ${job.logo} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {job.company[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{job.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <Building className="h-3 w-3" />
                        <span>{job.company}</span>
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          className={`text-xs ${
                            job.match >= 90 ? 'bg-green-500/20 text-green-700' :
                            job.match >= 85 ? 'bg-blue-500/20 text-blue-700' :
                            'bg-orange-500/20 text-orange-700'
                          }`}
                        >
                          {job.match}% Match
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {job.connections} connections
                        </Badge>
                      </div>
                      {job.referralPath.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="text-muted-foreground">Referral path: </span>
                          <span className="text-blue-600">
                            {job.referralPath.join(' → ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {visibleJobs < jobs.length && (
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading more matches...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}