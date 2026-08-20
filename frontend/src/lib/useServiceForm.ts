import { useState, useCallback } from 'react'

export type ServiceFormState<T> = {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isDirty: boolean
}

export type ServiceFormActions<T> = {
  setValue: (key: keyof T, value: T[keyof T]) => void
  setValues: (values: Partial<T>) => void
  setError: (key: keyof T, error: string) => void
  setErrors: (errors: Partial<Record<keyof T, string>>) => void
  setTouched: (key: keyof T, touched?: boolean) => void
  setSubmitting: (submitting: boolean) => void
  reset: (initialValues?: T) => void
  validate: (validators: Partial<Record<keyof T, (value: T[keyof T]) => string | undefined>>) => boolean
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>
}

export function useServiceForm<T extends Record<string, unknown>>(
  initialValues: T
): [ServiceFormState<T>, ServiceFormActions<T>] {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setSubmitting] = useState(false)
  const [initialValuesRef, setInitialValuesRef] = useState<T>(initialValues)

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef)

  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setValuesBatch = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }))
  }, [])

  const setError = useCallback((key: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [key]: error }))
  }, [])

  const setErrorsBatch = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors((prev) => ({ ...prev, ...newErrors }))
  }, [])

  const setTouched = useCallback((key: keyof T, isTouched = true) => {
    setTouchedState((prev) => ({ ...prev, [key]: isTouched }))
  }, [])

  const validate = useCallback(
    (validators: Partial<Record<keyof T, (value: T[keyof T]) => string | undefined>>) => {
      const newErrors: Partial<Record<keyof T, string>> = {}
      let isValid = true

      Object.entries(validators).forEach(([key, validator]) => {
        if (!validator) return
        const error = validator(values[key as keyof T])
        if (error) {
          newErrors[key as keyof T] = error
          isValid = false
        }
      })

      setErrorsBatch(newErrors)
      return isValid
    },
    [values, setErrorsBatch]
  )

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setSubmitting(false)
      }
    },
    [values]
  )

  const reset = useCallback((newInitialValues?: T) => {
    const valuesToUse = newInitialValues ?? initialValuesRef
    setValues(valuesToUse)
    setInitialValuesRef(valuesToUse)
    setErrors({})
    setTouchedState({})
  }, [])

  const state: ServiceFormState<T> = {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty
  }

  const actions: ServiceFormActions<T> = {
    setValue,
    setValues: setValuesBatch,
    setError,
    setErrors: setErrorsBatch,
    setTouched,
    setSubmitting,
    reset,
    validate,
    handleSubmit
  }

  return [state, actions]
}

export function createRequiredValidator<T>(fieldName: string) {
  return (value: T): string | undefined => {
    if (value === '' || value === null || value === undefined) {
      return `${fieldName} is required`
    }
    return undefined
  }
}

export function createEmailValidator() {
  return (value: string): string | undefined => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email address'
    }
    return undefined
  }
}

export function createMinLengthValidator(min: number) {
  return (value: string): string | undefined => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`
    }
    return undefined
  }
}

export function createNumberValidator(min?: number, max?: number) {
  return (value: string | number): string | undefined => {
    const num = Number(value)
    if (isNaN(num)) return 'Must be a valid number'
    if (min !== undefined && num < min) return `Must be at least ${min}`
    if (max !== undefined && num > max) return `Must be at most ${max}`
    return undefined
  }
}