// ============================================================
// VeAssist - Map Controller
// ============================================================

const OVERPASS_URLS = [
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
];


// ============================================================
// CATEGORY TAGS
// ============================================================

const CATEGORY_TAGS = {

    Hospitals: [
        ["amenity", "hospital"],
    ],

    Pharmacies: [
        ["amenity", "pharmacy"],
    ],

    Clinics: [
        ["amenity", "clinic"],
        ["amenity", "doctors"],
    ],

    Police: [
        ["amenity", "police"],
    ],

    "Diagnostic Centres": [
        ["healthcare", "laboratory"],
        ["healthcare", "diagnostic"],
    ],

    "Government Offices": [
        ["office", "government"],
    ],

    "Welfare Offices": [
        ["social_facility", "government"],
    ],

    Banks: [
        ["amenity", "bank"],
    ],

    "Post Offices": [
        ["amenity", "post_office"],
    ],

    Emergency: [
        ["amenity", "fire_station"],
        ["emergency", "ambulance_station"],
    ],
};


// ============================================================
// SIMPLE IN-MEMORY CACHE
// ============================================================

const locationCache = new Map();

const CACHE_DURATION = 60 * 1000;


// ============================================================
// DISTANCE CALCULATION
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
// BUILD ADDRESS
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
// DETERMINE CATEGORY
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


    // --------------------------------------------------------
    // ECHS
    // --------------------------------------------------------

    if (
        name.includes("echs") ||
        name.includes("ex-servicemen") ||
        name.includes("ex servicemen") ||
        name.includes("exservicemen") ||
        name.includes("veteran") ||
        operator.includes("echs") ||
        operator.includes("ex-servicemen")
    ) {
        return "ECHS";
    }


    // --------------------------------------------------------
    // NORMAL CATEGORIES
    // --------------------------------------------------------

    if (tags.amenity === "hospital") {
        return "Hospitals";
    }

    if (tags.amenity === "pharmacy") {
        return "Pharmacies";
    }

    if (
        tags.amenity === "clinic" ||
        tags.amenity === "doctors"
    ) {
        return "Clinics";
    }

    if (tags.amenity === "police") {
        return "Police";
    }

    if (
        tags.healthcare === "laboratory" ||
        tags.healthcare === "diagnostic"
    ) {
        return "Diagnostic Centres";
    }

    if (tags.amenity === "bank") {
        return "Banks";
    }

    if (tags.amenity === "post_office") {
        return "Post Offices";
    }

    if (
        tags.amenity === "fire_station" ||
        tags.emergency === "ambulance_station"
    ) {
        return "Emergency";
    }

    if (tags.social_facility === "government") {
        return "Welfare Offices";
    }

    if (tags.office === "government") {
        return "Government Offices";
    }

    return "Other";
};


// ============================================================
// BUILD OVERPASS QUERY
// ============================================================

const buildOverpassQuery = (
    latitude,
    longitude,
    radius
) => {

    const queries = [];

    Object.values(CATEGORY_TAGS).forEach(
        (tags) => {

            tags.forEach(
                ([key, value]) => {

                    queries.push(`
                        nwr(
                            around:${radius},
                            ${latitude},
                            ${longitude}
                        )["${key}"="${value}"];
                    `);

                }
            );

        }
    );


    return `
        [out:json][timeout:25];

        (
            ${queries.join("\n")}
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

        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            30000
        );


        try {

            console.log(
                "Trying Overpass server:",
                url
            );


            const response = await fetch(
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

                    signal: controller.signal,
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
// GET NEARBY LOCATIONS
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
            Number(req.query.radius || 5000);


        // ----------------------------------------------------
        // VALIDATE LOCATION
        // ----------------------------------------------------

        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {

            return res.status(400).json({
                message:
                    "Valid latitude and longitude are required.",
            });

        }


        // ----------------------------------------------------
        // LIMIT RADIUS
        // ----------------------------------------------------

        if (radius < 1000) {
            radius = 1000;
        }

        if (radius > 5000) {
            radius = 5000;
        }


        // ----------------------------------------------------
        // CACHE KEY
        // ----------------------------------------------------

        const cacheKey =
            `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;


        const cached =
            locationCache.get(cacheKey);


        if (
            cached &&
            Date.now() - cached.timestamp <
                CACHE_DURATION
        ) {

            console.log(
                "Returning cached nearby locations."
            );


            return res.json({
                locations: cached.locations,
                cached: true,
            });
        }


        // ----------------------------------------------------
        // BUILD QUERY
        // ----------------------------------------------------

        const query =
            buildOverpassQuery(
                latitude,
                longitude,
                radius
            );


        // ----------------------------------------------------
        // CALL OVERPASS
        // ----------------------------------------------------

        const data =
            await requestOverpass(query);


        const results = [];

        const seenIds = new Set();


        // ----------------------------------------------------
        // PROCESS RESULTS
        // ----------------------------------------------------

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


            // ------------------------------------------------
            // REAL NAME
            // ------------------------------------------------

            const locationName =
                tags.name ||
                tags["name:en"] ||
                tags.official_name ||
                tags["official_name:en"];


            // Skip unnamed places
            if (!locationName) {
                continue;
            }


            // ------------------------------------------------
            // DUPLICATE CHECK
            // ------------------------------------------------

            const id =
                `${element.type}-${element.id}`;


            if (seenIds.has(id)) {
                continue;
            }


            seenIds.add(id);


            // ------------------------------------------------
            // DISTANCE
            // ------------------------------------------------

            const distance =
                calculateDistance(
                    latitude,
                    longitude,
                    elementLatitude,
                    elementLongitude
                );


            // ------------------------------------------------
            // RESULT
            // ------------------------------------------------

            results.push({

                id,

                name:
                    locationName,

                category:
                    getCategory(tags),

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
                    tags.emergency === "yes",

                operator:
                    tags.operator ||
                    "",
            });
        }


        // ----------------------------------------------------
        // SORT NEAREST FIRST
        // ----------------------------------------------------

        results.sort(
            (a, b) =>
                a.distanceValue -
                b.distanceValue
        );


        // ----------------------------------------------------
        // CACHE RESULT
        // ----------------------------------------------------

        locationCache.set(
            cacheKey,
            {
                timestamp: Date.now(),
                locations: results,
            }
        );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.json({

            locations: results,

            count:
                results.length,

            cached: false,
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


export {
    getNearbyLocations,
};