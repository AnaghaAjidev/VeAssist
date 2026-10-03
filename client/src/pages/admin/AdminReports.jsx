import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Download,
    RefreshCw,
    Search,
    CalendarDays,
    FileSpreadsheet,
    FileDown,
    ChevronDown,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import logo from "../../assets/logo.png";

const API_URL = "http://localhost:5000/api";

const statusStyles = {
    Draft: "bg-slate-100 text-slate-700",
    Submitted: "bg-blue-100 text-blue-700",
    "Under Review": "bg-amber-100 text-amber-700",
    "Forwarded to Authority": "bg-purple-100 text-purple-700",
    "Under Authority Review": "bg-indigo-100 text-indigo-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
};

export default function AdminReports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [applicationType, setApplicationType] = useState("All");
    const [status, setStatus] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [exportOpen, setExportOpen] = useState(false);

    // Authentication
    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // Fetch reports
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/admin/reports`,
                getAuthConfig()
            );

            const data = response.data;

            const records = Array.isArray(data)
                ? data
                : data.applications || data.reports || [];

            setReports(records);
        } catch (err) {
            console.error("Failed to fetch reports:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load reports. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Get case ID
    const getCaseId = (report) => {
        const caseData = report.caseId;

        if (caseData && typeof caseData === "object") {
            return (
                caseData.caseId ||
                caseData._id ||
                caseData.id ||
                "—"
            );
        }

        return caseData || "—";
    };

    // Get applicant name
    const getApplicantName = (report) => {
        const applicant = report.submittedBy;

        if (applicant && typeof applicant === "object") {
            return applicant.name || applicant.fullName || "—";
        }

        return report.applicantName || "—";
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Filter reports
    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const caseId = String(getCaseId(report)).toLowerCase();
            const applicantName = String(
                getApplicantName(report)
            ).toLowerCase();

            const search = searchTerm.toLowerCase();

            const matchesSearch =
                !search ||
                caseId.includes(search) ||
                applicantName.includes(search);

            const matchesType =
                applicationType === "All" ||
                report.applicationType === applicationType;

            const matchesStatus =
                status === "All" || report.status === status;

            const reportDate = report.createdAt
                ? new Date(report.createdAt)
                : null;

            const matchesStart =
                !startDate ||
                (reportDate &&
                    reportDate >= new Date(`${startDate}T00:00:00`));

            const matchesEnd =
                !endDate ||
                (reportDate &&
                    reportDate <
                    new Date(
                        new Date(`${endDate}T00:00:00`).getTime() +
                        24 * 60 * 60 * 1000
                    ));

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus &&
                matchesStart &&
                matchesEnd
            );
        });
    }, [
        reports,
        searchTerm,
        applicationType,
        status,
        startDate,
        endDate,
    ]);

    // Summary based on filtered reports
    const filteredSummary = useMemo(() => {
        return {
            total: filteredReports.length,

            approved: filteredReports.filter(
                (report) => report.status === "Approved"
            ).length,

            pending: filteredReports.filter((report) =>
                [
                    "Submitted",
                    "Under Review",
                    "Forwarded to Authority",
                    "Under Authority Review",
                ].includes(report.status)
            ).length,

            rejected: filteredReports.filter(
                (report) => report.status === "Rejected"
            ).length,
        };
    }, [filteredReports]);

    // Summary cards
    const summaryCards = [
        {
            label: "Total Applications",
            value: filteredSummary.total,
            icon: FileText,
            color: "bg-blue-50 text-blue-700",
        },
        {
            label: "Approved",
            value: filteredSummary.approved,
            icon: CheckCircle,
            color: "bg-green-50 text-green-700",
        },
        {
            label: "Pending Review",
            value: filteredSummary.pending,
            icon: Clock,
            color: "bg-amber-50 text-amber-700",
        },
        {
            label: "Rejected",
            value: filteredSummary.rejected,
            icon: XCircle,
            color: "bg-red-50 text-red-700",
        },
    ];

    // Current filter information for downloads
    const getActiveFilters = () => {
        return [
            ["Search", searchTerm || "All"],
            ["Application Type", applicationType],
            ["Status", status],
            ["From Date", startDate || "All"],
            ["To Date", endDate || "All"],
        ];
    };

    // Export validation
    const canExport = () => {
        if (!filteredReports.length) {
            alert("There are no report records to export.");
            return false;
        }

        return true;
    };

    // Prepare rows for export
    const getExportRows = () => {
        return filteredReports.map((report) => ({
            "Case ID": getCaseId(report),
            Applicant: getApplicantName(report),
            "Application Type": report.applicationType || "—",
            Date: formatDate(report.createdAt),
            Status: report.status || "—",
        }));
    };

    // CSV Export
    const handleExportCSV = () => {
        if (!canExport()) return;

        const rows = getExportRows();
        const headers = Object.keys(rows[0]);

        const csv = [
            headers,
            ...rows.map((row) => headers.map((header) => row[header])),
        ]
            .map((row) =>
                row
                    .map(
                        (value) =>
                            `"${String(value ?? "").replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\r\n");

        // UTF-8 BOM helps Excel recognize the encoding
        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;",
        });

        downloadBlob(blob, "veassist-application-report.csv");
        setExportOpen(false);
    };

    // Shared file download helper
    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    // PDF Export
    const handleExportPDF = () => {
        if (!canExport()) return;

        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();

        const navy = [11, 31, 58];
        const blue = [37, 99, 235];
        const lightBlue = [239, 246, 255];
        const gray = [100, 116, 139];

        const generatedAt = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        // Header
        doc.setFillColor(...navy);
        doc.rect(0, 0, pageWidth, 34, "F");

        // Logo image
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const image = new Image();

            // Use the imported logo if available
            image.src = logo;

            // Logo is added asynchronously below only when loaded
            // The text header remains available even without it.
            if (image.complete && image.naturalWidth > 0) {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                ctx.drawImage(image, 0, 0);
                const logoData = canvas.toDataURL("image/png");
                doc.addImage(logoData, "PNG", 12, 7, 19, 19);
            }
        } catch (err) {
            console.warn("Logo could not be added to PDF:", err);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(21);
        doc.text("VeAssist", 36, 16);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("APPLICATION REPORT", 36, 24);

        doc.setFontSize(9);
        doc.text(
            `Generated: ${generatedAt}`,
            pageWidth - 12,
            16,
            { align: "right" }
        );

        // Report title
        doc.setTextColor(...navy);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Reports & Analytics", 12, 45);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...gray);
        doc.text(
            `Showing ${filteredReports.length} application record(s)`,
            12,
            51
        );

        // Summary cards
        const cardY = 58;
        const cardGap = 5;
        const cardWidth = (pageWidth - 24 - cardGap * 3) / 4;
        const cardHeight = 21;

        const pdfCards = [
            {
                label: "TOTAL APPLICATIONS",
                value: filteredSummary.total,
                color: navy,
            },
            {
                label: "APPROVED",
                value: filteredSummary.approved,
                color: [22, 163, 74],
            },
            {
                label: "PENDING REVIEW",
                value: filteredSummary.pending,
                color: [217, 119, 6],
            },
            {
                label: "REJECTED",
                value: filteredSummary.rejected,
                color: [220, 38, 38],
            },
        ];

        pdfCards.forEach((card, index) => {
            const x = 12 + index * (cardWidth + cardGap);

            doc.setFillColor(...lightBlue);
            doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "F");

            doc.setTextColor(...gray);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.text(card.label, x + 4, cardY + 7);

            doc.setTextColor(...card.color);
            doc.setFontSize(16);
            doc.text(String(card.value), x + 4, cardY + 16);
        });

        // Active filters
        const activeFilters = getActiveFilters();

        doc.setTextColor(...navy);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Applied Filters", 12, 90);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        const filterText = activeFilters
            .map(([label, value]) => `${label}: ${value}`)
            .join("   |   ");

        const filterLines = doc.splitTextToSize(
            filterText,
            pageWidth - 24
        );

        doc.setTextColor(...gray);
        doc.text(filterLines, 12, 96);

        const tableStartY = 101 + (filterLines.length - 1) * 4;

        // Application table
        const tableRows = filteredReports.map((report) => [
            String(getCaseId(report)),
            String(getApplicantName(report)),
            String(report.applicationType || "—"),
            formatDate(report.createdAt),
            String(report.status || "—"),
        ]);

        autoTable(doc, {
            startY: tableStartY,
            head: [
                [
                    "Case ID",
                    "Applicant",
                    "Application Type",
                    "Date",
                    "Status",
                ],
            ],
            body: tableRows,
            theme: "grid",
            margin: {
                left: 12,
                right: 12,
                bottom: 18,
            },
            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 3,
                textColor: [51, 65, 85],
                lineColor: [226, 232, 240],
                lineWidth: 0.2,
                overflow: "linebreak",
            },
            headStyles: {
                fillColor: navy,
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: "left",
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            columnStyles: {
                0: { cellWidth: 36 },
                1: { cellWidth: 55 },
                2: { cellWidth: 65 },
                3: { cellWidth: 35 },
                4: { cellWidth: 40 },
            },
            didParseCell: (data) => {
                if (
                    data.section === "body" &&
                    data.column.index === 4
                ) {
                    const value = data.cell.raw;

                    if (value === "Approved") {
                        data.cell.styles.textColor = [22, 163, 74];
                        data.cell.styles.fontStyle = "bold";
                    } else if (value === "Rejected") {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = "bold";
                    } else if (
                        [
                            "Submitted",
                            "Under Review",
                            "Forwarded to Authority",
                            "Under Authority Review",
                        ].includes(value)
                    ) {
                        data.cell.styles.textColor = [217, 119, 6];
                        data.cell.styles.fontStyle = "bold";
                    }
                }
            },
        });

        // Footer on every page
        const pageCount = doc.internal.getNumberOfPages();

        for (let page = 1; page <= pageCount; page++) {
            doc.setPage(page);

            const pageHeight = doc.internal.pageSize.getHeight();

            doc.setDrawColor(226, 232, 240);
            doc.line(12, pageHeight - 13, pageWidth - 12, pageHeight - 13);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...gray);

            doc.text(
                "VeAssist | Application Report",
                12,
                pageHeight - 7
            );

            doc.text(
                `Page ${page} of ${pageCount}`,
                pageWidth - 12,
                pageHeight - 7,
                { align: "right" }
            );
        }

        doc.save("veassist-application-report.pdf");
        setExportOpen(false);
    };

    // Excel Export
    const handleExportExcel = () => {
        if (!canExport()) return;

        const workbook = XLSX.utils.book_new();

        const generatedAt = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        // Summary worksheet
        const summaryData = [
            ["VeAssist"],
            ["APPLICATION REPORT"],
            [],
            ["Report Information", "Value"],
            ["Generated On", generatedAt],
            ["Total Applications", filteredSummary.total],
            ["Approved", filteredSummary.approved],
            ["Pending Review", filteredSummary.pending],
            ["Rejected", filteredSummary.rejected],
            [],
            ["Applied Filters", "Selected Value"],
            ...getActiveFilters(),
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

        summarySheet["!cols"] = [
            { wch: 25 },
            { wch: 32 },
        ];

        summarySheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        ];

        // Style summary cells
        const summaryStyles = {
            title: {
                font: {
                    bold: true,
                    sz: 20,
                    color: { rgb: "FFFFFF" },
                },
                fill: { fgColor: { rgb: "0B1F3A" } },
                alignment: { horizontal: "left", vertical: "center" },
            },
            subtitle: {
                font: {
                    bold: true,
                    sz: 12,
                    color: { rgb: "FFFFFF" },
                },
                fill: { fgColor: { rgb: "16365F" } },
            },
            heading: {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "0B1F3A" } },
            },
        };

        summarySheet["A1"].s = summaryStyles.title;
        summarySheet["A2"].s = summaryStyles.subtitle;

        ["A4", "B4", "A11", "B11"].forEach((cell) => {
            if (summarySheet[cell]) {
                summarySheet[cell].s = summaryStyles.heading;
            }
        });

        // Detailed application worksheet
        const details = getExportRows();

        const detailSheet = XLSX.utils.json_to_sheet(details);

        detailSheet["!cols"] = [
            { wch: 22 },
            { wch: 28 },
            { wch: 30 },
            { wch: 20 },
            { wch: 28 },
        ];

        // Enable worksheet autofilter
        if (details.length) {
            detailSheet["!autofilter"] = {
                ref: `A1:E${details.length + 1}`,
            };
        }

        // Apply header styling
        const detailHeaders = [
            "A1",
            "B1",
            "C1",
            "D1",
            "E1",
        ];

        detailHeaders.forEach((cell) => {
            if (detailSheet[cell]) {
                detailSheet[cell].s = summaryStyles.heading;
            }
        });

        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "Report Summary"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            detailSheet,
            "Applications"
        );

        XLSX.writeFile(
            workbook,
            "veassist-application-report.xlsx"
        );

        setExportOpen(false);
    };

    // Refresh reports
    const handleRefresh = () => {
        fetchReports();
    };

    // Clear filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setApplicationType("All");
        setStatus("All");
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* HEADER */}
            <header className="bg-[#0B1F3A] text-white shadow-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="VeAssist Logo"
                            className="h-11 w-11 object-contain"
                        />

                        <div>
                            <h1 className="text-2xl font-bold">
                                VeAssist
                            </h1>
                            <p className="text-sm text-blue-100">
                                Reports & Analytics
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-lg border border-slate-400 px-4 py-2 text-sm transition hover:bg-white hover:text-[#0B1F3A]"
                    >
                        <ArrowLeft size={17} />
                        <span className="hidden sm:inline">
                            Dashboard
                        </span>
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* PAGE HEADING */}
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Reports Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Monitor application progress and generate
                            reports.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        {/* EXPORT DROPDOWN */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setExportOpen((prev) => !prev)
                                }
                                disabled={!filteredReports.length}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#16365f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Download size={16} />
                                Export Report
                                <ChevronDown
                                    size={15}
                                    className={`transition-transform ${exportOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {exportOpen && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close export menu"
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() => setExportOpen(false)}
                                    />

                                    <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                                        <button
                                            type="button"
                                            onClick={handleExportPDF}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-red-50"
                                        >
                                            <FileDown
                                                size={19}
                                                className="text-red-600"
                                            />
                                            <div>
                                                <p className="font-semibold">
                                                    Download PDF
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Formatted report
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExportExcel}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-green-50"
                                        >
                                            <FileSpreadsheet
                                                size={19}
                                                className="text-green-600"
                                            />
                                            <div>
                                                <p className="font-semibold">
                                                    Download Excel
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Summary and details
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExportCSV}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-blue-50"
                                        >
                                            <FileText
                                                size={19}
                                                className="text-blue-600"
                                            />
                                            <div>
                                                <p className="font-semibold">
                                                    Download CSV
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Simple data export
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* SUMMARY CARDS */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.label}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {card.label}
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-slate-800">
                                            {card.value}
                                        </p>
                                    </div>

                                    <div
                                        className={`rounded-xl p-3 ${card.color}`}
                                    >
                                        <Icon size={23} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* FILTERS */}
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Search
                            size={18}
                            className="text-slate-500"
                        />

                        <h3 className="font-semibold text-slate-800">
                            Filter Reports
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* SEARCH */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600">
                                Search
                            </label>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                placeholder="Search case ID or applicant..."
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* APPLICATION TYPE */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600">
                                Application Type
                            </label>

                            <select
                                value={applicationType}
                                onChange={(e) => setApplicationType(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="All">All Types</option>
                                <option value="Pension Assistance">
                                    Pension Assistance
                                </option>
                                <option value="Insurance Assistance">
                                    Insurance Assistance
                                </option>
                                <option value="ECHS Assistance">
                                    ECHS Assistance
                                </option>
                                <option value="Scholarship">
                                    Scholarship
                                </option>
                                <option value="Vocational Training">
                                    Vocational Training
                                </option>
                            </select>
                        </div>
                        {/* STATUS */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="All">All Statuses</option>

                                {Object.keys(statusStyles).map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* FROM DATE */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600">
                                <CalendarDays
                                    size={14}
                                    className="mr-1 inline"
                                />
                                From Date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) =>
                                    setStartDate(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* TO DATE */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600">
                                <CalendarDays
                                    size={14}
                                    className="mr-1 inline"
                                />
                                To Date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) =>
                                    setEndDate(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* CLEAR FILTERS */}
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </section>

                {/* ERROR */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}

                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="ml-2 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* LOADING */}
                {loading && (
                    <p className="text-sm text-slate-500">
                        Loading reports...
                    </p>
                )}

                {/* REPORT TABLE */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="font-semibold text-slate-800">
                                Application Report
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                {filteredReports.length} records shown
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">
                                        Case ID
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Applicant
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Application Type
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Date
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report) => (
                                        <tr
                                            key={report._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-700">
                                                {getCaseId(report)}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {getApplicantName(report)}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {report.applicationType || "—"}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {formatDate(report.createdAt)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[
                                                        report.status
                                                        ] ||
                                                        "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    {report.status || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-14 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <FileText
                                                    size={32}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-medium text-slate-600">
                                                    {loading
                                                        ? "Loading report data..."
                                                        : "No applications match your filters."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}