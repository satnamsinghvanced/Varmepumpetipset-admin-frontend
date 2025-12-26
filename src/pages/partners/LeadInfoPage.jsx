import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import api from "../../api/axios";

const LeadInfo = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("currentMonth");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  const fetchLeadInfo = async () => {
    setLoading(true);
    try {
      const params = { partnerId, filter: dateFilter };
      if (dateFilter === "custom") {
        if (customDates.start) params.startDate = customDates.start;
        if (customDates.end) params.endDate = customDates.end;
      }
      const res = await api.get("/lead-logs/partner-summary", { params });
      if (res.data.success) {
        setPartnerData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch lead info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadInfo();
  }, [dateFilter]);

  const handleExportCSV = () => {
    if (!partnerData) return;

    const rows = [
      ["Partner Name", partnerData.partnerName],
      [""],

      // ["Lead Type", "Count", "Price per Lead", "Total Price"],
      // ...partnerData.leadTypes.map(lt => [
      //   lt.leadType,
      //   lt.count,
      //   lt.pricePerLead,
      //   lt.totalPrice
      // ]),

      [""],
      ["Lead ID", "Type", "Price", "Sent Date"],
      ...partnerData.leadDetails.map((lead) => [
        lead.leadId,
        lead.type,
        lead.price,
        new Date(lead.sent).toLocaleDateString("en-GB"),
      ]),

      [""],
      ["", "Grand Total", partnerData.grandTotal],
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${partnerData.partnerName}_leads_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headerButtons = [
    {
      value: "Back",
      variant: "white",
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
      onClick: () => navigate(-1),
    },
  ];
  console.log(partnerData);
  const noLeadsFound =
    !partnerData ||
    (partnerData.leadTypes?.length === 0 &&
      partnerData.leadDetails?.length === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Summary"
        description="Overview of leads for this partner."
        buttonsList={headerButtons}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow flex flex-wrap gap-4 items-center">
        <select
          className="p-2 border border-slate-300 rounded-lg min-w-[180px]"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="currentMonth">Current Month</option>
          <option value="previousMonth">Previous Month</option>
          <option value="custom">Custom Range</option>
        </select>
        {dateFilter === "custom" && (
          <>
            <input
              type="date"
              name="start"
              value={customDates.start}
              onChange={(e) =>
                setCustomDates({ ...customDates, start: e.target.value })
              }
              className="p-2 border border-slate-300 rounded-lg"
            />
            <input
              type="date"
              name="end"
              value={customDates.end}
              onChange={(e) =>
                setCustomDates({ ...customDates, end: e.target.value })
              }
              className="p-2 border border-slate-300 rounded-lg"
            />
          </>
        )}
        <button
          onClick={fetchLeadInfo}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Filter
        </button>

        <button
          onClick={handleExportCSV}
         disabled={loading || noLeadsFound}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>
      {!loading && noLeadsFound && (
  <div className="bg-white border border-slate-200 rounded-xl p-10 shadow text-center">
    <p className="text-sm font-semibold text-slate-800">
      No leads found
    </p>
    <p className="text-xs text-slate-500 mt-1">
      There are no leads available for the selected date range.
    </p>
  </div>
)}
      {!noLeadsFound && (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm w-full">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-xl font-semibold text-slate-900">
                Lead Overview — {partnerData?.partnerName || "Partner"}
              </p>

              <p className="text-sm text-slate-500">
                Total Leads: {partnerData?.totalLeads || 0} | Grand Total:{" "}
                {partnerData?.grandTotal || 0}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Lead Type</th>
                    <th className="px-6 py-3">Count</th>
                    <th className="px-6 py-3">Price per Lead</th>
                    <th className="px-6 py-3">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {partnerData?.leadTypes.map((lt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4">{lt.leadType}</td>
                      <td className="px-6 py-4">{lt.count}</td>
                      <td className="px-6 py-4">{lt.pricePerLead}</td>
                      <td className="px-6 py-4 font-semibold">
                        {lt.totalPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm w-full">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-xl font-semibold text-slate-900">
                Lead Details
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Lead ID</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Sent Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {partnerData?.leadDetails.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4">{lead.leadId}</td>
                      <td className="px-6 py-4">{lead.type}</td>
                      <td className="px-6 py-4 font-medium">{lead.price}</td>
                      <td className="px-6 py-4">
                        {new Date(lead.sent).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeadInfo;
