/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaRegEye } from "react-icons/fa6";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../UI/pagination";
import { fetchPartners, deletePartner } from "../../store/slices/partnersSlice";
import api from "../../api/axios";
import { LuLogs } from "react-icons/lu";

export const CollaboratePartnerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { partners, loading, pagination } = useSelector(
    (state) => state.partners
  );

  const [page, setPage] = useState(1);
  const limit = 10;
  const [limitLoading, setLimitLoading] = useState(false);
  const [filters, setFilters] = useState({
    isActive: "",
    isPremium: "",
    city: "",
    postalCode: "",
    name: "",
  });

  const debounceTimer = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [partnerLimit, setPartnerLimit] = useState("");

  const applyFilters = (filterValues, requestPage = 1) => {
    const params = {
      isActive: filterValues.isActive || undefined,
      isPremium: filterValues.isPremium || undefined,
      city: filterValues.city || undefined,
      postalCode: filterValues.postalCode || undefined,
      name: filterValues.name || undefined,
      page: requestPage,
      limit,
    };
    dispatch(fetchPartners(params))
      .unwrap()
      .catch(() => toast.error("Failed to fetch partners"));
  };

  const fetchWithDelay = (updatedFilters) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      applyFilters(updatedFilters, 1);
    }, 500);
  };

  useEffect(() => {
    applyFilters(filters, page);
  }, [page]);

  const handleDelete = () => {
    if (!partnerToDelete) return;
    dispatch(deletePartner(partnerToDelete))
      .unwrap()
      .then(() => {
        toast.success("Partner deleted successfully");
        applyFilters(filters, page);
      })
      .catch(() => toast.error("Failed to delete partner"));
    setShowDeleteModal(false);
    setPartnerToDelete(null);
  };
  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const { data } = await api.get("/partners/get-limit");
        if (data?.success) {
          setPartnerLimit(data.data.limit); // set limit from backend
        }
      } catch (error) {
        toast.error("Failed to load partner limit");
      }
    };

    fetchLimit();
  }, []);
  const headerButtons = [
    {
      value: "+ Add Partner",
      variant: "primary",
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate("/partners/create"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        description="Manage your Partners here."
        buttonsList={headerButtons}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow flex flex-wrap gap-4">
        <div className=" rounded-xl p-1  grid md:flex md:flex-wrap gap-4 w-full">
          <select
            className="p-2 border border-slate-300 rounded-lg min-w-[150px]"
            value={filters.isActive}
            onChange={(e) => {
              const updated = { ...filters, isActive: e.target.value };
              setFilters(updated);
              fetchWithDelay(updated);
            }}
          >
            <option value="">Status: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            className="p-2 border border-slate-300 rounded-lg min-w-[150px]"
            value={filters.isPremium}
            onChange={(e) => {
              const updated = { ...filters, isPremium: e.target.value };
              setFilters(updated);
              fetchWithDelay(updated);
            }}
          >
            <option value="">User Type: All</option>
            <option value="true">Premium</option>
            <option value="false">Non-Premium</option>
          </select>

          <input
            className="p-2 border border-slate-300 rounded-lg min-w-[150px]"
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => {
              const updated = { ...filters, city: e.target.value };
              setFilters(updated);
              fetchWithDelay(updated);
            }}
            onKeyDown={(e) => e.key === "Enter" && applyFilters(filters, 1)}
          />

          <input
            className="p-2 border border-slate-300 rounded-lg min-w-[150px]"
            type="text"
            placeholder="Postal Code"
            value={filters.postalCode}
            maxLength={4}
            onChange={(e) => {
              if (/^\d{0,4}$/.test(e.target.value)) {
                const updated = { ...filters, postalCode: e.target.value };
                setFilters(updated);
                fetchWithDelay(updated);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && applyFilters(filters, 1)}
          />

          <input
            className="p-2 border border-slate-300 rounded-lg min-w-[150px]"
            type="text"
            placeholder="Name"
            value={filters.name}
            onChange={(e) => {
              const updated = { ...filters, name: e.target.value };
              setFilters(updated);
              fetchWithDelay(updated);
            }}
            onKeyDown={(e) => e.key === "Enter" && applyFilters(filters, 1)}
          />
          <div className="flex items-center gap-2 grow justify-end">
            <label
              htmlFor="limit"
              className="text-sm font-medium text-slate-700"
            >
              Partner Limit:
            </label>
            <input
              id="limit"
              type="number"
              className="p-2 border border-slate-300 rounded-lg w-20"
              value={partnerLimit}
              onChange={(e) => setPartnerLimit(e.target.value)}
              placeholder="Enter Limit"
            />
            <button
              onClick={async () => {
                if (!partnerLimit || partnerLimit <= 0) {
                  return toast.error("Please enter a valid limit");
                }
                try {
                  setLimitLoading(true);
                  await api.put("/partners/limit", {
                    limit: Number(partnerLimit),
                  });
                  toast.success("Partner limit updated successfully");
                } catch (error) {
                  toast.error("Failed to update partner limit");
                } finally {
                  setLimitLoading(false);
                }
              }}
              className={`px-3 py-1 rounded-lg text-white 
    ${
      limitLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-primary hover:bg-primary/80"
    }
  `}
            >
              {limitLoading ? (
                <span className="loader border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block animate-spin"></span>
              ) : (
                "✓"
              )}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm w-full">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Partners Overview
              </p>
              <p className="text-xs text-slate-500">
                {loading ? "Loading..." : `${partners.length} items`}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Postal Codes</th>
                  <th className="px-6 py-3">Total Leads</th>
                  <th className="px-6 py-3">Premium</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-600">
                {loading ? (
                  [...Array(limit)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(8)].map((__, idx) => (
                        <td key={idx} className="px-6 py-6">
                          <div className="h-4 bg-slate-100 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : partners.length > 0 ? (
                  partners.map((p, index) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-6 py-4">{p.city}</td>
                      <td className="px-6 py-4">
                        {Array.isArray(p.postalCodes)
                          ? p.postalCodes.join(", ")
                          : p.postalCodes?.exact?.length > 0
                          ? p.postalCodes.exact.map((c) => c.code).join(", ")
                          : p.postalCodes?.ranges?.length > 0
                          ? p.postalCodes.ranges
                              .map((r) => `${r.from}-${r.to}`)
                              .join(", ")
                          : ""}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {p.leads.total ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${
                            p.isPremium ? "bg-slate-900" : "bg-slate-400"
                          }`}
                        >
                          {p.isPremium ? "Premium" : "Non-Premium"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${
                            p.isActive ? "bg-slate-900" : "bg-slate-400"
                          }`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* <div className="relative group">
                            <button
                              className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
                              onClick={() => navigate(`/leads-logs/${p._id}`)}
                            >
                              <LuLogs size={16} />
                            </button>

                            <span
                              className="absolute left-1/2 -translate-x-1/2 -top-8 
                                  hidden group-hover:block 
                                 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow"
                            >
                              Logs
                            </span>
                          </div> */}

                          <div className="relative group">
                            <button
                              className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
                              onClick={() => navigate(`/partners/${p._id}`)}
                            >
                              <FaRegEye size={16} />
                            </button>
                            <span
                              className="absolute left-1/2 -translate-x-1/2 -top-8 
                                          hidden group-hover:block bg-slate-800 text-white text-xs 
                                            px-2 py-1 rounded shadow"
                            >
                              View
                            </span>
                          </div>

                          <div className="relative group">
                            <button
                              className="rounded-full border p-2 text-slate-500 hover:text-slate-900"
                              onClick={() =>
                                navigate(`/partners/${p._id}/edit`)
                              }
                            >
                              <AiTwotoneEdit size={16} />
                            </button>
                            <span
                              className="absolute left-1/2 -translate-x-1/2 -top-8 
                                            hidden group-hover:block bg-slate-800 text-white text-xs 
                                            px-2 py-1 rounded shadow"
                            >
                              Edit
                            </span>
                          </div>

                          <button
                            className="rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              setPartnerToDelete(p._id);
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
                      colSpan="8"
                      className="px-6 py-6 text-center text-slate-500"
                    >
                      No Partner found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {partners.length > 0 && (
            <div className=" px-6 py-4">
              <Pagination
                totalPages={pagination.totalPages || 1}
                page={page}
                setPage={setPage}
              />
            </div>
          )}
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <p className="mb-6 text-center text-lg font-semibold">
                Are you sure you want to delete this partner?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="rounded-full border px-4 py-2"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-full bg-red-600 px-4 py-2 text-white"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratePartnerPage;
