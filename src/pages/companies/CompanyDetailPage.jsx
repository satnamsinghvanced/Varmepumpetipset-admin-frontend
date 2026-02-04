import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import {
  clearSelectedCompany,
  getCompanyById,
} from "../../store/slices/companySlice";

const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE;
const fixImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("http") ? url : `${IMAGE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const CompanyDetailPage = () => {
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCompany, loading } = useSelector((state) => state.companies);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");


  useEffect(() => {
    if (companyId) {
      dispatch(getCompanyById(companyId));
    }
    return () => {
      dispatch(clearSelectedCompany());
    };
  }, [dispatch, companyId]);

  const headerButtons = [
    {
      value: "Back to Companies",
      variant: "white",
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
      onClick: () => {
        const redirectUrl = page ? `/companies?page=${page}` : "/companies";
        navigate(redirectUrl);
      },
    },
    {
      value: "Edit Company",
      variant: "primary",
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate(`/company/${companyId}/edit${page ? `?page=${page}` : ""}`),
    },
  ];

  if (loading && !selectedCompany) {
    return (
      <div className="space-y-6">
        <PageHeader title="Company details" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="space-y-6">
        <PageHeader title="Company details" buttonsList={headerButtons} />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Company not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={selectedCompany.companyName}
        description="Preview the full content for this company."
        buttonsList={headerButtons}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {selectedCompany.companyImage ? (
          <img
            src={fixImageUrl(selectedCompany.companyImage)}
            alt={selectedCompany.companyName}
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="h-64 w-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
            No image uploaded
          </div>
        )}

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Address (Competitor)", value: selectedCompany.address },
              // { label: "Email", value: selectedCompany.email },
              // { label: "Zip Code", value: selectedCompany.zipCode },
              { label: "Broker Sites", value: selectedCompany.brokerSites },
              {
                label: "Website Address",
                value: selectedCompany.websiteAddress,
              },
              // { label: "isRecommended", value: selectedCompany?.isRecommended },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-50 p-4 border border-slate-100"
              >
                {/* <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  {item.label === "isRecommended" ? "isRecommended" : item.label }
                </p> */}
                <p className="mt-1 text-sm text-slate-900 font-medium">
                  {item.value === false ? "No" : item.value === true ? "Yes" : item.value || item.value || "N/A"}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Extractor
            </p>

            <div className="mt-2 space-y-1">
              {Array.isArray(selectedCompany.extractor) &&
                selectedCompany.extractor.length > 0 ? (
                selectedCompany.extractor.map((item, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-slate-900">
                    <span className="text-slate-400">•</span>
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-900 font-medium">N/A</p>
              )}
            </div>
          </div>

          {selectedCompany.excerpt && (
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Excerpt
              </p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                {selectedCompany.excerpt}
              </p>
            </div>
          )}

          <div className="rounded-xl p-5 border border-slate-100 bg-white shadow-inner">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
              Description
            </p>

            <div
              className="prose mt-3 max-w-none text-slate-700"
              dangerouslySetInnerHTML={{
                __html:
                  selectedCompany.description ||
                  "<p>No description provided.</p>",
              }}
            />
          </div>
          <div className="rounded-xl mt-6 p-5 border border-slate-200 ">
            <p className="text-xs font-semibold uppercase text-slate-600 mb-4">
              SEO Information
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Meta Title", value: selectedCompany.metaTitle },
                {
                  label: "Meta Description",
                  value: selectedCompany.metaDescription,
                },
                { label: "Meta Keywords", value: selectedCompany.metaKeywords },
                { label: "Canonical URL", value: selectedCompany.canonicalUrl },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-50 p-4 border border-slate-100"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-900 font-medium">
                    {item.value || "N/A"}
                  </p>
                </div>
              ))}
            </div>

            {/* Open Graph */}
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "OG Title", value: selectedCompany.ogTitle },
                {
                  label: "OG Description",
                  value: selectedCompany.ogDescription,
                },
                { label: "OG Type", value: selectedCompany.ogType },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-50 p-4 border border-slate-100"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-900 font-medium">
                    {item.value || "N/A"}
                  </p>
                </div>
              ))}
            </div>

            {/* JSON LD */}
            <div className="rounded-xl p-5 border border-slate-100 bg-white shadow-inner">
              <p className="text-xs font-semibold uppercase text-slate-500">
                JSON-LD
              </p>
              <pre className="mt-3 text-sm bg-slate-400 text-white p-3 rounded-md overflow-auto">
                {selectedCompany.jsonLd || "No JSON-LD provided"}
              </pre>
            </div>

            {/* Dates */}
            {/* <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Published Date", value: selectedCompany.publishedDate },
            { label: "Last Updated Date", value: selectedCompany.lastUpdatedDate },
            { label: "Show Published Date", value: selectedCompany.showPublishedDate ? "Yes" : "No" },
            { label: "Show Updated Date", value: selectedCompany.showLastUpdatedDate ? "Yes" : "No" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">{item.label}</p>
              <p className="mt-1 text-sm text-slate-900 font-medium">{item.value || "N/A"}</p>
            </div>
          ))}
        </div> */}

            {/* Robots */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Robots
              </p>
              <div className="grid md:grid-cols-3 gap-2 mt-3 text-sm">
                {Object.entries(selectedCompany.robots || {}).map(
                  ([key, value], i) => (
                    <div
                      key={i}
                      className="flex justify-between bg-white p-2 rounded border border-slate-200"
                    >
                      <span className="capitalize">{key}</span>
                      <span className="font-medium">
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
