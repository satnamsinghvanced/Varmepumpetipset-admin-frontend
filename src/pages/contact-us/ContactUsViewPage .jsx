import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import {
  fetchContactById,
  clearSelectedContact,
} from "../../store/slices/contactUsSlice";

const ContactUsViewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selected, loading } = useSelector((state) => state.contact);

  useEffect(() => {
    if (id) dispatch(fetchContactById(id));

    return () => {
      dispatch(clearSelectedContact());
    };
  }, [dispatch, id]);

  const headerButtons = [
    {
      value: "Back to Contacts",
      variant: "white",
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
      onClick: () => navigate(-1),
    },
  ];

  if (loading && !selected) {
    return (
      <div className="space-y-6">
        <PageHeader title="Message Details" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  // ---------------- WHEN NO DATA FOUND ----------------
  if (!selected) {
    return (
      <div className="space-y-6">
        <PageHeader title="Message Details" buttonsList={headerButtons} />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Message not found.
        </div>
      </div>
    );
  }

  // ---------------- MAIN VIEW PAGE ----------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Message Details"
        description="Full details for the selected contact message."
        buttonsList={headerButtons}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {selected.name}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {selected.email}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Phone
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {selected.phone || "N/A"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Message
          </p>
          <p className="mt-3 text-slate-700 whitespace-pre-line leading-relaxed">
            {selected.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUsViewPage;
