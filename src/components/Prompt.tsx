import { useState, useEffect } from 'react'
import { formatParams, validateInput, formatUrl } from '../utils/format-utils'
import LoadingState from './LoadingState'

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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasReachedRateLimit, setHasReachedRateLimit] = useState<boolean>(false)

  const fetchPrompt = async (): Promise<void> => {
    if (validationError) setValidationError('')
    const baseUrl = 'http://localhost:8080/api/v1/prompts'
    const formattedGenre = formatParams(genre)
    const formattedTheme = formatParams(theme)
    const params = {
      genre: formattedGenre,
      theme: formattedTheme
    }

    const url = formatUrl(baseUrl, params)

    try {
      setIsLoading(true)
      const response = await fetch(url)
      const data = await response.json()

      // intercept early if rate limited
      if (response.status === 429) {
        setIsLoading(false)
        setHasReachedRateLimit(true)
        setFetchError(data.error)
        return
      }

      // otherwise, set the prompt in state or set other error
      if (data.response) {
        setIsLoading(false)
        setPrompt(data.response)
      } else {
        setIsLoading(false)
        setFetchError(data.error)
      }
       
    } catch (error) {
      setIsLoading(false)
      setFetchError('Failed to fetch prompt. Please try again later.')
    }
  }

  useEffect(() => {
    fetchPrompt()
  }, [])

  return (
    <div className='prompt-container'>
      {isLoading ? <LoadingState /> : <p>{prompt || fetchError}</p>}
      <div className='action-container'>
        {showInputFields && (
          <div className='input-container'>
            <div>
              <input
                type='text'
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder='Genre'
                maxLength={20}
              />
              <input
                type='text'
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder='Theme'
                maxLength={30}
              />
            </div>
          </div>
        )}
        <div className='button-container'>
          {!showInputFields && <button onClick={() => setShowInputFields(true)} disabled={hasReachedRateLimit}>Add Genre or Theme</button>}
          <button 
            onClick={() => {
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
                  setValidationError('An unknown error occurred. Please try again later.')
                }
              }
            }}
            disabled={hasReachedRateLimit}
          >
            Fetch New Prompt
          </button>
          <div className='validation-error'>
            {validationError && <span className='validation-error'>{validationError}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prompt
