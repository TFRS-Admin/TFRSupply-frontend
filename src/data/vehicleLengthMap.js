/**
 * data/vehicleLengthMap.js
 * Maps vehicle make/model patterns to recommended lightbar length skuSegments.
 * Used by the configurator to visually label compatible options.
 * Does NOT filter or remove any options.
 */

const VEHICLE_LENGTH_MAP = [
  { makePattern: 'Ford',      modelPattern: 'Police Interceptor Utility', lengths: ['53'] },
  { makePattern: 'Ford',      modelPattern: 'Expedition SSV',             lengths: ['53', '60'] },
  { makePattern: 'Ford',      modelPattern: 'F-150',                      lengths: ['53', '60'] },
  { makePattern: 'Ford',      modelPattern: 'F-350',                      lengths: ['60'] },
  { makePattern: 'Ford',      modelPattern: 'F-450',                      lengths: ['60'] },
  { makePattern: 'Chevrolet', modelPattern: 'Tahoe',                      lengths: ['53'] },
  { makePattern: 'Chevrolet', modelPattern: 'Suburban',                   lengths: ['53', '60'] },
  { makePattern: 'Chevrolet', modelPattern: 'Silverado',                  lengths: ['53', '60'] },
  { makePattern: 'Dodge',     modelPattern: 'Charger',                    lengths: ['45'] },
  { makePattern: 'Dodge',     modelPattern: 'Durango',                    lengths: ['53'] },
  { makePattern: 'Ram',       modelPattern: '1500',                       lengths: ['53'] },
  { makePattern: 'Ram',       modelPattern: '3500',                       lengths: ['60'] },
];

/**
 * Returns an array of recommended length skuSegments for a given vehicle,
 * or an empty array if no rule matches.
 * @param {{ make: string, model: string } | null} vehicle
 * @returns {string[]}
 */
export function getRecommendedLengths(vehicle) {
  if (!vehicle) return [];
  const rule = VEHICLE_LENGTH_MAP.find(
    r =>
      vehicle.make?.toLowerCase().includes(r.makePattern.toLowerCase()) &&
      vehicle.model?.toLowerCase().includes(r.modelPattern.toLowerCase())
  );
  return rule ? rule.lengths : [];
}