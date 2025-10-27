import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { lessonAPI } from '../api/api';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ mapAction }) {
  const map = useMap();

  useEffect(() => {
    if (!mapAction) return;

    switch (mapAction.action_type) {
      case 'zoom_to':
        if (mapAction.payload.bounds) {
          map.fitBounds(mapAction.payload.bounds);
        } else if (mapAction.payload.center && mapAction.payload.zoom) {
          map.setView(mapAction.payload.center, mapAction.payload.zoom);
        }
        break;
      case 'pan_to':
        if (mapAction.payload.center) {
          map.panTo(mapAction.payload.center);
        }
        break;
      case 'set_zoom':
        if (mapAction.payload.zoom) {
          map.setZoom(mapAction.payload.zoom);
        }
        break;
    }
  }, [map, mapAction]);

  return null;
}

function LessonViewer() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      const response = await lessonAPI.get(id);
      setLesson(response.data);
    } catch (err) {
      setError('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading lesson...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!lesson || !lesson.steps || lesson.steps.length === 0) {
    return <div className="error">Lesson not found or has no steps</div>;
  }

  const currentStep = lesson.steps[currentStepIndex];
  const mapAction = currentStep?.map_action;

  const handleNext = () => {
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div>
      <h1 className="card-header">{lesson.title}</h1>
      <p>{lesson.description}</p>

      <div className="lesson-viewer">
        <div className="lesson-controls">
          <div className="lesson-step">
            <h3>
              Step {currentStepIndex + 1} of {lesson.steps.length}
            </h3>
            <div
              dangerouslySetInnerHTML={{ __html: currentStep.content }}
              style={{ marginTop: '1rem' }}
            />
          </div>
          <div className="lesson-navigation">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === lesson.steps.length - 1}
              className="btn btn-primary"
            >
              Next
            </button>
          </div>
        </div>

        <div className="map-container">
          <MapContainer
            center={[16.0, 108.0]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {mapAction && <MapController mapAction={mapAction} />}
            {mapAction?.action_type === 'add_marker' && mapAction.payload.position && (
              <Marker position={mapAction.payload.position}>
                {mapAction.payload.popup && (
                  <Popup>{mapAction.payload.popup}</Popup>
                )}
              </Marker>
            )}
            {mapAction?.action_type === 'add_geojson' && mapAction.payload.geojson && (
              <GeoJSON data={mapAction.payload.geojson} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default LessonViewer;
