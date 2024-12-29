import React, { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';

const KaleidoscopeApp = () => {
  const canvasRef = useRef(null);
  const p5Ref = useRef(null);
  const [hasPattern, setHasPattern] = useState(false);

  useEffect(() => {
    // Import p5 dynamically to avoid SSR issues
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;

      // Remove any existing canvas
      if (p5Ref.current) {
        p5Ref.current.remove();
      }

      // Create new p5 instance
      p5Ref.current = new p5((p) => {
        let symmetry = 6;
        let angle = 360 / symmetry;
        let points = [];
        let colors = [];
        let currentHue = 0;

        p.setup = () => {
          const canvas = p.createCanvas(390, 844);
          canvas.parent(canvasRef.current);
          p.angleMode(p.DEGREES);
          p.colorMode(p.HSB, 360, 100, 100);
          p.background(0);
          generateNewPattern();
        };

        p.draw = () => {
          p.translate(p.width / 2, p.height / 2);
          
          for (let i = 0; i < points.length - 1; i++) {
            for (let j = 0; j < symmetry; j++) {
              p.push();
              p.rotate(angle * j);
              
              p.stroke(colors[i]);
              p.strokeWeight(3);
              p.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
              
              p.scale(1, -1);
              p.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
              p.pop();
            }
          }
        };

        function generateNewPattern() {
          points = [];
          colors = [];
          let numPoints = p.random(10, 20);
          currentHue = p.random(360);
          let maxRadius = p.min(p.width, p.height/2) / 3;
          
          for (let i = 0; i < numPoints; i++) {
            let radius = p.random(20, maxRadius);
            let angle = p.random(360);
            let x = p.cos(angle) * radius;
            let y = p.sin(angle) * radius;
            
            points.push(p.createVector(x, y));
            
            let hue = (currentHue + p.random(-30, 30)) % 360;
            let saturation = p.random(70, 100);
            let brightness = p.random(70, 100);
            colors.push(p.color(hue, saturation, brightness));
          }
          
          points.sort((a, b) => {
            let angleA = p.atan2(a.y, a.x);
            let angleB = p.atan2(b.y, b.x);
            return angleA - angleB;
          });
          
          points.push(points[0]);
          colors.push(colors[0]);
        }

        // Expose generateNewPattern to component
        p.generateNewPattern = generateNewPattern;
      });
    });

    // Cleanup function
    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
      }
    };
  }, []);

  const handleGenerate = () => {
    if (p5Ref.current) {
      p5Ref.current.generateNewPattern();
      p5Ref.current.background(0);
      setHasPattern(true);
    }
  };

  const handleDownload = () => {
    if (!p5Ref.current || !hasPattern) return;

    // Get the canvas element
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    // Create a temporary link element
    const link = document.createElement('a');
    // Generate a timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `kaleidoscope-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Kaleidoscope Generator</h1>
      
      <div className="relative mb-6">
        <div ref={canvasRef} className="rounded-lg overflow-hidden shadow-2xl" />
      </div>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleGenerate}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold 
                   shadow-lg hover:bg-purple-700 transition-colors duration-200
                   active:transform active:scale-95"
        >
          Generate New Pattern
        </button>

        <button
          onClick={handleDownload}
          disabled={!hasPattern}
          className={`px-6 py-3 rounded-lg font-semibold shadow-lg
                     flex items-center gap-2 transition-all duration-200
                     ${hasPattern 
                       ? 'bg-green-600 hover:bg-green-700 text-white active:transform active:scale-95' 
                       : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
        >
          <Download size={20} />
          Download
        </button>
      </div>

      <p className="text-gray-400 mt-4 text-center max-w-md px-4">
        Generate unique kaleidoscope patterns and download them as PNG images!
      </p>
    </div>
  );
};

export default KaleidoscopeApp;
