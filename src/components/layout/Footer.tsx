import React from "react";
import { Link } from "@/lib/router-compat";
import { Mail, Phone, MapPin, Instagram, Facebook} from "lucide-react";

const XIcon = ({ size = 24, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/" },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/" },
  { name: "X", icon: XIcon, href: "https://x.com/" },
];

const Footer = () => {
  return (
    <footer id="contact">
      {/* Main footer */}
      <div className="bg-neutral-950 text-neutral-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                roge<span className="text-primary">.</span>
              </h3>
              <p className="text-sm leading-relaxed mb-5">
                Your partner for high-quality custom printing. We bring your designs to life.
              </p>
              <div className="flex gap-3">
                {socials.map(({ name, icon: Icon, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Roge on ${name}`}
                    title={name}
                    className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-5">
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/collection" className="hover:text-primary transition-colors">Collection</Link></li>
                <li><Link to="/manufacturers" className="hover:text-primary transition-colors">Manufacturers</Link></li>
                <li><a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="/#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-5">
                Products
              </h4>
              <ul className="space-y-3 text-sm">
                {["T-Shirts", "Hoodies", "Caps", "Banners & Flags", "Business Cards"].map((p) => (
                  <li key={p}>
                    <Link to="/designer" className="hover:text-primary transition-colors">
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-5">
                Contact Us
              </h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <a href="mailto:rogeprints@gmail.com" className="hover:text-primary transition-colors">
                    rogeprints@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <a href="tel:+2222222220" className="hover:text-primary transition-colors">
                    +222 222 2220
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Worldwide</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <p>&copy; {new Date().getFullYear()} roge. All rights reserved.</p>
            <p className="space-x-4">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;