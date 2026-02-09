import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { FaRegCopy } from "react-icons/fa6";
import { toast } from "react-toastify";
import {
  getLeadById,
  updateLeadStatus,
} from "../../store/slices/leadLogsSlice";
import api from "../../api/axios";


const LeadDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedLead, loading } = useSelector((s) => s.lead);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const [partnerPrices, setPartnerPrices] = useState([]);
  const [status, setStatus] = useState("");
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (id) dispatch(getLeadById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedLead) {
      setStatus(selectedLead.status);
      setProfit(selectedLead.profit);
      if (selectedLead.partnerIds) {
        setPartnerPrices(
          selectedLead.partnerIds.map((p) => ({
            partnerId: p.partnerId?._id,
            name: p.partnerId?.name,
            email: p.partnerId?.email,
            leadPrice: p.leadPrice || 0,
          }))
        );
      }
    }
  }, [selectedLead]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    dispatch(updateLeadStatus({ leadId: id, status: newStatus }));
  };

  const handlePartnerPriceChange = async (partnerId, value) => {
    const updated = partnerPrices.map((p) =>
      p.partnerId === partnerId ? { ...p, leadPrice: Number(value) } : p
    );
    setPartnerPrices(updated);

    try {
      const res = await api.patch("/lead-logs/update-partner-profit", {
        leadId: id,
        partnerId,
        leadPrice: Number(value),
      });

      if (res.data.success) {
        toast.success("Partner lead price updated!");
        setProfit(res.data.data.profit); 
      } else {
        toast.error(res.data.message || "Failed to update price");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const handleProfitChange = (e) => {
    const newProfit = Number(e.target.value);
    setProfit(newProfit);
  };
  const exportToCSV = () => {
    if (!selectedLead) return;

    const rows = [];
    const values = selectedLead.dynamicFields?.[0]?.values || {};
    const log = selectedLead.log ? JSON.parse(selectedLead.log) : {};
    const stats = log.statistics || {};

    const add = (...cols) => rows.push(cols);

    add("Section", "Field", "Value");
    add("Lead Summary", "Lead ID", selectedLead.uniqueId);
    add("Lead Summary", "Status", selectedLead.status);
    add("Lead Summary", "Lead Type", values.selectedFormTitle);
    add("Lead Summary", "Form Number", selectedLead.formNumber);
    add(
      "Lead Summary",
      "Created At",
      new Date(selectedLead.createdAt).toLocaleString()
    );
    add("Lead Summary", "Total Profit", selectedLead.profit);
    add("Lead Summary", "IP Address", selectedLead.ip);
    add("");

    // ================= USER DETAILS =================
    add("User Details", "Field", "Value");
    const fieldMap = {
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      streetName: "Street Name",
      postalCode: "Postal Code",
      accommodationType: "Accommodation Type",
      homeSize: "Home Size",
      roomCount: "Room Count",
      roomCondition: "Condition",
      sellingDate: "Selling Timeline",
      details: "Details",
    };

    Object.entries(fieldMap)?.forEach(([key, label]) => {
      if (values[key]) add("User Details", label, values[key]);
    });
    add("");

    // ================= PARTNERS =================
    add("Partners", "Partner Name", "Email", "Lead Price");
    selectedLead.partnerIds?.forEach((p) => {
      add("Partners", p.partnerId?.name, p.partnerId?.email, p.leadPrice);
    });
    add("");

    // ================= EMAIL RESULTS =================
    add("Email Results", "Email", "Status", "Sent At", "Error");
    selectedLead.emailResults?.forEach((er) => {
      add(
        "Email Results",
        er.email,
        er.status,
        er.sentAt ? new Date(er.sentAt).toLocaleString() : "",
        er.error || ""
      );
    });
    add("");

    // ================= PROCESSING STATS =================
    add("Processing Stats", "Metric", "Value");
    add("Processing Stats", "Initial Partners", stats.initialPartners);
    add("Processing Stats", "Postal Matched", stats.postalMatched);
    add("Processing Stats", "Wishes Matched", stats.wishesMatched);
    add("Processing Stats", "Limit Available", stats.limitAvailable);
    add("Processing Stats", "Final Selected", stats.finalSelected);
    add("Processing Stats", "Max Allowed", stats.maxPartnersAllowed);
    add("");

    // ================= PROCESSING LOGS =================
    add("Processing Logs", "Step", "Partner", "Result", "Details");

    Object.values(log.steps || {})?.forEach((step) => {
      step.log?.forEach((entry) => {
        add(
          "Processing Logs",
          step.name,
          entry.partnerName || "",
          entry.match === true
            ? "Matched"
            : entry.match === false
              ? "Not Matched"
              : entry.limitReached === false
                ? "Passed"
                : entry.isPremium
                  ? "Ranked"
                  : "Checked",
          JSON.stringify(entry)
        );
      });
    });

    // ================= CSV DOWNLOAD =================
    const escape = (v) =>
      v === undefined || v === null ? "" : `"${String(v).replace(/"/g, '""')}"`;

    const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lead_${selectedLead.uniqueId}_detailed.csv`;
    link.click();
  };

  const headerButtons = [
    {
      value: "Back to leads",
      variant: "white",
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
      onClick: () => {
        const redirectUrl = page ? `/lead-logs?page=${page}` : "/lead-logs";
        navigate(redirectUrl);
      },
    },
    {
      value: "Export CSV",
      variant: "primary",
      onClick: exportToCSV,
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
  const leadLog = selectedLead.log ? JSON.parse(selectedLead.log) : null;

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
            { label: "Profit", value: profit },
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
            Partners & Lead Price
          </p>
          {partnerPrices.length ? (
            <div className="space-y-3">
              {partnerPrices.map((p) => (
                <div
                  key={p.partnerId}
                  className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={p.leadPrice}
                      onChange={(e) => {
                        const updated = partnerPrices.map((partner) =>
                          partner.partnerId === p.partnerId
                            ? { ...partner, leadPrice: Number(e.target.value) }
                            : partner
                        );
                        setPartnerPrices(updated);
                      }}
                      className="w-28 border border-slate-300 rounded-md px-2 py-1 text-sm"
                    />

                    {/* Tick Button */}
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.patch(
                            "/lead-logs/update-partner-profit",
                            {
                              leadId: id,
                              partnerId: p.partnerId,
                              leadPrice: p.leadPrice,
                            }
                          );

                          if (res.data.success) {
                            toast.success("Partner lead price updated!");
                            setProfit(res.data.data.profit); // update total profit
                          } else {
                            toast.error(
                              res.data.message || "Failed to update price"
                            );
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error("Something went wrong!");
                        }
                      }}
                      className="px-2 py-1 bg-primary text-white rounded hover:bg-primary/80"
                      title="Update partner price"
                    >
                      ✔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">-</p>
          )}
        </div>
        {/* Email Results */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
            Email Results
          </p>

          {selectedLead.emailResults && selectedLead.emailResults.length > 0 ? (
            <div className="space-y-3">
              {selectedLead.emailResults.map((er) => (
                <div
                  key={er._id}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {er.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      Sent at:{" "}
                      {er.sentAt ? new Date(er.sentAt).toLocaleString() : "—"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${er.status === "sent"
                        ? "bg-green-100 text-green-700"
                        : er.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {er.status.toUpperCase()}
                    </span>

                    {er.error && (
                      <p className="text-xs text-red-600 mt-1">{er.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No email activity found.</p>
          )}
        </div>

        {/* Status & Total Profit */}
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
              Total Profit
            </p>
            <input
              type="number"
              value={profit}
              onChange={handleProfitChange}
              className="border border-slate-200 px-3 py-2 rounded-md w-full"
            />
          </div>
        </div>
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
        {leadLog && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 mt-6">
            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
              Lead Processing Log
            </p>

            {Object.entries(leadLog.steps || {}).map(([stepKey, step], idx) => (
              <div key={idx} className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {step.name} ({step.description})
                </p>
                <div className="ml-4 space-y-2 text-sm text-slate-600">
                  {step.log?.map((entry, i) => (
                    <div
                      key={i}
                      className="p-2 border border-slate-200 rounded bg-white"
                    >
                      {Object.entries(entry).map(([k, v]) => (
                        <p key={k}>
                          <strong>{k}:</strong>{" "}
                          {typeof v === "object"
                            ? JSON.stringify(v)
                            : String(v)}
                        </p>
                      ))}
                    </div>
                  ))}
                  {step.summary && (
                    <p className="mt-1 text-xs text-slate-500">
                      <strong>Summary:</strong> {JSON.stringify(step.summary)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetails;