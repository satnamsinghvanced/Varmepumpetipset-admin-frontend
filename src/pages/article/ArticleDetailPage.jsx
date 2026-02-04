import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import {
  clearSelectedArticle,
  getArticleById,
} from "../../store/slices/articleSlice";

const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE;
const fixImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("http") ? url : `${IMAGE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const ArticleDetailPage = () => {
  const { articleId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedArticle, loading } = useSelector((state) => state.articles);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");

  useEffect(() => {
    if (articleId) {
      dispatch(getArticleById(articleId));
    }
    return () => {
      dispatch(clearSelectedArticle());
    };
  }, [dispatch, articleId]);

  const headerButtons = [
    {
      value: "Back to articles",
      variant: "white",
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
      onClick: () => {
        const redirectUrl = page ? `/articles?page=${page}` : "/articles";
        navigate(redirectUrl);
      },
    },
    {
      value: "Edit article",
      variant: "primary",
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate(`/articles/${articleId}/edit${page ? `?page=${page}` : ""}`),
    },
  ];

  if (loading && !selectedArticle) {
    return (
      <div className="space-y-6">
        <PageHeader title="Article details" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!selectedArticle) {
    return (
      <div className="space-y-6">
        <PageHeader title="Article details" buttonsList={headerButtons} />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Article not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={selectedArticle.title}
        description="Preview the full content and metadata for this article."
        buttonsList={headerButtons}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {selectedArticle.image && (
          <img
            src={fixImageUrl(selectedArticle.image)}
            alt={selectedArticle.title}
            className="h-72 w-full rounded-t-2xl object-cover"
          />
        )}

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {selectedArticle.categoryId?.title || "N/A"}
              </p>
            </div>
            {/* <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Author
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {selectedArticle.createdBy?.username || "N/A"}
              </p>
            </div> */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Article Position
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {selectedArticle.articlePosition || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Show date
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {selectedArticle.showDate
                  ? new Date(selectedArticle.showDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Article Tags
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Array.isArray(selectedArticle.articleTags) &&
                  selectedArticle.articleTags.length > 0 ? (
                  selectedArticle.articleTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-slate-200 rounded-full text-slate-700"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-base font-semibold text-slate-900">N/A</p>
                )}
              </div>
            </div>
          </div>

          {selectedArticle.excerpt && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Excerpt
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {selectedArticle.excerpt}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>
            <div
              className="prose mt-3 max-w-none text-slate-700"
              dangerouslySetInnerHTML={{
                __html:
                  selectedArticle.description ||
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
                { label: "Meta Title", value: selectedArticle.metaTitle },
                {
                  label: "Meta Description",
                  value: selectedArticle.metaDescription,
                },
                { label: "Meta Keywords", value: selectedArticle.metaKeywords },
                { label: "Canonical URL", value: selectedArticle.canonicalUrl },
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
                { label: "OG Title", value: selectedArticle.ogTitle },
                {
                  label: "OG Description",
                  value: selectedArticle.ogDescription,
                },
                { label: "OG Type", value: selectedArticle.ogType },
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
                {selectedArticle.jsonLd || "No JSON-LD provided"}
              </pre>
            </div>

            {/* Dates */}
            {/* <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Published Date", value: selectedArticle.publishedDate },
            { label: "Last Updated Date", value: selectedArticle.lastUpdatedDate },
            { label: "Show Published Date", value: selectedArticle.showPublishedDate ? "Yes" : "No" },
            { label: "Show Updated Date", value: selectedArticle.showLastUpdatedDate ? "Yes" : "No" },
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
                {Object.entries(selectedArticle.robots || {}).map(
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

export default ArticleDetailPage;
