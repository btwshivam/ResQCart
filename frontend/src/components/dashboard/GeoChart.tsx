import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface GeoChartProps {
  className?: string;
}

const GeoChart: React.FC<GeoChartProps> = ({ className = '' }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current) return;

    // Sample store data for different locations
    const stores = [
      { name: "Store A", lat: 40.7128, lng: -74.0060, spoilage: 50, category: "Fruits", address: "New York, NY" },
      { name: "Store B", lat: 34.0522, lng: -118.2437, spoilage: 80, category: "Dairy", address: "Los Angeles, CA" },
      { name: "Store C", lat: 41.8781, lng: -87.6298, spoilage: 30, category: "Vegetables", address: "Chicago, IL" },
      { name: "Store D", lat: 29.7604, lng: -95.3698, spoilage: 90, category: "Meat", address: "Houston, TX" },
      { name: "Store E", lat: 33.4484, lng: -112.0740, spoilage: 60, category: "Bakery", address: "Phoenix, AZ" },
      { name: "Store F", lat: 39.9526, lng: -75.1652, spoilage: 40, category: "Fruits", address: "Philadelphia, PA" },
      { name: "Store G", lat: 32.7767, lng: -96.7970, spoilage: 70, category: "Dairy", address: "Dallas, TX" },
    ];

    const categoryColors: { [key: string]: string } = {
      "Fruits": "#10B981",
      "Dairy": "#3B82F6",
      "Vegetables": "#F59E0B",
      "Meat": "#EF4444",
      "Bakery": "#8B5CF6"
    };

    const data = [{
      type: 'scattermapbox' as const,
      mode: 'markers' as const,
      lon: stores.map(store => store.lng),
      lat: stores.map(store => store.lat),
      marker: {
        size: stores.map(store => store.spoilage * 0.3 + 10),
        color: stores.map(store => categoryColors[store.category]),
        opacity: 0.8,
        line: {
          color: 'white',
          width: 2
        }
      },
      text: stores.map(store => 
        `<b>${store.name}</b><br>` +
        `Address: ${store.address}<br>` +
        `Category: ${store.category}<br>` +
        `Spoilage: ${store.spoilage} kg`
      ),
      hovertemplate: '%{text}<extra></extra>'
    }];

    const layout = {
      title: {
        text: 'Geographic Distribution of Food Spoilage',
        font: { size: 16, color: '#374151' }
      },
      mapbox: {
        style: 'open-street-map',
        center: { lat: 39.8283, lon: -98.5795 }, // Center of USA
        zoom: 3
      },
      margin: { t: 50, b: 50, l: 50, r: 50 },
      paper_bgcolor: 'white',
      font: { family: 'Inter, system-ui, sans-serif' },
      showlegend: false
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
      <div ref={plotRef} style={{ width: '100%', height: '500px' }} />
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
        <div className="mt-2 text-xs text-gray-600">
          * Bubble size represents spoilage amount
        </div>
      </div>
    </div>
  );
};

export default GeoChart;