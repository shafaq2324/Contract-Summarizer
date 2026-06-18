exports.uploadContract = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        res.status(201).json({
            message: "Contract uploaded successfully",
            file: req.file.filename,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};