import React from "react";

import {
    Languages,
    ChevronDown,
} from "lucide-react";

import {
    useLanguage,
} from "../../i18n/LanguageContext";

const LanguageSelector = () => {

    const {
        language,
        setLanguage,
    } = useLanguage();

    const handleChange = (event) => {

        setLanguage(
            event.target.value
        );

    };

    return (
        <div className="relative">

            <div
                className="
                    flex items-center gap-2
                    bg-white
                    border border-[#C8D8E8]
                    rounded-xl
                    px-3 py-2
                    shadow-sm
                "
            >

                <Languages
                    size={17}
                    className="text-[#1F4E79]"
                />

                <select
                    value={language}
                    onChange={handleChange}
                    className="
                        bg-transparent
                        text-sm
                        font-semibold
                        text-[#0B1F3A]
                        outline-none
                        cursor-pointer
                        appearance-none
                        pr-5
                    "
                    aria-label="Select language"
                >

                    <option value="en">
                        English
                    </option>

                    <option value="ml">
                        മലയാളം
                    </option>

                    <option value="hi">
                        हिन्दी
                    </option>

                </select>

                <ChevronDown
                    size={15}
                    className="
                        text-[#617A92]
                        pointer-events-none
                        -ml-5
                    "
                />

            </div>

        </div>
    );
};

export default LanguageSelector;