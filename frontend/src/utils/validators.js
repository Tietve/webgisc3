/**
 * Form validation utilities
 */

export const validators = {
  /**
   * Validate email format
   */
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },

  /**
   * Validate password (min 6 characters)
   */
  password: (password) => {
    return password && password.length >= 6
  },

  /**
   * Check if passwords match
   */
  passwordMatch: (password, confirmPassword) => {
    return password === confirmPassword
  },

  /**
   * Validate enrollment code (8 characters)
   */
  enrollmentCode: (code) => {
    return code && code.length === 8
  },

  /**
   * Required field validation
   */
  required: (value) => {
    return value !== null && value !== undefined && value.trim() !== ''
  },
}

/**
 * Validate form data
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateForm = (data, rules) => {
  const errors = {}

  Object.keys(rules).forEach((field) => {
    const rule = rules[field]
    const value = data[field]

    if (rule.required && !validators.required(value)) {
      errors[field] = rule.message || `${field} is required`
    } else if (rule.email && !validators.email(value)) {
      errors[field] = rule.message || 'Invalid email format'
    } else if (rule.password && !validators.password(value)) {
      errors[field] = rule.message || 'Password must be at least 6 characters'
    } else if (rule.match && value !== data[rule.match]) {
      errors[field] = rule.message || 'Passwords do not match'
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
