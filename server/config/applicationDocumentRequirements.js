const applicationDocumentRequirements = {
    "Pension Assistance": [
        {
            documentType: "Death Certificate",
            description: "Required proof of the veteran's death.",
        },
        {
            documentType: "Identity Proof",
            description: "Valid identity proof of the beneficiary.",
        },
        {
            documentType: "Bank Document",
            description: "Bank account document for pension transfer.",
        },
        {
            documentType: "Service Document",
            description: "Veteran service or pension related document.",
        },
    ],

    "Insurance Assistance": [
        {
            documentType: "Death Certificate",
            description: "Required proof of the veteran's death.",
        },
        {
            documentType: "Identity Proof",
            description: "Valid identity proof of the beneficiary.",
        },
        {
            documentType: "Insurance Document",
            description: "Insurance policy or scheme document.",
        },
        {
            documentType: "Bank Document",
            description: "Bank account document for claim settlement.",
        },
    ],

    "ECHS Assistance": [
        {
            documentType: "Identity Proof",
            description: "Valid identity proof of the beneficiary.",
        },
        {
            documentType: "Service Document",
            description: "Veteran service document.",
        },
        {
            documentType: "ECHS Card",
            description: "ECHS membership card.",
        },
    ],
};

export default applicationDocumentRequirements;