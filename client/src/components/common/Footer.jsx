import { Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer id="contact" className="bg-[#081627] text-gray-300">

      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">

        {/* Brand */}

        <div>
          <h2 className="text-3xl font-bold text-white">
            VeAssist
          </h2>

          <div className="w-16 h-1 bg-[#D4AF37] mt-2 mb-5 rounded-full"></div>

        </div>

        {/* Quick Links */}

        <div>
          <h3 className="text-xl font-semibold text-white mb-5">
            Quick Links
          </h3>

          <ul className="space-y-3">

            <li className="hover:text-[#D4AF37] cursor-pointer transition">
              Home
            </li>

            <li className="hover:text-[#D4AF37] cursor-pointer transition">
              About
            </li>

            <li className="hover:text-[#D4AF37] cursor-pointer transition">
              Features
            </li>

            <li className="hover:text-[#D4AF37] cursor-pointer transition">
              Contact
            </li>

          </ul>
        </div>

        {/* Services */}

        <div>

          <h3 className="text-xl font-semibold text-white mb-5">
            Our Services
          </h3>

          <ul className="space-y-2">

            <li>AI Guidance</li>

            <li>Document Repository</li>

            <li>Case & Application Tracking</li>

            <li>Scholarship Assistance</li>

            <li>Widow Vocational Training</li>

            <li>Welfare Officer Support</li>

          </ul>

        </div>

        {/* Contact */}

        <div>

          <h3 className="text-xl font-semibold text-white mb-5">
            Contact Us
          </h3>

          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[#D4AF37]" />
              <span>support@veassist.in</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-[#D4AF37]" />
              <span>+91 7907100949</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-[#D4AF37]" />
              <span>Kerala, India</span>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-gray-700">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">

          <p>
            © 2026 VeAssist. All Rights Reserved.
          </p>

          <div className="flex gap-6 mt-3 md:mt-0">

            <span className="hover:text-[#D4AF37] cursor-pointer transition">
              Privacy Policy
            </span>

            <span className="hover:text-[#D4AF37] cursor-pointer transition">
              Terms & Conditions
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;