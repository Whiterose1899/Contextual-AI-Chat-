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

type TextSelection = {
  nodeId: number
  text: string
  position: {
    top: number
    left: number
    width: number
    height: number
  }
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

  const [selectedText, setSelectedText] =
    useState<TextSelection | null>(null)

  const [isAskingAboutSelection, setIsAskingAboutSelection] =
    useState(false)

  const [contextQuestion, setContextQuestion] = useState('')

  function handleTextSelection(nodeId: number) {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0) {
      return
    }

    const text = selection.toString().trim()

    if (text === '') {
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    const newSelection: TextSelection = {
      nodeId,
      text,
      position: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    }

    setSelectedText(newSelection)

    console.log('Selected text:', newSelection)
  }

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

  function handleAskAboutSelection() {
    if (!selectedText) {
      return
    }

    setIsAskingAboutSelection(true)
  }

  function handleContextQuestionSubmit() {
    if (!selectedText || contextQuestion.trim() === '') {
      return
    }

    console.log('Context question:', {
      parentId: selectedText.nodeId,
      highlightedContext: selectedText.text,
      question: contextQuestion,
    })
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

              <p
                onMouseUp={() => {
                  if (message.role === 'ai') {
                    handleTextSelection(
                      conversationNodes[0].id,
                    )
                  }
                }}
              >
                {message.content}
              </p>
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

      {selectedText && !isAskingAboutSelection && (
        <button
          className="ask-about-button"
          style={{
            position: 'fixed',
            top:
              selectedText.position.top +
              selectedText.position.height +
              8,
            left: selectedText.position.left,
          }}
          onClick={handleAskAboutSelection}
        >
          Ask about this
        </button>
      )}

      {isAskingAboutSelection && selectedText && (
        <div className="context-question-box">
          <div className="context-question-label">
            Ask about:
          </div>

          <div className="context-question-text">
            "{selectedText.text}"
          </div>

          <input
            type="text"
            placeholder="Ask a question..."
            value={contextQuestion}
            onChange={(event) =>
              setContextQuestion(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleContextQuestionSubmit()
              }
            }}
          />

          <button onClick={handleContextQuestionSubmit}>
            Ask
          </button>
        </div>
      )}

      <div className="input-area">
        <input
          type="text"
          placeholder="What's in your mind?"
          value={inputText}
          onChange={(event) =>
            setInputText(event.target.value)
          }
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