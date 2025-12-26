import { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { AiTwotoneEdit, AiOutlinePlus } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  getAllPrivacyPolicies,
  updatePrivacyPolicy,
} from "../../store/slices/privacyPolicySlice";

import { addCustomStyling } from "../../utils/addCustomStyling";

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

const privacyPolicyDefaultState = {
  policyId: null,
  title: "",
  content: "",
  lastUpdated: null,
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    robots: {
      noindex: false,
      nofollow: false,
      noarchive: false,
      nosnippet: false,
      notranslate: false,
    },
    jsonLd: "",
    customHead: "",
    includeInSitemap: true,
    priority: 0.7,
    changefreq: "monthly",
  },
};

const formats = [
  "header", "bold", "italic", "underline", "strike",
  "list", "blockquote", "code-block",
  "align", "link", "image",
];

export const PrivacyPolicyPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.privacyPolicy);

  const [isEditing, setIsEditing] = useState(false);

  const getInitialData = () => {
    if (items && items.length > 0) {
      const policy = items[0];
      return {
        policyId: policy._id,
        title: policy.title || "Privacy Policy",
        content: policy.description || "",
        lastUpdated: policy.updatedAt || "",
        seo: {
          metaTitle: policy.metaTitle || "",
          metaDescription: policy.metaDescription || "",
          metaKeywords: policy.metaKeywords || "",
          canonicalUrl: policy.canonicalUrl || "",
          ogTitle: policy.ogTitle || "",
          ogDescription: policy.ogDescription || "",
          ogImage: policy.ogImage || "",
          robots: policy.robots || privacyPolicyDefaultState.seo.robots,
          jsonLd: policy.jsonLd || "",
          customHead: policy.customHead || "",
          includeInSitemap: policy.includeInSitemap ?? true,
          priority: policy.priority ?? 0.7,
          changefreq: policy.changefreq || "monthly",
        },
      };
    }
    return privacyPolicyDefaultState;
  };

  const [formState, setFormState] = useState(getInitialData);

  // Destructure
  const { policyId, title, content, seo, lastUpdated } = formState;

  // Setters
  const setTitle = (val) => setFormState(prev => ({ ...prev, title: val }));
  const setContent = (val) => setFormState(prev => ({ ...prev, content: val }));
  const setSeo = (val) => setFormState(prev => ({ ...prev, seo: val }));
  const setPolicyId = (val) => setFormState(prev => ({ ...prev, policyId: val }));
  const setLastUpdated = (val) => setFormState(prev => ({ ...prev, lastUpdated: val }));


  // FETCH POLICY
  useEffect(() => {
    dispatch(getAllPrivacyPolicies());
  }, [dispatch]);

  // SET FORM DATA ONCE FETCHED
  useEffect(() => {
    if (items && items.length > 0) {
      const policy = items[0];
      setFormState({
        policyId: policy._id,
        title: policy.title || "Privacy Policy",
        content: policy.description || "",
        lastUpdated: policy.updatedAt || "",
        seo: {
          metaTitle: policy.metaTitle || "",
          metaDescription: policy.metaDescription || "",
          metaKeywords: policy.metaKeywords || "",
          canonicalUrl: policy.canonicalUrl || "",
          ogTitle: policy.ogTitle || "",
          ogDescription: policy.ogDescription || "",
          ogImage: policy.ogImage || "",
          robots: policy.robots || privacyPolicyDefaultState.seo.robots,
          jsonLd: policy.jsonLd || "",
          customHead: policy.customHead || "",
          includeInSitemap: policy.includeInSitemap ?? true,
          priority: policy.priority ?? 0.7,
          changefreq: policy.changefreq || "monthly",
        },
      });
    }
  }, [items]);

  // INITIALIZE DEFAULT DATA
  const handleCreateDefault = async () => {
    try {
      const res = await dispatch(
        updatePrivacyPolicy({
          id: "new", // Triggers the create logic in your updated controller
          data: {
            title: "Privacy Policy",
            description: `<h2>1. Introduction</h2><p>At Boligtip, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website or use our services (collectively, the “Service”).</p><p>By using Boligtip, you agree to this Privacy Policy. If you do not agree, please do not use our Service..</p><h2>2. Information We Collect</h2><p>We may collect the following types of information:</p><p><strong>a. Personal Information</strong> – such as your name, email address, phone number, or other details you provide when creating an account or contacting us.</p><p><strong>b. Usage Data </strong>– including your IP address, browser type, device information, and pages visited.</p><p><strong>c. Cookies and Tracking Technologies</strong> – small files stored on your device that help us analyze usage and improve user experience.</p><h2>3. How We Use Your Information</h2><p>We use the collected data to:</p><ol><li>Provide, maintain, and improve our Service.</li><li>Personalize your user experience.</li><li>Communicate with you (e.g., support, updates, offers).</li><li>Ensure security and prevent fraud.</li><li>Comply with legal obligations.</li></ol><h2>4. Sharing of Information</h2><p>We do not sell your personal data.</p><p>We may share information only in the following cases:</p><p><strong>With service providers</strong> that help us operate Boligtip (e.g., hosting, analytics).</p><p><strong>For legal reasons</strong> if required by law or to protect our rights.</p><p><strong>During business transfers </strong>such as mergers, acquisitions, or asset sales.</p><h2>5. Data Retention</h2><p>We keep your data only as long as necessary to fulfill the purposes described in this Policy or as required by law.</p><h2>6. Cookies</h2><p>Boligtip uses cookies to remember preferences, improve site performance, and analyze traffic.</p><p>You can control or disable cookies in your browser settings, though some features may not work properly if cookies are disabled.</p><h2>7. Data Security</h2><p>We use reasonable administrative, technical, and physical safeguards to protect your personal information. However, no online service is completely secure, and we cannot guarantee absolute security.</p><h2>8. Your Rights</h2><p>Depending on your location, you may have rights to:</p><p>Access and receive a copy of your personal data.</p><p>Request correction or deletion.</p><p>Withdraw consent for data processing.</p><p>Object to or limit certain uses of your information.</p><p>To exercise these rights, contact us using the details below.</p><h2>9. Third-Party Links</h2><p>Our Service may contain links to third-party websites. Boligtip is not responsible for the content or privacy practices of these external sites.</p><h2>10. Changes to This Policy</h2><p>We may update this Privacy Policy periodically. Any changes will be posted on this page with a revised “Effective Date.” Continued use of the Service after updates constitutes acceptance of the new Policy.</p><h2>11. Contact Us</h2><p>For questions or requests regarding privacy, contact us at:</p><p>📧 privacy@boligtip.com</p>`,
            ...seo,
          },
        })
      ).unwrap();

      toast.success("Privacy Policy initialized!");
      dispatch(getAllPrivacyPolicies());
    } catch (err) {
      toast.error("Failed to initialize Privacy Policy.");
    }
  };

  const handleSave = useCallback(async () => {
    if (!policyId) return;

    try {
      const res = await dispatch(
        updatePrivacyPolicy({
          id: policyId,
          data: {
            title,
            description: content,
            ...seo,
          },
        })
      ).unwrap();

      toast.success(res?.message || "Privacy Policy updated!");
      setIsEditing(false);
      dispatch(getAllPrivacyPolicies());
    } catch (err) {
      toast.error("Failed to update Privacy Policy.");
    }
  }, [dispatch, policyId, title, content, seo]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // EMPTY STATE VIEW
  if (!policyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white border-2 border-dashed border-slate-200 rounded-2xl m-6">
        <div className="bg-blue-50 p-4 rounded-full mb-4 text-blue-500">
          <AiOutlinePlus size={40} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">No Privacy Policy Found</h2>
        <p className="text-gray-500 mb-6 text-center max-w-sm">
          A privacy policy hasn't been created yet. Click below to start with a default template.
        </p>
        <button
          onClick={handleCreateDefault}
          className="px-8 py-3 bg-[#161925] text-white rounded-lg hover:bg-black shadow-lg font-medium"
        >
          Initialize Privacy Policy
        </button>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>

        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <AiTwotoneEdit size={22} className="text-[#161925]" />
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-200 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#161925] text-white rounded-md hover:bg-black transition-all"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* CONTENT BOX */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-10">
        {!isEditing ? (
          <>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: addCustomStyling(content) }}
            />
            <hr />
            <div className="mt-10 space-y-2">
              <h2 className="text-lg font-semibold">SEO Preview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
                <p><strong>Meta Title:</strong> {seo.metaTitle}</p>
                <p><strong>Canonical:</strong> {seo.canonicalUrl}</p>
                <p className="md:col-span-2"><strong>Meta Description:</strong> {seo.metaDescription}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded focus:ring-2 focus:ring-[#161925] outline-none"
                placeholder="Page Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Policy Content</label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={(val) => setContent(val.replace(/&nbsp;/g, " "))}
                modules={modules}
                formats={formats}
              />
            </div>

            {/* SEO FORM */}
            <div className="mt-10 bg-gray-50 p-6 rounded-xl border border-slate-200 space-y-4">
              <h2 className="text-lg font-semibold">SEO Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Meta Title"
                  value={seo.metaTitle}
                  onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded"
                />
                <input
                  placeholder="Canonical URL"
                  value={seo.canonicalUrl}
                  onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded"
                />
              </div>

              <textarea
                placeholder="Meta Description"
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full border border-slate-200 p-2 rounded h-24"
              />

              <div className="space-y-2 pt-4">
                <h3 className="font-semibold text-sm uppercase text-gray-500">Search Robots</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.keys(seo.robots).map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
                      <input
                        type="checkbox"
                        checked={seo.robots[key]}
                        onChange={(e) =>
                          setSeo({
                            ...seo,
                            robots: { ...seo.robots, [key]: e.target.checked },
                          })
                        }
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};