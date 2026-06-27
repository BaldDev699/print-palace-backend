import React from "react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-muted text-muted-foreground py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">roge</h3>
            <p className="text-sm">
              Your partner for high-quality custom printing. We bring your designs to life.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-primary">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-primary">
                  Products
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li>
                <p>Email: contact@rogeprint.com</p>
              </li>
              <li>
                <p>Phone: (123) 456-7890</p>
              </li>
              <li>
                <p>123 Print Street, Design City, DC 12345</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} roge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
