import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

interface QuickLink {
  label: string;
  to: string;
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
];

interface SocialLink {
  label: string;
  href: string;
  Icon: typeof Facebook;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com', Icon: Facebook },
  { label: 'Instagram', href: 'https://www.instagram.com', Icon: Instagram },
  { label: 'LinkedIn', href: 'https://www.linkedin.com', Icon: Linkedin },
];

export interface FooterProps {
  currentYear?: number;
}

export default function Footer({ currentYear = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className="bg-[#1c1c1c] font-montserrat text-gray-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-gray-400">
          &copy; {currentYear} TFR Supply. All rights reserved.
        </p>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-300 transition-colors hover:text-[#e21938]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-gray-300 transition-colors hover:text-[#e21938]"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
