// ============================================================
// VeAssist - Map Service
// ============================================================


// ============================================================
// NORMAL NEARBY LOCATIONS
// ============================================================

export const getNearbyLocations = async (
    latitude,
    longitude,
    radius = 5000
) => {

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


    const url =
        `http://localhost:5000/api/map/nearby` +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        `&radius=${encodeURIComponent(radius)}`;


    console.log(
        "Loading normal nearby locations..."
    );


    const response =
        await fetch(url);


    if (!response.ok) {

        let message =
            "Unable to load nearby locations.";


        try {

            const errorData =
                await response.json();


            if (errorData.message) {
                message =
                    errorData.message;
            }

        } catch {
            // Ignore JSON parsing error
        }


        throw new Error(message);
    }


    const data =
        await response.json();


    console.log(
        "Normal locations received:",
        data.locations?.length || 0
    );


    return data.locations || [];
};


// ============================================================
// ECHS LOCATIONS
// ============================================================

export const getNearbyECHSLocations = async (
    latitude,
    longitude,
    radius = 5000
) => {

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


    const url =
        `http://localhost:5000/api/map/echs` +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        `&radius=${encodeURIComponent(radius)}`;


    console.log(
        "Loading ECHS locations..."
    );


    const response =
        await fetch(url);


    if (!response.ok) {

        let message =
            "Unable to load nearby ECHS locations.";


        try {

            const errorData =
                await response.json();


            if (errorData.message) {
                message =
                    errorData.message;
            }

        } catch {
            // Ignore JSON parsing error
        }


        throw new Error(message);
    }


    const data =
        await response.json();


    console.log(
        "ECHS locations received:",
        data.locations?.length || 0
    );


    return data.locations || [];
};


// ============================================================
// CATEGORY FILTER
// ============================================================

export const getNearbyLocationsByCategory =
    async (
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


        if (
            !category ||
            category === "All"
        ) {

            return locations;
        }


        return locations.filter(
            (location) =>
                location.category ===
                category
        );
    };