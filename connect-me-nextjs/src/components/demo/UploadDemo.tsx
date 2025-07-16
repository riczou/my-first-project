"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, Users, Building, BarChart3 } from "lucide-react";

interface UploadDemoProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function UploadDemo({ isPlaying, onToggle }: UploadDemoProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    { label: "Uploading file...", icon: Upload, duration: 2000 },
    { label: "Processing connections...", icon: Users, duration: 3000 },
    { label: "Analyzing companies...", icon: Building, duration: 2500 },
    { label: "Generating insights...", icon: BarChart3, duration: 2000 },
  ];

  useEffect(() => {
    if (!isPlaying) {
      setUploadProgress(0);
      setCurrentStep(0);
      setShowResults(false);
      return;
    }

    let timeouts: NodeJS.Timeout[] = [];
    let totalTime = 0;

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);
        
        // Animate progress for this step
        const stepProgress = ((index + 1) / steps.length) * 100;
        let currentProgress = (index / steps.length) * 100;
        
        const progressInterval = setInterval(() => {
          currentProgress += 2;
          setUploadProgress(Math.min(currentProgress, stepProgress));
          
          if (currentProgress >= stepProgress) {
            clearInterval(progressInterval);
            
            if (index === steps.length - 1) {
              setTimeout(() => setShowResults(true), 500);
            }
          }
        }, 50);
        
        timeouts.push(setTimeout(() => clearInterval(progressInterval), step.duration));
      }, totalTime);
      
      timeouts.push(timeout);
      totalTime += step.duration;
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isPlaying]);

  const mockResults = {
    connections: 1247,
    companies: 156,
    industries: 23,
    strongConnections: 89,
  };

  return (
    <Card className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <div className="absolute inset-0 p-6">
        {!isPlaying && !showResults && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 border-4 border-dashed border-blue-300 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
              <Button onClick={onToggle} className="bg-blue-600 hover:bg-blue-700">
                Start Upload Demo
              </Button>
            </div>
          </div>
        )}

        {isPlaying && !showResults && (
          <div className="h-full flex flex-col justify-center space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                {(() => {
                  const IconComponent = steps[currentStep]?.icon || Upload;
                  return <IconComponent className="h-8 w-8 text-blue-600 animate-pulse" />;
                })()}
              </div>
              <h3 className="text-xl font-semibold">{steps[currentStep]?.label}</h3>
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-2 max-w-md mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    index < currentStep ? 'bg-green-500' : 
                    index === currentStep ? 'bg-blue-500 animate-pulse' : 
                    'bg-gray-300'
                  }`} />
                  <span className={`text-sm ${
                    index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                  {index < currentStep && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {showResults && (
          <div className="h-full flex flex-col justify-center space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analysis Complete!</h3>
              <p className="text-muted-foreground">Your network has been processed successfully</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{mockResults.connections}</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{mockResults.companies}</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{mockResults.industries}</div>
                <div className="text-sm text-muted-foreground">Industries</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{mockResults.strongConnections}</div>
                <div className="text-sm text-muted-foreground">Strong Ties</div>
              </Card>
            </div>

            <div className="text-center">
              <Button onClick={onToggle} variant="outline">
                Restart Demo
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}