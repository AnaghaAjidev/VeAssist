import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Only PDF, JPG, and PNG files are allowed."
                )
            );
        }

        cb(null, true);
    },
});

export default upload;