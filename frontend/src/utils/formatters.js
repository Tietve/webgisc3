/**
 * Formatting utility functions
 */

/**
 * Format date to Vietnamese format
 * @param {string|Date} date
 * @returns {string} Formatted date (DD/MM/YYYY)
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format datetime to Vietnamese format
 * @param {string|Date} datetime
 * @returns {string} Formatted datetime (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const d = new Date(datetime)
  const date = formatDate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${date} ${hours}:${minutes}`
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get initials from email
 * @param {string} email
 * @returns {string} First letter uppercase
 */
export const getInitials = (email) => {
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
}

/**
 * Format score
 * @param {number} score
 * @returns {string} Score/100
 */
export const formatScore = (score) => {
  return `${score}/100`
}
