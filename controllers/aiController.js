const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.generateQuestions = async (req, res) => {
  const { topic, difficulty = 'medium', amount = 10 } = req.body;

  if (!topic) return res.status(400).json({ message: 'Topic is required' });

  const prompt = `Generate exactly ${amount} multiple choice quiz questions about "${topic}" at "${difficulty}" difficulty level.

Return ONLY a valid JSON array with no extra text, markdown, or explanation. Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Brief explanation why this is correct (1-2 sentences)"
  }
]

Rules:
- Each question must have exactly 4 options
- correct_answer must exactly match one of the options
- explanation must explain why the correct answer is right
- Questions should be specific to ${topic}
- Difficulty: ${difficulty} (easy=basic concepts, medium=intermediate, hard=advanced)
- No duplicate questions`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return res.status(500).json({ message: 'AI returned empty response' });

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ message: 'AI returned invalid format' });

    const questions = JSON.parse(jsonMatch[0]);

    const valid = questions.every(q =>
      q.question && Array.isArray(q.options) && q.options.length === 4 && q.correct_answer && q.explanation
    );
    if (!valid) return res.status(500).json({ message: 'AI returned malformed questions' });

    res.status(200).json({ questions });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: 'Failed to generate questions: ' + err.message });
  }
};

exports.getExplanation = async (req, res) => {
  const { question, correct_answer, user_answer } = req.body;

  if (!question || !correct_answer) {
    return res.status(400).json({ message: 'Question and correct answer required' });
  }

  const prompt = `You are a quiz explanation assistant. Answer in plain text only, no bullet points, no labels.

Question: "${question}"
Correct Answer: "${correct_answer}"
User's Answer: "${user_answer || 'Skipped'}"

In 2 sentences: explain why "${correct_answer}" is the correct answer. Do NOT mention option letters like A, B, C, D. Do NOT say "the correct answer is c" or similar. Just explain the concept directly.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const explanation = completion.choices[0]?.message?.content?.trim();
    if (!explanation) return res.status(500).json({ message: 'Failed to generate explanation' });

    res.status(200).json({ explanation });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: 'Failed to generate explanation: ' + err.message });
  }
};
