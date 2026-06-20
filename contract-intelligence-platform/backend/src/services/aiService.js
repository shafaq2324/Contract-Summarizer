const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

exports.analyzeContract = async (contractText) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const prompt = `
        Analyze the following contract.

        Return ONLY valid JSON.

        {
        "contract_type": "",
        "effective_date": "",
        "expiry_date": "",
        "parties": [],
        "payment_terms": "",
        "termination_clause": "",
        "confidentiality_clause": "",
        "liability_clause": "",
        "risk_level": "",
        "risks": []
        }

        Instructions:
        1. contract_type = type of agreement.
        2. effective_date = contract start date.
        3. expiry_date = contract end date.
        4. parties = all parties involved.
        5. payment_terms = summarize payment clauses.
        6. termination_clause = summarize termination terms.
        7. confidentiality_clause = summarize confidentiality terms.
        8. liability_clause = summarize liability terms.
        9. risk_level must be exactly one of:
        - Low
        - Medium
        - High
        10. risks must contain an array of legal or business risks.

        Examples of risks:
        - Missing confidentiality clause
        - No termination clause
        - Unclear payment obligations
        - Unlimited liability
        - Missing dispute resolution clause
        - Missing governing law clause

        Return ALL fields even if information is unavailable.

        Contract:
        ${contractText}
        `;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        temperature: 0.1,
        messages: [
            {
                role: "system",
                content:
                    "You are a contract analysis assistant. Return only valid JSON.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    return (
        completion?.choices?.[0]?.message?.content || ""
    );
};