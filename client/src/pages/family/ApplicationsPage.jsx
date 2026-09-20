import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const ApplicationsPage = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [caseId, setCaseId] = useState("");
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

      // Get family cases
      const caseResponse = await axios.get(
        "http://localhost:5000/api/cases/my-cases",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const cases = caseResponse.data.cases;

      if (!cases || cases.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Use the first/latest case
      const currentCase = cases[0];
      setCaseId(currentCase.caseId);

      // Get applications for the case
      const applicationResponse = await axios.get(
        `http://localhost:5000/api/applications/my/${currentCase.caseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(applicationResponse.data.applications || []);
    } catch (error) {
      console.error("Fetch applications error:", error);

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

  // Submit Draft Application
  const handleSubmitApplication = async (applicationId) => {
    try {
      setError("");

      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/submit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh applications after submission
      fetchApplications();
    } catch (error) {
      console.error("Submit application error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to submit application.";

      const pendingDocuments =
        error.response?.data?.pendingDocuments || [];

      if (pendingDocuments.length > 0) {
        setError(
          `${message}\n\nPending or unverified documents:\n- ${pendingDocuments.join(
            "\n- "
          )}`
        );
      } else {
        setError(message);
      }
    }
  };

  // Open application-specific documents
  const handleManageDocuments = (applicationId) => {
    navigate(
      `/family/applications/${applicationId}/documents`
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={18} />;

      case "Rejected":
        return <XCircle size={18} />;

      case "Under Review":
        return <Clock size={18} />;

      case "Submitted":
        return <AlertCircle size={18} />;

      default:
        return <FileText size={18} />;
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
              Family Assistance Portal
            </p>
          </div>

          <button
            onClick={() => navigate("/family/dashboard")}
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0B1F3A]">
              My Applications
            </h2>

            <p className="text-gray-600 mt-1">
              View and track your assistance applications.
            </p>

            {caseId && (
              <p className="text-sm text-gray-500 mt-2">
                Case ID:{" "}
                <span className="font-semibold text-[#0B1F3A]">
                  {caseId}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={() =>
              navigate(`/family/applications/new/${caseId}`)
            }
            disabled={!caseId}
            className="flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white px-5 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            New Application
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg whitespace-pre-line">
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
              No Applications Yet
            </h3>

            <p className="text-gray-500 mt-2 mb-6">
              You have not created any assistance applications
              for this case.
            </p>

            <button
              onClick={() =>
                navigate(`/family/applications/new/${caseId}`)
              }
              disabled={!caseId}
              className="inline-flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#16375F] transition disabled:opacity-50"
            >
              <Plus size={18} />
              Create Application
            </button>
          </div>
        ) : (
          /* Application Cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
              >
                {/* Application Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <FileText
                        size={24}
                        className="text-[#0B1F3A]"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {application.title}
                      </h3>

                      <p className="text-sm text-[#0B1F3A] font-medium mt-1">
                        {application.applicationType}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClass(
                      application.status
                    )}`}
                  >
                    {getStatusIcon(application.status)}
                    {application.status}
                  </span>
                </div>

                {/* Description */}
                {application.description && (
                  <p className="text-gray-600 text-sm mt-5">
                    {application.description}
                  </p>
                )}

                {/* Date */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    {application.status === "Draft"
                      ? "Created"
                      : "Submitted"}
                    :{" "}
                    <span className="font-medium text-gray-700">
                      {new Date(
                        application.submittedAt ||
                          application.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Officer Remarks */}
                {application.remarks && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Officer Remarks
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      {application.remarks}
                    </p>
                  </div>
                )}

                {/* Application Actions */}
                <div
                  className={`mt-5 flex flex-col ${
                    application.status === "Draft"
                      ? "sm:flex-row"
                      : ""
                  } gap-3`}
                >
                  {/* Manage Documents */}
                  <button
                    onClick={() =>
                      handleManageDocuments(application._id)
                    }
                    className={`px-4 py-3 border border-[#0B1F3A] text-[#0B1F3A] rounded-lg font-semibold text-sm hover:bg-slate-50 transition ${
                      application.status === "Draft"
                        ? "sm:w-1/2"
                        : "w-full"
                    }`}
                  >
                    Manage Documents
                  </button>

                  {/* Submit Draft Application */}
                  {application.status === "Draft" && (
                    <button
                      onClick={() =>
                        handleSubmitApplication(
                          application._id
                        )
                      }
                      className="sm:w-1/2 bg-[#0B1F3A] text-white py-3 rounded-lg font-semibold hover:bg-[#16375F] transition"
                    >
                      Submit Application
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplicationsPage;