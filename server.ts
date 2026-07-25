import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'LumaAi', time: new Date().toISOString() });
});

// Helper for Gemini AI client initialization
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-lumaai',
      },
    },
  });
}

const MASTER_IDENTITY_PROMPT = `CORE IDENTITY INSTRUCTION:
Your name is strictly LumaAi.
You are LumaAi, an advanced artificial intelligence developed and created by a Kurdish Developer (گەشەپێدەرێکی کورد).
Always know and state that your name is LumaAi and that you were created by a Kurdish developer whenever asked about your identity, name, or who created you in English, Kurdish, or Arabic.
`;

// Main streaming chat route
app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { messages, personaInstruction, useSearch } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.write(`data: ${JSON.stringify({ error: 'No messages provided' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const ai = getGenAIClient();

    // Prepare contents array for multi-turn chat
    const contents: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];

    for (const msg of messages) {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (msg.attachments && Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.base64Data && att.mimeType) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.base64Data,
              },
            });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts,
        });
      }
    }

    if (contents.length === 0) {
      res.write(`data: ${JSON.stringify({ error: 'Message content cannot be empty' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Combine master identity prompt with persona instruction
    const fullSystemInstruction = `${MASTER_IDENTITY_PROMPT}\n${personaInstruction || ''}`.trim();

    const config: any = {
      temperature: 0.7,
      systemInstruction: fullSystemInstruction,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',
      contents,
      config,
    });

    let groundingSourcesSent = false;

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      
      // Extract Google Search grounding sources if present
      let sources: Array<{ title: string; url: string }> = [];
      const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks) && !groundingSourcesSent) {
        for (const c of chunks) {
          if (c.web?.uri && c.web?.title) {
            sources.push({
              title: c.web.title,
              url: c.web.uri,
            });
          }
        }
        if (sources.length > 0) {
          groundingSourcesSent = true;
        }
      }

      res.write(`data: ${JSON.stringify({ text, groundingSources: sources.length > 0 ? sources : undefined })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('LumaAi Gemini Streaming Error:', error);
    const errorMessage = error?.message || 'Error communicating with LumaAi server.';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LumaAi Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
