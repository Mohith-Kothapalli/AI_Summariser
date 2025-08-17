import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import axios from 'axios';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Summarization endpoint
app.post('/summarize', async (req, res) => {
  const { transcript, prompt } = req.body;
  if (!transcript || !prompt) return res.status(400).json({ error: 'Missing transcript or prompt' });

  try {
    // Groq API call — OpenAI-compatible payload
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert meeting note summarizer.' },
          { role: 'user', content: `${prompt}\n\n${transcript}` }
        ],
        max_tokens: 1024,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Summarization failed', details: error.message });
  }
});

// Email endpoint
app.post('/send-email', async (req, res) => {
  const { summary, emails } = req.body;
  if (!summary || !emails) return res.status(400).json({ error: 'Missing summary or emails' });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: emails.split(',').map(e => e.trim()),
      subject: 'AI Meeting Summary',
      text: summary
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Email failed', details: error.message });
  }
});

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
