import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Contextual AI backend is running!',
  })
})

app.post('/api/ask', async (req, res) => {
  try {
    const { question, highlightedContext } = req.body

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3:4b',
        stream: false,
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant helping the user understand a specific part of a previous AI response.',
          },
          {
            role: 'user',
            content: `Highlighted context:
"${highlightedContext}"

User's question:
"${question}"

Answer the user's question specifically in relation to the highlighted context.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Ollama returned status ${response.status}`,
      )
    }

    const data = await response.json()

    res.json({
      answer: data.message.content,
    })
  } catch (error) {
    console.error('Ollama API error:', error)

    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Failed to get response from Ollama.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})