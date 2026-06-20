const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

exports.analyzeContract = async (contractText) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const prompt = `
Return ONLY valid JSON.

Extract:
{
  "contract_type": "",
  "effective_date": "",
  "expiry_date": "",
  "parties": [],
  "payment_terms": "",
  "termination_clause": "",
  "confidentiality_clause": "",
  "liability_clause": ""
}

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