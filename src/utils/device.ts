/**
 * Device detection utilities
 */

/**
 * Determines if the current device is a mobile device
 * @returns true if the device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Determines if the current device is a tablet
 * @returns true if the device is a tablet, false otherwise
 */
export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth > 768 && window.innerWidth <= 1024
}

/**
 * Determines if the current device is a desktop
 * @returns true if the device is desktop, false otherwise
 */
export const isDesktopDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth > 1024
}

/**
 * Gets the current screen width
 * @returns screen width in pixels
 */
export const getScreenWidth = (): number => {
  if (typeof window === 'undefined') return 1024
  return window.innerWidth
}

/**
 * Gets the current screen height
 * @returns screen height in pixels
 */
export const getScreenHeight = (): number => {
  if (typeof window === 'undefined') return 768
  return window.innerHeight
} 