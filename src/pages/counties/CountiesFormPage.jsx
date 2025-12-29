import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import {
  clearSelectedCounty,
  createCounty,
  getCounties,
  getCountyById,
  updateCounty,
} from "../../store/slices/countySlice";
import { toast } from "react-toastify";
import { RiDeleteBin5Line } from "react-icons/ri";
import ImageUploader from "../../UI/ImageUpload";
import { getCompaniesAll } from "../../store/slices/companySlice";
import ReactQuill from "react-quill-new";
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
  "blockquote",
  "code-block",
  "align",
  "link",
  "image",
];

const requiredFields = ["name", "slug"];

function labelFor(name) {
  const map = {
    name: "County Name",
    slug: "Slug",
    excerpt: "Excerpt",
  };
  return map[name] || name;
}

const CountiesFormPage = () => {
  const { countyId } = useParams();
  const isEditMode = Boolean(countyId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    counties,
    loading: citiesLoading,
    selectedCounty,
  } = useSelector((state) => state.counties || {});
   const { allCompanies } = useSelector((state) => state.companies);

    const [companySearch, setCompanySearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    excerpt: "",
    title: "",
    description: "",
    icon: "",
    companies: [],

    // SEO
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

    robots: {
      noindex: false,
      nofollow: false,
      noarchive: false,
      nosnippet: false,
      noimageindex: false,
      notranslate: false,
    },
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCompaniesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (isEditMode && countyId) dispatch(getCountyById(countyId));
    else dispatch(clearSelectedCounty());
    return () => dispatch(clearSelectedCounty());
  }, [dispatch, isEditMode, countyId]);
  useEffect(() => {
    dispatch(getCounties());
  }, [dispatch]);
  useEffect(() => {
  dispatch(getCompaniesAll());
}, [dispatch]);
  useEffect(() => {
    if (isEditMode && selectedCounty) {
      setForm({
        name: selectedCounty.name || "",
        slug: selectedCounty.slug || "",
        excerpt: selectedCounty.excerpt || "",
        title: selectedCounty.title || "",
        description: selectedCounty.description || "",
        icon: selectedCounty.icon || "",

        companies: Array.isArray(selectedCounty.companies)
          ? selectedCounty.companies.map((c, index) => ({
              companyId: String(c.companyId._id || c.companyId),
              rank: c.rank ?? index + 1,
              isRecommended: !!c.isRecommended,
            }))
          : [],

        metaTitle: selectedCounty.metaTitle || "",
        metaDescription: selectedCounty.metaDescription || "",
        metaKeywords: selectedCounty.metaKeywords || "",
        metaImage: selectedCounty.metaImage || "",

        canonicalUrl: selectedCounty.canonicalUrl || "",
        jsonLd: selectedCounty.jsonLd || "",

        ogTitle: selectedCounty.ogTitle || "",
        ogDescription: selectedCounty.ogDescription || "",
        ogImage: selectedCounty.ogImage || "",
        ogType: selectedCounty.ogType || "website",

       robots: selectedCounty.robots,
      });

      setPreviewImage(selectedCounty.icon || "");
    }
  }, [isEditMode, selectedCounty]);

  const validateField = (name, value) => {
    let message = "";
    if (requiredFields.includes(name)) {
      if (!value || !String(value).trim()) {
        message = `${labelFor(name)} is required`;
      }
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const validateAll = () => {
    const newErrors = {};
    requiredFields.forEach((f) => {
      const v = form[f];
      if (!v || !String(v).trim()) newErrors[f] = `${labelFor(f)} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (type !== "checkbox") {
      validateField(name, newValue);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setImageFile(file || null);
    setPreviewImage(file ? URL.createObjectURL(file) : "");
  };
  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    excerpt: form.excerpt,
    title: form.title,
    description: form.description,
    icon: form.icon,

    companies: form.companies.map((c, index) => ({
      companyId: c.companyId,
      rank: index + 1,
      isRecommended: c.isRecommended,
    })),

    // SEO
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    metaKeywords: form.metaKeywords,
    metaImage: form.metaImage,

    canonicalUrl: form.canonicalUrl,
    jsonLd: form.jsonLd,

    ogTitle: form.ogTitle,
    ogDescription: form.ogDescription,
    ogImage: form.ogImage,
    ogType: form.ogType,

    robots: {
      noindex: !!form.robots.noindex,
      nofollow: !!form.robots.nofollow,
      noarchive: !!form.robots.noarchive,
      nosnippet: !!form.robots.nosnippet,
      noimageindex: !!form.robots.noimageindex,
      notranslate: !!form.robots.notranslate,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Please fill required fields before saving.");
      return;
    }

    setSubmitting(true);

    try {
      let payload;
      let isFormData = false;

      if (imageFile) {
        isFormData = true;
        payload = new FormData();
        payload.append("name", form.name);
        payload.append("slug", form.slug);
        payload.append("excerpt", form.excerpt);
        payload.append("icon", imageFile);
        payload.append("metaTitle", form.metaTitle);
        payload.append("metaDescription", form.metaDescription);
        payload.append("metaKeywords", form.metaKeywords);
        payload.append("metaImage", form.metaImage);
        payload.append("canonicalUrl", form.canonicalUrl);
        payload.append("jsonLd", form.jsonLd);

        payload.append("ogTitle", form.ogTitle);
        payload.append("ogDescription", form.ogDescription);
        payload.append("ogImage", form.ogImage);
        payload.append("ogType", form.ogType);

        payload.append("robots", JSON.stringify(form.robots));
        payload.append("companies", JSON.stringify(form.companies));
      } else {
        payload = buildPayload(); // ✔ normal JSON
      }

      if (isEditMode) {
        await dispatch(
          updateCounty({ id: countyId, countyData: payload, isFormData })
        ).unwrap();
        toast.success("County updated!");
      } else {
        await dispatch(
          createCounty({ countyData: payload, isFormData })
        ).unwrap();
        toast.success("County created!");
      }

      navigate("/counties");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const isDisabled = hasErrors || submitting;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit County Details" : "Add County"}
        description={
          isEditMode
            ? "Update content for this County."
            : "Add a new County to the database."
        }
        buttonsList={useMemo(
          () => [
            {
              value: "Back to Counties",
              variant: "white",
              className:
                "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
              onClick: () => navigate("/counties"),
            },
          ],
          [navigate]
        )}
      />

      <form onSubmit={handleSubmit} className="">
        <div className="rounded-2xl md:p-8  space-y-6 border bg-white border-slate-200 shadow-sm max-w-8xl m-auto p-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "County Name", name: "name" },
              { label: "Slug", name: "slug" },
              { label: "Excerpt", name: "excerpt" },
              { label: "Title", name: "title" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {field.label}
                  {requiredFields.includes(field.name) && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  name={field.name}
                  type={field.type || "text"}
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
          <div ref={dropdownRef}>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Companies <span className="text-red-500">*</span>
            </label>

            {/* Trigger Button */}
            <div
              className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1 cursor-pointer"
              onClick={() => setShowCompaniesDropdown((prev) => !prev)}
            >
              {form.companies.length === 0 ? (
                <span className="text-slate-500 text-sm">Select Companies</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                 {form.companies.map((item) => {
                       const company = allCompanies.find((c) => c._id === item.companyId);
                    return (
                      <span
                        key={item.companyId}
                        className="bg-gray-100 text-slate-700 px-2 py-1 text-xs rounded-lg flex items-center gap-1"
                      >
                        {company?.companyName}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm((prev) => ({
                              ...prev,
                              companies: prev.companies.filter((x) => x !== item),
                            }));
                          }}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dropdown */}
             {showCompaniesDropdown && (
                <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white border rounded-xl shadow p-2">
                  {/* Search input */}
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full mb-2 rounded border px-2 py-1 text-sm outline-none focus:border-primary"
                  />

                  {/* Filtered list */}
                  {allCompanies
                    ?.filter((c) =>
                      c.companyName
                        .toLowerCase()
                        .includes(companySearch.toLowerCase())
                    )
                    .map((company) => (
                      <label
                        key={company._id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-100 cursor-pointer rounded"
                      >
                        <input
                          type="checkbox"
                          className="!relative"
                          checked={form.companies.some(
                            (c) => c.companyId === company._id
                          )}
                          onChange={(e) => {
                            let updated = [...form.companies];
                            if (e.target.checked) {
                              if (updated.length >= 10) {
                                toast.info("Maximum 10 companies allowed");
                                return;
                              }
                              updated.push({
                                companyId: company._id,
                                rank: updated.length + 1,
                                isRecommended: false,
                              });
                            } else {
                              updated = updated.filter(
                                (c) => c.companyId !== company._id
                              );
                            }
                            setForm((prev) => ({
                              ...prev,
                              companies: updated,
                            }));
                          }}
                        />
                        <span>{company.companyName}</span>
                      </label>
                    ))}
                </div>
              )}
            <h4 className="font-semibold mt-4">Selected Companies</h4>

            <div className="space-y-2">
              {form.companies.map((item, index) => {
                const company = allCompanies.find(
                  (c) => c._id === item.companyId
                );

                return (
                  <div
                    key={item.companyId}
                    className="flex items-center justify-between border rounded-lg p-2 bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {index + 1}. {company?.companyName}
                      </span>

                      {/* Recommended */}
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          className="!relative"
                          checked={item.isRecommended}
                          onChange={() => {
                            const updated = [...form.companies];
                            updated[index].isRecommended =
                              !updated[index].isRecommended;
                            setForm((prev) => ({
                              ...prev,
                              companies: updated,
                            }));
                          }}
                        />
                        Recommended
                      </label>
                    </div>

                    {/* Reorder */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const updated = [...form.companies];
                          [updated[index - 1], updated[index]] = [
                            updated[index],
                            updated[index - 1],
                          ];
                          setForm((prev) => ({
                            ...prev,
                            companies: updated,
                          }));
                        }}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        disabled={index === form.companies.length - 1}
                        onClick={() => {
                          const updated = [...form.companies];
                          [updated[index], updated[index + 1]] = [
                            updated[index + 1],
                            updated[index],
                          ];
                          setForm((prev) => ({
                            ...prev,
                            companies: updated,
                          }));
                        }}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Icon
            </label>
            {previewImage ? (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-56 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 rounded-full bg-red-600 p-2 text-white shadow hover:bg-red-500"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewImage("");
                    }}
                    title="Remove image"
                  >
                    <RiDeleteBin5Line size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="mt-3 flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-slate-300">
                <span>Click to upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
              {/* Tooltip */}
              <span className="relative flex items-center group">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500 cursor-pointer select-none">
                  i
                </span>

                {/* Tooltip content */}
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
                  Please use <i>##</i> for H2 tags and <i>#</i> for H3 tags. The
                  remaining text should stay unchanged, and please ensure the
                  content matches what is provided in the CSV file.
                </span>
              </span>
            </label>

            <div className="mt-2 rounded-2xl border border-slate-200 p-1">
              <textarea
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={10}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
             <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 mt-6">
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
                          onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
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
          <div className="mt-8">
            <button
              type="submit"
              disabled={isDisabled}
              className=" w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Create County"}
            </button>

            {isDisabled && hasErrors && (
              <p className="mt-2 text-xs text-red-600">
                Please fill all required fields to enable Save
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CountiesFormPage;
