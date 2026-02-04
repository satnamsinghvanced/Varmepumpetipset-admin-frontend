import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";

import { getCountyById, clearSelectedCounty } from "../../store/slices/countySlice";

const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE;
const fixImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("http") ? url : `${IMAGE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const CountiesDetailPage = () => {
  const { countyId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCounty, loading } = useSelector((state) => state.counties);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");

  useEffect(() => {
    if (countyId) dispatch(getCountyById(countyId));
    return () => dispatch(clearSelectedCounty());
  }, [dispatch, countyId]);

  const headerButtons = [
    {
      value: "Back to Counties",
      variant: "white",
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
      onClick: () => {
        const redirectUrl = page ? `/counties?page=${page}` : "/counties";
        navigate(redirectUrl);
      },
    },
    {
      value: "Edit County",
      variant: "primary",
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate(`/county/${countyId}/edit${page ? `?page=${page}` : ""}`),
    },
  ];

  const renderValue = (label, value) => {
    if (label === "isRecommended") {
      return value ? (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
          Yes
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium text-red-800">
          No
        </span>
      );
    }

    if (value === null || value === undefined || value === "") return "N/A";
    return String(value);
  };

  const detailItems = [
    { label: "slug", value: selectedCounty?.slug },
    // { label: "County", value: selectedCounty?.countyId?.name },
    // { label: "isRecommended", value: selectedCounty?.isRecommended },
    { label: "title", value: selectedCounty?.title },
    // { label: "rank", value: selectedCounty?.rank },
  ];

  const seoItems = [
    { label: "Meta Title", value: selectedCounty?.metaTitle },
    { label: "Meta Description", value: selectedCounty?.metaDescription },
    { label: "Meta Keywords", value: selectedCounty?.metaKeywords },
    { label: "Canonical URL", value: selectedCounty?.canonicalUrl },

    { label: "OG Title", value: selectedCounty?.ogTitle },
    { label: "OG Description", value: selectedCounty?.ogDescription },
    { label: "OG Type", value: selectedCounty?.ogType },

    { label: "JSON-LD", value: selectedCounty?.jsonLd },
    // { label: "Include in Sitemap", value: selectedCounty?.includeInSitemap ? "Yes" : "No" },
    // { label: "Priority", value: selectedCounty?.priority },
    // { label: "Change Frequency", value: selectedCounty?.changefreq },

    // { label: "Published Date", value: selectedCounty?.publishedDate },
    // { label: "Last Updated", value: selectedCounty?.lastUpdatedDate },

    {
      label: "Robots (noindex)",
      value: selectedCounty?.robots?.noindex ? "Yes" : "No",
    },
    {
      label: "Robots (nofollow)",
      value: selectedCounty?.robots?.nofollow ? "Yes" : "No",
    },
    {
      label: "Robots (noarchive)",
      value: selectedCounty?.robots?.noarchive ? "Yes" : "No",
    },
    {
      label: "Robots (nosnippet)",
      value: selectedCounty?.robots?.nosnippet ? "Yes" : "No",
    },
    {
      label: "Robots (noimageindex)",
      value: selectedCounty?.robots?.noimageindex ? "Yes" : "No",
    },
    {
      label: "Robots (notranslate)",
      value: selectedCounty?.robots?.notranslate ? "Yes" : "No",
    },
  ];

  if (loading && !selectedCounty) {
    return (
      <div className="space-y-6">
        <PageHeader title="Place details" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!selectedCounty) {
    return (
      <div className="space-y-6">
        <PageHeader title="Place details" buttonsList={headerButtons} />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Place not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={selectedCounty.name}
        description="Preview the full content for this county."
        buttonsList={headerButtons}
      />
      {selectedCounty.icon && (
        <div className="flex justify-center mb-6">
          <img
            src={fixImageUrl(selectedCounty.icon)}
            alt={`${selectedCounty.name} icon`}
            className="h-24 w-24 rounded-full object-cover border border-slate-200"
          />
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-6 p-6">
          {/* BASIC DETAILS */}
          <div className="grid gap-4 md:grid-cols-3">
            {detailItems.map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-50 p-4 border border-slate-100"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-slate-900 font-medium">
                  {renderValue(item.label, item.value)}
                </p>
              </div>
            ))}
          </div>


          {/* EXCERPT */}
          {selectedCounty.excerpt && (
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Excerpt
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {selectedCounty.excerpt}
              </p>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="rounded-xl p-5 border border-slate-100 bg-white shadow-inner">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Description
            </p>
            <div
              className="prose mt-3 max-w-none text-slate-700"
              dangerouslySetInnerHTML={{
                __html:
                  selectedCounty.description ||
                  "<p>No description provided.</p>",
              }}
            />
          </div>
          {/* COMPANIES SECTION */}
          {/* COMPANIES SECTION */}
          <div className="rounded-xl mt-6 p-5 border border-slate-200 bg-slate-50">
            <p className="text-xs font-semibold uppercase text-slate-600 mb-4">
              Companies in this County
            </p>

            {Array.isArray(selectedCounty.companies) &&
              selectedCounty.companies.length > 0 ? (
              <div className="space-y-3">
                {[...selectedCounty.companies]
                  .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
                  .map((item, index) => (
                    <div
                      key={item.companyId?._id || index}
                      className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {index + 1}.
                        </span>

                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {item.companyId?.companyName || "Unknown Company"}
                          </p>

                          {item.isRecommended && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-500">
                        Rank: {item.rank}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No companies assigned to this place.
              </p>
            )}
          </div>

          {/* SEO SECTION */}
          <div className="rounded-xl mt-6 p-5 border border-slate-200 bg-slate-50">
            <p className="text-xs font-semibold uppercase text-slate-600 mb-4">
              SEO Information
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {seoItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white p-4 border border-slate-200"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {renderValue(item.label, item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountiesDetailPage;
