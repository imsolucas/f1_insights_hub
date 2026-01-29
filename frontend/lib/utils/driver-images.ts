import { Driver } from '../api-client';

/**
 * Map driverId (or name) to image filename when it doesn't match forename_surname.
 * Keys are lowercase driverId from API; values are the filename without .png
 */
const DRIVER_IMAGE_OVERRIDES: Record<string, string> = {
  antonelli: 'kimi_antonelli',
  hadjar: 'isaac_hadjar',
};

/**
 * Name-based overrides when forename+surname doesn't match filename.
 * Key: normalized fullName that API would produce; value: actual filename (no .png)
 */
const DRIVER_IMAGE_NAME_OVERRIDES: Record<string, string> = {
  andrea_kimi_antonelli: 'kimi_antonelli',
  isack_hadjar: 'isaac_hadjar',
  alex_albon: 'alexander_albon',
};

function normalizeNamePart(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Get driver image path. Uses overrides when API name doesn't match file naming.
 * Tries driverId override, then forename_surname override, then forename_surname as filename.
 */
export function getDriverImagePath(driver: Driver): string {
  const driverIdKey = driver.driverId?.toLowerCase().trim();
  const overrideById = driverIdKey && DRIVER_IMAGE_OVERRIDES[driverIdKey];
  if (overrideById) {
    return `/driver-images/${overrideById}.png`;
  }

  const forename = normalizeNamePart(driver.forename ?? '');
  const surname = normalizeNamePart(driver.surname ?? '');
  const fullName = forename && surname ? `${forename}_${surname}` : surname || forename;

  const overrideByName = fullName && DRIVER_IMAGE_NAME_OVERRIDES[fullName];
  if (overrideByName) {
    return `/driver-images/${overrideByName}.png`;
  }
  if (fullName) {
    return `/driver-images/${fullName}.png`;
  }
  return '/driver-images/unknown_driver.png';
}

/**
 * Get initials for a driver (e.g. "FA" for Fernando Alonso). Used as fallback when image fails to load.
 */
export function getDriverInitials(driver: Driver): string {
  const f = (driver.forename ?? '').trim();
  const s = (driver.surname ?? '').trim();
  if (f && s) return `${f[0]}${s[0]}`.toUpperCase();
  if (s) return s.slice(0, 2).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '?';
}
