import { useCallback, useState } from 'react'

export type ServiceFormErrors<T> = Partial<Record<keyof T, string>>
export type ServiceFormValidators<T> = Partial<{ [K in keyof T]: (value: T[K], values: T) => string | undefined }>

export type ServiceFormState<T> = {
  values: T
  errors: ServiceFormErrors<T>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isDirty: boolean
}

export type ServiceFormActions<T> = {
  setValue: (key: keyof T, value: T[keyof T]) => void
  setValues: (values: Partial<T>) => void
  setError: (key: keyof T, error: string) => void
  setErrors: (errors: ServiceFormErrors<T>) => void
  setTouched: (key: keyof T, touched?: boolean) => void
  setSubmitting: (submitting: boolean) => void
  reset: (initialValues?: T) => void
  validate: (validators?: ServiceFormValidators<T>) => boolean
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>
}

export function useServiceForm<T extends Record<string, unknown>>(
  initialValues: T,
  formValidators: ServiceFormValidators<T> = {}
): [ServiceFormState<T>, ServiceFormActions<T>] {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ServiceFormErrors<T>>({})
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setSubmitting] = useState(false)
  const [initialValuesRef, setInitialValuesRef] = useState<T>(initialValues)

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef)

  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    setValues((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }, [])

  const setValuesBatch = useCallback((newValues: Partial<T>) => {
    setValues((previous) => ({ ...previous, ...newValues }))
  }, [])

  const setError = useCallback((key: keyof T, error: string) => {
    setErrors((previous) => ({ ...previous, [key]: error }))
  }, [])

  const setErrorsBatch = useCallback((newErrors: ServiceFormErrors<T>) => {
    setErrors((previous) => ({ ...previous, ...newErrors }))
  }, [])

  const setTouched = useCallback((key: keyof T, isTouched = true) => {
    setTouchedState((previous) => ({ ...previous, [key]: isTouched }))
  }, [])

  const validate = useCallback((validators: ServiceFormValidators<T> = formValidators) => {
    const nextErrors: ServiceFormErrors<T> = {}
    let isValid = true

    Object.entries(validators).forEach(([key, validator]) => {
      if (!validator) return
      const typedKey = key as keyof T
      const error = validator(values[typedKey], values)
      if (error) {
        nextErrors[typedKey] = error
        isValid = false
      }
    })

    setErrors(nextErrors)
    setTouchedState((previous) => Object.keys(validators).reduce((next, key) => ({ ...next, [key]: true }), previous))
    return isValid
  }, [formValidators, values])

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => async (event: React.FormEvent) => {
      event.preventDefault()
      if (!validate()) return
      setSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setSubmitting(false)
      }
    },
    [validate, values]
  )

  const reset = useCallback((newInitialValues?: T) => {
    const valuesToUse = newInitialValues ?? initialValuesRef
    setValues(valuesToUse)
    setInitialValuesRef(valuesToUse)
    setErrors({})
    setTouchedState({})
  }, [initialValuesRef])

  return [{ values, errors, touched, isSubmitting, isDirty }, {
    setValue,
    setValues: setValuesBatch,
    setError,
    setErrors: setErrorsBatch,
    setTouched,
    setSubmitting,
    reset,
    validate,
    handleSubmit,
  }]
}

export function createRequiredValidator<T>(fieldName: string) {
  return (value: T): string | undefined => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return `${fieldName} is required`
    return undefined
  }
}

export function createEmailValidator() {
  return (value: string): string | undefined => {
    if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address'
    return undefined
  }
}

export function createMinLengthValidator(min: number) {
  return (value: string): string | undefined => {
    if (value.trim() && value.trim().length < min) return `Must be at least ${min} characters`
    return undefined
  }
}

export function createNumberValidator(min?: number, max?: number) {
  return (value: string | number): string | undefined => {
    if (typeof value === 'string' && value.trim() === '') return 'Enter a valid number'
    const num = Number(value)
    if (!Number.isFinite(num)) return 'Enter a valid number'
    if (min !== undefined && num < min) return `Must be at least ${min}`
    if (max !== undefined && num > max) return `Must be at most ${max}`
    return undefined
  }
}
