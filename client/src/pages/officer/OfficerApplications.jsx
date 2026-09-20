import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";

const OfficerApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (
        !user ||
        (user.role !== "officer" && user.role !== "admin")
      ) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/applications/officer",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data.applications || []);
    } catch (error) {
      console.error(
        "Fetch officer applications error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={17} />;

      case "Rejected":
        return <XCircle size={17} />;

      case "Under Review":
        return <Clock size={17} />;

      case "Submitted":
        return <AlertCircle size={17} />;

      default:
        return <FileText size={17} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Under Review":
        return "bg-yellow-100 text-yellow-700";

      case "Submitted":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFamilyName = (application) => {
    return (
      application.caseId?.familyUser?.name ||
      application.submittedBy?.name ||
      "Family"
    );
  };

  const getCaseId = (application) => {
    return (
      application.caseId?.caseId ||
      "N/A"
    );
  };

  const getVeteranName = (application) => {
    return (
      application.caseId?.veteranDetails?.name ||
      "N/A"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-[#0B1F3A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              VeAssist
            </h1>

            <p className="text-sm text-gray-300">
              Welfare Officer Portal
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/officer/dashboard")
            }
            className="flex items-center gap-2 text-sm hover:text-yellow-300 transition"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="mb-8">

          <p className="text-[#D4AF37] font-semibold text-sm">
            APPLICATION MANAGEMENT
          </p>

          <h2 className="text-3xl font-bold text-[#0B1F3A] mt-1">
            Applications
          </h2>

          <p className="text-gray-600 mt-2">
            Review and manage assistance applications submitted
            by families.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500">
              Loading applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">

            <FileText
              size={50}
              className="mx-auto text-gray-400 mb-4"
            />

            <h3 className="text-xl font-semibold text-gray-800">
              No Applications Found
            </h3>

            <p className="text-gray-500 mt-2">
              There are currently no applications to display.
            </p>

          </div>
        ) : (
          /* Application List */
          <div className="space-y-5">

            {applications.map((application) => (

              <div
                key={application._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* Application Information */}
                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 rounded-lg bg-[#EEF5FF] flex items-center justify-center flex-shrink-0">
                      <FileText
                        size={25}
                        className="text-[#1F4E79]"
                      />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-[#0B1F3A]">
                        {application.title}
                      </h3>

                      <p className="text-sm text-[#1F4E79] font-medium mt-1">
                        {application.applicationType}
                      </p>

                      <div className="mt-3 space-y-1">

                        <p className="text-sm text-gray-600">
                          Family:{" "}
                          <span className="font-semibold text-gray-800">
                            {getFamilyName(application)}
                          </span>
                        </p>

                        <p className="text-sm text-gray-600">
                          Veteran:{" "}
                          <span className="font-semibold text-gray-800">
                            {getVeteranName(application)}
                          </span>
                        </p>

                        <p className="text-sm text-gray-600">
                          Case ID:{" "}
                          <span className="font-semibold text-gray-800">
                            {getCaseId(application)}
                          </span>
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Status + Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-4">

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {getStatusIcon(application.status)}
                      {application.status}
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/officer/applications/${application._id}`
                        )
                      }
                      className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1F4E79] transition"
                    >
                      <Eye size={17} />
                      View Application
                    </button>

                  </div>

                </div>

                {/* Description + Date */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                  {application.description ? (
                    <p className="text-sm text-gray-600">
                      {application.description}
                    </p>
                  ) : (
                    <span />
                  )}

                  <p className="text-sm text-gray-500">
                    Submitted:{" "}
                    <span className="font-medium text-gray-700">
                      {application.submittedAt
                        ? new Date(
                            application.submittedAt
                          ).toLocaleDateString()
                        : "Not submitted"}
                    </span>
                  </p>

                </div>

              </div>

            ))}

          </div>
        )}

      </main>
    </div>
  );
};

export default OfficerApplications;