/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Route, Routes as RouteWrapper, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Layout from "../layouts/Layout";
import { ROUTES } from "../consts/routes";
import LoginForm from "../components/LoginForm";
import { useSelector } from "react-redux";
import Settings from "../pages/settings/Settings";
import Faq from "../pages/helpcenter/Faq";
import HomePage from "../pages/homepage/homepage";
import ArticlePage from "../pages/article/ArticlePage";
import AboutPage from "../pages/about/AboutPage";
import PartnerPage from "../pages/partner/PartnerPage";
import FormPage from "../pages/forms/forms";
import { TermOfServicePage } from "../pages/term_of_service/TermOfService";
import { PrivacyPolicyPage } from "../pages/privacy_policy/PrivacyPolicy";
import CountyPage from "../pages/counties/CountiesPage";
import ArticleFormPage from "../pages/article/ArticleFormPage";
import ArticleDetailPage from "../pages/article/ArticleDetailPage";
import EmailTemplateList from "../pages/email-template/templates";
import CreateEmailTemplate from "../pages/email-template/email-templates";
import Places from "../pages/places/PlacePage";
import Company from "../pages/companies/CompanyPage";
import CompanyDetailPage from "../pages/companies/CompanyDetailPage";
import CompanyFormPage from "../pages/companies/CompanyFormPage";
import PlaceFormPage from "../pages/places/PlaceFormPage";
import PlaceDetailPage from "../pages/places/PlaceDetailPage";
import { Quote } from "../pages/quote/Quote";
import CountiesFormPage from "../pages/counties/CountiesFormPage";
import ArticleCategoryFormPage from "../pages/article-category/ArticleCategoryFormPage";
import ArticleCategoryPage from "../pages/article-category/ArticleCategoryPage";
import RealEstateAgentsPage from "../pages/realEstateAgents/RealEstateAgentsPage";
import RealEstateAgentsFormPage from "../pages/realEstateAgents/RealEstateAgentsFormPage";
import CollaboratePartnerPage from "../pages/partners/CollaboratePartnerPage";
import PartnerEditPage from "../pages/partners/PartnerEditPage";
import { PartnerDetailPage } from "../pages/partners/PartnerDetails";
import { AddPartnerPage } from "../pages/partners/AddPartnerPage";

import SitemapPage from "../pages/sitemap/SitemapPage";
import FooterListPage from "../pages/footer/FooterListPage";
import CreateFooterItemPage from "../pages/footer/CreateFooterItemPage";
import CreateFooterArticlePage from "../pages/footer/CreateFooterArticlePage";
import EditFooterItemPage from "../pages/footer/EditFooterItemPage";
import CreateFooterSelectPage from "../pages/footer/CreateFooterSelectPage";
import SitemapFormPage from "../pages/sitemap/SitemapFormPage";
import ContactUsListPage from "../pages/contact-us/ContactUs";
import ContactUsViewPage from "../pages/contact-us/ContactUsViewPage ";
import SMTPSettings from "../pages/settings/EmailConfiguration";
// import FormTypeSelectionPage from "../pages/forms/FormManagePage";
import AdminFormBuilder from "../pages/forms/forms";
import Faqs from "../pages/helpcenter/Faq";
import AddFaq from "../pages/helpcenter/AddFaq";
import EditFaq from "../pages/helpcenter/EditFaq";
import Categories from "../pages/faqCategories/Categories";
import AddCategory from "../pages/faqCategories/AddCategory";
import EditCategory from "../pages/faqCategories/EditCategory";
import Dashboard from "../pages/dashboard/dashboard";
import LeadLogs from "../pages/leadLogs/leadLogsPage";
import FaqPage from "../pages/faqPage/FaqPage";
import ArticleUIPage from "../pages/articlePage/ArticlePage";
import FormUIPage from "../pages/formpage/FormPage";

import FormCreateEditPage from "../pages/forms/FormPage";
import FormManagePage from "../pages/forms/FormTypeSelectionPage";
import StepsBuilderForm from "../pages/forms/StepsBuilderForm";
import LeadDetails from "../pages/leadLogs/LeadDetails";
import CountiesDetailPage from "../pages/counties/CountiesDetailPage";

const Routes = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    if (!token && window.location.pathname !== "/login") {
      navigate("/login");
    }

    if (token && window.location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token && window.location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [token, navigate]);
  return (
    <RouteWrapper>
      <Route element={token ? <Layout /> : <AuthLayout />}>

      
        <Route path={ROUTES.HOMEPAGE} element={<HomePage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />

        <Route path={ROUTES.FAQ} element={<Faq />} />

        <Route path="/faqs/add" element={<AddFaq />} />
        <Route path="/faqs/edit/:id" element={<EditFaq />} />

        <Route path="/faqs/categories" element={<Categories />} />
        <Route path="/faqs/categories/add" element={<AddCategory />} />
        <Route path="/faqs/categories/edit/:id" element={<EditCategory />} />

        <Route path={ROUTES.ARTICLE} element={<ArticlePage />} />
        <Route path={ROUTES.ARTICLE_CREATE} element={<ArticleFormPage />} />
        <Route path={ROUTES.ARTICLE_EDIT} element={<ArticleFormPage />} />
        <Route path={ROUTES.ARTICLE_VIEW} element={<ArticleDetailPage />} />

        <Route
          path={ROUTES.ARTICLE_CATEGORY}
          element={<ArticleCategoryPage />}
        />
        <Route
          path={ROUTES.ARTICLE_CATEGORY_CREATE}
          element={<ArticleCategoryFormPage />}
        />
        <Route
          path={ROUTES.ARTICLE_CATEGORY_EDIT}
          element={<ArticleCategoryFormPage />}
        />
        {/* <Route path={ROUTES.ARTICLE_CATEGORY_VIEW} element={<ArticleCategoryDetailPage />} /> */}

        <Route path={ROUTES.PARTNER} element={<PartnerPage />} />
        <Route
          path={ROUTES.REAL_ESTATE_AGENTS}
          element={<RealEstateAgentsPage />}
        />
        <Route
          path={ROUTES.REAL_ESTATE_AGENTS_EDIT}
          element={<RealEstateAgentsFormPage />}
        />

        <Route path={ROUTES.FORMS} element={<FormManagePage />} />
        <Route path="/admin/form-selection" element={<FormManagePage />} />
        <Route path="/forms/create" element={<FormCreateEditPage />} />
        <Route path="/forms/:id/edit" element={<FormCreateEditPage />} />
        <Route path="/forms/:id/steps" element={<StepsBuilderForm />} />

        <Route
          path="/admin/form-builder/:formType"
          element={<AdminFormBuilder />}
        />
        <Route path={ROUTES.COUNTY} element={<CountyPage />} />
        <Route path={ROUTES.COUNTY_CREATE} element={<CountiesFormPage />} />
        <Route path={ROUTES.COUNTY_EDIT} element={<CountiesFormPage />} />
        <Route path={ROUTES.COUNTY_VIEW} element={<CountiesDetailPage />} />

        <Route path={ROUTES.PLACES} element={<Places />} />
        <Route path={ROUTES.PLACES_CREATE} element={<PlaceFormPage />} />
        <Route path={ROUTES.PLACES_VIEW} element={<PlaceDetailPage />} />
        <Route path={ROUTES.PLACES_EDIT} element={<PlaceFormPage />} />

        <Route path={ROUTES.COMPANIES} element={<Company />} />
        <Route path={ROUTES.COMPANIES_CREATE} element={<CompanyFormPage />} />
        <Route path={ROUTES.COMPANIES_VIEW} element={<CompanyDetailPage />} />
        <Route path={ROUTES.COMPANIES_EDIT} element={<CompanyFormPage />} />

        <Route path={ROUTES.FOOTER} element={<FooterListPage />} />
        <Route path={ROUTES.FOOTER_CREATE} element={<CreateFooterItemPage />} />
        <Route
          path={ROUTES.FOOTER_VIEW}
          element={<CreateFooterArticlePage />}
        />
        <Route path={ROUTES.FOOTER_EDIT} element={<EditFooterItemPage />} />
        <Route path={ROUTES.FOOTER_EDIT_FOR_HEADER_AND_ADDRESS} element={<EditFooterItemPage />} />
        {/* <Route path="/footer/edit/:tab" element={<EditFooterItemPage />} /> */}
        <Route
          path="/footer/create/:tab/select"
          element={<CreateFooterSelectPage />}
        />

        <Route path={ROUTES.HOME} element={<Dashboard />} />
        <Route path={ROUTES.TERM_OF_SERVICE} element={<TermOfServicePage />} />
        <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
        <Route path={ROUTES.QUOTES} element={<Quote />} />
        <Route path={ROUTES.FAQPAGE} element={<FaqPage />} />
        <Route path={ROUTES.ARTICLEPAGE} element={<ArticleUIPage />} />
        <Route path={ROUTES.FORMPAGE} element={<FormUIPage />} />

        <Route path={ROUTES.LOGIN} element={<LoginForm />} />
        <Route path={ROUTES.EMAIL_TEMPLATES} element={<EmailTemplateList />} />
        <Route path="/email/create" element={<CreateEmailTemplate />} />
        <Route
          path="/email/edit/:templateId"
          element={<CreateEmailTemplate />}
        />
        <Route path={ROUTES.PARTNERS} element={<CollaboratePartnerPage />} />
        <Route path={ROUTES.PARTNER_CREATE} element={<AddPartnerPage />} />
        <Route path={ROUTES.PARTNERS_ID} element={<PartnerDetailPage />} />
        <Route path={ROUTES.PARTNERS_EDIT_ID} element={<PartnerEditPage />} />
        <Route path={ROUTES.PARTNERS_EDIT_ID} element={<PartnerEditPage />} />

        <Route path={ROUTES.SITEMAP} element={<SitemapPage />} />
        <Route path="/sitemap/create" element={<SitemapFormPage />} />
        <Route path="/sitemap/edit/:index" element={<SitemapFormPage />} />
        <Route path="/smtp" element={<SMTPSettings />} />

        <Route path={ROUTES.CONTACTUS} element={<ContactUsListPage />} />
        <Route path={ROUTES.CONTACTUS_VIEW} element={<ContactUsViewPage />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />

        <Route path={ROUTES.LEAD_LOGS} element={<LeadLogs />} />
        <Route path="/leads/:id" element={<LeadDetails />} />
      </Route>
    </RouteWrapper>
  );
};

export default Routes;
