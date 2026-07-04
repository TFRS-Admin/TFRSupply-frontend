import fireTruckImg from '@/assets/images/navigation/fire-truck.webp';
import industrialWarningImg from '@/assets/images/navigation/industrial-warning.webp';
import outdoorWarningSirenImg from '@/assets/images/navigation/outdoor-warning-siren.webp';
import policeMarketImg from '@/assets/images/navigation/police-market.jpg';
import workTruckImg from '@/assets/images/navigation/work-truck.webp';

/**
 * Single source of truth for the primary nav verticals shown in the desktop
 * mega menu and mobile drawer. `path: null` verticals have no catalog data
 * yet (see src/data/verticals) and render as "Coming Soon" — matches the
 * pre-existing disabled state in SiteHeader/StoreLanding.
 */
export const NAV_VERTICALS = [
  {
    id: 'police',
    label: 'Police',
    path: '/police',
    image: policeMarketImg,
    imageAlt: 'Police vehicle equipped with Federal Signal warning lights',
    tagline: 'Police Vehicle Safety Devices',
    description: 'Exterior and interior warning lights, sirens, speakers, and directional lighting engineered for officer safety.',
  },
  {
    id: 'fire',
    label: 'Fire/EMS',
    path: '/fire',
    image: fireTruckImg,
    imageAlt: 'Fire apparatus equipped with Federal Signal warning equipment',
    tagline: 'Fire & EMS Warning Equipment',
    description: 'Reliable warning devices built for first responders and emergency medical crews.',
  },
  {
    id: 'work-truck',
    label: 'Work Truck',
    path: '/work-truck',
    image: workTruckImg,
    imageAlt: 'Work truck equipped with amber warning lighting',
    tagline: 'Work Truck Warning Equipment',
    description: 'Lights, beacons, sirens, and accessories for utility, municipal, and heavy-duty fleets.',
  },
  {
    id: 'signaling',
    label: 'Signaling Devices',
    path: null,
    image: industrialWarningImg,
    imageAlt: 'Industrial warning and signaling equipment',
    tagline: 'Industrial Signaling Devices',
    description: 'A broad selection of warning and signaling products for industrial use.',
  },
  {
    id: 'mass',
    label: 'Mass Notification',
    path: null,
    image: outdoorWarningSirenImg,
    imageAlt: 'Outdoor warning siren tower against a blue sky',
    tagline: 'Mass Notification & Outdoor Warning',
    description: 'Community alerting systems and outdoor warning sirens that communicate when it matters most.',
  },
];
