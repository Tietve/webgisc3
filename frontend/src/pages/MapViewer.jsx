import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, FeatureGroup, Popup, Marker } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { gisAPI, toolsAPI, lessonAPI } from '../api/api';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapViewer() {
  const [layers, setLayers] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState({});
  const [layerData, setLayerData] = useState({});
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLessonPopup, setShowLessonPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [activeTool, setActiveTool] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [toolResult, setToolResult] = useState(null);
  const [drawnItems, setDrawnItems] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    loadLayers();
    loadLessons();
  }, []);

  const loadLayers = async () => {
    try {
      const response = await gisAPI.listLayers();
      setLayers(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load layers:', err);
    }
  };

  const loadLessons = async () => {
    try {
      const response = await lessonAPI.list();
      setLessons(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load lessons:', err);
    }
  };

  const handleLessonSelect = async (lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setShowLessonPopup(true);
    setLessonsOpen(false);

    // Load lesson details with steps
    try {
      const response = await lessonAPI.get(lesson.id);
      setSelectedLesson(response.data);
    } catch (err) {
      console.error('Failed to load lesson details:', err);
    }
  };

  const handleNextStep = () => {
    if (selectedLesson && selectedLesson.steps && currentStep < selectedLesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLayerToggle = async (layerId) => {
    const isSelected = selectedLayers[layerId];
    if (isSelected) {
      setSelectedLayers({ ...selectedLayers, [layerId]: false });
    } else {
      setSelectedLayers({ ...selectedLayers, [layerId]: true });
      if (!layerData[layerId]) {
        try {
          const response = await gisAPI.getFeatures(layerId);
          setLayerData({ ...layerData, [layerId]: response.data });
        } catch (err) {
          console.error('Failed to load layer:', err);
        }
      }
    }
  };

  const handleDrawCreated = (e) => {
    const { layer } = e;
    const geojson = layer.toGeoJSON();
    setDrawnItems([...drawnItems, geojson]);

    if (activeTool === 'buffer') {
      handleBuffer(geojson);
    } else if (activeTool === 'measure') {
      handleMeasure(layer);
    }
  };

  const handleBuffer = async (geometry) => {
    try {
      const response = await toolsAPI.buffer(geometry, 1000);
      setToolResult({ type: 'buffer', data: response.data });
    } catch (err) {
      console.error('Buffer failed:', err);
    }
  };

  const handleMeasure = (layer) => {
    let measurement = '';

    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
      const latlngs = layer.getLatLngs();
      let distance = 0;
      for (let i = 0; i < latlngs.length - 1; i++) {
        distance += latlngs[i].distanceTo(latlngs[i + 1]);
      }
      measurement = `${(distance / 1000).toFixed(2)} km`;
    } else if (layer instanceof L.Polygon) {
      const bounds = layer.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const width = sw.distanceTo(L.latLng(sw.lat, ne.lng));
      const height = sw.distanceTo(L.latLng(ne.lat, sw.lng));
      const area = width * height;
      measurement = `${(area / 1000000).toFixed(2)} km²`;
    }

    setToolResult({ type: 'measurement', value: measurement });
  };

  const clearDrawings = () => {
    setDrawnItems([]);
    setToolResult(null);
    setActiveTool(null);
  };

  const getLayerStyle = (feature) => ({
    fillColor: '#3498db',
    weight: 2,
    opacity: 1,
    color: '#2980b9',
    fillOpacity: 0.3,
  });

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = Object.entries(feature.properties)
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br/>');
      layer.bindPopup(popupContent);
    }
  };

  const panelStyle = {
    position: 'absolute',
    top: '70px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 1000,
    maxHeight: 'calc(100vh - 90px)',
    overflowY: 'auto',
    animation: 'slideIn 0.3s ease',
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>

      {/* Floating Toolbar - Top Left */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1001,
        display: 'flex',
        gap: '10px',
      }}>
        {/* Tools Button */}
        <button
          onClick={() => { setToolsOpen(!toolsOpen); setLayersOpen(false); setLessonsOpen(false); }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            border: 'none',
            background: toolsOpen
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: toolsOpen ? 'white' : '#333',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => !toolsOpen && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          title="Drawing Tools"
        >
          🛠️
        </button>

        {/* Layers Button */}
        <button
          onClick={() => { setLayersOpen(!layersOpen); setToolsOpen(false); setLessonsOpen(false); }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            border: 'none',
            background: layersOpen
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: layersOpen ? 'white' : '#333',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => !layersOpen && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          title="Map Layers"
        >
          🗺️
        </button>

        {/* Lessons Button */}
        <button
          onClick={() => { setLessonsOpen(!lessonsOpen); setToolsOpen(false); setLayersOpen(false); }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            border: 'none',
            background: lessonsOpen
              ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: lessonsOpen ? 'white' : '#333',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => !lessonsOpen && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          title="Lessons"
        >
          📚
        </button>
      </div>

      {/* Tools Panel */}
      {toolsOpen && (
        <div style={{ ...panelStyle, left: '10px', width: '280px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Drawing & Analysis Tools</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className={`btn ${activeTool === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')}
            >
              🖊️ Draw Features
            </button>
            <button
              className={`btn ${activeTool === 'measure' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTool(activeTool === 'measure' ? null : 'measure')}
            >
              📏 Measure
            </button>
            <button
              className={`btn ${activeTool === 'buffer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTool(activeTool === 'buffer' ? null : 'buffer')}
            >
              🎯 Buffer (1km)
            </button>
            <button
              className="btn btn-danger"
              onClick={clearDrawings}
              disabled={drawnItems.length === 0}
            >
              🗑️ Clear All
            </button>
          </div>

          {toolResult && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
            }}>
              <strong>Result:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px', fontWeight: 'bold', color: '#2196F3' }}>
                {toolResult.value || JSON.stringify(toolResult.data)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layers Panel */}
      {layersOpen && (
        <div style={{ ...panelStyle, left: '10px', width: '280px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Map Layers</h3>
          {layers.length === 0 ? (
            <p style={{ color: '#666' }}>No layers available</p>
          ) : (
            <div>
              {layers.map((layer) => (
                <label
                  key={layer.id}
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    padding: '8px',
                    backgroundColor: selectedLayers[layer.id] ? '#e3f2fd' : 'transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedLayers[layer.id] || false}
                    onChange={() => handleLayerToggle(layer.id)}
                    style={{ marginRight: '10px' }}
                  />
                  {layer.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lessons Panel */}
      {lessonsOpen && (
        <div style={{ ...panelStyle, left: '10px', width: '320px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>📚 Interactive Lessons</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Chọn bài học để xem hướng dẫn tương tác trên bản đồ
          </p>
          {lessons.length === 0 ? (
            <div>
              <p style={{ color: '#666' }}>No lessons available yet.</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                Demo lessons will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => handleLessonSelect(lesson)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                    e.currentTarget.style.borderColor = '#2196F3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{lesson.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{lesson.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Demo Lessons - Static for now */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>DEMO LESSONS:</div>
            {[
              { title: 'Bài 1: Giới thiệu về GIS', desc: 'Tìm hiểu cơ bản về hệ thống thông tin địa lý' },
              { title: 'Bài 2: Sử dụng bản đồ', desc: 'Học cách zoom, pan và tương tác với bản đồ' },
              { title: 'Bài 3: Đo khoảng cách', desc: 'Thực hành đo khoảng cách trên bản đồ' },
            ].map((demo, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedLesson({
                    id: `demo-${idx}`,
                    title: demo.title,
                    description: demo.desc,
                    steps: [
                      {
                        order: 1,
                        title: 'Bước 1: Mở bản đồ',
                        content: 'Quan sát bản đồ Việt Nam. Bạn có thể zoom in/out bằng nút + - hoặc cuộn chuột.',
                        map_action: { type: 'zoom', params: { zoom: 7, center: [16.0, 108.0] } }
                      },
                      {
                        order: 2,
                        title: 'Bước 2: Chọn công cụ',
                        content: 'Click vào icon 🛠️ để mở menu công cụ. Chọn "Measure" để đo khoảng cách.',
                        map_action: { type: 'highlight', params: { element: 'tools' } }
                      },
                      {
                        order: 3,
                        title: 'Bước 3: Thực hành',
                        content: 'Vẽ một đường thẳng trên bản đồ. Khoảng cách sẽ được tính tự động!',
                        map_action: { type: 'enable_draw', params: { tool: 'polyline' } }
                      },
                    ]
                  });
                  setCurrentStep(0);
                  setShowLessonPopup(true);
                  setLessonsOpen(false);
                }}
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff3e0';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#FF9800' }}>
                  {demo.title}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{demo.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Popup */}
      {showLessonPopup && selectedLesson && selectedLesson.steps && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          maxWidth: '90vw',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 2000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{selectedLesson.title}</h2>
            <button
              onClick={() => setShowLessonPopup(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0 5px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '30px' }}>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                Bước {currentStep + 1} / {selectedLesson.steps.length}
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>
                {selectedLesson.steps[currentStep].title}
              </h3>
              <p style={{ margin: 0, lineHeight: '1.6' }}>
                {selectedLesson.steps[currentStep].content}
              </p>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                style={{ flex: 1 }}
              >
                ← Quay lại
              </button>
              {currentStep < selectedLesson.steps.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  style={{ flex: 1 }}
                >
                  Tiếp theo →
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={() => setShowLessonPopup(false)}
                  style={{ flex: 1, backgroundColor: '#4CAF50', color: 'white' }}
                >
                  Hoàn thành ✓
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '4px',
            backgroundColor: '#e0e0e0',
          }}>
            <div style={{
              height: '100%',
              width: `${((currentStep + 1) / selectedLesson.steps.length) * 100}%`,
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}

      {/* Backdrop for Lesson Popup */}
      {showLessonPopup && (
        <div
          onClick={() => setShowLessonPopup(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1999,
          }}
        />
      )}

      {/* Full Screen Map */}
      <MapContainer
        ref={mapRef}
        center={[16.0, 108.0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Drawing Controls */}
        {(activeTool === 'draw' || activeTool === 'measure' || activeTool === 'buffer') && (
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleDrawCreated}
              draw={{
                rectangle: activeTool === 'draw',
                circle: activeTool === 'buffer',
                circlemarker: false,
                marker: activeTool === 'draw',
                polyline: activeTool === 'measure' || activeTool === 'draw',
                polygon: activeTool === 'measure' || activeTool === 'draw',
              }}
              edit={{
                edit: false,
                remove: false,
              }}
            />
          </FeatureGroup>
        )}

        {/* Layer Data */}
        {Object.entries(selectedLayers).map(([layerId, isSelected]) => {
          if (isSelected && layerData[layerId]) {
            return (
              <GeoJSON
                key={layerId}
                data={layerData[layerId]}
                style={getLayerStyle}
                onEachFeature={onEachFeature}
              />
            );
          }
          return null;
        })}

        {/* Tool Results */}
        {toolResult && toolResult.data && toolResult.data.result && (
          <GeoJSON
            data={toolResult.data.result}
            style={{
              fillColor: '#ff7800',
              weight: 2,
              opacity: 1,
              color: '#ff5500',
              fillOpacity: 0.4,
            }}
          />
        )}
      </MapContainer>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: transparent;
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          borderRadius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}

export default MapViewer;
