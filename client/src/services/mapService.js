// ============================================================
// VeAssist - Map Service
// ============================================================

const API_BASE =
    (import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "") +
    "/api/map";

const hasCoordinates = (latitude, longitude) =>
    latitude !== null &&
    latitude !== undefined &&
    latitude !== "" &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180;

const fetchLocations = async (path, params, timeoutMs, timeoutMessage) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${API_BASE}${path}?${params.toString()}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(
                data.message || `Map request failed (${response.status}).`
            );
            error.status = response.status;
            error.details = data.error || null;
            error.locations = Array.isArray(data.locations) ? data.locations : [];
            throw error;
        }

        if (!Array.isArray(data.locations)) {
            throw new Error("The map service returned an invalid response.");
        }

        return data.locations;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error(timeoutMessage);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

const buildParams = (latitude, longitude, radius) => {
    if (!hasCoordinates(latitude, longitude)) {
        throw new Error("Valid latitude and longitude are required.");
    }

    const parsedRadius = Number(radius);
    const safeRadius =
        Number.isFinite(parsedRadius) && parsedRadius > 0
            ? Math.min(Math.max(parsedRadius, 1000), 15000)
            : 5000;

    return new URLSearchParams({
        latitude: String(Number(latitude)),
        longitude: String(Number(longitude)),
        radius: String(safeRadius),
    });
};

// NORMAL NEARBY LOCATIONS
export const getNearbyLocations = async (
    latitude,
    longitude,
    radius = 5000
) => {
    const params = buildParams(latitude, longitude, radius);
    return fetchLocations(
        "/nearby",
        params,
        75000,
        "Nearby places search timed out. Please try again."
    );
};

// ECHS LOCATIONS: use the dedicated local directory endpoint first.
export const getNearbyECHSLocations = async (
    latitude,
    longitude,
    radius = 15000
) => {
    const params = buildParams(latitude, longitude, radius);

    try {
        return await fetchLocations(
            "/echs",
            params,
            15000,
            "ECHS search timed out. Please try again."
        );
    } catch (error) {
        console.warn(
            "Dedicated ECHS directory request failed; attempting nearby ECHS-tagged results:",
            error.message
        );

        // Keep this fallback category-specific so normal places are never
        // accidentally shown as ECHS facilities.
        const locations = await getNearbyLocations(
            latitude,
            longitude,
            Math.min(Number(radius) || 5000, 5000)
        );

        return locations.filter(
            (location) =>
                String(location.category || "").toLowerCase() === "echs" ||
                /\bechs\b/i.test(`${location.name || ""} ${location.operator || ""}`)
        );
    }
};

export const getNearbyLocationsByCategory = async (
    latitude,
    longitude,
    category,
    radius = 5000
) => {
    const locations = await getNearbyLocations(latitude, longitude, radius);
    if (!category || category === "All") return locations;
    return locations.filter((location) => location.category === category);
};
