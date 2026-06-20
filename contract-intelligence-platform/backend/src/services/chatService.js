const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL ||
    "llama-3.3-70b-versatile";

exports.askContractQuestion = async (
    contractText,
    question
) => {

    const prompt = `
You are a legal contract assistant.

Answer the user's question only using the contract below.

Contract:
${contractText}

Question:
${question}
`;

    const completion =
        await groq.chat.completions.create({
            model: MODEL,
            temperature: 0.2,
            messages: [
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