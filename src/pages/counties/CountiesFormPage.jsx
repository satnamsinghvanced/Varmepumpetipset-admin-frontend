import { useEffect, useMemo, useState } from "react";
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

  const [form, setForm] = useState({
    name: "",
    slug: "",
    excerpt: "",
    icon: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && countyId) dispatch(getCountyById(countyId));
    else dispatch(clearSelectedCounty());
    return () => dispatch(clearSelectedCounty());
  }, [dispatch, isEditMode, countyId]);
  useEffect(() => {
    dispatch(getCounties());
  }, [dispatch]);
  useEffect(() => {
    if (isEditMode && selectedCounty) {
      setForm({
        name: selectedCounty.name || "",
        slug: selectedCounty.slug || "",
        excerpt: selectedCounty.excerpt || "",
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
  const buildPayload = () => {
    const payload = {
      name: form.name?.trim() || "",
      slug: form.slug?.trim() || "",
      excerpt: form.excerpt?.trim() || "",
      icon: form.icon || "",
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
      let payload;
      let isFormData = false;

      if (imageFile) {
        isFormData = true;
        payload = new FormData();
        payload.append("name", form.name);
        payload.append("slug", form.slug);
        payload.append("excerpt", form.excerpt);
        payload.append("icon", imageFile); // ✔ Upload file
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Featured image
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
