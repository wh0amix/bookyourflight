import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              <h3 className="text-xl font-bold">BookYourFlight</h3>
            </div>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Your trusted partner for seamless flight booking experiences worldwide.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Destinations</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Special Offers</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Travel Blog</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">FAQs</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Booking Policy</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-zinc-400">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" />
                <span>support@bookyourflight.com</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-400">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" />
                <span>123 Aviation Street, New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm">
            © 2026 BookYourFlight. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Privacy</a>
            <a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Terms</a>
            <a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
