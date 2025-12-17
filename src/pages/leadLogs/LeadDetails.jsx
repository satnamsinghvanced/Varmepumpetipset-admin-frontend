import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { FaRegCopy } from "react-icons/fa6";
import {
  getLeadById,
  updateLeadStatus,
  updateLeadProfit,
} from "../../store/slices/leadLogsSlice";
import { toast } from "react-toastify";

const LeadDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedLead, loading } = useSelector((s) => s.lead);

  useEffect(() => {
    if (id) dispatch(getLeadById(id));
  }, [id, dispatch]);
  const [status, setStatus] = useState("");
  const [profit, setProfit] = useState(0);
  useEffect(() => {
    if (selectedLead) {
      setStatus(selectedLead.status);
      setProfit(selectedLead.profit);
    }
  }, [selectedLead]);
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus); // update UI immediately
    dispatch(updateLeadStatus({ leadId: id, status: newStatus }));
  };

  const handleProfitChange = (e) => {
    const newProfit = Number(e.target.value);
    setProfit(newProfit); // update UI immediately
    dispatch(updateLeadProfit({ leadId: id, profit: newProfit }));
  };
  const headerButtons = [
    {
      value: "Back to leads",
      variant: "white",
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
      onClick: () => navigate(-1),
    },
  ];

  if (loading || !selectedLead) {
    return (
      <div className="space-y-6">
        <PageHeader title="Lead details" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  const values = selectedLead.dynamicFields?.[0]?.values || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Lead #${selectedLead.uniqueId}`}
        description="View and manage detailed lead information."
        buttonsList={headerButtons}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "Name", value: values.name },
            { label: "Email", value: values.email },
            { label: "Phone", value: values.phone },
            {
              label: "Created",
              value: new Date(selectedLead.createdAt).toLocaleString(),
            },
            { label: "Status", value: selectedLead.status },
            { label: "Profit", value: selectedLead.profit },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {item.value || "N/A"}
              </p>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
            Partners
          </p>
          {selectedLead.partnerIds?.length ? (
            <div className="space-y-1 text-sm">
              {selectedLead.partnerIds.map((p) => (
                <p key={p._id}>
                  {p.name} {p.email ? `(${p.email})` : ""}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm">-</p>
          )}
        </div>

        {/* Lead Types */}
        {/* <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Lead Types</p>
          {selectedLead.leadTypes?.length ? (
            selectedLead.leadTypes.map((t) => (
              <p key={t._id} className="text-sm">
                {t.title || "Unknown Type"} {t.description ? `- ${t.description}` : ""}
              </p>
            ))
          ) : (
            <p className="text-sm">-</p>
          )}
        </div> */}

        {/* Status & Profit Updates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
              Update Status
            </p>
            <select
              value={status}
              onChange={handleStatusChange}
              className="border border-slate-200 px-3 py-2 rounded-md w-full"
            >
              <option value="Pending">Pending</option>
              <option value="Complete">Complete</option>
              <option value="Reject">Reject</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
              Update Profit
            </p>
            <input
              type="number"
              value={profit}
              onChange={handleProfitChange}
              className="border border-slate-200 px-3 py-2 rounded-md w-full"
            />
          </div>
        </div>
        <p></p>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
            Form Filled Details ({values.selectedFormTitle || "N/A"})
          </p>

          <div className="grid gap-4 md:grid-cols-2 text-sm">
            {Object.entries(values).map(([key, value]) => {
              if (!value) return null;

              // Map field keys to friendly names
              let label = key;
              switch (key) {
                case "selectedFormType":
                  label = "Lead Type Id";
                  value = (
                    <span className="">
                      {selectedLead.formNumber || 0}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedLead.formNumber
                          );
                          toast.info("Lead Type ID is  copied!");
                        }}
                        className="px-2 py-1 ml-1 text-xs bg-slate-200 hover:bg-slate-300 rounded gap-2"
                      >
                        <FaRegCopy />
                      </button>
                    </span>
                  );
                  break;
                case "selectedFormTitle":
                  label = "Lead Type";
                  break;
                case "streetName":
                  label = "Street Name";
                  break;
                case "postalCode":
                  label = "Postal Code";
                  break;
                case "details":
                  label = "Details";
                  break;
                case "name":
                  label = "Full Name";
                  break;
                case "email":
                  label = "Email Address";
                  break;
                case "phone":
                  label = "Phone Number";
                  break;
                default:
                  label = key;
              }

              return (
                <p key={key}>
                  <strong>{label}:</strong> {value}
                </p>
              );
            })}
          </div>
        </div>

        {/* Raw JSON */}
        {/* <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-inner">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Raw Data</p>
          <pre className="text-xs overflow-auto bg-slate-100 p-3 rounded-md">
            {JSON.stringify(selectedLead, null, 2)}
          </pre>
        </div> */}
      </div>
    </div>
  );
};

export default LeadDetails;
