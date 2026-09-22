import { useState } from 'react'
import './App.css'

type Message = {
  id: number
  role: 'user' | 'ai'
  content: string
  parentId?: number
}

function App() {
  const [inputText, setInputText] = useState('')

  const [messages, setMessages] = useState<Message[]>([
      {
        id: 1,
        role: 'user',
        content: 'Explain climate change.',
      },
      {
        id: 2,
        role: 'ai',
        content:
          "Climate change refers to long-term changes in the Earth's temperature and weather patterns. These changes can occur naturally, but human activities have been the main driver of climate change since the 1800s.",
        parentId: 1,
      },
  ])

  const [isThinking, setIsThinking] = useState(false)

  async function handleSend() {
    if (inputText.trim() === '') {
      return
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputText,
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ])

    setInputText('')
    setIsThinking(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const aiMessage: Message = {
      id: Date.now() + 1,
      role: 'ai',
      content: 'This is a mock AI response.',
      parentId: userMessage.id,
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      aiMessage,
    ])

    setIsThinking(false)
  }

  return (
    <div className="app">
      <header className="chat-header">
        <h1>Contextual AI</h1>
      </header>

      <main className="chat">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.role === 'user'
                ? 'user-message'
                : 'ai-message'
            }`}
          >
            <div className="message-label">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>

            <p>{message.content}</p>
          </div>
        ))}

        {isThinking && (
          <div className="message ai-message">
            <div className="message-label">AI</div>
            <p>Thinking...</p>
          </div>
        )}
      </main>

      <div className="input-area">
        <input
          type="text"
          placeholder="What's in your mind?"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSend()
            }
          }}
        />

        <button onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}

export default App