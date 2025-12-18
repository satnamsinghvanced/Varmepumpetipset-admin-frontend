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
  "header", "bold", "italic", "underline", "strike", "list", "bullet", "blockquote", "code-block", "align", "link", "image",
];

// --- Helper Components ---

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
    <div className="border-b border-gray-100 pb-4 last:border-0">
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
            disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-400"
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
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-400 pointer-events-none"
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

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    <div className="grid gap-4">{children}</div>
  </div>
);

const Input = ({ label, value, onChange, name, disabled, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-400"
      }`}
    />
  </div>
);

const Textarea = ({ label, value, onChange, name, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      rows={4}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-400"
      }`}
    />
  </div>
);

const Checkbox = ({ label, checked, onChange, name, disabled }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      name={name}
      checked={!!checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded !relative"
    />
    <label className="text-sm font-medium text-gray-700">{label}</label>
  </div>
);

// --- Component Logic ---

const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE ?? import.meta.env.VITE_LOCAL_URL_IMAGE;

const PartnerPage = () => {
  const dispatch = useDispatch();
  const { partners, loading } = useSelector((state) => state.partner);
  
  // Initialize state with an empty template so it shows blank inputs if no data is found
  const [formData, setFormData] = useState({
    heading: "", subHeading: "", contactFormTitle: "", formText: "", buttonText: "",
    title: "", description: "", metaTitle: "", metaKeywords: "", metaDescription: "",
    metaImage: "", canonicalUrl: "", jsonLd: "", ogTitle: "", ogDescription: "",
    ogImage: "", ogType: "website",
    contactFields: [
        { name: "name", label: "Name", placeholder: "Enter name", type: "text", required: true },
        { name: "email", label: "Email", placeholder: "Enter email", type: "email", required: true },
        { name: "message", label: "Message", placeholder: "Enter message", type: "textarea", required: false }
    ],
    robots: { noindex: false, nofollow: false, noarchive: false, nosnippet: false, noimageindex: false, notranslate: false }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPartners());
  }, [dispatch]);

  useEffect(() => {
    if (partners && partners.length > 0) {
      setFormData({
        ...partners[0],
        robots: partners[0].robots || {},
        contactFields: partners[0].contactFields || [],
      });
      if (partners[0].image && typeof partners[0].image === 'string') {
        setPreview(`${IMAGE_URL}${partners[0].image}`);
      }
    }
  }, [partners]);

  const handleChange = (e, fieldName) => {
    const { value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    const nameParts = fieldName.split(".");
    if (nameParts.length === 2) {
      const [parentField, childField] = nameParts;
      setFormData((prev) => ({
        ...prev,
        [parentField]: { ...prev[parentField], [childField]: newValue },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldName]: newValue }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
      toast.success("Image uploaded successfully!");
    }
  };

  const handleRequiredToggle = (fieldName) => {
    setFormData((prev) => ({
      ...prev,
      contactFields: prev.contactFields.map((field) =>
        field.name === fieldName ? { ...field, required: !field.required } : field
      ),
    }));
  };

  const handleLabelChange = (e, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      contactFields: prev.contactFields.map((field) =>
        field.name === fieldName ? { ...field, label: e.target.value } : field
      ),
    }));
  };

  const handlePlaceholderChange = (e, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      contactFields: prev.contactFields.map((field) =>
        field.name === fieldName ? { ...field, placeholder: e.target.value } : field
      ),
    }));
  };

  const handleSave = async () => {
    if (!formData?._id) {
      toast.error("No partner found to update.");
      return;
    }
    try {
      const response = await dispatch(updatePartner({ id: formData._id, formData })).unwrap();
      toast.success(response?.message || "Partner updated successfully!");
      setIsEditing(false);
      dispatch(fetchPartners());
    } catch (err) {
      toast.error(err?.message || "Failed to update.");
    }
  };

  const handleDelete = async () => {
    if (!formData?._id) return;
    try {
      await dispatch(deletePartner(formData._id)).unwrap();
      toast.success("Partner deleted!");
      setShowDeleteModal(false);
      dispatch(fetchPartners());
    } catch (err) {
      toast.error(err?.message || "Delete failed.");
    }
  };

  const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

  if (loading) return <p className="p-6 text-gray-600">Loading partner data...</p>;

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Partner Page</h1>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)}><AiTwotoneEdit size={22} /></button>
              <button onClick={() => setShowDeleteModal(true)} className="text-red-600"><RiDeleteBin5Line size={22} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-[#161925] text-white rounded-md">Save</button>
            </>
          )}
        </div>
      </div>

      <Section title="Partner Information (Header)">
        <Input label="Heading" value={formData.heading} onChange={(e) => handleChange(e, "heading")} disabled={!isEditing} />
        <Input label="Sub Heading" value={formData.subHeading} onChange={(e) => handleChange(e, "subHeading")} disabled={!isEditing} />
      </Section>

      <Section title="Contact Form Fields">
        <Input label="Contact Form Title" value={formData.contactFormTitle} onChange={(e) => handleChange(e, "contactFormTitle")} disabled={!isEditing} />
        <Input label="Form Text" value={formData.formText} onChange={(e) => handleChange(e, "formText")} disabled={!isEditing} />
        <Input label="Button Text" value={formData.buttonText} onChange={(e) => handleChange(e, "buttonText")} disabled={!isEditing} />
        {formData.contactFields?.map((field, index) => (
          <DynamicField key={index} field={field} disabled={!isEditing} isEditing={isEditing} 
            onChange={handleChange} onRequiredToggle={handleRequiredToggle} 
            onLabelChange={handleLabelChange} onPlaceholderChange={handlePlaceholderChange} 
          />
        ))}
      </Section>

      <Section title="Details Section">
        <Input label="Title" value={formData.title} onChange={(e) => handleChange(e, "title")} disabled={!isEditing} />
        {isEditing && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          </div>
        )}
        {(preview || formData.image) && (
          <img src={typeof formData.image === 'string' && !preview ? `${IMAGE_URL}${formData.image}` : preview} alt="Preview" className="mt-3 rounded-lg border h-40 object-cover" />
        )}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          {isEditing ? (
            <ReactQuill theme="snow" value={formData.description || ""} onChange={(val) => setFormData(p => ({...p, description: val}))} modules={modules} formats={formats} />
          ) : (
            <div className="border border-gray-300 rounded-lg px-3 py-2 bg-white min-h-[100px]" dangerouslySetInnerHTML={{ __html: formData.description || "" }} />
          )}
        </div>
      </Section>

      <Section title="SEO and Metadata">
        <Input label="Meta Title" value={formData.metaTitle} onChange={(e) => handleChange(e, "metaTitle")} disabled={!isEditing} />
        <Input label="Meta Keywords" value={formData.metaKeywords} onChange={(e) => handleChange(e, "metaKeywords")} disabled={!isEditing} />
        <Textarea label="Meta Description" value={formData.metaDescription} onChange={(e) => handleChange(e, "metaDescription")} disabled={!isEditing} />
        <Input label="Canonical URL" value={formData.canonicalUrl} onChange={(e) => handleChange(e, "canonicalUrl")} disabled={!isEditing} />
        <Textarea label="JSON-LD" value={formData.jsonLd} onChange={(e) => handleChange(e, "jsonLd")} disabled={!isEditing} />
      </Section>

      <Section title="Open Graph (Social Sharing)">
        <Input label="OG Title" value={formData.ogTitle} onChange={(e) => handleChange(e, "ogTitle")} disabled={!isEditing} />
        <Textarea label="OG Description" value={formData.ogDescription} onChange={(e) => handleChange(e, "ogDescription")} disabled={!isEditing} />
        <Input label="OG Image URL" value={formData.ogImage} onChange={(e) => handleChange(e, "ogImage")} disabled={!isEditing} />
        <Input label="OG Type" value={formData.ogType} onChange={(e) => handleChange(e, "ogType")} disabled={!isEditing} />
      </Section>

      <Section title="Robots Tags">
        <div className="grid grid-cols-3 gap-3">
          {["noindex", "nofollow", "noarchive", "nosnippet", "noimageindex", "notranslate"].map(tag => (
            <Checkbox key={tag} label={tag} checked={getNestedValue(formData, `robots.${tag}`)} onChange={(e) => handleChange(e, `robots.${tag}`)} disabled={!isEditing} />
          ))}
        </div>
      </Section>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg text-center">
            <p className="mb-6 font-bold">Delete this page?</p>
            <div className="flex justify-center gap-3">
              <button className="border px-4 py-2 rounded" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPage;