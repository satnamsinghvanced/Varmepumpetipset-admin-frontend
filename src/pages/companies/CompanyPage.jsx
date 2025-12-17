import { useEffect, useState, useRef } from "react"; // 👈 Added useRef
import { useDispatch, useSelector } from "react-redux";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { LuFileUp, LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

import PageHeader from "../../components/PageHeader";
import Pagination from "../../UI/pagination";

import {
  getCompanies,
  deleteCompany,
  createCompany,
  importCompanies,
} from "../../store/slices/companySlice";
import { ROUTES } from "../../consts/routes";
import { FaRegEye } from "react-icons/fa";

export const Company = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { companies, loading, error } = useSelector((state) => state.companies);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [showUploadingFileLoader, setShowUploadingFileLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [manualCompany, setManualCompany] = useState({
    name: "",
    slug: "",
    countyId: "",
    title: "",
    excerpt: "",
    description: "",
  });

  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await dispatch(getCompanies({ page, limit, search })).unwrap();
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompanies();
  }, [dispatch, page, limit, search]);

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      const res = await dispatch(deleteCompany(companyToDelete._id)).unwrap();
      toast.success(res.message || "Company deleted");
      setShowDeleteModal(false);
      dispatch(getCompanies({ page, limit }));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleAddCompany = async () => {
    if (!manualCompany.name || !manualCompany.slug || !manualCompany.countyId) {
      return toast.error("Fill required fields");
    }

    try {
      await dispatch(createCompany(manualCompany)).unwrap();
      toast.success("Company added");
      setShowAddModal(false);
      setManualCompany({
        name: "",
        slug: "",
        countyId: "",
        title: "",
        excerpt: "",
        description: "",
      });
      dispatch(getCompanies({ page, limit }));
    } catch (err) {
      toast.error("Failed to add company");
    }
  };
  const isValidFileExtension = (file) => {
    if (!file) return false;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx")) {
      return true;
    }
    return false;
  };
  const handleImportCompanies = async () => {
    if (!uploadFile) {
      toast.error("Please upload a file first");
      return;
    }
    setShowUploadingFileLoader(true);
    const formData = new FormData();
    formData.append("csv", uploadFile);

    try {
      const result = await dispatch(importCompanies(formData)).unwrap();
      // console.log(result);

      const { inserted = 0, skipped = 0 } = result;

      let message = "Companies imported successfully";

      if (inserted > 0 && skipped > 0) {
        message = `${inserted} inserted, ${skipped} skipped (duplicates)`;
      } else if (inserted > 0) {
        message = `${inserted} companies inserted successfully`;
      } else if (skipped > 0) {
        message = `${skipped} companies skipped (already exist)`;
      } else {
        message = "No companies inserted";
      }

      toast.success(message);

      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      dispatch(getCompanies({ page, limit }));
    } catch (err) {
      console.error(err);
      toast.error("Import failed");
    } finally {
      setShowUploadingFileLoader(false);
    }
  };

  useEffect(() => {
    if (uploadFile) {
      handleImportCompanies();
    }
  }, [uploadFile, dispatch, page, limit]);

  const headerButtons = [
    {
      value: showUploadingFileLoader ? "Uploading..." : "Import",
      variant: "white",
      icon: showUploadingFileLoader ? (
        <div className="h-4 w-4 animate-spin border-2 border-slate-400 border-t-transparent rounded-full" />
      ) : (
        <LuFileUp size={18} />
      ),
      disabled: showUploadingFileLoader,
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
      onClick: () => {
        if (!showUploadingFileLoader) fileInputRef.current.click();
      },
    },
    {
      value: "Add Company",
      variant: "primary",
      icon: <LuPlus size={18} />,
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate(ROUTES.COMPANIES_CREATE),
    },
  ];

  const totalCompanies = companies?.data?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage companies and related information."
        buttonsList={headerButtons}
      />

      <input
        ref={fileInputRef}
        id="company-import-input"
        type="file"
        className="hidden"
        accept=".csv, .xlsx"
        onChange={(e) => {
          const selectedFile = e.target.files[0];

          if (selectedFile) {
            if (isValidFileExtension(selectedFile)) {
              setUploadFile(selectedFile);
            } else {
              toast.error(
                "Invalid file type. Only CSV (.csv) and Excel (.xlsx) files are allowed."
              );

              e.target.value = "";
              setUploadFile(null);
            }
          }
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4">
          <div className="ml-4">
            <p className="text-sm font-semibold text-slate-900">
              Companies overview
            </p>
            <p className="text-xs text-slate-500">
              {loading ? "Loading..." : `${totalCompanies} items`}
            </p>
          </div>
          <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => {
            setPage(1); // reset to first page
            setSearch(e.target.value);
          }}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Company Name</th>
                <th className="px-6 py-3">Address (Competitor)</th>
                <th className="px-6 py-3">Description</th>
                 <th className="px-6 py-3">Recommended</th>
                <th className="px-6 py-3">Extractor's</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(10)].map((__, idx) => (
                      <td key={idx} className="px-6 py-6">
                        <div className="h-4 bg-slate-100 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-red-500"
                    colSpan="6"
                  >
                    {error}
                  </td>
                </tr>
              ) : totalCompanies > 0 ? (
                companies.data.map((company, index) => (
                  <tr key={company._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {company.companyName}
                    </td>

                    <td className="px-6 py-4">{company.address}</td>
                    <td className="px-6 py-4 align-top">
                      <div
                        className="line-clamp-2 text-slate-700 text-sm break-words"
                        dangerouslySetInnerHTML={{
                          __html: company.description,
                        }}
                      ></div>
                    </td>
                    <td className="px-6 py-4">
                      {company.isRecommended ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Recommended</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 truncate">Not Recommended</span>
                      )}
                    </td> 
                    <td className="px-6 py-4">
                      <div className="line-clamp-2 space-y-1 text-sm text-slate-700 break-words">
                        {company.extractor.map((item, idx) => (
                          <div key={idx}>{item}</div>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
                          onClick={() => navigate(`/company/${company._id}`)}
                          title="Preview"
                        >
                          <FaRegEye size={16} />
                        </button>
                        <button
                          className="rounded-full border p-2 text-slate-500 hover:text-slate-900"
                          onClick={() =>
                            navigate(`/company/${company._id}/edit`)
                          }
                        >
                          <AiTwotoneEdit size={16} />
                        </button>
                        <button
                          className="rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setCompanyToDelete(company);
                            setShowDeleteModal(true);
                          }}
                        >
                          <RiDeleteBin5Line size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalCompanies > 0 && (
          <div className=" px-6 py-4">
            <Pagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <p className="mb-6 text-center text-lg font-semibold">
              Are you sure you want to delete this company?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-full border px-4 py-2"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-red-600 px-4 py-2 text-white"
                onClick={handleDeleteCompany}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
