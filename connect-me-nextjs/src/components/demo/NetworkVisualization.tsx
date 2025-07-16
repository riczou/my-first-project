"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  company: string;
  name: string;
}

interface NetworkVisualizationProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function NetworkVisualization({ isPlaying, onToggle }: NetworkVisualizationProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Sample network data
  const sampleNodes: Node[] = [
    { id: 1, x: 50, y: 50, size: 16, color: "bg-blue-500", company: "Google", name: "Sarah Chen" },
    { id: 2, x: 80, y: 30, size: 12, color: "bg-green-500", company: "Microsoft", name: "John Smith" },
    { id: 3, x: 20, y: 80, size: 14, color: "bg-purple-500", company: "Apple", name: "Maria Garcia" },
    { id: 4, x: 70, y: 70, size: 10, color: "bg-orange-500", company: "Amazon", name: "David Wilson" },
    { id: 5, x: 30, y: 20, size: 12, color: "bg-red-500", company: "Netflix", name: "Lisa Johnson" },
    { id: 6, x: 60, y: 50, size: 8, color: "bg-indigo-500", company: "Spotify", name: "Alex Brown" },
    { id: 7, x: 40, y: 60, size: 10, color: "bg-pink-500", company: "Uber", name: "Emma Davis" },
    { id: 8, x: 85, y: 60, size: 14, color: "bg-cyan-500", company: "Tesla", name: "Michael Lee" },
  ];

  useEffect(() => {
    setNodes(sampleNodes);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
      setNodes(prev => prev.map(node => ({
        ...node,
        x: Math.max(5, Math.min(95, node.x + (Math.random() - 0.5) * 2)),
        y: Math.max(5, Math.min(95, node.y + (Math.random() - 0.5) * 2)),
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <Card className="relative h-96 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Network Visualization */}
      <div className="absolute inset-0 p-6">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {nodes.map(node => 
            nodes.filter(other => other.id > node.id && 
              Math.sqrt(Math.pow(other.x - node.x, 2) + Math.pow(other.y - node.y, 2)) < 30
            ).map(connectedNode => (
              <line
                key={`${node.id}-${connectedNode.id}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${connectedNode.x}%`}
                y2={`${connectedNode.y}%`}
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-300 dark:text-slate-600"
                opacity={isPlaying ? 0.6 : 0.3}
              />
            ))
          )}
        </svg>

        {/* Network Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute ${node.color} rounded-full flex items-center justify-center text-white font-bold text-xs transition-all duration-100`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}
            title={`${node.name} - ${node.company}`}
          >
            {node.name.split(' ').map(n => n[0]).join('')}
          </div>
        ))}

        {/* Hover Info Panel */}
        {isPlaying && (
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg" style={{ zIndex: 3 }}>
            <div className="text-sm font-semibold">Live Network Analysis</div>
            <div className="text-xs text-muted-foreground">
              {nodes.length} connections • {Math.floor(animationFrame / 10)} insights generated
            </div>
          </div>
        )}
      </div>

      {/* Control Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20" style={{ zIndex: 4 }}>
        <Button
          onClick={onToggle}
          className="bg-white/90 hover:bg-white text-slate-900 shadow-lg"
        >
          {isPlaying ? 'Pause Network Analysis' : 'Start Network Analysis'}
        </Button>
      </div>
    </Card>
  );
}