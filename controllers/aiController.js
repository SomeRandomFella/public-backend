exports.sendPromptAi = async (req, res, API_KEY) => {
  const prompt = req.body?.prompt;

  if (!prompt) {
    return res.status(400).json("missing prompt");
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: `you are a AI for SFools made by amir (dont mention that unless asked) to help people with their homework and study and maybe just talk to them and dont make responses to long your prompt is: ${prompt}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response";
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).send("hi smth went wrong");
  }
};
