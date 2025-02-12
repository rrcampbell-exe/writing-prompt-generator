import { useState, useEffect } from 'react'
import { formatParams, validateInput, formatUrl } from '../utils/format-utils'

type PromptState = string
type ErrorState = string
type InputState = string

const Prompt = () => {
  const [prompt, setPrompt] = useState<PromptState>('')
  const [fetchError, setFetchError] = useState<ErrorState>('')
  const [validationError, setValidationError] = useState<ErrorState>('')
  const [theme, setTheme] = useState<InputState>('')
  const [genre, setGenre] = useState<InputState>('')
  const [showInputFields, setShowInputFields] = useState<boolean>(false)

  const fetchPrompt = async (): Promise<void> => {
    const baseUrl = 'http://localhost:8080/api/v1/prompts'
    const formattedGenre = formatParams(genre)
    const formattedTheme = formatParams(theme)
    const params = {
      genre: formattedGenre,
      theme: formattedTheme
    }

    const url = formatUrl(baseUrl, params)

    try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.response) {
        setPrompt(data.response)
      } else {
        setFetchError(data.error)
      }
    } catch (error) {
      setFetchError('Failed to fetch prompt. Please try again later.')
    }
  }

  useEffect(() => {
    fetchPrompt()
  }, [])

  return (
    <div className='prompt-container'>
      <p>{prompt || fetchError}</p>
      <div className='action-container'>
        {showInputFields && (
          <div className='input-container'>
            <div>
              <input
                type='text'
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder='Genre'
              />
              <input
                type='text'
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder='Theme'
              />
            </div>
          </div>
        )}
        <div className='button-container'>
          {!showInputFields && <button onClick={() => setShowInputFields(true)}>Add Genre or Theme</button>}
          <button onClick={() => {
            try {
              validateInput(genre)
              validateInput(theme)
              fetchPrompt()
              setGenre('')
              setTheme('')
            } catch (error) {
              if (error instanceof Error) {
                setValidationError(error.message)
              } else {
                setValidationError('An unknown error occurred')
              }
            }
          }}>Fetch New Prompt</button>
          {validationError && <span className='error'>{validationError}</span>}
        </div>
      </div>
    </div>
  )
}

export default Prompt
