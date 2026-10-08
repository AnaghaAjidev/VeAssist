// ============================================================
// VeAssist - Map Controller
// ============================================================

const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
];


// ============================================================
// NORMAL CATEGORY TAGS
// ECHS IS INTENTIONALLY NOT INCLUDED HERE
// ============================================================

const CATEGORY_TAGS = {

    Hospitals: [
        ["amenity", "hospital"],
        ["healthcare", "hospital"],
    ],

    Pharmacies: [
        ["amenity", "pharmacy"],
        ["healthcare", "pharmacy"],
    ],

    Clinics: [
        ["amenity", "clinic"],
        ["amenity", "doctors"],
        ["healthcare", "clinic"],
        ["healthcare", "doctor"],
    ],

    "Welfare Offices": [
        ["amenity", "social_facility"],
        ["office", "government"],
        ["office", "association"],
        ["office", "charity"],
        ["office", "ngo"],
    ],

    "Diagnostic Centres": [
        ["healthcare", "laboratory"],
        ["healthcare", "medical_imaging"],
        ["healthcare", "sample_collection"],
        ["healthcare", "diagnostic"],
        ["healthcare:speciality", "diagnostic_radiology"],
        ["healthcare:speciality", "clinical_pathology"],
    ],

    "Government Offices": [
        ["office", "government"],
    ],

    Police: [
        ["amenity", "police"],
    ],

    Banks: [
        ["amenity", "bank"],
    ],

    "Post Offices": [
        ["amenity", "post_office"],
    ],
};


// ============================================================
// CACHE
// ============================================================

const locationCache = new Map();

const CACHE_DURATION = 60 * 1000;


// ============================================================
// DISTANCE
// ============================================================

const calculateDistance = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
) => {

    const earthRadius = 6371;

    const dLatitude =
        ((latitude2 - latitude1) * Math.PI) / 180;

    const dLongitude =
        ((longitude2 - longitude1) * Math.PI) / 180;

    const a =
        Math.sin(dLatitude / 2) *
            Math.sin(dLatitude / 2) +
        Math.cos((latitude1 * Math.PI) / 180) *
            Math.cos((latitude2 * Math.PI) / 180) *
            Math.sin(dLongitude / 2) *
            Math.sin(dLongitude / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
};


// ============================================================
// FORMAT DISTANCE
// ============================================================

const formatDistance = (distance) => {

    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }

    return `${distance.toFixed(1)} km`;
};


// ============================================================
// ADDRESS
// ============================================================

const buildAddress = (tags) => {

    const parts = [];

    if (tags["addr:housenumber"]) {
        parts.push(tags["addr:housenumber"]);
    }

    if (tags["addr:street"]) {
        parts.push(tags["addr:street"]);
    }

    if (tags["addr:suburb"]) {
        parts.push(tags["addr:suburb"]);
    }

    if (tags["addr:city"]) {
        parts.push(tags["addr:city"]);
    }

    if (tags["addr:district"]) {
        parts.push(tags["addr:district"]);
    }

    if (tags["addr:state"]) {
        parts.push(tags["addr:state"]);
    }

    if (tags["addr:postcode"]) {
        parts.push(tags["addr:postcode"]);
    }

    return parts.join(", ");
};


// ============================================================
// CATEGORY DETECTION
// ============================================================

const getCategory = (tags) => {

    const name = (
        tags.name ||
        tags["name:en"] ||
        tags.official_name ||
        tags["official_name:en"] ||
        ""
    ).toLowerCase();

    const operator = (
        tags.operator ||
        tags["operator:en"] ||
        ""
    ).toLowerCase();

    const socialFor = (
        tags["social_facility:for"] ||
        ""
    ).toLowerCase();

    const healthcareSpeciality = (
        tags["healthcare:speciality"] ||
        ""
    ).toLowerCase();


    // ========================================================
    // ECHS
    // This is also used when ECHS data is returned separately.
    // ========================================================

    if (
        name.includes("echs") ||
        name.includes("ex-servicemen") ||
        name.includes("ex servicemen") ||
        name.includes("exservicemen") ||
        name.includes("veteran") ||
        operator.includes("echs") ||
        operator.includes("ex-servicemen") ||
        operator.includes("veteran")
    ) {
        return "ECHS";
    }


    // ========================================================
    // WELFARE
    // ========================================================

    if (
        name.includes("welfare") ||
        name.includes("social welfare") ||
        name.includes("sainik board") ||
        name.includes("zila sainik") ||
        name.includes("district sainik") ||
        name.includes("ex-servicemen welfare") ||
        name.includes("ex servicemen welfare") ||
        name.includes("veteran welfare") ||
        operator.includes("welfare") ||
        operator.includes("sainik board") ||
        operator.includes("ex-servicemen") ||
        socialFor.includes("veteran")
    ) {
        return "Welfare Offices";
    }


    // ========================================================
    // DIAGNOSTIC CENTRES
    // ========================================================

    if (
        tags.healthcare === "laboratory" ||
        tags.healthcare === "medical_imaging" ||
        tags.healthcare === "sample_collection" ||
        tags.healthcare === "diagnostic" ||
        healthcareSpeciality.includes("diagnostic_radiology") ||
        healthcareSpeciality.includes("clinical_pathology") ||
        name.includes("diagnostic") ||
        name.includes("diagnostics") ||
        name.includes("laboratory") ||
        name.includes("lab") ||
        name.includes("pathology") ||
        name.includes("imaging")
    ) {
        return "Diagnostic Centres";
    }


    // ========================================================
    // HOSPITALS
    // ========================================================

    if (
        tags.amenity === "hospital" ||
        tags.healthcare === "hospital"
    ) {
        return "Hospitals";
    }


    // ========================================================
    // PHARMACIES
    // ========================================================

    if (
        tags.amenity === "pharmacy" ||
        tags.healthcare === "pharmacy"
    ) {
        return "Pharmacies";
    }


    // ========================================================
    // CLINICS
    // ========================================================

    if (
        tags.amenity === "clinic" ||
        tags.amenity === "doctors" ||
        tags.healthcare === "clinic" ||
        tags.healthcare === "doctor"
    ) {
        return "Clinics";
    }


    // ========================================================
    // POLICE
    // ========================================================

    if (tags.amenity === "police") {
        return "Police";
    }


    // ========================================================
    // BANKS
    // ========================================================

    if (tags.amenity === "bank") {
        return "Banks";
    }


    // ========================================================
    // POST OFFICES
    // ========================================================

    if (tags.amenity === "post_office") {
        return "Post Offices";
    }


    // ========================================================
    // GOVERNMENT OFFICES
    // ========================================================

    if (tags.office === "government") {
        return "Government Offices";
    }


    return "Other";
};


// ============================================================
// BUILD NORMAL OVERPASS QUERY
// ============================================================
const buildOverpassQuery = (latitude, longitude, radius) => {
    return `
        [out:json][timeout:25];

        (
            node(around:${radius},${latitude},${longitude})
                ["amenity"~"hospital|pharmacy|clinic|doctors|social_facility|police|bank|post_office"];

            way(around:${radius},${latitude},${longitude})
                ["amenity"~"hospital|pharmacy|clinic|doctors|social_facility|police|bank|post_office"];

            node(around:${radius},${latitude},${longitude})
                ["healthcare"~"hospital|pharmacy|clinic|doctor|laboratory|medical_imaging|sample_collection|diagnostic"];

            way(around:${radius},${latitude},${longitude})
                ["healthcare"~"hospital|pharmacy|clinic|doctor|laboratory|medical_imaging|sample_collection|diagnostic"];

            node(around:${radius},${latitude},${longitude})
                ["office"~"government|association|charity|ngo"];

            way(around:${radius},${latitude},${longitude})
                ["office"~"government|association|charity|ngo"];
        );

        out center tags;
    `;
};

// ============================================================
// BUILD ECHS QUERY
// ============================================================

const buildECHSQuery = (
    latitude,
    longitude,
    radius
) => {

    return `
        [out:json][timeout:20];

        (
            nwr(
                around:${radius},
                ${latitude},
                ${longitude}
            )["name"~"echs|ex-servicemen|ex servicemen|exservicemen|veteran",i];

            nwr(
                around:${radius},
                ${latitude},
                ${longitude}
            )["official_name"~"echs|ex-servicemen|ex servicemen|exservicemen|veteran",i];

            nwr(
                around:${radius},
                ${latitude},
                ${longitude}
            )["operator"~"echs|ex-servicemen|ex servicemen|exservicemen|veteran",i];

            nwr(
                around:${radius},
                ${latitude},
                ${longitude}
            )["social_facility:for"~"veteran",i];
        );

        out center tags;
    `;
};


// ============================================================
// REQUEST OVERPASS
// ============================================================

const requestOverpass = async (query) => {

    let lastError = null;


    for (const url of OVERPASS_URLS) {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                30000
            );


        try {

            console.log(
                "Trying Overpass server:",
                url
            );


            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded; charset=UTF-8",

                            "User-Agent":
                                "VeAssist/1.0",
                        },

                        body:
                            new URLSearchParams({
                                data: query,
                            }).toString(),

                        signal:
                            controller.signal,
                    }
                );


            clearTimeout(timeout);


            if (!response.ok) {

                const errorText =
                    await response.text();


                console.warn(
                    "Overpass server failed:",
                    url,
                    response.status,
                    errorText.substring(0, 500)
                );


                lastError =
                    new Error(
                        `Overpass server returned ${response.status}`
                    );


                continue;
            }


            const data =
                await response.json();


            console.log(
                "Overpass server succeeded:",
                url
            );


            return data;

        } catch (error) {

            clearTimeout(timeout);


            console.warn(
                "Overpass connection failed:",
                url,
                error.message
            );


            lastError = error;
        }
    }


    throw (
        lastError ||
        new Error(
            "All Overpass servers failed."
        )
    );
};


// ============================================================
// FORMAT LOCATION RESULTS
// ============================================================

const formatLocationResults = (
    data,
    latitude,
    longitude,
    categoryFilter = null
) => {

    const results = [];

    const seenIds = new Set();


    for (const element of data.elements || []) {

        const tags =
            element.tags || {};


        const elementLatitude =
            element.lat ??
            element.center?.lat;


        const elementLongitude =
            element.lon ??
            element.center?.lon;


        if (
            elementLatitude === undefined ||
            elementLatitude === null ||
            elementLongitude === undefined ||
            elementLongitude === null
        ) {
            continue;
        }


        const locationName =
            tags.name ||
            tags["name:en"] ||
            tags.official_name ||
            tags["official_name:en"];


        if (!locationName) {
            continue;
        }


        const id =
            `${element.type}-${element.id}`;


        if (seenIds.has(id)) {
            continue;
        }


        seenIds.add(id);


        const category =
            getCategory(tags);


        if (
            categoryFilter &&
            category !== categoryFilter
        ) {
            continue;
        }


        // Don't show unrelated OSM social facilities
        // in the normal "All" result.
        if (
            !categoryFilter &&
            category === "Other"
        ) {
            continue;
        }


        const distance =
            calculateDistance(
                latitude,
                longitude,
                elementLatitude,
                elementLongitude
            );


        results.push({

            id,

            name:
                locationName,

            category,

            latitude:
                elementLatitude,

            longitude:
                elementLongitude,

            distance:
                formatDistance(distance),

            distanceValue:
                distance,

            address:
                buildAddress(tags),

            phone:
                tags.phone ||
                tags["contact:phone"] ||
                "",

            website:
                tags.website ||
                tags["contact:website"] ||
                "",

            openStatus:
                tags.opening_hours ||
                "Opening hours not available",

            emergency:
                false,

            operator:
                tags.operator ||
                "",
        });
    }


    results.sort(
        (a, b) =>
            a.distanceValue -
            b.distanceValue
    );


    return results;
};


// ============================================================
// NORMAL NEARBY LOCATIONS
// ============================================================

const getNearbyLocations = async (
    req,
    res
) => {

    try {

        const latitude =
            Number(req.query.latitude);

        const longitude =
            Number(req.query.longitude);

        let radius =
            Number(
                req.query.radius || 5000
            );


        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {

            return res.status(400).json({
                message:
                    "Valid latitude and longitude are required.",
            });
        }


        if (radius < 1000) {
            radius = 1000;
        }


        if (radius > 5000) {
            radius = 5000;
        }


        const cacheKey =
            `normal_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;


        const cached =
            locationCache.get(cacheKey);


        if (
            cached &&
            Date.now() - cached.timestamp <
                CACHE_DURATION
        ) {

            return res.json({
                locations:
                    cached.locations,

                count:
                    cached.locations.length,

                cached: true,
            });
        }


        const query =
            buildOverpassQuery(
                latitude,
                longitude,
                radius
            );


        const data =
            await requestOverpass(query);


        const results =
            formatLocationResults(
                data,
                latitude,
                longitude
            );


        locationCache.set(
            cacheKey,
            {
                timestamp:
                    Date.now(),

                locations:
                    results,
            }
        );


        return res.json({

            locations:
                results,

            count:
                results.length,

            cached:
                false,
        });

    } catch (error) {

        console.error(
            "Nearby locations error:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to load nearby locations.",

            error:
                error.message,
        });
    }
};


// ============================================================
// ECHS LOCATIONS
// SEPARATE LIGHTWEIGHT SEARCH
// ============================================================

const getECHSLocations = async (
    req,
    res
) => {

    try {

        const latitude =
            Number(req.query.latitude);

        const longitude =
            Number(req.query.longitude);

        let radius =
            Number(
                req.query.radius || 5000
            );


        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {

            return res.status(400).json({
                message:
                    "Valid latitude and longitude are required.",
            });
        }


        if (radius < 1000) {
            radius = 1000;
        }


        if (radius > 10000) {
            radius = 10000;
        }


        const cacheKey =
            `echs_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;


        const cached =
            locationCache.get(cacheKey);


        if (
            cached &&
            Date.now() - cached.timestamp <
                CACHE_DURATION
        ) {

            return res.json({
                locations:
                    cached.locations,

                count:
                    cached.locations.length,

                cached: true,
            });
        }


        const query =
            buildECHSQuery(
                latitude,
                longitude,
                radius
            );


        const data =
            await requestOverpass(query);


        const results =
            formatLocationResults(
                data,
                latitude,
                longitude,
                "ECHS"
            );


        locationCache.set(
            cacheKey,
            {
                timestamp:
                    Date.now(),

                locations:
                    results,
            }
        );


        return res.json({

            locations:
                results,

            count:
                results.length,

            cached:
                false,
        });

    } catch (error) {

        console.error(
            "ECHS locations error:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to load nearby ECHS locations.",

            error:
                error.message,
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

export {
    getNearbyLocations,
    getECHSLocations,
};