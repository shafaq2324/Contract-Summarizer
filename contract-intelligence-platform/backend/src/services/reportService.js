const PDFDocument = require("pdfkit");

exports.generatePDF = (analysis) => {
    return new Promise((resolve, reject) => {

        const doc = new PDFDocument();

        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));

        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });

        doc.fontSize(20)
            .text("Contract Analysis Report", {
                align: "center",
            });

        doc.moveDown();

        doc.fontSize(14)
            .text(
                `Contract Type: ${analysis.contract_type || "N/A"}`
            );

        doc.text(
            `Effective Date: ${analysis.effective_date || "N/A"}`
        );

        doc.text(
            `Expiry Date: ${analysis.expiry_date || "N/A"}`
        );

        doc.moveDown();

        doc.text("Parties:");

        if (analysis.parties) {
            analysis.parties.forEach((party) => {
                doc.text(`• ${party}`);
            });
        }

        doc.moveDown();

        doc.text(
            `Risk Level: ${analysis.risk_level || "N/A"}`
        );

        doc.moveDown();

        doc.text("Risks:");

        if (analysis.risks) {
            analysis.risks.forEach((risk) => {
                doc.text(`• ${risk}`);
            });
        }

        doc.moveDown();

        doc.text(
            `Payment Terms: ${
                analysis.payment_terms || "N/A"
            }`
        );

        doc.moveDown();

        doc.text(
            `Termination Clause: ${
                analysis.termination_clause ||
                "N/A"
            }`
        );

        doc.moveDown();

        doc.text(
            `Confidentiality Clause: ${
                analysis.confidentiality_clause ||
                "N/A"
            }`
        );

        doc.moveDown();

        doc.text(
            `Liability Clause: ${
                analysis.liability_clause ||
                "N/A"
            }`
        );

        doc.end();
    });
};