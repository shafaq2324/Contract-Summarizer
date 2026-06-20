const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL ||
    "llama-3.3-70b-versatile";

exports.compareContracts = async (
    contract1,
    contract2
) => {

    const prompt = `
Compare these two contracts.

Return ONLY valid JSON.

{
    "similarities": [],
    "differences": [],
    "risk_comparison": {
        "contract1": "",
        "contract2": ""
    }
}

Contract 1:
${contract1}

Contract 2:
${contract2}
`;

    const completion =
        await groq.chat.completions.create({
            model: MODEL,
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a legal contract comparison assistant. Return only JSON."
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

    return (
        completion.choices[0].message.content
    );
};