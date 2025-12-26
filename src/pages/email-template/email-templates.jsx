import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import { LuArrowLeft } from "react-icons/lu";

const CreateEmailTemplate = () => {
  const { templateId } = useParams();
  const isEditMode = Boolean(templateId);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(isEditMode);
  const navigate = useNavigate();
  const headerButtons = [
    {
      value: "Back to Templates",
      variant: "white",
      icon: <LuArrowLeft fontSize={18} />,
      border: "border-slate-300 dark:border-slate-600",
      onClick: () => navigate(-1),
    },
  ];

  useEffect(() => {
    if (!isEditMode) return;

    const fetchTemplate = async () => {
      try {
        setInitializing(true);
        const res = await api.get(`/email-templates/detail?id=${templateId}`);
        const data = res.data?.data ?? res.data;
        setName(data?.name || "");
        setSubject(data?.subject || "");
        setBody(data?.body || "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load template.");
      } finally {
        setInitializing(false);
      }
    };

    fetchTemplate();
  }, [isEditMode, templateId]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isEditMode) {
        await api.put(`/email-templates/update?id=${templateId}`, {
          name,
          subject,
          body,
        });
        toast.success("Template updated!");
      } else {
        await api.post(`/email-templates`, {
          name,
          subject,
          body,
        });
        toast.success("Template created!");
      }
      navigate("/email-templates");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving the template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Email Template" : "Create Email Template"}
        description={
          isEditMode
            ? "Update copy, subject line, and HTML body before saving."
            : "Design a reusable email template and preview it in real time."
        }
        buttonsList={headerButtons}
      />

      {isEditMode && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          <p className="font-semibold">You are editing an existing template.</p>
          <p className="text-amber-700">
            Changes are applied immediately after you save, so double-check the
            HTML preview before publishing.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Template Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Template Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-50"
                placeholder="Welcome Email"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={initializing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Subject
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-50"
                placeholder="Thank you for signing up"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={initializing}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Email HTML Body
                </label>
                <span className="text-xs text-slate-400">
                  Supports HTML content
                </span>
              </div>
              <textarea
                rows={12}
                className="mt-1 block w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-50"
                placeholder="<h1>Welcome!</h1><p>We are glad to have you here.</p>"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={initializing}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500">
                {initializing
                  ? "Loading template..."
                  : "Need HTML? Paste your styled markup here."}
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || initializing}
                className="btn group btn-primary btn-sm rounded-10 text-base  undefined !bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Save Template"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              Live preview
            </span>
          </div>

          <div className="mb-4 border-b border-dashed border-slate-200 pb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {subject || "Your email subject will appear here"}
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            {initializing ? (
              <p className="text-sm text-slate-400">Loading template…</p>
            ) : body ? (
              <div
                className="prose max-w-none text-sm prose-headings:mt-0 prose-p:my-1 prose-a:text-indigo-600"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <p className="text-sm text-slate-400">
                Start typing your HTML body on the left to see a live preview
                here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmailTemplate;
