import logo from "../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (

    <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src={logo}
            alt="VeAssist Logo"
            className="w-20 h-14 object-contain scale-125"
          />

          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B1F3A]">
            VeAssist
          </h1>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center gap-10 text-[17px] font-medium text-gray-700">
          <li
            onClick={() => scrollToSection("home")}
            className="cursor-pointer hover:text-[#0B1F3A]"
          >
            Home
          </li>

          <li
            onClick={() => scrollToSection("about")}
            className="cursor-pointer hover:text-[#0B1F3A]"
          >
            About
          </li>

          <li
            onClick={() => scrollToSection("features")}
            className="cursor-pointer hover:text-[#0B1F3A]"
          >
            Features
          </li>

          <li
            onClick={() => scrollToSection("contact")}
            className="cursor-pointer hover:text-[#0B1F3A]"
          >
            Contact
          </li>
        </ul>

        {/* Login Button */}
        <button className="bg-[#0B1F3A] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1F4E79] transition duration-300 shadow-md hover:shadow-lg">
          Login
        </button>

      </div>
    </nav>
  );
}

export default Navbar;