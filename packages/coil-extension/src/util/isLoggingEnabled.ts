import { BuildConfig } from '../types/BuildConfig'
import { BUILD_CONFIG, COIL_DOMAIN } from '../webpackDefines'

export function isLoggingEnabled(buildConfig: BuildConfig) {
  const enabled = Boolean(buildConfig.isLoggingEnabled)
  const logEnabled = localStorage.getItem('COIL_LOGGING_ENABLED')
  if (logEnabled === null && COIL_DOMAIN === 'http://localhost:4000') {
    localStorage.COIL_LOGGING_ENABLED = true
  }
  const override = Boolean(localStorage.COIL_LOGGING_ENABLED)
  return enabled || override
}

export const loggingEnabled = isLoggingEnabled(BUILD_CONFIG)
