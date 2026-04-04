import { validateAuthPayload } from './validation.js';

export function validateCredentials(values, isRegister) {
  return validateAuthPayload(values, isRegister);
}
