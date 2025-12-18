import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { RiDeleteBin5Line } from "react-icons/ri";
import {
  clearSelectedCompany,
  createCompany,
  getCompanyById,
  updateCompany,
} from "../../store/slices/companySlice";
import { uploadImage } from "../../store/slices/imageUpload";
import { toast } from "react-toastify";
import ImageUploader from "../../UI/ImageUpload";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    [{ align: [] }],
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
  "code-block",
  "align",
  "link",
  "image",
];

const requiredFields = [
  "companyName",
  // "email",
  // "zipCode",
  "address",
  "websiteAddress",
];

const CompanyFormPage = () => {
  const { companyId } = useParams();
  const isEditMode = Boolean(companyId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCompany } = useSelector((state) => state.companies || {});

  const [form, setForm] = useState({
    companyName: "",
    city: "",
    address: "",
    description: "",
    websiteAddress: "",
    extractor: "",
    brokerSites: "",
    features: "",
    totalRating: "",
    averageRating: "",
    companyImage: "",
    isRecommended: false,
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
  });

  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && companyId) {
      dispatch(getCompanyById(companyId));
    } else {
      dispatch(clearSelectedCompany());
    }
    return () => {
      dispatch(clearSelectedCompany());
    };
  }, [dispatch, isEditMode, companyId]);

  useEffect(() => {
    if (isEditMode && selectedCompany) {
      setForm({
        companyName: selectedCompany.companyName || "",
        city: selectedCompany.city || "",
        address: selectedCompany.address || "",
        description: selectedCompany.description || "",
        websiteAddress: selectedCompany.websiteAddress || "",
        extractor: Array.isArray(selectedCompany.extractor)
          ? selectedCompany.extractor.join(", ")
          : "",
        brokerSites: Array.isArray(selectedCompany.brokerSites)
          ? selectedCompany.brokerSites.join(", ")
          : "",
        features: Array.isArray(selectedCompany.features)
          ? selectedCompany.features.join(", ")
          : "",
        totalRating: selectedCompany.totalRating || 0,
        averageRating: selectedCompany.averageRating || 0,
        isRecommended: selectedCompany.isRecommended || false,
        companyImage: selectedCompany.companyImage || "",

        metaTitle: selectedCompany.metaTitle || "",
        metaDescription: selectedCompany.metaDescription || "",
        metaKeywords: selectedCompany.metaKeywords || "",
        metaImage: selectedCompany.metaImage || "",

        canonicalUrl: selectedCompany.canonicalUrl || "",
        jsonLd: selectedCompany.jsonLd || "",

        ogTitle: selectedCompany.ogTitle || "",
        ogDescription: selectedCompany.ogDescription || "",
        ogImage: selectedCompany.ogImage || "",
        ogType: selectedCompany.ogType || "website",

        publishedDate: selectedCompany.publishedDate || "",
        lastUpdatedDate: selectedCompany.lastUpdatedDate || "",
        showPublishedDate: selectedCompany.showPublishedDate || false,
        showLastUpdatedDate: selectedCompany.showLastUpdatedDate || false,

        robots: selectedCompany.robots,
      });
      setPreviewImage(selectedCompany.companyImage || "");
    }
  }, [isEditMode, selectedCompany]);

  const validateField = (name, value) => {
    let message = "";
    if (requiredFields.includes(name)) {
      if (!value || !String(value).trim()) {
        message = `${labelFor(name)} is required`;
      }
      //  else {
      //   if (name === "email") {
      //     const re =
      //       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
      //     if (!re.test(String(value).toLowerCase())) {
      //       message = "Please enter a valid email address";
      //     }
      //   }
      // }
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const validateAll = () => {
    const newErrors = {};
    requiredFields.forEach((f) => {
      const v = form[f];
      if (!v || !String(v).trim()) newErrors[f] = `${labelFor(f)} is required`;
      // if (f === "email" && v && String(v).trim()) {
      //   const re =
      //     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
      //   if (!re.test(String(v).toLowerCase())) {
      //     newErrors.email = "Please enter a valid email address";
      //   }
      // }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function labelFor(name) {
    const map = {
      companyName: "Company Name",
      // email: "Email",
      // zipCode: "Zip Code",
      address: "Address (Competitor)",
      websiteAddress: "Website Address",
    };
    return map[name] || name;
  }

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    validateField(name, newValue);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/x-icon",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image.");
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadImage(file);
      const imageUrl =
        typeof result === "string"
          ? result
          : result?.url || result?.data || result;
      if (!imageUrl) {
        throw new Error("Image upload failed: no URL returned");
      }
      setForm((prev) => ({ ...prev, companyImage: imageUrl }));
      setPreviewImage(imageUrl);
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(err?.message || "Failed to upload companyImage");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, companyImage: "" }));
    setPreviewImage("");
  };

  const buildPayload = () => {
    const payload = {
      companyName: form.companyName?.trim() || "",
      city: form.city?.trim() || "",
      address: form.address?.trim() || "",
      description: form.description || "",
      websiteAddress: form.websiteAddress?.trim() || "",
      totalRating: form.totalRating || 0,
      isRecommended :form.isRecommended || false ,
      averageRating: form.averageRating || 0,
      companyImage: form.companyImage || "",
      extractor: form.extractor
        ? form.extractor
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      brokerSites: form.brokerSites
        ? form.brokerSites
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      features: form.features
        ? form.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      metaTitle: form.metaTitle?.trim() || "",
      metaDescription: form.metaDescription?.trim() || "",
      metaKeywords: form.metaKeywords || "",
      metaImage: form.metaImage || "",

      canonicalUrl: form.canonicalUrl?.trim() || "",
      jsonLd: form.jsonLd || "",

      // Open Graph
      ogTitle: form.ogTitle?.trim() || "",
      ogDescription: form.ogDescription?.trim() || "",
      ogImage: form.ogImage || "",
      ogType: form.ogType || "website",

      // Dates
      publishedDate: form.publishedDate || "",
      lastUpdatedDate: form.lastUpdatedDate || "",
      showPublishedDate: form.showPublishedDate || false,
      showLastUpdatedDate: form.showLastUpdatedDate || false,

      // Robots
      robots: {
        noindex: !!form.robots.noindex,
        nofollow: !!form.robots.nofollow,
        noarchive: !!form.robots.noarchive,
        nosnippet: !!form.robots.nosnippet,
        noimageindex: !!form.robots.noimageindex,
        notranslate: !!form.robots.notranslate,
      },
    };

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Please fill required fields before saving.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      if (isEditMode) {
        await dispatch(
          updateCompany({ id: companyId, companyData: payload })
        ).unwrap();
        toast.success("Company updated!");
      } else {
        await dispatch(createCompany(payload)).unwrap();
        toast.success("Company created!");
      }

      navigate("/companies");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to save the company."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const isDisabled = hasErrors || submitting || isUploading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Company Details" : "Add Company"}
        description={
          isEditMode
            ? "Update content for this Company."
            : "Add a new Company to the database."
        }
        buttonsList={useMemo(
          () => [
            {
              value: "Back to Companies",
              variant: "white",
              className:
                "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
              onClick: () => navigate("/companies"),
            },
          ],
          [navigate]
        )}
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Company Name", name: "companyName" },
              { label: "Website Address", name: "websiteAddress" },
              { label: "Address (Competitor)", name: "address" },
              { label: "Total Rating", name: "totalRating", type: "number" },
              {
                label: "Average Rating",
                name: "averageRating",
                type: "number",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {field.label}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={form[field.name] ?? ""}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-900 outline-none transition
                    ${
                      errors[field.name]
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-200 focus:border-primary"
                    }`}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {[
              { label: "Extractor Tags (Comma Separated)", name: "extractor" },
              { label: "Broker Sites (Comma Separated)", name: "brokerSites" },
              { label: "Features", name: "features" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {field.label}
                </label>
                <textarea
                  name={field.name}
                  value={form[field.name] ?? ""}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g., tag1, tag2, tag3"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            ))}
          </div>

          {/* <div className="md:col-span-2">
            <label
              htmlFor="isRecommended-toggle"
              className="flex items-center cursor-pointer pt-2"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  name="isRecommended"
                  checked={form.isRecommended}
                  onChange={handleChange}
                  id="isRecommended-toggle"
                  className="sr-only"
                />

                <div
                  className={`w-11 h-6 rounded-full shadow-inner transition-colors duration-300 ease-in-out ${
                    form.isRecommended ? "bg-primary" : "bg-slate-300"
                  }`}
                ></div>

                <div
                  className={`dot absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ease-in-out ${
                    form.isRecommended ? "translate-x-full" : "translate-x-0"
                  }`}
                ></div>
              </div>

              <span className="ml-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Recommended Company
              </span>
            </label>
          </div> */}
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <div className="mt-2 rounded-2xl border border-slate-200 p-1">
              <ReactQuill
                value={form.description}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, description: value }))
                }
                modules={quillModules}
                formats={quillFormats}
                className="rounded-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:rounded-t-2xl"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Company Image
            </label>

            {previewImage ? (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="relative">
                  <img
                    src={`${
                      import.meta.env.VITE_API_URL_IMAGE
                    }/${previewImage}`}
                    alt="Preview"
                    className="h-56 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 rounded-full bg-red-600 p-2 text-white shadow hover:bg-red-500"
                    onClick={handleRemoveImage}
                    title="Remove companyImage"
                  >
                    <RiDeleteBin5Line size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="mt-3 flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-slate-300">
                <span>Click to upload Company Image</span>
                <input
                  type="file"
                  accept="companyImage/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}

            {isUploading && (
              <p className="mt-2 text-sm text-slate-500">
                Uploading companyImage...
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              {/* SEO SECTION */}
              <div className="pt-6">
                <h2 className="text-xl font-bold mb-4">SEO Settings</h2>

                {/* Meta Title */}
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Meta Title
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm({ ...form, metaTitle: e.target.value })
                  }
                />

                {/* Meta Description */}
                <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Meta Description
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-24 focus:border-primary"
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm({ ...form, metaDescription: e.target.value })
                  }
                />

                {/* Keywords */}
                <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Meta Keywords (comma separated)
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                  value={form.metaKeywords}
                  onChange={(e) =>
                    setForm({ ...form, metaKeywords: e.target.value })
                  }
                />

                {/* Meta Image */}
                <ImageUploader
                  label="Meta Image"
                  value={form.metaImage}
                  onChange={(img) => setForm({ ...form, metaImage: img })}
                />
              </div>

              {/* OG TAGS */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-4">Open Graph (OG) Tags</h2>

                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  OG Title
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                  value={form.ogTitle}
                  onChange={(e) =>
                    setForm({ ...form, ogTitle: e.target.value })
                  }
                />

                <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  OG Description
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-24 focus:border-primary"
                  value={form.ogDescription}
                  onChange={(e) =>
                    setForm({ ...form, ogDescription: e.target.value })
                  }
                />

                <ImageUploader
                  label="OG Image"
                  value={form.ogImage}
                  onChange={(img) => setForm({ ...form, ogImage: img })}
                />

                <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  OG Type
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                  value={form.ogType}
                  onChange={(e) => setForm({ ...form, ogType: e.target.value })}
                />
              </div>

              {/* ADVANCED SEO */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-4">Advanced SEO</h2>

                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Canonical URL
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                  value={form.canonicalUrl}
                  onChange={(e) =>
                    setForm({ ...form, canonicalUrl: e.target.value })
                  }
                />

                <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  JSON-LD Schema
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-28 focus:border-primary"
                  value={form.jsonLd}
                  onChange={(e) => setForm({ ...form, jsonLd: e.target.value })}
                />

                <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Custom Head Tags
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-24 focus:border-primary"
                  value={form.customHead}
                  onChange={(e) =>
                    setForm({ ...form, customHead: e.target.value })
                  }
                />
              </div>

              {/* ROBOTS SETTINGS */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-4">Robots Settings</h2>

                {Object.keys(form.robots).map((key) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      className="!relative"
                      type="checkbox"
                      checked={form.robots[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          robots: { ...form.robots, [key]: e.target.checked },
                        })
                      }
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
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
                : "Create Company"}
            </button>

            {isDisabled && (
              <p className="mt-2 text-xs text-red-600">
                {isUploading
                  ? "Please wait companyImage is uploading..."
                  : hasErrors
                  ? "Please fill all required fields to enable Save"
                  : ""}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyFormPage;
