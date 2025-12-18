/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchPartnerById } from "../../store/slices/partnersSlice";
import { AiTwotoneEdit } from "react-icons/ai";

export const PartnerDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { partnerDetail, loading } = useSelector((state) => state.partners);

  useEffect(() => {
    dispatch(fetchPartnerById(id));
  }, [id]);

  if (loading) return <p className="p-5 text-sm">Loading...</p>;
  if (!partnerDetail) return <p className="p-5 text-sm">Partner not found</p>;
console.log(partnerDetail)
  const p = partnerDetail;

  // Format postal codes
  const postalExact =
    p.postalCodes?.exact?.map((e) => e.code).join(", ") || "-";
  const postalRanges =
    p.postalCodes?.ranges?.map((r) => `${r.from} - ${r.to}`).join(", ") || "-";

  return (
    <div className="relative z-10  overflow-y-auto">
      <div className="mx-auto max-w-8xl p-4">
        {/* HEADER */}
        <div className="flex  w-full justify-end lg:items-center gap-5 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-white btn-sm rounded-lg border-slate-300 text-slate-700 px-6 py-2"
          >
            Back to Partners
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">{p.name}</h1>
              <p className="text-gray-600 text-sm">{p.email}</p>
            </div>

            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 p-2 border rounded-full text-slate-600 hover:text-black"
                onClick={() => navigate(`/partners/${p._id}/edit`)}
              >
                <AiTwotoneEdit size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="bg-white rounded-xl shadow-sm p-5 grid sm:grid-cols-2 gap-5 mb-6">
          <InfoCard title="City" value={p.city} />
          <InfoCard title="Address" value={p.address || "-"} />

          <InfoCard title="Postal Codes (Exact)" value={postalExact} />
          <InfoCard title="Postal Code Ranges" value={postalRanges} />

          <InfoCard
            title="Premium"
            value={p.isPremium ? "Yes" : "No"}
            badge={p.isPremium}
          />
          <InfoCard
            title="Status"
            value={p.isActive ? "Active" : "Inactive"}
            badge={p.isActive}
          />
          <InfoCard title="Total Leads" value={p.leads.total} />

          <InfoCard
            title="Created At"
            value={new Date(p.createdAt).toLocaleString()}
          />
        </div>

        {/* LEAD TYPES */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">Lead Types & Prices</h2>

          {p.leadTypes?.length ? (
            <div className="space-y-2">
              {p.leadTypes.map((lt, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-3 rounded-lg border border-slate-200"
                >
                  <p className="text-sm font-medium">
                    {lt.typeId.formTitle} —{" "}
                    <span className="text-primary font-semibold">
                      ₹{lt.price}
                    </span>
                  </p>
                  {/* <p className="text-xs text-gray-600">Type ID: {lt.typeId}</p> */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No lead types added.</p>
          )}
        </div>

        {/* LEADS SUMMARY */}
        {/* <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">Leads Summary</h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard title="Last Month" value={p.leads?.lastMonth || 0} />
            <StatCard title="Current Month" value={p.leads?.currentMonth || 0} />
            <StatCard title="Total Leads" value={p.leads?.total || 0} />
          </div>
        </div> */}

        {/* WISHES */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold mb-3">Partner Preferences</h2>

          {p.wishes?.length ? (
            <div className="space-y-3">
              {p.wishes.map((w, i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-3">
                  <p className="text-sm font-medium">
                    {i + 1}. {w.question}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-semibold">Answer:</span>{" "}
                    {Array.isArray(w.expectedAnswer)
                      ? w.expectedAnswer.join(", ")
                      : w.expectedAnswer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No wishes added.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* Utility Components */
const InfoCard = ({ title, value, badge }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs text-gray-500 mb-1">{title}</p>

    {badge !== undefined ? (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          badge ? "bg-primary text-white" : "bg-red-600 text-white"
        }`}
      >
        {value}
      </span>
    ) : (
      <p className="text-sm font-medium break-words">{value}</p>
    )}
  </div>
);

const StatCard = ({ title, value }) => (
  <div className="rounded-lg bg-slate-50 p-3 text-center">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);
