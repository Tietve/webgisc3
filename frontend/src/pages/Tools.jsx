import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { toolsAPI } from '../api/api';
import 'leaflet-draw/dist/leaflet.draw.css';

function Tools() {
  const [selectedTool, setSelectedTool] = useState('buffer');
  const [inputGeometry, setInputGeometry] = useState(null);
  const [overlayGeometry, setOverlayGeometry] = useState(null);
  const [result, setResult] = useState(null);
  const [distance, setDistance] = useState(1000);
  const [units, setUnits] = useState('meters');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreated = (e, isOverlay = false) => {
    const { layer } = e;
    const geojson = layer.toGeoJSON();

    if (isOverlay) {
      setOverlayGeometry(geojson);
    } else {
      setInputGeometry(geojson);
    }
  };

  const handleExecuteBuffer = async () => {
    if (!inputGeometry) {
      setError('Please draw a geometry first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await toolsAPI.executeBuffer(inputGeometry, distance, units);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to execute buffer tool');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteIntersect = async () => {
    if (!inputGeometry || !overlayGeometry) {
      setError('Please draw both input and overlay geometries');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await toolsAPI.executeIntersect(inputGeometry, overlayGeometry);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to execute intersect tool');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputGeometry(null);
    setOverlayGeometry(null);
    setResult(null);
    setError('');
  };

  return (
    <div>
      <h1 className="card-header">Geospatial Analysis Tools</h1>

      {error && <div className="error">{error}</div>}

      <div className="card-grid">
        <div className="card">
          <h2 className="card-header">Tool Selection</h2>

          <div className="form-group">
            <label>Select Tool</label>
            <select
              className="form-control"
              value={selectedTool}
              onChange={(e) => {
                setSelectedTool(e.target.value);
                handleClear();
              }}
            >
              <option value="buffer">Buffer</option>
              <option value="intersect">Intersect</option>
            </select>
          </div>

          {selectedTool === 'buffer' && (
            <>
              <div className="form-group">
                <label>Distance</label>
                <input
                  type="number"
                  className="form-control"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Units</label>
                <select
                  className="form-control"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                >
                  <option value="meters">Meters</option>
                  <option value="kilometers">Kilometers</option>
                  <option value="miles">Miles</option>
                </select>
              </div>

              <button
                onClick={handleExecuteBuffer}
                className="btn btn-success"
                disabled={loading || !inputGeometry}
              >
                {loading ? 'Processing...' : 'Execute Buffer'}
              </button>
            </>
          )}

          {selectedTool === 'intersect' && (
            <button
              onClick={handleExecuteIntersect}
              className="btn btn-success"
              disabled={loading || !inputGeometry || !overlayGeometry}
            >
              {loading ? 'Processing...' : 'Execute Intersect'}
            </button>
          )}

          <button onClick={handleClear} className="btn btn-secondary mt-2">
            Clear All
          </button>

          {result && (
            <div className="mt-3">
              <h3>Result</h3>
              <div className="badge badge-success">Operation Successful</div>
              <pre style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-header">Instructions</h2>
          {selectedTool === 'buffer' && (
            <div>
              <p>1. Use the drawing tools to create a geometry on the map</p>
              <p>2. Set the buffer distance and units</p>
              <p>3. Click "Execute Buffer" to create a buffer around your geometry</p>
              <p>4. The result will appear on the map in blue</p>
            </div>
          )}
          {selectedTool === 'intersect' && (
            <div>
              <p>1. Draw the first geometry (input) on the left map</p>
              <p>2. Draw the second geometry (overlay) on the right map</p>
              <p>3. Click "Execute Intersect" to find the intersection</p>
              <p>4. The result will show the overlapping area</p>
            </div>
          )}
        </div>
      </div>

      <div className="map-container mt-3">
        <MapContainer
          center={[16.0, 108.0]}
          zoom={6}
          style={{ height: '600px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={(e) => handleCreated(e, false)}
              draw={{
                rectangle: true,
                circle: true,
                circlemarker: false,
                marker: false,
                polyline: true,
                polygon: true,
              }}
            />
          </FeatureGroup>
          {inputGeometry && <GeoJSON data={inputGeometry} style={{ color: 'red' }} />}
          {overlayGeometry && <GeoJSON data={overlayGeometry} style={{ color: 'green' }} />}
          {result && <GeoJSON data={result} style={{ color: 'blue', fillOpacity: 0.3 }} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default Tools;
