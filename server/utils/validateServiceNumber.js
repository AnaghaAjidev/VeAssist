const validateServiceNumber = (serviceNumber) => {
    if (typeof serviceNumber !== "string") {
        return {
            valid: false,
            type: "Unknown",
            id: "",
        };
    }

    const cleanId = serviceNumber.trim().toUpperCase();

    const officerPattern = /^\d{5}[A-Z]$/;
    const sailorPattern = /^\d{6}[A-Z]$/;

    if (officerPattern.test(cleanId)) {
        return {
            valid: true,
            type: "Officer",
            id: cleanId,
        };
    }

    if (sailorPattern.test(cleanId)) {
        return {
            valid: true,
            type: "Sailor",
            id: cleanId,
        };
    }

    return {
        valid: false,
        type: "Unknown",
        id: cleanId,
    };
};

export default validateServiceNumber;