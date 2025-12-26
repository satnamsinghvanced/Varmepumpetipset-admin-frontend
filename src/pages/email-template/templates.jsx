import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../components/PageHeader";
import { LuPlus } from "react-icons/lu";
import { HiSparkles } from "react-icons/hi2";

const EmailTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [settingDefault, setSettingDefault] = useState(false);
  const selectedIdRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const fetchTemplates = useCallback(async (preferredId = null) => {
    try {
      const res = await api.get(`/email-templates`);

      const payload = res.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setTemplates(list);

      if (list.length === 0) {
        setSelectedId(null);
        return;
      }

      const targetId = preferredId || selectedIdRef.current;
      const hasPreferred = targetId && list.some((t) => t._id === targetId);

      if (hasPreferred) {
        setSelectedId(targetId);
      } else {
        setSelectedId(list[0]._id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load templates.");
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const selectedTemplate =
    templates.find((t) => t._id === selectedId) || templates[0];
  const defaultTemplate = templates.find((t) => t.isActive);

  const headerButtons = [
    {
      value: "New Template",
      variant: "primary",
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      icon: <LuPlus fontSize={18} />,
      onClick: () => navigate("/email/create"),
    },
  ];

  const handleMakeDefault = async () => {
    if (!selectedTemplate?._id) return;

    try {
      setSettingDefault(true);

      await api.patch(
        `/email-templates/default-email-template?id=${selectedTemplate._id}`
      );
      toast.success("Default template set successfully.");
      await fetchTemplates(selectedTemplate._id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to set default template.");
    } finally {
      setSettingDefault(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Email Templates"
        description="Browse saved templates, edit content, and control which one is active."
        buttonsList={headerButtons}
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          {defaultTemplate && (
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <HiSparkles size={22} />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Default Template
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {defaultTemplate.name || "Untitled template"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Active subject:{" "}
                    <span className="font-medium text-slate-700">
                      {defaultTemplate.subject || "No subject"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  All Templates
                </p>
                <p className="text-xs text-slate-500">
                  Click a card to preview and manage details.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 w-[70px]">
                {templates.length} total
              </span>
            </div>

            {templates.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                You have no saved templates yet. Use the{" "}
                <span className="font-semibold text-slate-700">
                  New Template
                </span>{" "}
                button to create one.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {templates.map((t) => {
                  const isSelected = t._id === selectedId;
                  return (
                    <li
                      key={t._id}
                      onClick={() => setSelectedId(t._id)}
                      className={`cursor-pointer px-5 py-3 transition hover:bg-slate-50 ${
                        isSelected ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {t.name || "Untitled template"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t.subject || "No subject"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isSelected && (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                              Selected
                            </span>
                          )}
                          {t.isActive && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {selectedTemplate
                  ? selectedTemplate.name || "Untitled template"
                  : "No template selected"}
              </p>
              {selectedTemplate && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-slate-500">
                    Subject:{" "}
                    <span className="font-medium text-slate-700">
                      {selectedTemplate.subject || "No subject"}
                    </span>
                  </p>
                  {selectedTemplate.isActive && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Default
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/email/edit/${selectedTemplate._id}`)
                  }
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Edit Template
                </button>
              )}
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={handleMakeDefault}
                  disabled={settingDefault || selectedTemplate.isActive}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
                    selectedTemplate.isActive
                      ? "bg-slate-200 text-slate-500"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                  }`}
                >
                  {selectedTemplate.isActive
                    ? "Default Template"
                    : settingDefault
                    ? "Saving..."
                    : "Make Default"}
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5">
              {selectedTemplate ? (
                <div
                  className="prose max-w-none text-sm prose-headings:mt-0 prose-p:my-1 prose-a:text-indigo-600"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
                  <p>Select a template from the list to see its preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateList;
