import echsFacilities from "../data/echsFacilities.js";
// ============================================================
// VeAssist - Map Controller
// ============================================================

// Public Overpass instances are rate-limited. Keep this list short and try
// servers sequentially instead of launching parallel requests.
const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
];

const CACHE_DURATION = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 20000;
const locationCache = new Map();

const NORMAL_DEFAULT_RADIUS = 2000;
const MAX_NORMAL_RADIUS = 5000;
const ECHS_DEFAULT_RADIUS = 2000;
const MAX_ECHS_RADIUS = 15000;

// ============================================================
// DISTANCE
// ============================================================

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (value) => (value * Math.PI) / 180;
    const earthRadius = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (distance) =>
    distance < 1
        ? `${Math.round(distance * 1000)} m`
        : `${distance.toFixed(1)} km`;

// ============================================================
// ADDRESS
// ============================================================

const buildAddress = (tags = {}) => {
    const keys = [
        "addr:housenumber",
        "addr:street",
        "addr:suburb",
        "addr:city",
        "addr:district",
        "addr:state",
        "addr:postcode",
    ];

    return [...new Set(keys.map((key) => tags[key]).filter(Boolean))].join(
        ", "
    );
};

// ============================================================
// CATEGORY DETECTION
// ============================================================

const getCategory = (tags = {}) => {
    const name = [
        tags.name,
        tags["name:en"],
        tags.official_name,
        tags["official_name:en"],
        tags.short_name,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const operator = [tags.operator, tags["operator:en"]]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const searchable = `${name} ${operator}`;
    const socialFor = String(tags["social_facility:for"] || "").toLowerCase();
    const speciality = String(tags["healthcare:speciality"] || "").toLowerCase();

    // ECHS is checked before generic welfare/health categories.
    if (
        /\bechs\b/.test(searchable) ||
        (/ex[\s-]?servicemen/.test(searchable) &&
            /contributory|health|poly\s?clinic|medical|hospital/.test(searchable))
    ) {
        return "ECHS";
    }

    if (
        /welfare|sainik board|zila sainik|district sainik|veteran|ex[\s-]?servicemen/.test(
            searchable
        ) ||
        socialFor.includes("veteran") ||
        socialFor.includes("ex-servicemen")
    ) {
        return "Welfare Offices";
    }

    if (
        ["laboratory", "medical_imaging", "sample_collection", "diagnostic"].includes(
            tags.healthcare
        ) ||
        (tags.amenity !== "hospital" &&
            /diagnostic_radiology|clinical_pathology/.test(speciality)) ||
        /\b(diagnostic|diagnostics|laboratory|pathology|imaging)\b/.test(name) ||
        /\blab\b/.test(name)
    ) {
        return "Diagnostic Centres";
    }

    if (tags.amenity === "hospital" || tags.healthcare === "hospital") {
        return "Hospitals";
    }
    if (tags.amenity === "pharmacy" || tags.healthcare === "pharmacy") {
        return "Pharmacies";
    }
    if (
        ["clinic", "doctors"].includes(tags.amenity) ||
        ["clinic", "doctor"].includes(tags.healthcare)
    ) {
        return "Clinics";
    }
    if (tags.amenity === "police") return "Police";
    if (tags.amenity === "bank") return "Banks";
    if (tags.amenity === "post_office") return "Post Offices";
    if (tags.office === "government") return "Government Offices";

    if (
        tags.amenity === "social_facility" ||
        ["association", "charity", "ngo"].includes(tags.office)
    ) {
        return "Welfare Offices";
    }

    return "Other";
};

// ============================================================
// OVERPASS QUERY BUILDERS
// Ordinary search is split into small groups. If one group fails, successful
// groups can still be returned instead of losing every nearby result.
// ============================================================

const buildNearbyQueryGroups = (latitude, longitude, radius) => {
    const area = `around:${radius},${latitude},${longitude}`;

    const buildGroup = (filters) => `
        [out:json][timeout:10];
        (
            ${filters
            .flatMap((filter) => [
                `node(${area})${filter};`,
                `way(${area})${filter};`,
            ])
            .join("\n            ")}
        );
        out center tags;
    `;

    return [
        {
            name: "healthcare",
            query: buildGroup([
                '["amenity"~"hospital|pharmacy|clinic|doctors"]',
                '["healthcare"~"hospital|pharmacy|clinic|doctor"]',
            ]),
        },
        {
            name: "diagnostics",
            query: buildGroup([
                '["healthcare"~"laboratory|medical_imaging|sample_collection|diagnostic"]',
                '["healthcare:speciality"~"diagnostic_radiology|clinical_pathology"]',
            ]),
        },
        {
            name: "civic",
            query: buildGroup([
                '["amenity"~"social_facility|police|bank|post_office"]',
                '["office"~"government|association|charity|ngo"]',
            ]),
        },
    ];
};

const buildECHSQuery = (latitude, longitude, radius) => {
    const area = `around:${radius},${latitude},${longitude}`;
    const pattern =
        "echs|ex-servicemen|ex servicemen|exservicemen|ex-service men";

    const keys = ["name", "name:en", "official_name"];

    const lines = keys.flatMap((key) => [
        `node(${area})["${key}"~"${pattern}",i];`,
        `way(${area})["${key}"~"${pattern}",i];`,
    ]);

    return `
        [out:json][timeout:15];
        (
            ${lines.join("\n")}
        );
        out center tags;
    `;
};

// ============================================================
// OVERPASS REQUEST QUEUE / LIMITED FALLBACK
// Each query tries at most two servers once. No second full retry pass.
// ============================================================

let overpassQueue = Promise.resolve();

const enqueueOverpass = (task) => {
    const run = overpassQueue.then(task);
    overpassQueue = run.catch(() => { });
    return run;
};

const tryServers = async (
    query,
    { timeoutMs = REQUEST_TIMEOUT_MS } = {}
) => {
    let lastError;

    for (const url of OVERPASS_URLS) {
        const controller = new AbortController();

        const timer = setTimeout(
            () => controller.abort(),
            timeoutMs
        );

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "VeAssist/1.0",
                },
                body: new URLSearchParams({
                    data: query,
                }).toString(),
                signal: controller.signal,
            });

            if (!response.ok) {
                lastError = new Error(
                    `Overpass server returned ${response.status}`
                );

                console.warn(
                    "Overpass failed:",
                    url,
                    response.status
                );

                continue;
            }

            const data = await response.json();

            if (
                data?.remark &&
                /timed out|timeout|out of memory|runtime error/i.test(
                    data.remark
                )
            ) {
                lastError = new Error(
                    `Overpass query failed: ${data.remark}`
                );

                console.warn(
                    "Overpass query failed:",
                    url,
                    data.remark
                );

                continue;
            }

            return data;
        } catch (error) {
            lastError = error.name === "AbortError"
                ? new Error(
                    `Overpass request timed out: ${url}`
                )
                : error;

            console.warn(
                "Overpass connection failed:",
                url,
                lastError.message
            );
        } finally {
            clearTimeout(timer);
        }
    }

    throw lastError || new Error(
        "All configured Overpass servers failed."
    );
};

const requestOverpass = (
    query,
    options = {}
) => enqueueOverpass(
    () => tryServers(query, options)
);

// ============================================================
// FORMAT RESULTS
// ============================================================

const formatLocationResults = (data, latitude, longitude, categoryFilter = null) => {
    const results = [];
    const seen = new Set();

    for (const element of data?.elements || []) {
        const tags = element.tags || {};
        const placeLatitude = element.lat ?? element.center?.lat;
        const placeLongitude = element.lon ?? element.center?.lon;

        if (
            !Number.isFinite(Number(placeLatitude)) ||
            !Number.isFinite(Number(placeLongitude))
        ) {
            continue;
        }

        const name =
            tags.name ||
            tags["name:en"] ||
            tags.official_name ||
            tags["official_name:en"] ||
            tags.short_name;

        if (!name) continue;

        const category = getCategory(tags);
        if (categoryFilter && category !== categoryFilter) continue;
        if (!categoryFilter && category === "Other") continue;

        const lat = Number(placeLatitude);
        const lon = Number(placeLongitude);
        const dedupeKey = `${name.toLowerCase()}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const distanceValue = calculateDistance(latitude, longitude, lat, lon);
        if ((tags.name || "").toLowerCase().includes("federal bank")) {
    console.log("[DEBUG Federal Bank tags]", tags);
}
        results.push({
            id: `${element.type}-${element.id}`,
            name,
            category,
            latitude: lat,
            longitude: lon,
            distance: formatDistance(distanceValue),
            distanceValue,
            address:
                buildAddress(tags) ||
                [tags["addr:full"], tags["contact:address"], tags["addr:place"]]
                    .filter(Boolean)
                    .join(", "),
            phone: tags.phone || tags["contact:phone"] || tags["contact:mobile"] || "",
            email: tags.email || tags["contact:email"] || "",
            website: tags.website || tags["contact:website"] || "",
            openStatus:
                tags.opening_hours ||
                tags["opening_hours:covid19"] ||
                "Opening hours not available",
            emergency: false,
            operator: tags.operator || "",
        });
    }

    return results;
};

const mergeUnique = (...lists) => {
    const unique = new Map();

    lists.flat().forEach((location) => {
        const key = `${location.name.toLowerCase()}|${Number(location.latitude).toFixed(3)}|${Number(location.longitude).toFixed(3)}`;
        if (!unique.has(key)) unique.set(key, location);
    });

    return [...unique.values()].sort(
        (a, b) => (a.distanceValue ?? Infinity) - (b.distanceValue ?? Infinity)
    );
};

// ============================================================
// INPUT VALIDATION
// ============================================================

const readCoordinates = (req, res, defaultRadius, maxRadius) => {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    let radius = Number(req.query.radius || defaultRadius);

    if (
        req.query.latitude === undefined ||
        req.query.longitude === undefined ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        res.status(400).json({
            message: "Valid latitude and longitude are required.",
        });
        return null;
    }

    if (!Number.isFinite(radius) || radius <= 0) radius = defaultRadius;
    radius = Math.max(1000, Math.min(radius, maxRadius));

    return { latitude, longitude, radius };
};

// ============================================================
// CACHE
// Expired entries remain available as fallback when Overpass is unavailable.
// ============================================================

const makeCacheKey = (type, latitude, longitude, radius) =>
    `${type}_${latitude.toFixed(3)}_${longitude.toFixed(3)}_${radius}`;

const getCachedEntry = (key, allowStale = false) => {
    const entry = locationCache.get(key);
    if (!entry) return null;
    if (allowStale || Date.now() - entry.timestamp < CACHE_DURATION) return entry;
    return null;
};

const sendLocations = (res, locations, { cached = false, stale = false, partial = false } = {}) =>
    res.json({
        locations,
        count: locations.length,
        cached,
        ...(stale ? { stale: true } : {}),
        ...(partial ? { partial: true } : {}),
    });

// ============================================================
// NORMAL NEARBY HANDLER - sequential small groups with partial success
// ============================================================

const getNearbyLocations = async (req, res) => {
    const coordinates = readCoordinates(
        req,
        res,
        NORMAL_DEFAULT_RADIUS,
        MAX_NORMAL_RADIUS
    );
    if (!coordinates) return;

    const { latitude, longitude, radius } = coordinates;
    const cacheKey = makeCacheKey("normal", latitude, longitude, radius);
    const freshCache = getCachedEntry(cacheKey);

    if (freshCache) {
        return sendLocations(res, freshCache.locations, { cached: true, partial: freshCache.partial });
    }

    const groups = buildNearbyQueryGroups(latitude, longitude, radius);
    const successfulLists = [];
    let failedGroups = 0;
    let lastError = null;

    for (const group of groups) {
        try {
            const data = await requestOverpass(group.query);
            successfulLists.push(formatLocationResults(data, latitude, longitude));
        } catch (error) {
            failedGroups += 1;
            lastError = error;
            console.warn(`Nearby query group '${group.name}' failed:`, error.message);
        }
    }

    if (successfulLists.length > 0) {
        const locations = mergeUnique(...successfulLists);
        const partial = failedGroups > 0;
        locationCache.set(cacheKey, {
            timestamp: Date.now(),
            locations,
            partial,
        });
        return sendLocations(res, locations, { partial });
    }

    const stale = getCachedEntry(cacheKey, true);
    if (stale) {
        return sendLocations(res, stale.locations, {
            cached: true,
            stale: true,
            partial: stale.partial,
        });
    }

    console.error("Nearby locations error:", lastError?.message || "All query groups failed");
    return res.status(503).json({
        message: "Nearby places are temporarily unavailable. Please try again shortly.",
        error: lastError?.message || "All nearby query groups failed.",
    });
};

// ============================================================
// ECHS HANDLER - independent query and cache
// ============================================================


const getECHSLocations = async (req, res) => {
    const coordinates = readCoordinates(
        req,
        res,
        ECHS_DEFAULT_RADIUS,
        MAX_ECHS_RADIUS
    );

    if (!coordinates) return;

    const { latitude, longitude } = coordinates;

    // ECHS is served from the local directory dataset.
    // This endpoint does not depend on Overpass.
    const locations = echsFacilities.map((facility) => ({
        ...facility,
        distance: "Distance unavailable",
        distanceValue: null,
        openStatus: "Contact the facility to confirm hours",
        emergency: false,
        operator: "ECHS",
    }));

    return res.json({
        locations,
        count: locations.length,
        cached: false,
        source: "local-echs-directory",
    });
};


export { getNearbyLocations, getECHSLocations };
