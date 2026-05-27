import React, {
  useContext,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Clock3,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Medal,
  PlayCircle,
  Settings,
  Trophy,
  Target,
  WalletCards,
  X,
  User2,
  Sparkles,
  Library,
  Sigma,
  Bookmark,
  Calculator,
  Brain,
  Home,
  Layers3,
  ShieldCheck,
  LogOut,
  Bell,
  Flame,
} from "lucide-react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { signOut } from "firebase/auth";

import { auth } from "../../firebase/config";

import { AuthContext } from "../context/AuthContext";

const JambSidebar = ({
  dark = true,
  sidebarOpen,
  setSidebarOpen,
}) => {

  const location = useLocation();

  const navigate = useNavigate();

  const { user } =
    useContext(AuthContext);

  const [loggingOut, setLoggingOut] =
    useState(false);

  /**
   * =========================
   * THEME
   * =========================
   */

  const glass = dark
    ? "bg-white/5 border border-white/10"
    : "bg-slate-100 border border-slate-200";

  const cardHover = dark
    ? "hover:bg-white/10"
    : "hover:bg-slate-200";

  const textFade = dark
    ? "text-slate-400"
    : "text-slate-500";

  /**
   * =========================
   * USERNAME
   * =========================
   */

  const username = useMemo(() => {

    if (!user?.displayName)
      return "Student";

    return user.displayName.split(
      " "
    )[0];

  }, [user]);

  /**
   * =========================
   * LOGOUT
   * =========================
   */

  const handleLogout = async () => {

    try {

      setLoggingOut(true);

      await signOut(auth);

      navigate("/");

    } catch (error) {

      console.log(error);

    } finally {

      setLoggingOut(false);
    }
  };

  /**
   * =========================
   * NAVIGATION
   * =========================
   */

  const navSections = [

    /**
     * MAIN
     */

    {
      title: "MAIN",

      items: [
        {
          icon: (
            <LayoutDashboard size={20} />
          ),

          title: "Dashboard",

          path: "/",
        },

        {
          icon: (
            <PlayCircle size={20} />
          ),

          title: "CBT Practice",

          path: "/subjects",

          badge: "LIVE",
        },

        {
          icon: (
            <FileQuestion size={20} />
          ),

          title: "Past Questions",

          path: "/subjects-list",
        },

        {
          icon: (
            <BrainCircuit size={20} />
          ),

          title: "AI Tutor",

          path: "/ai-tutor",

          badge: "AI",
        },

        {
          icon: (
            <BookOpen size={20} />
          ),

          title: "Study Materials",

          path: "/materials",
        },
      ],
    },

    /**
     * FORMULA HUB
     */

    {
      title: "FORMULA HUB",

      items: [
        {
          icon: (
            <Library size={20} />
          ),

          title: "Formula Hub",

          path: "/formula-hub",
        },

        {
          icon: (
            <Sigma size={20} />
          ),

          title: "Subjects",

          path:
            "/formula-hub/subjects",
        },

        {
          icon: (
            <Bookmark size={20} />
          ),

          title: "Bookmarks",

          path:
            "/formula-hub/bookmarks",
        },

        {
          icon: (
            <Calculator size={20} />
          ),

          title: "Calculations",

          path:
            "/formula-calculator",
        },

        {
          icon: (
            <Brain size={20} />
          ),

          title: "AI Formula Explain",

          path:
            "/formula-ai",

          badge: "NEW",
        },
      ],
    },

    /**
     * PERFORMANCE
     */

    {
      title: "PERFORMANCE",

      items: [
        {
          icon: (
            <BarChart3 size={20} />
          ),

          title: "Analytics",

          path: "/analytics",
        },

        {
          icon: (
            <Target size={20} />
          ),

          title: "Goals",

          path: "/goals",
        },

        {
          icon: (
            <Trophy size={20} />
          ),

          title: "Leaderboard",

          path:
            "/leaderboard",
        },

        {
          icon: (
            <Medal size={20} />
          ),

          title: "Achievements",

          path:
            "/achievements",
        },
      ],
    },

    /**
     * ACCOUNT
     */

    {
      title: "ACCOUNT",

      items: [
        {
          icon: (
            <Clock3 size={20} />
          ),

          title: "Study Planner",

          path: "/planner",
        },

        {
          icon: (
            <WalletCards size={20} />
          ),

          title: "Subscription",

          path:
            "/subscription",

          badge: "PRO",
        },

        {
          icon: (
            <Bell size={20} />
          ),

          title:
            "Notifications",

          path:
            "/notifications",
        },

        {
          icon: (
            <Settings size={20} />
          ),

          title: "Settings",

          path: "/settings",
        },
      ],
    },
  ];

  return (
    <>
      {/* OVERLAY */}

      {sidebarOpen && (

        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-[310px]
          transition-all duration-300
          overflow-hidden
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${
            dark
              ? "bg-[#071120]/95 border-r border-white/10 text-white"
              : "bg-white/95 border-r border-slate-200 text-slate-900"
          }
          backdrop-blur-3xl
          flex flex-col
        `}
      >

        {/* BG EFFECT */}

        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* CONTENT */}

        <div className="relative z-10 flex flex-col h-full">

          {/* HEADER */}

          <div className="p-5 sm:p-6 border-b border-white/10">

            {/* MOBILE */}

            <div className="flex items-center justify-between lg:hidden">

              <div className="flex items-center gap-3">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">

                  <GraduationCap className="text-white" />
                </div>

                <div>

                  <h1 className="font-black text-xl">
                    UniHelp.ng
                  </h1>

                  <p
                    className={`text-sm ${textFade}`}
                  >
                    JAMB Portal
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${glass}`}
              >

                <X size={22} />
              </button>
            </div>

            {/* DESKTOP */}

            <div className="hidden lg:flex items-center gap-4">

              <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">

                <GraduationCap
                  size={30}
                  className="text-white"
                />
              </div>

              <div>

                <h1 className="font-black text-2xl">
                  UniHelp.ng
                </h1>

                <p
                  className={`text-sm ${textFade}`}
                >
                  Smart JAMB System
                </p>
              </div>
            </div>

            {/* USER */}

            <div
              className={`mt-6 rounded-3xl p-4 ${glass}`}
            >

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl">

                  {username
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">

                  <h3 className="font-bold truncate">

                    {user?.displayName ||
                      "Student"}
                  </h3>

                  <p
                    className={`text-sm truncate ${textFade}`}
                  >

                    {user?.email}
                  </p>
                </div>
              </div>

              <Link
                to="/profile"
                className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition-all text-white px-4 py-3"
              >

                <div className="flex items-center gap-2">

                  <User2 size={18} />

                  <span className="text-sm font-medium">
                    View Profile
                  </span>
                </div>

                <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* NAVIGATION */}

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-7 scrollbar-thin scrollbar-thumb-white/10">

            {navSections.map(
              (
                section,
                sectionIndex
              ) => (

                <div key={sectionIndex}>

                  <p
                    className={`text-xs font-bold tracking-[0.2em] mb-3 px-3 ${textFade}`}
                  >

                    {section.title}
                  </p>

                  <div className="space-y-2">

                    {section.items.map(
                      (
                        item,
                        index
                      ) => {

                        return (

                          <NavLink
                            key={index}
                            to={item.path}

                            onClick={() =>
                              setSidebarOpen(false)
                            }

                            className={({
                              isActive,
                            }) =>
                              `
                              group w-full
                              flex items-center justify-between
                              p-4 rounded-2xl
                              transition-all duration-300
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 scale-[1.02]"
                                  : `${glass} ${cardHover}`
                              }
                            `
                            }
                          >

                            {({
                              isActive,
                            }) => (
                              <>
                                <div className="flex items-center gap-4">

                                  <div
                                    className={`transition-all ${
                                      isActive
                                        ? "scale-110"
                                        : "group-hover:scale-110"
                                    }`}
                                  >

                                    {item.icon}
                                  </div>

                                  <span className="font-medium text-sm">

                                    {item.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">

                                  {item.badge && (

                                    <span
                                      className={`
                                        text-[10px]
                                        font-black
                                        px-2 py-1
                                        rounded-full
                                        ${
                                          isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-indigo-500/10 text-indigo-400"
                                        }
                                      `}
                                    >

                                      {item.badge}
                                    </span>
                                  )}

                                  <ChevronRight
                                    size={17}
                                    className={`
                                      transition-all duration-300
                                      ${
                                        isActive
                                          ? "translate-x-1"
                                          : "group-hover:translate-x-1"
                                      }
                                    `}
                                  />
                                </div>
                              </>
                            )}
                          </NavLink>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* FOOTER */}

          <div className="p-5 border-t border-white/10 space-y-4">

            {/* MOCK STATUS */}

            <div
              className={`rounded-3xl p-4 ${glass}`}
            >

              <div className="flex items-start gap-3">

                <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">

                  <Sparkles size={20} />
                </div>

                <div>

                  <h3 className="font-bold">
                    Mock Exam Ready
                  </h3>

                  <p
                    className={`text-sm mt-1 ${textFade}`}
                  >
                    Your next CBT mock
                    exam starts soon.
                  </p>
                </div>
              </div>

              <Link
                to="/mock-setup"
                className="mt-4 flex items-center justify-center gap-2 h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition-all text-white font-medium"
              >

                <PlayCircle size={18} />

                Start Mock Exam
              </Link>
            </div>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}

              disabled={loggingOut}

              className="
                w-full h-13 rounded-2xl
                bg-red-500 hover:bg-red-600
                transition-all duration-300
                flex items-center justify-center gap-3
                text-white font-semibold
                disabled:opacity-70
              "
            >

              <LogOut size={20} />

              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default JambSidebar;