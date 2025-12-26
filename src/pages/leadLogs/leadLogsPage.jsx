/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLeads,
  getPartnerLeads,
  updateLeadProfit,
  updateLeadStatus,
} from "../../store/slices/leadLogsSlice";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../UI/pagination";
import { FaRegEye } from "react-icons/fa6";
import { getForms } from "../../store/slices/formSelectSlice";

const LeadLogs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { leads = [], loading, error, pagination } = useSelector((s) => s.lead);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [leadSearch, setLeadSearch] = useState("");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [status, setStatus] = useState("");
  const [formType, setFormType] = useState("");
  const { forms = [], loading: formsLoading } = useSelector(
    (s) => s.formSelect
  );
  useEffect(() => {
    dispatch(getForms());
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (partnerSearch) {
        dispatch(
          getPartnerLeads({
            page,
            limit,
            search: partnerSearch,
            status,
            formType,
          })
        );
      } else {
        dispatch(
          getAllLeads({
            page,
            limit,
            search: leadSearch,
            status,
            formType, // ✅ ADD THIS
          })
        );
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [page, leadSearch, partnerSearch, status, formType]);

  const badgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Complete":
        return "bg-green-100 text-green-700";
      case "Reject":
        return "bg-red-200 text-gray-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const leadTypeBadge = (type) => {
    switch (type) {
      case "selge_bolig":
        return "bg-blue-100 text-blue-700";
      case "verdivurdering":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const totalLeads = leads?.length || 0;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Logs"
        description="Manage all incoming leads with search, filters, and pagination."
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search lead name, email, phone, ID..."
          value={leadSearch}
          onChange={(e) => {
            setPage(1);
            setPartnerSearch("");
            setLeadSearch(e.target.value);
          }}
          className="border border-slate-200 px-3 py-2 rounded-md w-64"
        />

        <input
          type="text"
          placeholder="Search partner name..."
          value={partnerSearch}
          onChange={(e) => {
            setPage(1);
            setLeadSearch("");
            setPartnerSearch(e.target.value);
          }}
          className="border border-slate-200 px-3 py-2 rounded-md w-64"
        />

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border border-slate-200 px-3 py-2 rounded-md"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Complete">Complete</option>
          <option value="Reject">Reject</option>
        </select>
        <select
          value={formType}
          onChange={(e) => {
            setPage(1);
            setFormType(e.target.value);
          }}
          className="border border-slate-200 px-3 py-2 rounded-md"
        >
          <option value="">All Lead Types</option>

          {formsLoading ? (
            <option disabled>Loading...</option>
          ) : (
            forms.map((form) => (
              <option key={form._id} value={form.formTitle}>
                {form.formTitle}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">
            Lead entries overview
          </p>
          <p className="text-xs text-slate-500">
            {loading ? "Loading leads..." : `${pagination?.total || 0} items`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Id</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Lead Type</th>
                <th className="px-6 py-3">Partner's</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Profit</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(9)].map((__, idx) => (
                      <td key={idx} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-6 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : totalLeads > 0 ? (
                leads.map((lead) => {
                  const values = lead.dynamicFields?.[0]?.values || {};

                  return (
                    <tr
                      key={lead._id}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-6 py-4">{lead.uniqueId}</td>
                      <td className="px-6 py-4">{values.name || "-"}</td>
                      <td className="px-6 py-4">{values.email || "-"}</td>
                      <td className="px-6 py-4">{values.phone || "-"}</td>

                      {/* Lead Type */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${leadTypeBadge(
                            values.leadType
                          )}`}
                        >
                          {values.selectedFormTitle
                            ? values.selectedFormTitle
                            : "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {lead.partnerIds?.length
                          ? lead.partnerIds.map((p, i) => (
                              <div key={i}>{p.partnerId?.name}</div>
                            ))
                          : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            dispatch(
                              updateLeadStatus({
                                leadId: lead._id,
                                status: e.target.value,
                              })
                            )
                          }
                          className={`px-2 py-1 text-xs rounded-md cursor-pointer ${badgeColor(
                            lead.status
                          )}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Complete">Complete</option>
                          <option value="Reject">Reject</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={lead.profit}
                          onChange={(e) =>
                            dispatch(
                              updateLeadProfit({
                                leadId: lead._id,
                                profit: Number(e.target.value),
                              })
                            )
                          }
                          className="border border-slate-200 px-2 py-1 w-20 rounded-md"
                        />
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <button
                          className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
                          onClick={() => navigate(`/leads/${lead._id}`)}
                        >
                          <FaRegEye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalLeads > 0 && (
          <div className="border-t border-slate-100 px-6 py-4">
            <Pagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadLogs;
