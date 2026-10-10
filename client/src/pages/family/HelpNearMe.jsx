import React, { useMemo, useRef, useState } from "react";



import { useNavigate } from "react-router-dom";



import HelpMap from "../../components/map/HelpMap";



import {

    getNearbyLocations,

    getNearbyECHSLocations,

} from "../../services/mapService";



import {

    MapPin,

    Search,

    Hospital,

    Building2,

    Pill,

    Navigation,

    Phone,

    Clock,

    LocateFixed,

    Landmark,

    Shield,

    Stethoscope,

    FlaskConical,

    X,

    ArrowLeft,

    ShieldCheck,

} from "lucide-react";



// ============================================================

// DISTRICT SAINIK WELFARE OFFICES

// NOTE: latitude/longitude are approximate (district civil station /

// town centre). Please verify them against the real office locations.

// ============================================================

const districtSainikOffices = [
    {
        id: "sainik-ernakulam",
        name: "Zila Sainik Welfare Office, Ernakulam",
        category: "District Sainik Welfare Offices",
        address: "Civil Station, Kakkanad, Ernakulam - 682030",
        latitude: 10.0159,
        longitude: 76.3425,
        phone: "0484-2422239",
        email: "zswoekm@gmail.com",
        distance: "Ernakulam district",
        openStatus: "Please contact the office to confirm hours",
    },
    {
        id: "sainik-alappuzha",
        name: "Zila Sainik Welfare Office, Alappuzha",
        category: "District Sainik Welfare Offices",
        address: "Arattuvazhi Road, Alappuzha - 688007",
        latitude: null,
        longitude: null,
        phone: "0477-2245673",
        email: "zswoalp@gmail.com",
        distance: "Alappuzha district",
        openStatus: "Please contact the office to confirm hours",
    },
    {
        id: "sainik-thrissur",
        name: "Zila Sainik Welfare Office, Thrissur",
        category: "District Sainik Welfare Offices",
        address: "Sainik Centre, Poothole, Thrissur - 680094",
        latitude: 10.51373,
        longitude: 76.20341,
        phone: "0487-2384037",
        email: "zswothrissur@gmail.com",
        distance: "Thrissur district",
        openStatus: "Please contact the office to confirm hours",
    },
    {
        id: "sainik-kollam",
        name: "Zila Sainik Welfare Office, Kollam",
        category: "District Sainik Welfare Offices",
        address: "Civil Station, Kollam - 691013",
        latitude: null,
        longitude: null,
        phone: "0474-2792987",
        email: "zswokollam@gmail.com",
        distance: "Kollam district",
        openStatus: "Please contact the office to confirm hours",
    },
    {
        id: "sainik-kannur",
        name: "Zila Sainik Welfare Office, Kannur",
        category: "District Sainik Welfare Offices",
        address: "Civil Station, Kannur - 670002",
        latitude: null,
        longitude: null,
        phone: "0497-2700069",
        email: "zswokannur@gmail.com",
        distance: "Kannur district",
        openStatus: "Please contact the office to confirm hours",
    },
    {
        id: "sainik-kozhikode",
        name: "Zila Sainik Welfare Office, Kozhikode",
        category: "District Sainik Welfare Offices",
        address: "Balan K. Nair Road, Kozhikode - 673001",
        latitude: null,
        longitude: null,
        phone: "0495-2771881",
        email: "kkdzswo@gmail.com",
        distance: "Kozhikode district",
        openStatus: "Please contact the office to confirm hours",
    },
];


const ECHS_RADIUS = 15000;

const NORMAL_RADIUS = 5000;



// ============================================================

// HELPERS

// ============================================================



// Sainik office coordinates are intentionally omitted until verified.

// Do not calculate or display exact distances for these records.

const sainikOffices = districtSainikOffices;

const normalizeDistrict = (value = "") =>
    String(value)
        .toLowerCase()
        .replace(/ district$/i, "")
        .replace(/\s+/g, " ")
        .trim();

// Map common ECHS polyclinic towns to their Kerala districts.
// Keep this matching name-based; ECHS records do not consistently include district fields.
const getECHSDistrict = (location) => {
    const text = normalizeDistrict(
        `${location?.name || ""} ${location?.address || ""}`
    );

    const townToDistrict = [
        ["kochi", "ernakulam"],
        ["ernakulam", "ernakulam"],
        ["alleppey", "alappuzha"],
        ["alappuzha", "alappuzha"],
        ["perinthalmanna", "malappuram"],
        ["malappuram", "malappuram"],
        ["kannur", "kannur"],
        ["cannanore", "kannur"],
        ["kozhikode", "kozhikode"],
        ["calicut", "kozhikode"],
        ["thrissur", "thrissur"],
        ["trichur", "thrissur"],
        ["kollam", "kollam"],
        ["quilon", "kollam"],
        ["palakkad", "palakkad"],
        ["palghat", "palakkad"],
        ["kottayam", "kottayam"],
        ["idukki", "idukki"],
        ["wayanad", "wayanad"],
        ["kalpetta", "wayanad"],
        ["kasaragod", "kasaragod"],
        ["pathanamthitta", "pathanamthitta"],
        ["thiruvananthapuram", "thiruvananthapuram"],
        ["trivandrum", "thiruvananthapuram"],
    ];

    const match = townToDistrict.find(([town]) =>
        new RegExp(`\\b${town}\\b`, "i").test(text)
    );

    return match ? match[1] : "";
};

const getDistrictFromCoordinates = async ({ latitude, longitude }) => {
    const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        zoom: "10",
        addressdetails: "1",
    });

    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params}`,
        { headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
        throw new Error("District lookup failed. Please try again.");
    }

    const data = await response.json();
    const address = data.address || {};
    const district =
        address.state_district ||
        address.district ||
        address.county ||
        address.city_district ||
        "";

    if (!district) {
        throw new Error("Could not identify a district from your GPS location.");
    }

    return district;
};



// ============================================================

// CATEGORIES

// ============================================================



const categories = [

    { name: "All", icon: MapPin },

    { name: "ECHS", icon: Hospital },

    { name: "Hospitals", icon: Hospital },

    { name: "Welfare Offices", icon: Building2 },

    { name: "Pharmacies", icon: Pill },

    { name: "Clinics", icon: Stethoscope },

    { name: "Government Offices", icon: Landmark },

    //{ name: "Diagnostic Centres", icon: FlaskConical },

    { name: "Police", icon: Shield },

    { name: "Banks", icon: Building2 },

    { name: "Post Offices", icon: Building2 },

    { name: "District Sainik Welfare Offices", icon: ShieldCheck },

];



const HelpNearMe = () => {

    const navigate = useNavigate();



    // ========================================================

    // STATE

    // ========================================================



    const [selectedCategory, setSelectedCategory] = useState("All");

    const [selectedLocation, setSelectedLocation] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [userLocation, setUserLocation] = useState(null);

    const [nearbyLocations, setNearbyLocations] = useState([]);

    const [echsLocations, setEchsLocations] = useState([]);

    const [loadingLocations, setLoadingLocations] = useState(false);

    const [echsError, setEchsError] = useState("");
    const [userDistrict, setUserDistrict] = useState("");
    const [districtError, setDistrictError] = useState("");
    const [loadingLocation, setLoadingLocation] = useState(false);



    // Avoid duplicate ECHS requests for the same user coordinates.

    const echsFetchedFor = useRef(null);

    const echsRequestRef = useRef({ key: null, promise: null });



    // ========================================================

    // LOCATIONS FOR SELECTED CATEGORY

    // Keep ordinary nearby, ECHS, and Sainik office data independent.

    // ========================================================



    const locationsForCategory = useMemo(() => {

        switch (selectedCategory) {

            case "All":

                return nearbyLocations;

            case "ECHS":
                if (!userDistrict) return [];
                return echsLocations.filter(
                    (location) =>
                        getECHSDistrict(location) === normalizeDistrict(userDistrict)
                );

            case "District Sainik Welfare Offices":
                if (!userDistrict) return [];
                return sainikOffices.filter(
                    (office) =>
                        normalizeDistrict(office.distance) ===
                        normalizeDistrict(userDistrict)
                );

            default:

                return nearbyLocations.filter(

                    (location) => location.category === selectedCategory

                );

        }

    }, [selectedCategory, nearbyLocations, echsLocations, userDistrict]);



    // ========================================================

    // SEARCH FILTER

    // ========================================================



    const filteredLocations = useMemo(() => {

        const search = searchTerm.trim().toLowerCase();



        if (!search) return locationsForCategory;



        return locationsForCategory.filter((location) =>

            [

                location.name,

                location.category,

                location.address,

                location.operator,

            ]

                .filter(Boolean)

                .join(" ")

                .toLowerCase()

                .includes(search)

        );

    }, [locationsForCategory, searchTerm]);



    // ========================================================

    // ECHS LOADER

    // ========================================================



    const loadECHS = async (location) => {

        const key = `${location.latitude},${location.longitude}`;



        if (echsFetchedFor.current === key) return echsLocations;



        // Reuse an active request for the same location.

        if (echsRequestRef.current.key === key && echsRequestRef.current.promise) {

            return echsRequestRef.current.promise;

        }



        setEchsError("");

        const request = getNearbyECHSLocations(

            location.latitude,

            location.longitude,

            ECHS_RADIUS

        )

            .then((locations) => {

                // Ignore a late response if a request for a newer location has

                // already replaced this in-flight request.

                if (echsRequestRef.current.key === key) {

                    setEchsLocations(locations);

                    echsFetchedFor.current = key;

                    setEchsError("");

                }

                return locations;

            })

            .catch((error) => {

                setEchsError(

                    error.message ||

                        "ECHS facilities are temporarily unavailable. Please try again."

                );

                throw error;

            })

            .finally(() => {

                if (echsRequestRef.current.key === key) {

                    echsRequestRef.current = { key: null, promise: null };

                }

            });



        echsRequestRef.current = { key, promise: request };

        return request;

    };



    // ========================================================

    // CATEGORY CHANGE

    // ========================================================



    const handleCategoryChange = async (category) => {

        setSelectedCategory(category);

        setSelectedLocation(null);

        if (category === "District Sainik Welfare Offices") {
            setDistrictError("");

            if (!userLocation) {
                setUserDistrict("");
                setDistrictError("Click Use My Location first to identify your district.");
                return;
            }

            try {
                const district = await getDistrictFromCoordinates(userLocation);
                setUserDistrict(district);
                setDistrictError("");
            } catch (error) {
                console.error("District lookup error:", error);
                setUserDistrict("");
                setDistrictError(error.message || "Unable to identify your district.");
            }
            return;
        }

        if (category !== "ECHS") return;



        if (!userLocation) {

            alert("Please use My Location first to find nearby ECHS facilities.");

            return;

        }



        try {
            const district = await getDistrictFromCoordinates(userLocation);
            setUserDistrict(district);
            setDistrictError("");
        } catch (error) {
            console.error("District lookup error:", error);
            setUserDistrict("");
            setDistrictError(error.message || "Unable to identify your district.");
            return;
        }

        const key = `${userLocation.latitude},${userLocation.longitude}`;

        if (echsFetchedFor.current === key) return;



        try {

            setLoadingLocations(true);

            await loadECHS(userLocation);

        } catch (error) {

            console.error("ECHS locations error:", error);

            // Keep API failure distinct from a successful empty result.

        } finally {

            setLoadingLocations(false);

        }

    };



    // ========================================================

    // GET CURRENT LOCATION

    // Load ordinary nearby results first. ECHS is queried only when selected.

    // ========================================================



    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                const locationKey = `${location.latitude},${location.longitude}`;
                const previousLocationKey = userLocation
                    ? `${userLocation.latitude},${userLocation.longitude}`
                    : null;

                // Update GPS state immediately; do not wait for API searches.
                setUserLocation(location);
                setLoadingLocation(false);
                setDistrictError("");
                setEchsError("");

                if (previousLocationKey !== locationKey) {
                    echsFetchedFor.current = null;
                    setNearbyLocations([]);
                    setEchsLocations([]);
                }

                if (
                    selectedCategory === "District Sainik Welfare Offices" ||
                    selectedCategory === "ECHS"
                ) {
                    try {
                        const district = await getDistrictFromCoordinates(location);
                        setUserDistrict(district);
                        setDistrictError("");
                    } catch (error) {
                        console.error("District lookup error:", error);
                        setUserDistrict("");
                        setDistrictError(
                            error.message || "Unable to identify your district."
                        );
                        if (selectedCategory === "District Sainik Welfare Offices") {
                            return;
                        }
                    }

                    if (selectedCategory === "District Sainik Welfare Offices") {
                        return;
                    }
                }

                setLoadingLocations(true);
                try {
                    const normalResult = await getNearbyLocations(
                        location.latitude,
                        location.longitude,
                        NORMAL_RADIUS
                    );
                    setNearbyLocations(normalResult);

                    if (selectedCategory === "ECHS") {
                        try {
                            await loadECHS(location);
                        } catch (error) {
                            console.error("ECHS locations error:", error);
                        }
                    }
                } catch (error) {
                    console.error("Nearby locations error:", error);
                    alert(
                        error.message ||
                            "Unable to load nearby locations. Please try again."
                    );
                } finally {
                    setLoadingLocations(false);
                }
            },
            (error) => {
                setLoadingLocation(false);
                console.error("Location error:", error);

                const message =
                    error.code === 1
                        ? "Location permission was denied. Please allow location access."
                        : error.code === 3
                          ? "Getting your location timed out. Check device location settings and try again."
                          : "Unable to access your location. Please try again.";

                alert(message);
            },
            { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
        );
    };

    // DIRECTIONS

    // ========================================================



    const handleDirections = (location) => {

        const destination =

            location.latitude != null && location.longitude != null

                ? `${location.latitude},${location.longitude}`

                : location.address;



        if (!destination) {

            alert("Location details are unavailable.");

            return;

        }



        window.open(

            `https\://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,

            "_blank",

            "noopener,noreferrer"

        );

    };



    // ========================================================

    // CALL

    // ========================================================



    const handleCall = (phone) => {

        if (!phone) return;



        window.location.href = `tel:${phone}`;

    };



    // ========================================================

    // UI

    // ========================================================



    return (

        <div className="min-h-screen bg-[#F4F8FC]">

            {/* HEADER */}

            <div className="bg-white border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        {/* LEFT SIDE - TITLE */}

                        <div className="flex items-center gap-4">

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



                        {/* RIGHT SIDE - DASHBOARD + LOCATION */}

                        <div className="flex items-center gap-3">

                            {/* USE LOCATION */}

                            <button

                                onClick={handleGetLocation}

                                disabled={loadingLocation}

                                className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-5 py-3 rounded-xl hover:bg-[#1F4E79] transition disabled:opacity-60 disabled:cursor-not-allowed"

                            >

                                <LocateFixed size={18} />



                                {loadingLocation
                                    ? "Getting Location..."
                                    : loadingLocations
                                      ? "Loading..."
                                      : "Use My Location"}

                            </button>



                            {/* DASHBOARD */}

                            <button

                                onClick={() => navigate("/family/dashboard")}

                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-medium hover:bg-[#1F4E79] transition shrink-0"

                            >

                                <ArrowLeft size={16} />



                                <span>Dashboard</span>

                            </button>

                        </div>

                    </div>

                </div>

            </div>



            {/* MAIN CONTENT */}

            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

                {/* SEARCH */}

                <div className="mb-6">

                    <div className="relative max-w-xl">

                        <Search

                            size={20}

                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"

                        />



                        <input

                            type="text"

                            value={searchTerm}

                            onChange={(e) => setSearchTerm(e.target.value)}

                            placeholder="Search hospitals, ECHS, pharmacies, offices..."

                            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"

                        />

                    </div>

                </div>



                {/* CATEGORIES */}

                <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-thin">

                    {categories.map((category) => {

                        const Icon = category.icon;



                        const isActive = selectedCategory === category.name;



                        return (

                            <button

                                key={category.name}

                                onClick={() =>

                                    handleCategoryChange(category.name)

                                }

                                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl border transition ${

                                    isActive

                                        ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"

                                        : "bg-white text-[#0B1F3A] border-slate-200 hover:border-[#1F4E79]"

                                }`}

                            >

                                <Icon size={17} />



                                {category.name}

                            </button>

                        );

                    })}

                </div>



                {/* MAP + LOCATIONS */}

                <div className="grid lg:grid-cols-[1fr_380px] gap-6">

                    {/* MAP */}

                    <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[650px]">

                        <HelpMap

                            userLocation={userLocation}

                            locations={filteredLocations}

                            selectedLocation={selectedLocation}

                            onLocationSelect={setSelectedLocation}

                        />

                    </div>



                    {/* NEARBY LOCATIONS */}

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

                        {/* HEADER */}

                        <div className="p-5 border-b border-slate-200">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-lg font-bold text-[#0B1F3A]">

                                        {selectedCategory === "ECHS"

                                            ? "Nearby ECHS"

                                            : selectedCategory === "District Sainik Welfare Offices"

                                              ? "District Sainik Welfare Offices"

                                              : "Nearby Places"}

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



                        {/* LOCATION LIST */}

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

                                        {selectedCategory === "ECHS"

                                            ? echsError

                                                ? "ECHS search temporarily unavailable"

                                                : userLocation

                                                  ? "No ECHS locations found"

                                                  : "Use My Location to search ECHS"

                                            : selectedCategory === "District Sainik Welfare Offices"

                                              ? "No offices match your search"

                                              : "No locations loaded yet"}

                                    </h3>



                                    <p className="text-sm text-gray-500 mt-2">

                                        {selectedCategory === "ECHS"

                                            ? echsError || (userLocation

                                                ? "The search completed but no matching ECHS facilities were found in the available map data."

                                                : "Please use My Location before searching for nearby ECHS facilities.")

                                            : selectedCategory === "District Sainik Welfare Offices"

                                              ? "Try a different search term to find a district Sainik Welfare Office."

                                              : "Use My Location to load nearby hospitals, welfare offices, pharmacies, clinics and other useful places."}

                                    </p>

                                </div>

                            ) : (

                                <div>

                                    {filteredLocations.map((location) => (

                                        <button

                                            key={location.id}

                                            onClick={() =>

                                                setSelectedLocation(location)

                                            }

                                            className="w-full text-left p-5 border-b border-slate-100 hover:bg-[#F8FBFF] transition"

                                        >

                                            <div className="flex gap-4">

                                                <div className="w-11 h-11 rounded-xl bg-[#EAF3FF] flex items-center justify-center text-[#1F4E79] shrink-0">

                                                    <MapPin size={21} />

                                                </div>



                                                <div className="min-w-0">

                                                    <h3 className="font-semibold text-[#0B1F3A]">

                                                        {location.name}

                                                    </h3>



                                                    <p className="text-xs text-[#1F4E79] mt-1">

                                                        {location.category}

                                                    </p>



                                                    <p className="text-sm text-gray-500 mt-1">

                                                        {location.distanceValue != null ? `${location.distance} away` : location.distance || "Distance unavailable"}

                                                    </p>



                                                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">

                                                        <Clock size={14} />



                                                        {location.openStatus}

                                                    </div>

                                                </div>

                                            </div>

                                        </button>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>



            {/* LOCATION DETAILS MODAL */}

            {selectedLocation && (

                <div className="fixed inset-0 z-[5000] bg-black/40 flex items-center justify-center p-5">

                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                        <div className="p-6">

                            {/* HEADER */}

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

                                    onClick={() => setSelectedLocation(null)}

                                    className="text-gray-400 hover:text-gray-700"

                                >

                                    <X size={21} />

                                </button>

                            </div>



                            {/* DETAILS */}

                            <div className="mt-6 space-y-4">

                                {/* DISTANCE */}

                                <div className="flex items-center gap-3">

                                    <Navigation

                                        size={18}

                                        className="text-[#1F4E79]"

                                    />



                                    <span className="text-gray-600">

                                        {selectedLocation.distanceValue != null ? `${selectedLocation.distance} away` : selectedLocation.distance || "Distance unavailable"}

                                    </span>

                                </div>



                                {/* ADDRESS */}

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



                                {/* OPENING HOURS */}

                                <div className="flex items-start gap-3">

                                    <Clock

                                        size={18}

                                        className="text-[#1F4E79] mt-1 flex-shrink-0"

                                    />



                                    <span className="text-gray-600">

                                        {selectedLocation.openStatus}

                                    </span>

                                </div>



                                {/* PHONE */}

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



                                {/* EMAIL */}

                                {selectedLocation.email && (

                                    <div className="flex items-start gap-3">

                                        <span className="text-[#1F4E79] font-semibold">@</span>

                                        <a

                                            href={`mailto:${selectedLocation.email}`}

                                            className="text-blue-700 underline break-all"

                                        >

                                            {selectedLocation.email}

                                        </a>

                                    </div>

                                )}

                            </div>



                            {/* ACTION BUTTONS */}

                            <div className="grid grid-cols-2 gap-3 mt-7">

                                <button

                                    onClick={() =>

                                        handleDirections(selectedLocation)

                                    }

                                    className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-4 py-3 rounded-xl hover:bg-[#1F4E79] transition"

                                >

                                    <Navigation size={17} />



                                    Get Directions

                                </button>



                                <button

                                    onClick={() =>

                                        handleCall(selectedLocation.phone)

                                    }

                                    disabled={!selectedLocation.phone}

                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition ${

                                        selectedLocation.phone

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