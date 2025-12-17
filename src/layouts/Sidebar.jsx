/* eslint-disable react/prop-types */

import { Link, useLocation, useNavigate } from "react-router";
import { HiChevronDoubleLeft } from "react-icons/hi";
import {
  Home,
  Info,
  FileSpreadsheet,
  BookOpenText,
  HelpCircle,
  UsersRound,
  FileCheck2,
  ShieldCheck,
  Settings,
  Mail,
  Quote,
  UserPlus,
  Map,
  MapPin,
  Building,
} from "lucide-react";
import { MdOutlineFindInPage } from "react-icons/md";
import { MdOutlineRealEstateAgent } from "react-icons/md";
import { FaQ } from "react-icons/fa6";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";
import { TbLogs } from "react-icons/tb";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { MdOutlineContactSupport } from "react-icons/md";
import { MdOutlineArticle } from "react-icons/md";
import { SiReacthookform } from "react-icons/si";
import { ROUTES } from "../consts/routes";
import { MdOutlineDynamicFeed } from "react-icons/md";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTheme } from "../store/slices/website_settingsSlice";

const SideBar = ({ toggleSidebar, isMiniSidebarOpen, onCloseSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logos } = useSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchTheme());
  }, [dispatch]);

  const [openDropdown, setOpenDropdown] = useState(null);

  // ⭐ UNIVERSAL ACTIVE CHECK FUNCTION ⭐
  const getIsActive = (href) => {
    if (!href) return false;

    const path = location.pathname;

    // Exact match
    if (path === href) return true;

    // Nested routes
    if (path.startsWith(href + "/")) return true;

    // Handle singular ↔ plural auto-match
    // counties -> county, categories -> category
    const singular = href.replace(/ies$/, "y").replace(/s$/, "");
    const plural = singular.endsWith("y")
      ? singular.slice(0, -1) + "ies"
      : singular + "s";

    if (path.startsWith("/" + singular)) return true;
    if (path.startsWith("/" + plural)) return true;

    return false;
  };

  const adminRoutes = [
    {
      name: "Dashboard",
      icon: TbLayoutDashboardFilled,
      href: ROUTES.HOME,
    },
    {
      name: "Dynamic Pages",
      icon: MdOutlineDynamicFeed,
      isDropdown: true,
      children: [
        {
          name: "Homepage",
          href: ROUTES.HOMEPAGE,
          icon: Home,
        },
        { name: "About Page", href: ROUTES.ABOUT, icon: Info },
        {
          name: "Article Page",
          href: ROUTES.ARTICLEPAGE,
          icon: MdOutlineArticle,
        },
        {
          name: "Form Page",
          href: ROUTES.FORMPAGE,
          icon: SiReacthookform,
        },
        {
          name: "Partner Page",
          href: ROUTES.PARTNER,
          icon: UserPlus,
        },
        {
          name: "Quotes Section",
          href: ROUTES.QUOTES,
          icon: Quote,
        },
        {
          name: "Faq Page",
          href: ROUTES.FAQPAGE,
          icon: FaQ,
        },
        {
          name: "Real Estate Agents",
          href: ROUTES.REAL_ESTATE_AGENTS,
          icon: MdOutlineRealEstateAgent,
        },
        {
          name: "Footer",
          icon: MdOutlineFindInPage,
          href: ROUTES.FOOTER,
        },
      ],
    },
    {
      name: "Forms",
      icon: FileSpreadsheet,
      href: ROUTES.FORMS,
    },
    {
      name: "Company Page",
      icon: UsersRound,
      href: ROUTES.PARTNERS,
    },
    {
      name: "Lead Logs",
      icon: TbLogs,
      href: ROUTES.LEAD_LOGS,
    },
    {
      name: "FAQ's",
      icon: HelpCircle,
      href: ROUTES.FAQ,
    },
    {
      name: "Articles",
      icon: BookOpenText,
      href: ROUTES.ARTICLE,
    },
    {
      name: "Article Categories",
      icon: FileCheck2,
      href: ROUTES.ARTICLE_CATEGORY,
    },
    {
      name: "Counties",
      icon: Map,
      href: ROUTES.COUNTY,
    },
    {
      name: "Places",
      icon: MapPin,
      href: ROUTES.PLACES,
    },
    {
      name: "Companies",
      icon: Building,
      href: ROUTES.COMPANIES,
    },
    {
      name: "Email Templates",
      icon: Mail,
      href: ROUTES.EMAIL_TEMPLATES,
    },
    {
      name: "Term of Service",
      icon: FileCheck2,
      href: ROUTES.TERM_OF_SERVICE,
    },
    {
      name: "Privacy Policy",
      icon: ShieldCheck,
      href: ROUTES.PRIVACY_POLICY,
    },

    {
      name: "Contact Us Logs",
      icon: MdOutlineContactSupport,
      href: ROUTES.CONTACTUS,
    },
    {
      name: "Settings",
      icon: Settings,
      href: ROUTES.SETTINGS,
    },
  ];

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  const navigationRoutes = adminRoutes;

  return (
    <>
      <div
        className={`${
          isMiniSidebarOpen ? "bg-black/40 w-full h-full fixed inset-0 z-30" : ""
        } md:hidden`}
        onClick={onCloseSidebar}
      />

      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-slate-100 bg-white/95 backdrop-blur-md transition-all duration-300 dark:border-blue-900 dark:bg-blue-950/95 ${
          isMiniSidebarOpen ? "w-[280px]" : "w-[88px]"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          {isMiniSidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2">
              {logos?.logoDark && (
                <img
                  src={`${IMAGE_URL}${logos.logoDark}`}
                  alt="Logo Dark"
                  className="h-8 w-auto object-contain"
                />
              )}
              {logos?.wordmarkDark && (
                <img
                  src={`${IMAGE_URL}${logos.wordmarkDark}`}
                  alt="Wordmark Dark"
                  className="h-8 w-auto object-contain"
                />
              )}
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <HiChevronDoubleLeft
              className={`text-xl transition ${
                isMiniSidebarOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        <div className="mt-2 flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-1">
              {navigationRoutes.map((item, index) => {
                const isActive = getIsActive(item.href);

                // ------- DROPDOWN -------
                if (item.isDropdown) {
                  const isOpen = openDropdown === item.name;

                  return (
                    <li key={index}>
                      <button
                        className={`relative flex w-full items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold transition text-slate-600 hover:bg-slate-100 ${
                          isMiniSidebarOpen ? "justify-between" : "justify-center"
                        }`}
                        onClick={() =>
                          setOpenDropdown(isOpen ? null : item.name)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center text-slate-500">
                            <item.icon size={18} />
                          </span>
                          {isMiniSidebarOpen && <span>{item.name}</span>}
                        </div>

                        {isMiniSidebarOpen &&
                          (isOpen ? (
                            <HiChevronDown size={16} className="text-slate-500" />
                          ) : (
                            <HiChevronRight size={16} className="text-slate-500" />
                          ))}
                      </button>

                      {isOpen && (
                        <ul className="ml-3 space-y-1">
                          {item.children.map((child, i) => (
                            <li key={i}>
                              <button
                                onClick={() => navigate(child.href)}
                                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
                                  location.pathname === child.href
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {child.icon && (
                                  <span
                                    className={`flex h-6 w-6 items-center justify-center ${
                                      location.pathname === child.href
                                        ? "text-white"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    <child.icon size={18} />
                                  </span>
                                )}
                                {isMiniSidebarOpen && <span>{child.name}</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                // ------- NORMAL ITEMS -------
                return (
                  <li key={index}>
                    <button
                      onClick={() => {
                        navigate(item.href);
                        onCloseSidebar();
                      }}
                      className={`relative flex w-full items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-100"
                      } ${isMiniSidebarOpen ? "" : "justify-center"}`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center ${
                          isActive ? "text-white" : "text-slate-500"
                        }`}
                      >
                        <item.icon size={18} />
                      </span>

                      {isMiniSidebarOpen && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
