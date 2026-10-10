import React, { useEffect, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_CENTER = [9.9312, 76.2673];
const DEFAULT_ZOOM = 12;
const USER_ZOOM = 14;
const OFFICE_ZOOM = 15;

const hasValidCoordinates = (location) => {
    if (!location) return false;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    return (
        location.latitude !== null &&
        location.latitude !== undefined &&
        location.latitude !== "" &&
        location.longitude !== null &&
        location.longitude !== undefined &&
        location.longitude !== "" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
};

const toLatLng = (location) => [
    Number(location.latitude),
    Number(location.longitude),
];

// Update map view when the user location or displayed offices change.
const MapCenter = ({ userLocation, locations }) => {
    const map = useMap();

    const points = useMemo(() => {
        const result = [];

        if (hasValidCoordinates(userLocation)) {
            result.push(toLatLng(userLocation));
        }

        locations.forEach((location) => {
            if (hasValidCoordinates(location)) {
                result.push(toLatLng(location));
            }
        });

        return result;
    }, [userLocation, locations]);

    const pointsKey = points
        .map(([latitude, longitude]) => `${latitude},${longitude}`)
        .join("|");

    useEffect(() => {
        if (!points.length) {
            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
            return;
        }

        if (points.length === 1) {
            map.setView(points[0], USER_ZOOM, {
                animate: false,
            });
            return;
        }

        map.fitBounds(points, {
            padding: [40, 40],
            maxZoom: USER_ZOOM,
            animate: false,
        });
    }, [map, pointsKey]);

    return null;
};

// Center the map when a user selects an office from the list.
const SelectedLocationCenter = ({ selectedLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (!hasValidCoordinates(selectedLocation)) return;

        map.flyTo(
            toLatLng(selectedLocation),
            Math.max(map.getZoom(), OFFICE_ZOOM),
            { duration: 0.5 }
        );
    }, [map, selectedLocation]);

    return null;
};

const HelpMap = ({
    userLocation,
    locations = [],
    selectedLocation = null,
    onLocationSelect,
}) => {
    // Only locations with valid coordinates can have map markers.
    const validLocations = useMemo(
        () => locations.filter(hasValidCoordinates),
        [locations]
    );

    const initialCenter = hasValidCoordinates(userLocation)
        ? toLatLng(userLocation)
        : DEFAULT_CENTER;

    return (
        <MapContainer
            center={initialCenter}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            className="w-full h-full min-h-[650px]"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Current user location */}
            {hasValidCoordinates(userLocation) && (
                <Marker position={toLatLng(userLocation)}>
                    <Popup>
                        <div className="text-center">
                            <strong>Your Current Location</strong>
                            <p className="text-sm text-gray-500 mt-1">
                                Your detected GPS position
                            </p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Display only the locations supplied by HelpNearMe.jsx */}
            {validLocations.map((location, index) => (
                <Marker
                    key={
                        location.id ??
                        `${location.name}-${location.latitude}-${location.longitude}-${index}`
                    }
                    position={toLatLng(location)}
                    eventHandlers={{
                        click: () => onLocationSelect?.(location),
                    }}
                >
                    <Popup>
                        <div className="min-w-[200px] max-w-[280px]">
                            <h3 className="font-semibold text-[#0B1F3A]">
                                {location.name || "Unnamed Location"}
                            </h3>

                            {location.category && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {location.category}
                                </p>
                            )}

                            {location.address && (
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Address:</strong>{" "}
                                    {location.address}
                                </p>
                            )}

                            {location.phone && (
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Phone:</strong>{" "}
                                    <a
                                        href={`tel:${location.phone}`}
                                        className="text-blue-700 underline"
                                    >
                                        {location.phone}
                                    </a>
                                </p>
                            )}

                            {location.openStatus && (
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Hours:</strong>{" "}
                                    {location.openStatus}
                                </p>
                            )}

                            {location.website && (
                                <p className="text-sm mt-2">
                                    <a
                                        href={location.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-700 underline"
                                    >
                                        Visit Website
                                    </a>
                                </p>
                            )}

                            {location.email && (
                                <p className="text-sm mt-2">
                                    <a
                                        href={`mailto:${location.email}`}
                                        className="text-blue-700 underline break-all"
                                    >
                                        {location.email}
                                    </a>
                                </p>
                            )}

                            {(hasValidCoordinates(location) ||
                                location.address) && (
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                        hasValidCoordinates(location)
                                            ? `${location.latitude},${location.longitude}`
                                            : location.address
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-sm font-medium text-blue-700 underline"
                                >
                                    Get Directions
                                </a>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}

            <MapCenter
                userLocation={userLocation}
                locations={validLocations}
            />

            <SelectedLocationCenter
                selectedLocation={selectedLocation}
            />
        </MapContainer>
    );
};

export default HelpMap;