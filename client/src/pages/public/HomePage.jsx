import Navbar from "../../components/common/Navbar";
import heroImage from "../../assets/hero-image.png";
import {
    Bot, FileText, ClipboardCheck, Bell, Users, ShieldCheck, GraduationCap,
    FilePlus, FolderOpen, UserCheck, MapPinned, CircleCheckBig
} from "lucide-react";
import Footer from "../../components/common/Footer";
import aboutImage from "../../assets/about-image.png";
import { Link } from "react-router-dom";


function HomePage() {
    const features = [
        {
            icon: <Bot size={40} />,
            title: "AI Guidance",
            description:
                "Receive personalized guidance, checklists, and smart assistance throughout the welfare process.",
        },
        {
            icon: <ClipboardCheck size={40} />,
            title: "Case & Application Tracking",
            description:
                "Manage assistance cases, applications, tasks, and monitor progress from one place.",
        },
        {
            icon: <FileText size={40} />,
            title: "Document Management",
            description:
                "Securely upload, organize, and manage important documents with status and missing-document alerts.",
        },
        {
            icon: <GraduationCap size={40} />,
            title: "Scholarship & Training Assistance",
            description:
                "Discover relevant scholarships and widow vocational training opportunities with guidance on eligibility and applications.",
        },
        {
            icon: <Users size={40} />,
            title: "Welfare Officer Support",
            description:
                "Receive guidance and support from Welfare Officers throughout the assistance process.",
        },
        {
            icon: <ShieldCheck size={40} />,
            title: "Notifications & Secure Records",
            description:
                "Receive timely reminders and updates while keeping personal information and records protected.",
        },
    ];

    const workflow = [
        {
            step: "01",
            icon: <FilePlus size={32} />,
            title: "Register Case",
            description:
                "Family registers a new assistance case after the loss of the veteran.",
        },
        {
            step: "02",
            icon: <FolderOpen size={32} />,
            title: "Upload Documents",
            description:
                "Upload all required documents securely for verification.",
        },
        {
            step: "03",
            icon: <UserCheck size={32} />,
            title: "Officer Verification",
            description:
                "Welfare Officer reviews documents and guides the family.",
        },
        {
            step: "04",
            icon: <MapPinned size={32} />,
            title: "Track Progress",
            description:
                "Monitor application progress and receive timely updates.",
        },
        {
            step: "05",
            icon: <CircleCheckBig size={32} />,
            title: "Case Completed",
            description:
                "All assistance procedures are completed successfully.",
        },
    ];

    return (
        <>
            <Navbar />

            <section id="home" className="min-h-screen pt-32 bg-gradient-to-br from-[#F8FBFF] via-[#EEF5FF] to-[#F7FAFC] flex items-center">  <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Content */}
                <div>
                    <p className="text-[#D4AF37] font-semibold uppercase tracking-widest mb-4">
                        VeAssist
                    </p>

                    <h1 className="text-5xl lg:text-6xl font-bold text-[#0B1F3A] leading-tight">
                        Supporting Naval
                        <br />
                        Ex-Servicemen Families
                        <br />
                        <span className="text-[#1F4E79]">
                            Through Every Step
                        </span>
                    </h1>

                    <p className="mt-6 text-lg text-gray-600 leading-8">
                        VeAssist helps families navigate pension, ECHS, insurance and welfare
                        procedures after the loss of a veteran. Get personalized guidance,
                        document management and application tracking in one place.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <Link
                            to="/register"
                            className="bg-[#0B1F3A] text-white px-7 py-3 rounded-xl hover:bg-[#1F4E79] transition inline-block"
                        >
                            Register Now
                        </Link>

                        <button
                            onClick={() =>
                                document.getElementById("features")?.scrollIntoView({
                                    behavior: "smooth",
                                })
                            }
                            className="border border-[#0B1F3A] text-[#0B1F3A] px-7 py-3 rounded-xl hover:bg-[#0B1F3A] hover:text-white transition"
                        >
                            Explore Features
                        </button>

                    </div>
                </div>

                {/* Right Side */}

                <div className="relative flex justify-center items-center">

                    <div className="absolute w-[430px] h-[430px] rounded-full bg-blue-200 opacity-30 blur-3xl"></div>

                    <img
                        src={heroImage}
                        alt="Hero Illustration"
                        className="relative w-[90%] mx-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.18)] hover:scale-105 transition duration-500"
                    />

                </div>
            </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-white border-t border-slate-200">

                <div className="max-w-7xl mx-auto px-6 lg:px-12">

                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left Image */}

                        <div className="flex justify-center">

                            <img
                                src={aboutImage}
                                alt="About VeAssist"
                                className="w-[85%] rounded-3xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.18)]"
                            />

                        </div>

                        {/* Right Content */}

                        <div>

                            <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold mb-4">
                                Why VeAssist?
                            </p>

                            <h2 className="text-5xl font-bold text-[#0B1F3A] leading-tight">
                                Because No Family
                                <br />
                                Should Navigate
                                <br />
                                Alone
                            </h2>

                            <p className="mt-6 text-gray-600 leading-8 text-lg">
                                Losing a loved one is emotionally challenging, and navigating
                                multiple government procedures during such a time can be
                                overwhelming.

                                VeAssist was created to simplify this journey by providing
                                families with clear guidance, organized documentation,
                                application tracking, and continuous assistance—including
                                access to relevant scholarships and widow vocational training
                                opportunities.
                            </p>

                            {/* Statistics */}

                            <div className="grid grid-cols-3 gap-6 mt-10">

                                <div>
                                    <h3 className="text-3xl font-bold text-[#0B1F3A]">24/7</h3>
                                    <p className="text-gray-500 mt-2">AI Guidance</p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-bold text-[#0B1F3A]">100%</h3>
                                    <p className="text-gray-500 mt-2">Secure Records</p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-bold text-[#0B1F3A]">5+</h3>
                                    <p className="text-gray-500 mt-2">Key Services</p>
                                </div>

                            </div>

                            <Link to="/about">
                                <button className="mt-10 bg-[#0B1F3A] text-white px-7 py-3 rounded-xl hover:bg-[#1F4E79] transition">
                                    Read More
                                </button>
                            </Link>

                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-[#F4F8FD] border-t border-slate-200">

                <div className="max-w-7xl mx-auto px-6">

                    <h2 className="text-4xl font-bold text-center text-[#0B1F3A]">
                        Everything You Need, All in One Platform
                    </h2>

                    <p className="text-center text-gray-600 mt-4 mb-14 text-lg">
                        Designed to simplify assistance procedures for Naval Ex-Servicemen families.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

                        {features.map((feature, index) => (

                            <div
                                key={index}
                                className="h-full rounded-2xl p-5 border border-blue-100
          bg-gradient-to-br from-[#FFFFFF] via-[#F8FBFF] to-[#FFF9EC]
          shadow-md hover:shadow-2xl hover:border-[#D4AF37]
          hover:-translate-y-2 transition duration-300"
                            >

                                {/* Icon */}
                                <div className="w-15 h-15 rounded-full bg-[#EAF3FF] flex items-center justify-center text-[#1F4E79] mb-6">
                                    {feature.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-semibold text-[#0B1F3A] mb-3">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 leading-7">
                                    {feature.description}
                                </p>

                            </div>

                        ))}

                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-24 bg-[#EEF5FF] border-t border-slate-200">

                <div className="max-w-7xl mx-auto px-6">

                    <h2 className="text-4xl font-bold text-center text-[#0B1F3A]">
                        How VeAssist Works
                    </h2>

                    <p className="text-center text-gray-600 mt-4 mb-16 text-lg">
                        A simple step-by-step assistance process for Naval Ex-Servicemen families.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">

                        {workflow.map((item, index) => (

                            <div
                                key={index}
                                className="relative bg-white rounded-2xl p-8 shadow-md border border-transparent hover:border-[#0B1F3A] hover:shadow-2xl hover:-translate-y-2 transition duration-300 text-center h-full"
                            >

                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0B1F3A] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                    {item.step}
                                </div>

                                <div className="flex justify-center mt-6 text-[#1F4E79] mb-5">
                                    {item.icon}
                                </div>

                                <h3 className="text-xl font-semibold text-[#0B1F3A] mb-3">
                                    {item.title}
                                </h3>

                                <p className="text-gray-600 leading-7 text-sm">
                                    {item.description}
                                </p>

                            </div>

                        ))}

                    </div>

                    {/* Continued Assistance */}
                    <div className="mt-14 text-center">

                        <p className="text-[#1F4E79] text-lg font-medium">
                            Assistance continues beyond case completion
                        </p>

                        <div className="flex items-center justify-center gap-3 mt-3">
                            <span className="text-[#0B1F3A] font-semibold">
                                Scholarships
                            </span>

                            <span className="text-[#D4AF37]">•</span>

                            <span className="text-[#0B1F3A] font-semibold">
                                Widow Vocational Training
                            </span>
                        </div>

                    </div>

                </div>

            </section>

            <Footer id="contact" />
        </>
    );
}

export default HomePage;