import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface HeatmapChartProps {
  className?: string;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ className = '' }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current) return;

    const stores = ["Store A", "Store B", "Store C", "Store D", "Store E"];
    const categories = ["Fruits", "Dairy", "Vegetables", "Meat", "Bakery"];
    
    // Simulate realistic spoilage data
    const zData = [
      [45, 78, 32, 89, 56],
      [38, 67, 28, 76, 49],
      [52, 81, 35, 92, 63],
      [29, 54, 22, 68, 41],
      [61, 95, 45, 102, 72]
    ];

    const data = [{
      z: zData,
      x: categories,
      y: stores,
      type: 'heatmap' as const,
      colorscale: 'YlOrRd',
      showscale: true,
      hovertemplate: '<b>%{y}</b><br>' +
                    'Category: %{x}<br>' +
                    'Spoilage: %{z} kg<br>' +
                    '<extra></extra>',
    }];

    const layout = {
      title: {
        text: 'Spoilage Heatmap by Store & Category',
        font: { size: 16, color: '#374151' }
      },
      xaxis: {
        title: { text: 'Product Category', font: { size: 14, color: '#6B7280' } },
        tickfont: { size: 12, color: '#6B7280' }
      },
      yaxis: {
        title: { text: 'Store Location', font: { size: 14, color: '#6B7280' } },
        tickfont: { size: 12, color: '#6B7280' }
      },
      margin: { t: 50, b: 50, l: 80, r: 80 },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      font: { family: 'Inter, system-ui, sans-serif' }
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      doubleClick: 'reset' as const,
      dragMode: 'zoom' as const
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
    </div>
  );
};

export default HeatmapChart;