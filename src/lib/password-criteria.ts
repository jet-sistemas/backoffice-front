export const PASSWORD_SPECIAL_CHARS = '!@#$%&*-_+=?'

export interface PasswordCriterion {
  id: string
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_CRITERIA: PasswordCriterion[] = [
  {
    id: 'minLength',
    label: 'Mínimo 8 caracteres',
    test: (password) => password.length >= 8,
  },
  {
    id: 'upper',
    label: 'Letra maiúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lower',
    label: 'Letra minúscula',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'digit',
    label: 'Número',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'special',
    label: `Caractere especial (${PASSWORD_SPECIAL_CHARS})`,
    test: (password) => /[!@#$%&*\-_+=?]/.test(password),
  },
]
