import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface Scatter3DChartProps {
  className?: string;
}

const Scatter3DChart: React.FC<Scatter3DChartProps> = ({ className = '' }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current) return;

    const stores = ["Store A", "Store B", "Store C", "Store D", "Store E"];
    
    // Simulate realistic spoilage data over time
    const scatterData = [
      { store: "Store A", day: 1, spoilage: 45, category: "Fruits" },
      { store: "Store B", day: 1, spoilage: 78, category: "Dairy" },
      { store: "Store C", day: 1, spoilage: 32, category: "Vegetables" },
      { store: "Store D", day: 1, spoilage: 89, category: "Meat" },
      { store: "Store E", day: 1, spoilage: 56, category: "Bakery" },
      { store: "Store A", day: 2, spoilage: 38, category: "Fruits" },
      { store: "Store B", day: 2, spoilage: 67, category: "Dairy" },
      { store: "Store C", day: 2, spoilage: 28, category: "Vegetables" },
      { store: "Store D", day: 2, spoilage: 76, category: "Meat" },
      { store: "Store E", day: 2, spoilage: 49, category: "Bakery" },
      { store: "Store A", day: 3, spoilage: 52, category: "Fruits" },
      { store: "Store B", day: 3, spoilage: 81, category: "Dairy" },
      { store: "Store C", day: 3, spoilage: 35, category: "Vegetables" },
      { store: "Store D", day: 3, spoilage: 92, category: "Meat" },
      { store: "Store E", day: 3, spoilage: 63, category: "Bakery" },
    ];

    const categoryColors: { [key: string]: string } = {
      Fruits: '#10B981',
      Dairy: '#3B82F6',
      Vegetables: '#F59E0B',
      Meat: '#EF4444',
      Bakery: '#8B5CF6'
    };

    const data = [{
      x: scatterData.map(d => stores.indexOf(d.store) + 1),
      y: scatterData.map(d => d.day),
      z: scatterData.map(d => d.spoilage),
      mode: 'markers' as const,
      type: 'scatter3d' as const,
      marker: {
        size: 8,
        color: scatterData.map(d => categoryColors[d.category]),
        opacity: 0.8,
        line: {
          color: 'white',
          width: 2
        }
      },
      text: scatterData.map(d => `${d.store} - ${d.category}`),
      hovertemplate: '<b>%{text}</b><br>' +
                    'Day: %{y}<br>' +
                    'Spoilage: %{z} kg<br>' +
                    '<extra></extra>'
    }];

    const layout = {
      title: {
        text: '3D Spoilage Hotspots Over Time',
        font: { size: 16, color: '#374151' }
      },
      scene: {
        xaxis: {
          title: { text: 'Store Location', font: { size: 12, color: '#6B7280' } },
          tickvals: [1, 2, 3, 4, 5],
          ticktext: stores,
          tickfont: { size: 10, color: '#6B7280' }
        },
        yaxis: {
          title: { text: 'Day', font: { size: 12, color: '#6B7280' } },
          tickfont: { size: 10, color: '#6B7280' }
        },
        zaxis: {
          title: { text: 'Spoilage (kg)', font: { size: 12, color: '#6B7280' } },
          tickfont: { size: 10, color: '#6B7280' }
        },
        bgcolor: 'white',
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 }
        }
      },
      margin: { t: 50, b: 50, l: 50, r: 50 },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      font: { family: 'Inter, system-ui, sans-serif' }
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      doubleClick: 'reset' as const
    };

    Plotly.newPlot(plotRef.current, data, layout, config);

    // Cleanup
    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div ref={plotRef} style={{ width: '100%', height: '400px' }} />
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Fruits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Dairy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Vegetables</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Meat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Bakery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scatter3DChart;