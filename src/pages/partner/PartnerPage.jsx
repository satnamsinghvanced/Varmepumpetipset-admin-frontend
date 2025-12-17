/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  fetchPartners,
  updatePartner,
  deletePartner,
} from "../../store/slices/partnerSlice";

// --- Quill Config ---
const modules = {
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

const formats = [
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
// --- End Quill Config ---

// --- Helper Components ---

// Component for rendering dynamic contact fields
const DynamicField = ({
  field,
  onChange,
  disabled,
  isEditing,
  onRequiredToggle,
  onLabelChange,
  onPlaceholderChange,
}) => {
  const { label, placeholder, name, type, required } = field;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        {isEditing ? (
          <div className="flex gap-4 items-center w-full">
            <label className="text-sm font-medium text-gray-600 w-1/4">
              Type: **{type}**
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => onLabelChange(e, name)}
              className="w-1/4 border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Label"
              disabled={disabled}
            />
            <input
              type="text"
              value={placeholder}
              onChange={(e) => onPlaceholderChange(e, name)}
              className="w-1/4 border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Placeholder"
              disabled={disabled}
            />
          </div>
        ) : (
          <label className="text-sm font-medium text-gray-600 mb-1 flex gap-2">
            {label}
            {required && (
              <span className="text-red-600 text-[18px] leading-none">*</span>
            )}
          </label>
        )}
      </div>

      {type === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          value={field.value || ""}
          onChange={(e) => onChange(e, name)}
          disabled={disabled}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "focus:ring-2 focus:ring-blue-400"
          }`}
          rows={4}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={field.value || ""}
          onChange={(e) => onChange(e, name)}
          disabled={disabled}
          // The pointer-events-none ensures the input can't be typed into when in view mode
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "focus:ring-2 focus:ring-blue-400 pointer-events-none"
          }`}
        />
      )}

      {isEditing && (
        <div className="flex items-center mt-2">
          <input
            type="checkbox"

            checked={required}
            onChange={() => onRequiredToggle(name)}
            className="mr-2 text-blue-600 !relative"
          />
          <label className="text-sm text-gray-600">Required</label>
        </div>
      )}
    </div>
  );
};

// Section Wrapper
const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    <div className="grid gap-4">{children}</div>
  </div>
);

// Basic Text Input
const Input = ({ label, value, onChange, name, disabled, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white ${
        disabled
          ? "bg-gray-100 cursor-not-allowed"
          : "focus:ring-2 focus:ring-blue-400"
      }`}
    />
  </div>
);

// Textarea Component
const Textarea = ({ label, value, onChange, name, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      rows={4}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white ${
        disabled
          ? "bg-gray-100 cursor-not-allowed"
          : "focus:ring-2 focus:ring-blue-400"
      }`}
    />
  </div>
);

// Checkbox Component
const Checkbox = ({ label, checked, onChange, name, disabled }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded !relative"
    />
    <label className="text-sm font-medium text-gray-700">{label}</label>
  </div>
);
// --- End Helper Components ---

const IMAGE_URL =
  import.meta.env.VITE_API_URL_IMAGE ?? import.meta.env.VITE_LOCAL_URL_IMAGE;

const PartnerPage = () => {
  const dispatch = useDispatch();
  const { partners, loading } = useSelector((state) => state.partner);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPartners());
  }, [dispatch]);

  useEffect(() => {
    if (partners.length > 0) {
      setFormData({
        ...partners[0],
        // Ensure nested objects are initialized
        robots: partners[0].robots || {},
        redirect: partners[0].redirect || {},
        // Default values for new fields
        buttonText: partners[0].buttonText || "",
        formText: partners[0].formText || "",
        canonicalUrl: partners[0].canonicalUrl || "",
        jsonLd: partners[0].jsonLd || "",
        ogTitle: partners[0].ogTitle || "",
        ogDescription: partners[0].ogDescription || "",
        ogImage: partners[0].ogImage || "",
        ogType: partners[0].ogType || "website",
        slug: partners[0].slug || "",
      });
      // Set initial preview if an image path exists
      if (partners[0].image && typeof partners[0].image === 'string') {
        setPreview(`${IMAGE_URL}${partners[0].image}`);
      }
    }
  }, [partners]);

  const handleChange = (e, fieldName) => {
    const { value, name: inputName, type, checked } = e.target;
    let newValue = value;

    // Handle Checkbox for boolean fields
    if (type === 'checkbox') {
      newValue = checked;
    }

    const nameParts = fieldName.split(".");

    if (nameParts.length === 2) {
      // Handles nested fields like 'robots.noindex' or 'redirect.enabled'
      const [parentField, childField] = nameParts;
      setFormData((prev) => ({
        ...prev,
        [parentField]: { ...prev[parentField], [childField]: newValue },
      }));
    } else {
      // Handles top-level fields
      setFormData((prev) => ({ ...prev, [fieldName]: newValue }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      toast.success("Image uploaded successfully!");
    }
  };

  const handleRequiredToggle = (fieldName) => {
    setFormData((prev) => ({
      ...prev,
      contactFields: prev.contactFields.map((field) =>
        field.name === fieldName
          ? { ...field, required: !field.required }
          : field
      ),
    }));
  };

  const handleLabelChange = (e, fieldName) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contactFields: prev.contactFields.map((field) =>
        field.name === fieldName ? { ...field, label: value } : field
      ),
    }));
  };

  const handlePlaceholderChange = (e, fieldName) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contactFields: prev.contactFields.map((field) =>
        field.name === fieldName ? { ...field, placeholder: value } : field
      ),
    }));
  };

  const handleSave = async () => {
    if (!formData?._id) {
      toast.error("No partner found to update.");
      return;
    }

    // Convert Date objects to ISO strings if they exist, to ensure proper sending to backend
    const dataToSave = {
      ...formData,
      publishedDate: formData.publishedDate ? new Date(formData.publishedDate).toISOString() : undefined,
      lastUpdatedDate: formData.lastUpdatedDate ? new Date(formData.lastUpdatedDate).toISOString() : undefined,
      scheduledPublishDate: formData.scheduledPublishDate ? new Date(formData.scheduledPublishDate).toISOString() : undefined,
      // The image field might be a File object or a string path; the controller handles it.
    };

    try {
      const response = await dispatch(
        updatePartner({ id: formData._id, formData: dataToSave })
      ).unwrap();
      toast.success(response?.message || "Partner updated successfully!");
      setIsEditing(false);
      dispatch(fetchPartners());
    } catch (err) {
      toast.error(err?.message || "Failed to update partner.");
    }
  };

  const handleDelete = async () => {
    if (!formData?._id) {
      toast.error("No partner found to delete.");
      return;
    }
    try {
      const response = await dispatch(deletePartner(formData._id)).unwrap();
      toast.success(response?.message || "Partner deleted successfully!");
      setFormData(null);
      setShowDeleteModal(false);
      dispatch(fetchPartners());
    } catch (err) {
      toast.error(err?.message || "Failed to delete partner.");
    }
  };

  if (loading || !formData)
    return <p className="p-6 text-gray-600">Loading partner data...</p>;

  // Function to safely access nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Partner Page</h1>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="px-2">
                <AiTwotoneEdit size={20} className="text-[#161925] text-xl" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 px-2"
              >
                <RiDeleteBin5Line className="text-xl" />
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#161925] hover:bg-[#161925]/85 text-white rounded-md"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      <Section title="Partner Information (Header)">
        <Input
          label="Heading"
          value={formData.heading}
          onChange={(e) => handleChange(e, "heading")}
          name="heading"
          disabled={!isEditing}
        />
        <Input
          label="Sub Heading"
          value={formData.subHeading}
          onChange={(e) => handleChange(e, "subHeading")}
          name="subHeading"
          disabled={!isEditing}
        />
      </Section>

      <Section title="Contact Form Fields">
        <Input
          label="Contact Form Title"
          value={formData.contactFormTitle}
          onChange={(e) => handleChange(e, "contactFormTitle")}
          name="contactFormTitle"
          disabled={!isEditing}
        />
        <Input
          label="Form Text"
          value={formData.formText}
          onChange={(e) => handleChange(e, "formText")}
          name="formText"
          disabled={!isEditing}
        />
        <Input
          label="Button Text"
          value={formData.buttonText}
          onChange={(e) => handleChange(e, "buttonText")}
          name="buttonText"
          disabled={!isEditing}
        />
        {formData.contactFields?.map((field, index) => (
          <DynamicField
            key={index}
            field={field}
            onChange={handleChange}
            disabled={!isEditing}
            isEditing={isEditing}
            onRequiredToggle={handleRequiredToggle}
            onLabelChange={handleLabelChange}
            onPlaceholderChange={handlePlaceholderChange}
          />
        ))}
      </Section>

      <Section title="Details Section">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleChange(e, "title")}
          name="title"
          disabled={!isEditing}
        />

        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-700"
            />
          </div>
        )}

        {(preview || formData.image) && (
          <img
            // Use the stored image path if no new file is being previewed
            src={typeof formData.image === 'string' && !preview ? `${IMAGE_URL}${formData.image}` : preview}
            alt="Preview"
            className="mt-3 rounded-lg border h-40 w-auto object-cover"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Description
          </label>
          {isEditing ? (
            <ReactQuill
              theme="snow"
              value={formData.description || ""}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
              className="bg-white rounded-lg"
              modules={modules}
              formats={formats}
            />
          ) : (
            <div
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white prose prose-gray max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formData.description || "" }}
            />
          )}
        </div>
      </Section>

      {/* --- NEW: SEO and Metadata Section --- */}
      <Section title="SEO and Metadata">
        <Input
          label="Meta Title"
          value={formData.metaTitle}
          onChange={(e) => handleChange(e, "metaTitle")}
          name="metaTitle"
          disabled={!isEditing}
        />
        <Input
          label="Meta Keywords (Comma-separated)"
          value={formData.metaKeywords}
          onChange={(e) => handleChange(e, "metaKeywords")}
          name="metaKeywords"
          disabled={!isEditing}
        />
        <Textarea
          label="Meta Description"
          value={formData.metaDescription}
          onChange={(e) => handleChange(e, "metaDescription")}
          name="metaDescription"
          disabled={!isEditing}
        />
        <Input
          label="Meta Image URL"
          value={formData.metaImage}
          onChange={(e) => handleChange(e, "metaImage")}
          name="metaImage"
          disabled={!isEditing}
        />
        <Input
          label="Canonical URL"
          value={formData.canonicalUrl}
          onChange={(e) => handleChange(e, "canonicalUrl")}
          name="canonicalUrl"
          disabled={!isEditing}
        />
        <Textarea
          label="JSON-LD / Structured Data"
          value={formData.jsonLd}
          onChange={(e) => handleChange(e, "jsonLd")}
          name="jsonLd"
          disabled={!isEditing}
        />
      </Section>

      {/* --- NEW: Open Graph/Social Sharing Section --- */}
      <Section title="Open Graph (Social Sharing)">
        <Input
          label="OG Title"
          value={formData.ogTitle}
          onChange={(e) => handleChange(e, "ogTitle")}
          name="ogTitle"
          disabled={!isEditing}
        />
        <Textarea
          label="OG Description"
          value={formData.ogDescription}
          onChange={(e) => handleChange(e, "ogDescription")}
          name="ogDescription"
          disabled={!isEditing}
        />
        <Input
          label="OG Image URL"
          value={formData.ogImage}
          onChange={(e) => handleChange(e, "ogImage")}
          name="ogImage"
          disabled={!isEditing}
        />
        <Input
          label="OG Type (e.g., website)"
          value={formData.ogType}
          onChange={(e) => handleChange(e, "ogType")}
          name="ogType"
          disabled={!isEditing}
        />
      </Section>
      
      {/* --- NEW: Publishing and SEO Settings Section --- */}
      <Section title="Publishing and Technical SEO">
        <Input
          label="Slug (URL Path)"
          value={formData.slug}
          onChange={(e) => handleChange(e, "slug")}
          name="slug"
          disabled={!isEditing}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Published Date"
            type="datetime-local"
            value={formData.publishedDate ? new Date(formData.publishedDate).toISOString().slice(0, 16) : ""}
            onChange={(e) => handleChange(e, "publishedDate")}
            name="publishedDate"
            disabled={!isEditing}
          />
          <Checkbox
            label="Show Published Date"
            checked={formData.showPublishedDate}
            onChange={(e) => handleChange(e, "showPublishedDate")}
            name="showPublishedDate"
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Last Updated Date"
            type="datetime-local"
            value={formData.lastUpdatedDate ? new Date(formData.lastUpdatedDate).toISOString().slice(0, 16) : ""}
            onChange={(e) => handleChange(e, "lastUpdatedDate")}
            name="lastUpdatedDate"
            disabled={!isEditing}
          />
          <Checkbox
            label="Show Last Updated Date"
            checked={formData.showLastUpdatedDate}
            onChange={(e) => handleChange(e, "showLastUpdatedDate")}
            name="showLastUpdatedDate"
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Checkbox
            label="Is Hidden (Draft Mode)"
            checked={formData.isHidden}
            onChange={(e) => handleChange(e, "isHidden")}
            name="isHidden"
            disabled={!isEditing}
          />
          <Checkbox
            label="Schedule Publishing"
            checked={formData.isScheduled}
            onChange={(e) => handleChange(e, "isScheduled")}
            name="isScheduled"
            disabled={!isEditing}
          />
          {formData.isScheduled && (
            <Input
              label="Scheduled Publish Date"
              type="datetime-local"
              value={formData.scheduledPublishDate ? new Date(formData.scheduledPublishDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => handleChange(e, "scheduledPublishDate")}
              name="scheduledPublishDate"
              disabled={!isEditing}
            />
          )}
        </div>

        <h3 className="text-lg font-medium text-gray-700 mt-2">Robots Tags</h3>
        <div className="grid grid-cols-3 gap-3">
          <Checkbox
            label="noindex"
            checked={getNestedValue(formData, "robots.noindex")}
            onChange={(e) => handleChange(e, "robots.noindex")}
            name="robots.noindex"
            disabled={!isEditing}
          />
          <Checkbox
            label="nofollow"
            checked={getNestedValue(formData, "robots.nofollow")}
            onChange={(e) => handleChange(e, "robots.nofollow")}
            name="robots.nofollow"
            disabled={!isEditing}
          />
          <Checkbox
            label="noarchive"
            checked={getNestedValue(formData, "robots.noarchive")}
            onChange={(e) => handleChange(e, "robots.noarchive")}
            name="robots.noarchive"
            disabled={!isEditing}
          />
          <Checkbox
            label="nosnippet"
            checked={getNestedValue(formData, "robots.nosnippet")}
            onChange={(e) => handleChange(e, "robots.nosnippet")}
            name="robots.nosnippet"
            disabled={!isEditing}
          />
          <Checkbox
            label="noimageindex"
            checked={getNestedValue(formData, "robots.noimageindex")}
            onChange={(e) => handleChange(e, "robots.noimageindex")}
            name="robots.noimageindex"
            disabled={!isEditing}
          />
          <Checkbox
            label="notranslate"
            checked={getNestedValue(formData, "robots.notranslate")}
            onChange={(e) => handleChange(e, "robots.notranslate")}
            name="robots.notranslate"
            disabled={!isEditing}
          />
        </div>

        <Textarea
          label="Custom Head HTML/Scripts"
          value={formData.customHead}
          onChange={(e) => handleChange(e, "customHead")}
          name="customHead"
          disabled={!isEditing}
        />

        {/* <h3 className="text-lg font-medium text-gray-700 mt-2">Sitemap Settings</h3>
        <div className="grid grid-cols-3 gap-4">
          <Checkbox
            label="Include in Sitemap"
            checked={formData.includeInSitemap}
            onChange={(e) => handleChange(e, "includeInSitemap")}
            name="includeInSitemap"
            disabled={!isEditing}
          />
          <Input
            label="Priority (0.0 - 1.0)"
            type="number"
            value={formData.priority}
            onChange={(e) => handleChange(e, "priority")}
            name="priority"
            disabled={!isEditing}
          />
          <Input
            label="Change Frequency (e.g., weekly)"
            value={formData.changefreq}
            onChange={(e) => handleChange(e, "changefreq")}
            name="changefreq"
            disabled={!isEditing}
          />
        </div> */}
      </Section>
      
      {/* <Section title="Redirect Settings">
        <Checkbox
          label="Enable Redirect"
          checked={getNestedValue(formData, "redirect.enabled")}
          onChange={(e) => handleChange(e, "redirect.enabled")}
          name="redirect.enabled"
          disabled={!isEditing}
        />
        {getNestedValue(formData, "redirect.enabled") && (
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Redirect From (Old URL)"
              value={getNestedValue(formData, "redirect.from")}
              onChange={(e) => handleChange(e, "redirect.from")}
              name="redirect.from"
              disabled={!isEditing}
            />
            <Input
              label="Redirect To (New URL)"
              value={getNestedValue(formData, "redirect.to")}
              onChange={(e) => handleChange(e, "redirect.to")}
              name="redirect.to"
              disabled={!isEditing}
            />
            <Input
              label="Redirect Type (301 or 302)"
              type="number"
              value={getNestedValue(formData, "redirect.type")}
              onChange={(e) => handleChange(e, "redirect.type")}
              name="redirect.type"
              disabled={!isEditing}
            />
          </div>
        )}
      </Section> */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 dark:bg-blue-950 rounded-lg w-[350px] shadow-lg">
            <p className="mb-6 font-bold text-center dark:text-white">
              Are you sure you want to delete this page?
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="border px-4 py-2 rounded-md"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPage;