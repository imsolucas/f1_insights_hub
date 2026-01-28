import { Driver } from '../api-client';

/**
 * Map driverId (or name) to image filename when it doesn't match forename_surname.
 * Keys are lowercase driverId from API; values are the filename without .png
 */
const DRIVER_IMAGE_OVERRIDES: Record<string, string> = {
  // Andrea Kimi Antonelli -> file is andrea_kim_antonelli (not andrea_kimi_antonelli)
  antonelli: 'andrea_kim_antonelli',
  // Isaac Hadjar -> file is isaac_hadjar
  hadjar: 'isaac_hadjar',
};

/**
 * Name-based overrides when forename+surname doesn't match filename.
 * Key: normalized fullName that API would produce; value: actual filename (no .png)
 */
const DRIVER_IMAGE_NAME_OVERRIDES: Record<string, string> = {
  andrea_kimi_antonelli: 'andrea_kim_antonelli',
  isack_hadjar: 'isaac_hadjar',
};

/**
 * Get driver image path. Uses overrides when API name doesn't match file naming.
 */
export function getDriverImagePath(driver: Driver): string {
  const driverIdKey = driver.driverId?.toLowerCase().trim();
  const overrideById = driverIdKey && DRIVER_IMAGE_OVERRIDES[driverIdKey];
  if (overrideById) {
    return `/driver-images/${overrideById}.png`;
  }

  const fullName = `${driver.forename}_${driver.surname}`
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  const overrideByName = DRIVER_IMAGE_NAME_OVERRIDES[fullName];
  if (overrideByName) {
    return `/driver-images/${overrideByName}.png`;
  }
  return `/driver-images/${fullName}.png`;
}
