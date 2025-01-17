import { StoreProxy } from '../../types/storage'

export const STORAGE_KEYS = [
  'user',
  'validToken',

  'adapted',
  'coilSite',
  'monetized',
  'monetizedTotal',

  'popup-route:last',
  'popup-route:tipping-shown'
]

export type PopupStateType = Omit<StoreProxy, 'token'>
