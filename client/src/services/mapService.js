// ============================================================
// VeAssist - Map Service
// ============================================================


// ============================================================
// GET NEARBY LOCATIONS
// ============================================================

export const getNearbyLocations = async (
    latitude,
    longitude,
    radius = 5000
) => {

    // --------------------------------------------------------
    // Validate coordinates
    // --------------------------------------------------------

    if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
    ) {

        throw new Error(
            "Valid latitude and longitude are required."
        );
    }


    // --------------------------------------------------------
    // Backend API
    // --------------------------------------------------------

    const url =
        `http://localhost:5000/api/map/nearby` +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        `&radius=${encodeURIComponent(radius)}`;


    console.log(
        "Loading nearby locations from VeAssist backend..."
    );


    // --------------------------------------------------------
    // Request
    // --------------------------------------------------------

    const response =
        await fetch(url);


    // --------------------------------------------------------
    // Handle error
    // --------------------------------------------------------

    if (!response.ok) {

        let errorMessage =
            "Unable to load nearby locations.";


        try {

            const errorData =
                await response.json();


            if (errorData.message) {
                errorMessage =
                    errorData.message;
            }

        } catch {
            // Ignore JSON parsing error
        }


        throw new Error(errorMessage);
    }


    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    const data =
        await response.json();


    console.log(
        "Nearby locations received:",
        data.locations?.length || 0
    );


    return data.locations || [];
};


// ============================================================
// GET LOCATIONS BY CATEGORY
// ============================================================

export const getNearbyLocationsByCategory = async (
    latitude,
    longitude,
    category,
    radius = 5000
) => {

    const locations =
        await getNearbyLocations(
            latitude,
            longitude,
            radius
        );


    return locations.filter(
        (location) =>
            location.category === category
    );
};


// ============================================================
// GET EMERGENCY LOCATIONS
// ============================================================

export const getNearbyEmergencyLocations = async (
    latitude,
    longitude,
    radius = 5000
) => {

    const locations =
        await getNearbyLocations(
            latitude,
            longitude,
            radius
        );


    return locations.filter(
        (location) =>
            location.category === "Emergency" ||
            location.category === "Hospitals" ||
            location.category === "Police"
    );
};