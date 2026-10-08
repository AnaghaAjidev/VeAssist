import React, { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// Automatically move map when location changes
const MapCenter = ({ location }) => {

    const map = useMap();

    useEffect(() => {

        if (location) {

            map.setView(
                [location.latitude, location.longitude],
                14
            );

        }

    }, [location, map]);

    return null;
};


const HelpMap = ({
    userLocation,
    locations = [],
    onLocationSelect,
}) => {

    const defaultCenter = [
        9.9312,
        76.2673,
    ];

    const center = userLocation
        ? [
            userLocation.latitude,
            userLocation.longitude,
        ]
        : defaultCenter;


    return (
        <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={true}
            className="w-full h-full min-h-[650px]"
        >

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {/* User Location */}

            {userLocation && (

                <Marker
                    position={[
                        userLocation.latitude,
                        userLocation.longitude,
                    ]}
                >

                    <Popup>

                        <div className="text-center">

                            <strong>
                                Your Location
                            </strong>

                            <p className="text-sm text-gray-500 mt-1">
                                You are here
                            </p>

                        </div>

                    </Popup>

                </Marker>

            )}


            {/* Nearby Locations */}

            {locations.map((location) => (

                <Marker
                    key={location.id}
                    position={[
                        location.latitude,
                        location.longitude,
                    ]}
                    eventHandlers={{
                        click: () => {

                            if (onLocationSelect) {

                                onLocationSelect(
                                    location
                                );

                            }

                        },
                    }}
                >

                    <Popup>

                        <div className="min-w-[180px]">

                            <h3 className="font-semibold text-[#0B1F3A]">
                                {location.name}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                {location.category}
                            </p>

                            {location.address && (

                                <p className="text-sm text-gray-600 mt-2">
                                    {location.address}
                                </p>

                            )}

                        </div>

                    </Popup>

                </Marker>

            ))}


            <MapCenter
                location={userLocation}
            />

        </MapContainer>
    );
};


export default HelpMap;