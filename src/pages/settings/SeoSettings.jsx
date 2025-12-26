import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getAgentById,
  createAgent,
  updateAgent,
  clearSelectedAgent,
} from "../../store/slices/realEstateAgents";
import { toast } from "react-toastify";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote"],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "link",
  "image",
];

const requiredFields = ["title", "description", "metaTitle", "metaDescription"];

const SEOSettings = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedAgent, loading } = useSelector((state) => state.agents);

  const [form, setForm] = useState({
    title: "",
    description: "",
    descriptionBottom: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    robotsTxt: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) dispatch(getAgentById(id));
    return () => dispatch(clearSelectedAgent());
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (!selectedAgent) return;

    setForm({
      title: selectedAgent.title || "",
      description: selectedAgent.description || "",
      descriptionBottom: selectedAgent.descriptionBottom || "",
      metaTitle: selectedAgent.metaTitle || "",
      metaDescription: selectedAgent.metaDescription || "",
      metaKeywords: selectedAgent.metaKeywords || "",
      canonicalUrl: selectedAgent.canonicalUrl || "",
      robotsTxt: selectedAgent.robotsTxt || "",
      ogTitle: selectedAgent.ogTitle || "",
      ogDescription: selectedAgent.ogDescription || "",
      ogImage: selectedAgent.ogImage || "",
    });
  }, [selectedAgent]);

  const validateField = (name, value) => {
    let msg = "";
    if (requiredFields.includes(name) && !value.trim()) {
      msg = `${name} is required`;
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  const validateAll = () => {
    const newErrors = {};
    requiredFields.forEach((f) => {
      if (!form[f].trim()) newErrors[f] = `${f} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Please fix errors before saving");
      return;
    }

    setSubmitting(true);
    const payload = { ...form };

    try {
      if (isEditMode) {
        await dispatch(updateAgent({ id, agentData: payload })).unwrap();
        toast.success("SEO settings updated");
      } else {
        await dispatch(createAgent(payload)).unwrap();
        toast.success("SEO settings created");
      }

      navigate("/real-estate-agents");
    } catch (err) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const isDisabled = hasErrors || submitting;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit SEO Settings" : "Add SEO Settings"}
        description={
          isEditMode
            ? "Update SEO content for this page."
            : "Create new SEO settings entry."
        }
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        {/* LEFT CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Page Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                errors.title
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-primary"
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 rounded-2xl border border-slate-200 p-1">
              <ReactQuill
                value={form.description}
                onChange={(value) => setForm((prev) => ({ ...prev, description: value.replace(/&nbsp;/g, " ") }))}
                modules={quillModules}
                formats={quillFormats}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Description Bottom
            </label>
            <div className="mt-2 rounded-2xl border border-slate-200 p-1">
              <ReactQuill
                value={form.descriptionBottom}
                onChange={(value) => setForm((prev) => ({ ...prev, descriptionBottom: value }))}
                modules={quillModules}
                formats={quillFormats}
              />
            </div>
          </div> */}

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Meta Title <span className="text-red-500">*</span>
            </label>
            <input
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleChange}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                errors.metaTitle
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-primary"
              }`}
            />
            {errors.metaTitle && <p className="mt-1 text-xs text-red-600">{errors.metaTitle}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Meta Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleChange}
              rows={3}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                errors.metaDescription
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-primary"
              }`}
            />
            {errors.metaDescription && (
              <p className="mt-1 text-xs text-red-600">{errors.metaDescription}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Meta Keywords</label>
            <input
              name="metaKeywords"
              value={form.metaKeywords}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 focus:border-primary"
            />
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Canonical & Robots</h2>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Canonical URL</label>
              <input
                name="canonicalUrl"
                value={form.canonicalUrl}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Robots.txt</label>
              <textarea
                name="robotsTxt"
                value={form.robotsTxt}
                onChange={handleChange}
                rows={5}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 focus:border-primary font-mono"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Open Graph (OG) Tags</h2>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">OG Title</label>
              <input
                name="ogTitle"
                value={form.ogTitle}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">OG Description</label>
              <textarea
                name="ogDescription"
                value={form.ogDescription}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">OG Image URL</label>
              <input
                name="ogImage"
                value={form.ogImage}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Create SEO Settings"}
            </button>

            {isDisabled && (
              <p className="mt-2 text-xs text-red-600">Fix errors before submitting</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SEOSettings;
