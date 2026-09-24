import { useState } from 'react'
import './App.css'

type ConversationMessage = {
  role: 'user' | 'ai'
  content: string
}

type NodeContents = {
  highlightedContext: string | null
  branchConversation: ConversationMessage[]
}

type ConversationNode = {
  id: number
  parentId: number
  contents: NodeContents
}

function App() {
  const [inputText, setInputText] = useState('')

  const [conversationNodes, setConversationNodes] = useState<
    ConversationNode[]
  >([
    {
      id: 1,
      parentId: -1,
      contents: {
        highlightedContext: null,
        branchConversation: [
          {
            role: 'user',
            content: 'Explain climate change.',
          },
          {
            role: 'ai',
            content:
              "Climate change refers to long-term changes in the Earth's temperature and weather patterns. These changes can occur naturally, but human activities have been the main driver of climate change since the 1800s.",
          },
        ],
      },
    },
  ])

  const [isThinking, setIsThinking] = useState(false)

  async function handleSend() {
    if (inputText.trim() === '') {
      return
    }

    const userMessage: ConversationMessage = {
      role: 'user',
      content: inputText,
    }

    setConversationNodes((previousNodes) =>
      previousNodes.map((node, index) => {
        if (index !== 0) {
          return node
        }

        return {
          ...node,
          contents: {
            ...node.contents,
            branchConversation: [
              ...node.contents.branchConversation,
              userMessage,
            ],
          },
        }
      }),
    )

    setInputText('')
    setIsThinking(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const aiMessage: ConversationMessage = {
      role: 'ai',
      content: 'This is a mock AI response.',
    }

    setConversationNodes((previousNodes) =>
      previousNodes.map((node, index) => {
        if (index !== 0) {
          return node
        }

        return {
          ...node,
          contents: {
            ...node.contents,
            branchConversation: [
              ...node.contents.branchConversation,
              aiMessage,
            ],
          },
        }
      }),
    )

    setIsThinking(false)
  }

  return (
    <div className="app">
      <header className="chat-header">
        <h1>Contextual AI</h1>
      </header>

      <main className="chat">
        {conversationNodes[0].contents.branchConversation.map(
          (message, index) => (
            <div
              key={index}
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
          ),
        )}

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

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}

export default App