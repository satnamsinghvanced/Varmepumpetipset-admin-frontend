/* eslint-disable no-undef */
import { useEffect, useMemo, useState } from "react";
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
import ImageUploader from "../../UI/ImageUpload";

/* ------------------ QUILL CONFIG ------------------ */
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
  "bullet",
  "blockquote",
  "link",
  "image",
];

const requiredFields = ["title", "description", "descriptionBottom"];

/* ------------------ EMPTY FORM ------------------ */
const EMPTY_FORM = {
  title: "",
  description: "",
  descriptionBottom: "",

  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  metaImage: "",

  canonicalUrl: "",
  jsonLd: "",

  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",

  publishedDate: "",
  lastUpdatedDate: "",
  showPublishedDate: false,
  showLastUpdatedDate: false,

  robots: {
    noindex: false,
    nofollow: false,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
  },

  customHead: "",
  slug: "",

  redirect: {
    enabled: false,
    from: "",
    to: "",
    type: 301,
  },

  breadcrumbs: [],
  includeInSitemap: true,
  priority: 0.7,
  changefreq: "weekly",

  isScheduled: false,
  scheduledPublishDate: "",

  isDeleted: false,
  isHidden: false,
};

const RealEstateAgentsFormPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedAgent, loading } = useSelector((state) => state.agents);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* ------------------ FETCH DATA ------------------ */
  useEffect(() => {
    if (id) dispatch(getAgentById(id));
    return () => dispatch(clearSelectedAgent());
  }, [dispatch, id]);

  /* ------------------ POPULATE OR KEEP BLANK ------------------ */
  useEffect(() => {
    if (selectedAgent) {
      setForm({
        ...EMPTY_FORM,
        ...selectedAgent,
        robots: {
          ...EMPTY_FORM.robots,
          ...selectedAgent.robots,
        },
      });
    } else {
      // 🔥 KEY FIX: no data → blank form
      setForm(EMPTY_FORM);
    }
  }, [selectedAgent]);

  /* ------------------ VALIDATION ------------------ */
  const validateAll = () => {
    const newErrors = {};
    requiredFields.forEach((f) => {
      if (!form[f]?.trim()) newErrors[f] = `${f} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Please fix errors before saving");
      return;
    }

    setSubmitting(true);

    try {
      if (selectedAgent?._id) {
        // ✅ UPDATE
        await dispatch(
          updateAgent({ id: selectedAgent._id, agentData: form })
        ).unwrap();
      } else {
        // ✅ CREATE (even if URL had ID)
        await dispatch(createAgent(form)).unwrap();
      }

      navigate("/real-estate-agents");
    } catch (err) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled =
    submitting || Object.values(errors).some((val) => val);

  /* ------------------ UI (UNCHANGED) ------------------ */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Real Estate Agent Page"
        description="Manage real estate agent content."
        buttonsList={useMemo(
          () => [
            {
              value: "Back",
              variant: "white",
              className:
                "border border-slate-300 text-slate-700 hover:border-slate-400",
              onClick: () => navigate("/real-estate-agents"),
            },
          ],
          [navigate]
        )}
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        {/* LEFT */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Title *
          </label>
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description *
            </label>
            <ReactQuill
              value={form.description}
              onChange={(v) =>
                setForm({ ...form, description: v })
              }
              modules={quillModules}
              formats={quillFormats}
            />
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description Bottom *
            </label>
            <ReactQuill
              value={form.descriptionBottom}
              onChange={(v) =>
                setForm({ ...form, descriptionBottom: v })
              }
              modules={quillModules}
              formats={quillFormats}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ImageUploader
              label="Meta Image"
              value={form.metaImage}
              onChange={(img) =>
                setForm({ ...form, metaImage: img })
              }
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RealEstateAgentsFormPage;
