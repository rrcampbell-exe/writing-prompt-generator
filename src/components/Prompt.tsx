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
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(30)

  const fetchPrompt = async (): Promise<void> => {
    if (validationError) setValidationError('')
    const baseUrl = 'http://writing-prompt-generator-api.vercel.app/api/v1/prompts'
    const formattedGenre = formatParams(genre)
    const formattedTheme = formatParams(theme)
    const params = {
      genre: formattedGenre,
      theme: formattedTheme
    }

    const url = formatUrl(baseUrl, params)

    try {
      setIsLoading(true)
      const response = await fetch(url, {
        headers: {
          'x-wpg-api-key': import.meta.env.VITE_WPG_API_KEY || ''
        }
      })
      const data = await response.json()

      // intercept early if rate limited by backend
      if (response.status === 429) {
        setIsLoading(false)
        setHasReachedRateLimit(true)
        setPrompt('')
        setFetchError(data.error)
        if (data.error.includes('Easy, eager writer')) {
          setIsTimedOut(true)
          startCountdown()
        }
        return
      }

      // otherwise, set the prompt in state or set other error
      if (data.response) {
        setIsLoading(false)
        setFetchError('')
        setPrompt(data.response)
      } else {
        setIsLoading(false)
        setPrompt('')
        setFetchError(data.error)
      }
       
    } catch (error) {
      setIsLoading(false)
      setPrompt('')
      setFetchError('Failed to fetch prompt. Please try again later.')
    }
  }

  const startCountdown = () => {
    setTimeRemaining(30)
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval)
          setIsTimedOut(false)
          setHasReachedRateLimit(false)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
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
            disabled={hasReachedRateLimit || isTimedOut}
          >
            Fetch New Prompt
          </button>
          <div className='error-details'>
            {validationError && <span>{validationError}</span>}
            {(hasReachedRateLimit && isTimedOut) && <span>Try again in {timeRemaining} seconds.</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prompt
