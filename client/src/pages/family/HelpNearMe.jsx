import React, { useState } from "react";
import HelpMap from "../../components/map/HelpMap";
import { getNearbyLocations } from "../../services/mapService";

import {
    MapPin,
    Search,
    Hospital,
    Building2,
    Pill,
    Cross,
    Navigation,
    Phone,
    Clock,
    LocateFixed,
    Landmark,
    Shield,
    Stethoscope,
    FlaskConical,
    Siren,
    X,
} from "lucide-react";


const HelpNearMe = () => {

    const [selectedCategory, setSelectedCategory] = useState("All");

    const [selectedLocation, setSelectedLocation] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [userLocation, setUserLocation] = useState(null);

    const [nearbyLocations, setNearbyLocations] = useState([]);

    const [loadingLocations, setLoadingLocations] = useState(false);

    const categories = [
        {
            name: "All",
            icon: MapPin,
        },
        {
            name: "ECHS",
            icon: Hospital,
        },
        {
            name: "Hospitals",
            icon: Hospital,
        },
        {
            name: "Welfare Offices",
            icon: Building2,
        },
        {
            name: "Pharmacies",
            icon: Pill,
        },
        {
            name: "Clinics",
            icon: Stethoscope,
        },
        {
            name: "Government Offices",
            icon: Landmark,
        },
        {
            name: "Diagnostic Centres",
            icon: FlaskConical,
        },
        {
            name: "Police",
            icon: Shield,
        },
        {
            name: "Emergency",
            icon: Siren,
        },
    ];


    /*
     * Actual nearby locations will be loaded
     * from the map/place service later.
     */



    const filteredLocations = nearbyLocations.filter((location) => {

        const matchesCategory =
            selectedCategory === "All" ||
            location.category === selectedCategory;

        const matchesSearch =
            location.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;

    });


    const handleGetLocation = () => {

        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        setLoadingLocations(true);


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                const location = {
                    latitude,
                    longitude,
                };


                setUserLocation(location);


                try {

                    const locations =
                        await getNearbyLocations(
                            latitude,
                            longitude,
                            5000
                        );


                    setNearbyLocations(
                        locations
                    );


                    console.log(
                        "Nearby locations:",
                        locations
                    );

                } catch (error) {

                    console.error(
                        "Nearby locations error:",
                        error
                    );


                    alert(
                        "Unable to load nearby locations. Please try again."
                    );

                } finally {

                    setLoadingLocations(false);

                }

            },


            (error) => {

                console.error(
                    "Location error:",
                    error
                );


                setLoadingLocations(false);


                alert(
                    "Unable to access your location. Please allow location access."
                );

            },


            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }

        );

    };


    const handleDirections = (location) => {

        if (!location?.latitude || !location?.longitude) {
            return;
        }

        const url =
            `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;

        window.open(
            url,
            "_blank"
        );

    };


    const handleCall = (phone) => {

        if (!phone) {
            return;
        }

        window.location.href =
            `tel:${phone}`;

    };


    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* Header */}

            <div className="bg-white border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="w-11 h-11 rounded-xl bg-[#EAF3FF] flex items-center justify-center text-[#1F4E79]">

                                    <MapPin size={24} />

                                </div>

                                <div>

                                    <h1 className="text-2xl font-bold text-[#0B1F3A]">

                                        Help Near Me

                                    </h1>

                                    <p className="text-sm text-gray-500">

                                        Find important services and facilities near your location

                                    </p>

                                </div>

                            </div>

                        </div>


                        <button
                            onClick={handleGetLocation}
                            className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-5 py-3 rounded-xl hover:bg-[#1F4E79] transition"
                        >

                            <LocateFixed size={18} />

                            Use My Location

                        </button>

                    </div>

                </div>

            </div>


            {/* Main Content */}

            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

                {/* Search */}

                <div className="mb-6">

                    <div className="relative max-w-xl">

                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="Search hospitals, ECHS, pharmacies, offices..."
                            className="
                                w-full
                                bg-white
                                border border-slate-200
                                rounded-xl
                                pl-12 pr-4
                                py-3
                                outline-none
                                focus:ring-2
                                focus:ring-[#1F4E79]
                            "
                        />

                    </div>

                </div>


                {/* Categories */}

                <div className="flex gap-3 overflow-x-auto pb-4 mb-6">

                    {categories.map((category) => {

                        const Icon =
                            category.icon;

                        const isActive =
                            selectedCategory === category.name;

                        return (

                            <button
                                key={category.name}
                                onClick={() =>
                                    setSelectedCategory(
                                        category.name
                                    )
                                }
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    whitespace-nowrap
                                    px-4
                                    py-2.5
                                    rounded-xl
                                    border
                                    transition
                                    ${isActive
                                        ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                                        : "bg-white text-[#0B1F3A] border-slate-200 hover:border-[#1F4E79]"
                                    }
                                `}
                            >

                                <Icon size={17} />

                                {category.name}

                            </button>

                        );

                    })}

                </div>


                {/* Map + Locations */}

                <div className="grid lg:grid-cols-[1fr_380px] gap-6">


                    {/* Map */}

                    <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[650px]">

                        <HelpMap
                            userLocation={userLocation}
                            locations={filteredLocations}
                            onLocationSelect={setSelectedLocation}
                        />

                    </div>


                    {/* Nearby Locations */}

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

                        <div className="p-5 border-b border-slate-200">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-lg font-bold text-[#0B1F3A]">

                                        Nearby Places

                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">

                                        {filteredLocations.length} locations found

                                    </p>

                                </div>

                                <Navigation
                                    size={20}
                                    className="text-[#1F4E79]"
                                />

                            </div>

                        </div>


                        <div className="max-h-[590px] overflow-y-auto">

                            {filteredLocations.length === 0 ? (

                                <div className="p-8 text-center">

                                    <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">

                                        <MapPin
                                            size={25}
                                            className="text-gray-400"
                                        />

                                    </div>

                                    <h3 className="font-semibold text-[#0B1F3A]">

                                        No locations loaded yet

                                    </h3>

                                    <p className="text-sm text-gray-500 mt-2">

                                        Nearby hospitals, ECHS facilities,
                                        welfare offices, pharmacies and
                                        other useful places will appear here.

                                    </p>

                                </div>

                            ) : (

                                <div>

                                    {filteredLocations.map(
                                        (location) => (

                                            <button
                                                key={location.id}
                                                onClick={() =>
                                                    setSelectedLocation(
                                                        location
                                                    )
                                                }
                                                className="w-full text-left p-5 border-b border-slate-100 hover:bg-[#F8FBFF] transition"
                                            >

                                                <div className="flex gap-4">

                                                    <div className="w-11 h-11 rounded-xl bg-[#EAF3FF] flex items-center justify-center text-[#1F4E79] shrink-0">

                                                        <MapPin
                                                            size={21}
                                                        />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <h3 className="font-semibold text-[#0B1F3A]">

                                                            {location.name}

                                                        </h3>

                                                        <p className="text-sm text-gray-500 mt-1">

                                                            {location.distance} away

                                                        </p>

                                                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">

                                                            <Clock size={14} />

                                                            {location.openStatus}

                                                        </div>

                                                    </div>

                                                </div>

                                            </button>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* Location Details Modal */}

            {selectedLocation && (

                <div className="fixed inset-0 z-[5000] bg-black/40 flex items-center justify-center p-5">

                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                        <div className="p-6">

                            <div className="flex items-start justify-between gap-4">

                                <div className="flex items-center gap-3">

                                    <div className="w-12 h-12 rounded-xl bg-[#EAF3FF] flex items-center justify-center text-[#1F4E79]">

                                        <MapPin size={24} />

                                    </div>

                                    <div>

                                        <h2 className="text-xl font-bold text-[#0B1F3A]">

                                            {selectedLocation.name}

                                        </h2>

                                        <p className="text-sm text-gray-500">

                                            {selectedLocation.category}

                                        </p>

                                    </div>

                                </div>


                                <button
                                    onClick={() =>
                                        setSelectedLocation(null)
                                    }
                                    className="text-gray-400 hover:text-gray-700"
                                >

                                    <X size={21} />

                                </button>

                            </div>


                            <div className="mt-6 space-y-4">

                                {/* Distance */}
                                <div className="flex items-center gap-3">

                                    <Navigation
                                        size={18}
                                        className="text-[#1F4E79]"
                                    />

                                    <span className="text-gray-600">

                                        {selectedLocation.distance} away

                                    </span>

                                </div>


                                {/* Address */}
                                {selectedLocation.address ? (

                                    <div className="flex items-start gap-3">

                                        <MapPin
                                            size={18}
                                            className="text-[#1F4E79] mt-1 flex-shrink-0"
                                        />

                                        <span className="text-gray-600">

                                            {selectedLocation.address}

                                        </span>

                                    </div>

                                ) : (

                                    <div className="flex items-start gap-3">

                                        <MapPin
                                            size={18}
                                            className="text-gray-400 mt-1 flex-shrink-0"
                                        />

                                        <span className="text-gray-400">

                                            Address not available

                                        </span>

                                    </div>

                                )}


                                {/* Opening Hours */}
                                <div className="flex items-start gap-3">

                                    <Clock
                                        size={18}
                                        className="text-[#1F4E79] mt-1 flex-shrink-0"
                                    />

                                    <span className="text-gray-600">

                                        {selectedLocation.openStatus}

                                    </span>

                                </div>


                                {/* Phone */}
                                {selectedLocation.phone && (

                                    <div className="flex items-center gap-3">

                                        <Phone
                                            size={18}
                                            className="text-[#1F4E79]"
                                        />

                                        <span className="text-gray-600">

                                            {selectedLocation.phone}

                                        </span>

                                    </div>

                                )}

                            </div>


                            <div className="grid grid-cols-2 gap-3 mt-7">

                                <button
                                    onClick={() =>
                                        handleDirections(
                                            selectedLocation
                                        )
                                    }
                                    className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-4 py-3 rounded-xl hover:bg-[#1F4E79] transition"
                                >

                                    <Navigation size={17} />

                                    Get Directions

                                </button>


                                <button
                                    onClick={() =>
                                        handleCall(
                                            selectedLocation.phone
                                        )
                                    }
                                    disabled={!selectedLocation.phone}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition ${selectedLocation.phone
                                            ? "border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"
                                            : "border border-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Phone size={17} />

                                    {selectedLocation.phone
                                        ? "Call"
                                        : "Phone Unavailable"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default HelpNearMe;