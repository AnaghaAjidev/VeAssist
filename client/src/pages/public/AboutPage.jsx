import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import aboutImage from "../../assets/about-image.png";
import {
    Users,
    UserCheck,
    Building2,
    ShieldCheck,
} from "lucide-react";


function AboutPage() {
    return (
        <>
            <Navbar />

            {/* Hero */}
            <section className="pt-36 pb-24 bg-gradient-to-r from-[#0B1F3A] via-[#163A63] to-[#1F4E79]">

                <div className="max-w-7xl mx-auto px-6 text-center">

                    <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold mb-5">
                        About VeAssist
                    </p>

                    <h1 className="text-6xl font-bold text-white leading-tight">
                        Empowering Naval
                        <br />
                        Ex-Servicemen Families
                    </h1>

                    <p className="max-w-3xl mx-auto mt-8 text-lg leading-8 text-gray-200">

                        Learn about the vision, purpose, and commitment behind
                        VeAssist—a platform designed to simplify welfare assistance
                        and support families with confidence.

                    </p>

                </div>

            </section>

            {/* Project Overview */}
            <section className="py-24 bg-[#D3E3F4]">

                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left */}

                    <div className="flex justify-center">

                        <img
                            src={aboutImage}
                            alt="Project Overview"
                            className="w-[90%]"
                        />

                    </div>

                    {/* Right */}

                    <div>

                        <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold mb-4">
                            Project Overview
                        </p>

                        <h2 className="text-5xl font-bold text-[#0B1F3A] leading-tight">
                            A Digital Platform
                            <br />
                            Built with Purpose
                        </h2>

                        <p className="mt-8 text-lg text-gray-600 leading-8">
                            VeAssist is a web-based assistance platform developed to support
                            Naval Ex-Servicemen families in accessing welfare services with
                            greater ease and confidence. It brings together AI-guided
                            assistance, document management, application tracking, and
                            Welfare Officer support into a single digital platform.
                        </p>

                        <p className="mt-6 text-lg text-gray-600 leading-8">
                            Beyond the initial assistance process, VeAssist also helps families
                            discover relevant scholarship opportunities and widow vocational
                            training assistance, providing guidance on eligibility, documents,
                            and official application procedures.
                        </p>

                    </div>

                </div>

            </section>


            <section className="py-24 bg-gradient-to-r from-[#0B1F3A] via-[#163A63] to-[#1F4E79]">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="relative grid lg:grid-cols-2 gap-20 items-start">

                        {/* Vertical Divider */}
                        <div className="hidden lg:block absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-white/20"></div>

                        {/* Mission */}
                        <div className="text-center lg:text-left">

                            <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold mb-5">
                                Our Mission
                            </p>

                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Making Welfare Assistance
                                <br />
                                Simple, Accessible &
                                <br />
                                Reliable
                            </h2>

                            <p className="mt-8 text-gray-200 leading-8">
                                Our mission is to empower Naval Ex-Servicemen families by
                                providing a secure digital platform that simplifies welfare
                                procedures, reduces confusion, and ensures timely access to
                                guidance, documentation, and continuous support throughout
                                every stage of the assistance process.
                            </p>

                        </div>

                        {/* Vision */}
                        <div className="text-center lg:text-left">

                            <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold mb-5">
                                Our Vision
                            </p>

                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Building a Future
                                <br />
                                Where Every Family
                                <br />
                                Receives Support
                            </h2>

                            <p className="mt-8 text-gray-200 leading-8">
                                We envision a future where every Naval Ex-Servicemen family
                                can access welfare information, guidance, and essential
                                services through one trusted digital platform that promotes
                                transparency, accessibility, and confidence for everyone.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

            {/* Objectives */}
            <section className="py-24 bg-[#D3E3F4]">

                <div className="max-w-5xl mx-auto px-6">

                    <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold text-center mb-5">
                        Objectives
                    </p>

                    <h2 className="text-5xl font-bold text-[#0B1F3A] text-center mb-16">
                        What We Aim to Achieve
                    </h2>

                    <div className="space-y-10">

                        {/* Objective 01 */}
                        <div className="flex gap-8">
                            <span className="text-5xl font-bold text-[#D4AF37]">01</span>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Simplify Welfare Procedures
                                </h3>

                                <p className="text-gray-600 mt-2 leading-7">
                                    Make assistance procedures easier to understand through a structured digital platform.
                                </p>
                            </div>
                        </div>

                        <hr className="border-slate-300" />

                        {/* Objective 02 */}
                        <div className="flex gap-8">
                            <span className="text-5xl font-bold text-[#D4AF37]">02</span>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Provide AI-Guided Assistance
                                </h3>

                                <p className="text-gray-600 mt-2 leading-7">
                                    Offer intelligent guidance and recommendations throughout every stage of the process.
                                </p>
                            </div>
                        </div>

                        <hr className="border-slate-300" />

                        {/* Objective 03 */}
                        <div className="flex gap-8">
                            <span className="text-5xl font-bold text-[#D4AF37]">03</span>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Secure Document Management
                                </h3>

                                <p className="text-gray-600 mt-2 leading-7">
                                    Ensure important documents are safely stored, organized, and easily accessible.
                                </p>
                            </div>
                        </div>

                        <hr className="border-slate-300" />

                        {/* Objective 04 */}
                        <div className="flex gap-8">
                            <span className="text-5xl font-bold text-[#D4AF37]">04</span>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Improve Communication & Transparency
                                </h3>

                                <p className="text-gray-600 mt-2 leading-7">
                                    Keep families informed with timely updates and transparent progress tracking.
                                </p>
                            </div>
                        </div>

                        <hr className="border-slate-300" />

                        {/* Objective 05 */}
                        <div className="flex gap-8">
                            <span className="text-5xl font-bold text-[#D4AF37]">05</span>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Extend Assistance Beyond Initial Procedures
                                </h3>

                                <p className="text-gray-600 mt-2 leading-7">
                                    Help families discover relevant scholarships and widow vocational
                                    training opportunities with clear guidance throughout the application process.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Who Can Use VeAssist */}
            <section className="py-24 bg-gradient-to-r from-[#0B1F3A] via-[#163A63] to-[#1F4E79]">

                <div className="max-w-7xl mx-auto px-6">

                    <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold text-center mb-5">
                        Who Can Use VeAssist?
                    </p>

                    <h2 className="text-5xl font-bold text-white text-center mb-16">
                        Designed for Every Stakeholder
                    </h2>

                    <div className="grid md:grid-cols-4 gap-10 text-center">

                        <div>
                            <div className="w-20 h-20 mx-auto rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B1F3A] mb-5 shadow-lg">
                                <Users size={38} />
                            </div>

                            <h3 className="text-xl font-semibold text-white">
                                Families
                            </h3>

                            <p className="mt-3 text-gray-200 leading-7">
                                Access guidance, upload documents, and track applications.
                            </p>
                        </div>

                        <div>
                            <div className="w-20 h-20 mx-auto rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B1F3A] mb-5 shadow-lg">
                                <UserCheck size={38} />
                            </div>

                            <h3 className="text-xl font-semibold text-white">
                                Welfare Officers
                            </h3>

                            <p className="mt-3 text-gray-200 leading-7">
                                Verify cases, guide families, and manage assistance.
                            </p>
                        </div>

                        <div>
                            <div className="w-20 h-20 mx-auto rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B1F3A] mb-5 shadow-lg">
                                <Building2 size={38} />
                            </div>

                            <h3 className="text-xl font-semibold text-white">
                                Authorities
                            </h3>

                            <p className="mt-3 text-gray-200 leading-7">
                                Review applications and monitor welfare services.
                            </p>
                        </div>

                        <div>
                            <div className="w-20 h-20 mx-auto rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B1F3A] mb-5 shadow-lg">
                                <ShieldCheck size={38} />
                            </div>

                            <h3 className="text-xl font-semibold text-white">
                                Administrators
                            </h3>

                            <p className="mt-3 text-gray-200 leading-7">
                                Manage users, monitor the platform, and ensure security.
                            </p>
                        </div>

                    </div>

                </div>

            </section>
            {/* Technology Stack */}
            <section className="py-24 bg-[#EDF4FC]">

                <div className="max-w-6xl mx-auto px-6 text-center">

                    <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold mb-5">
                        Technology Stack
                    </p>

                    <h2 className="text-5xl font-bold text-[#0B1F3A] mb-8">
                        Technologies Behind VeAssist
                    </h2>

                    <p className="text-gray-600 text-lg mb-14">
                        Modern technologies powering a secure and scalable assistance platform.
                    </p>

                    <div className="flex flex-wrap justify-center gap-5">

                        {[
                            "React.js",
                            "Tailwind CSS",
                            "Node.js",
                            "Express.js",
                            "MongoDB Atlas",
                            "Cloudinary",
                            "JWT",
                            "Git",
                            "GitHub",
                            "Gemini AI"
                        ].map((tech, index) => (

                            <span
                                key={index}
                                className="px-6 py-3 rounded-full bg-white border border-slate-200
          text-[#0B1F3A] font-semibold shadow-sm hover:bg-[#0B1F3A]
          hover:text-white transition"
                            >
                                {tech}
                            </span>

                        ))}

                    </div>

                </div>

            </section>
            {/* Future Scope */}
            <section className="py-14 bg-[#D3E3F4]">

                <div className="max-w-5xl mx-auto px-6">

                    <p className="uppercase tracking-[5px] text-[#D4AF37] font-semibold text-center mb-5">
                        Future Scope
                    </p>

                    <h2 className="text-5xl font-bold text-[#0B1F3A] text-center mb-16">
                        Expanding the Future of VeAssist
                    </h2>

                    <div className="space-y-4">

                        <div className="flex gap-8 items-start">

                            <div className="w-5 h-5 rounded-full bg-[#D4AF37] mt-3"></div>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Mobile Application
                                </h3>

                                <p className="text-gray-600 mt-3 leading-7">
                                    Develop Android and iOS applications to provide seamless access
                                    for users on mobile devices.
                                </p>
                            </div>

                        </div>

                        <div className="border-l-2 border-[#D4AF37] ml-2 h-12"></div>

                        <div className="flex gap-8 items-start">

                            <div className="w-5 h-5 rounded-full bg-[#D4AF37] mt-3"></div>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Government Integration
                                </h3>

                                <p className="text-gray-600 mt-3 leading-7">
                                    Integrate with official welfare portals to simplify document
                                    verification and application processing.
                                </p>
                            </div>

                        </div>

                        <div className="border-l-2 border-[#D4AF37] ml-2 h-12"></div>

                        <div className="flex gap-8 items-start">

                            <div className="w-5 h-5 rounded-full bg-[#D4AF37] mt-3"></div>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#0B1F3A]">
                                    Multilingual Support
                                </h3>

                                <p className="text-gray-600 mt-3 leading-7">
                                    Enable regional language support to improve accessibility for
                                    families across India.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </section>
            <Footer />
        </>
    );
}

export default AboutPage;