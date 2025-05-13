import React, { useEffect, useRef } from 'react';
import './MapComponent.css';

const MapComponent = ({ userLocation, partnerLocation, setMapInstance }) => {
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize the map
  useEffect(() => {
    if (!window.google || !userLocation) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: userLocation.lat, lng: userLocation.lng },
      zoom: 17,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true
    });

    // Create user marker with custom icon
    const userMarker = new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      title: 'Your Location'
    });

    userMarkerRef.current = userMarker;
    mapInstanceRef.current = map;
    setMapInstance(map);

    return () => {
      // Cleanup
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      if (partnerMarkerRef.current) {
        partnerMarkerRef.current.setMap(null);
      }
    };
  }, [setMapInstance]);

  // Update user marker when location changes
  useEffect(() => {
    if (!userLocation || !userMarkerRef.current || !mapInstanceRef.current) return;

    const newPosition = { lat: userLocation.lat, lng: userLocation.lng };
    userMarkerRef.current.setPosition(newPosition);

    // Center map on user location if no partner location
    if (!partnerLocation) {
      mapInstanceRef.current.setCenter(newPosition);
    }
  }, [userLocation, partnerLocation]);

  // Handle partner marker
  useEffect(() => {
    if (!partnerLocation || !mapInstanceRef.current) return;

    const partnerPosition = { lat: partnerLocation.lat, lng: partnerLocation.lng };

    // Create or update partner marker
    if (!partnerMarkerRef.current) {
      const partnerMarker = new window.google.maps.Marker({
        position: partnerPosition,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EA4335',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        },
        title: 'Partner Location',
        animation: window.google.maps.Animation.DROP
      });
      partnerMarkerRef.current = partnerMarker;
    } else {
      partnerMarkerRef.current.setPosition(partnerPosition);
    }

    // Adjust map bounds to show both markers
    if (userLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
      bounds.extend(partnerPosition);
      mapInstanceRef.current.fitBounds(bounds);

      // Add some padding
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      mapInstanceRef.current.fitBounds(bounds, padding);

      // Don't zoom in too much on small distances
      const zoom = mapInstanceRef.current.getZoom();
      if (zoom > 18) {
        mapInstanceRef.current.setZoom(18);
      }
    }
  }, [partnerLocation, userLocation]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      {userLocation && partnerLocation && (
        <div className="distance-indicator">
          <span>Finding each other...</span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
