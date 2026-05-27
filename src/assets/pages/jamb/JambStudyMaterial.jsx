import React, {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  PlayCircle,
  Search,
  Star,
  Video,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const JambStudyMaterials = ({
  dark,
}) => {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  /**
   * =========================
   * CATEGORIES
   * =========================
   */

  const categories = [
    "All",
    "PDF",
    "Video",
    "Notes",
    "CBT Guide",
  ];

  /**
   * =========================
   * MATERIALS
   * =========================
   */

  const materials = [
    {
      title:
        "English Masterclass",
      type: "PDF",
      subject: "English",
      lessons: 28,
      downloads: "12.4k",
      rating: 4.9,
      color:
        "from-indigo-500 to-cyan-500",
      icon: (
        <BookOpen size={22} />
      ),
    },

    {
      title:
        "Mathematics Formula Handbook",
      type: "Notes",
      subject:
        "Mathematics",
      lessons: 16,
      downloads: "8.2k",
      rating: 4.8,
      color:
        "from-purple-500 to-pink-500",
      icon: (
        <BrainCircuit
          size={22}
        />
      ),
    },

    {
      title:
        "Physics CBT Crash Course",
      type: "Video",
      subject: "Physics",
      lessons: 34,
      downloads: "6.8k",
      rating: 4.7,
      color:
        "from-cyan-500 to-blue-500",
      icon: (
        <Video size={22} />
      ),
    },

    {
      title:
        "Chemistry Revision Pack",
      type: "PDF",
      subject:
        "Chemistry",
      lessons: 20,
      downloads: "9.1k",
      rating: 4.9,
      color:
        "from-orange-500 to-red-500",
      icon: (
        <FileText size={22} />
      ),
    },

    {
      title:
        "Biology Study Notes",
      type: "Notes",
      subject: "Biology",
      lessons: 19,
      downloads: "11.7k",
      rating: 4.8,
      color:
        "from-green-500 to-emerald-500",
      icon: (
        <BookOpen size={22} />
      ),
    },

    {
      title:
        "How To Score 300+",
      type: "CBT Guide",
      subject: "General",
      lessons: 12,
      downloads: "20.5k",
      rating: 5.0,
      color:
        "from-yellow-500 to-orange-500",
      icon: (
        <PlayCircle
          size={22}
        />
      ),
    },
  ];

  /**
   * =========================
   * FILTER
   * =========================
   */

  const filteredMaterials =
    useMemo(() => {
      return materials.filter(
        (item) => {
          const matchesSearch =
            item.title
              .toLowerCase()
              .includes(
                search.toLowerCase(),
              ) ||
            item.subject
              .toLowerCase()
              .includes(
                search.toLowerCase(),
              );

          const matchesCategory =
            activeCategory ===
              "All" ||
            item.type ===
              activeCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      search,
      activeCategory,
    ]);

  /**
   * =========================
   * THEME
   * =========================
   */

  const bg = dark
    ? "bg-[#0f172a] text-white"
    : "bg-slate-100 text-slate-900";

  const card = dark
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
    : "bg-white border border-slate-200";

  const fade = dark
    ? "text-slate-400"
    : "text-slate-500";

  const input = dark
    ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400";

  return (
    <div
      className={`min-h-screen w-full ${bg}`}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* LEFT */}

          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <button
              onClick={() =>
                navigate(-1)
              }
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                dark
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-white hover:bg-slate-200"
              }`}
            >
              <ArrowLeft
                size={20}
              />
            </button>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                Study Materials
              </h1>

              <p
                className={`text-sm sm:text-base ${fade}`}
              >
                PDFs, videos,
                notes and CBT
                guides
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div
            className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-2xl ${card}`}
          >
            <BookOpen
              size={18}
              className="text-indigo-500"
            />

            <span className="font-semibold text-sm sm:text-base">
              {
                filteredMaterials.length
              }{" "}
              Materials
            </span>
          </div>
        </div>

        {/* ========================= */}
        {/* SEARCH */}
        {/* ========================= */}

        <div className="relative mb-5">
          <Search
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${fade}`}
          />

          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            className={`w-full h-12 sm:h-14 rounded-2xl border pl-11 pr-4 text-sm sm:text-base outline-none transition-all ${input}`}
          />
        </div>

        {/* ========================= */}
        {/* FILTERS */}
        {/* ========================= */}

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6">
          <div
            className={`min-w-fit flex items-center gap-2 px-4 h-11 rounded-xl shrink-0 ${card}`}
          >
            <Filter
              size={16}
              className="text-indigo-500"
            />

            <span className="text-sm font-semibold">
              Filter
            </span>
          </div>

          {categories.map(
            (
              category,
              index,
            ) => (
              <button
                key={index}
                onClick={() =>
                  setActiveCategory(
                    category,
                  )
                }
                className={`min-w-fit px-5 h-11 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                  activeCategory ===
                  category
                    ? "bg-indigo-500 text-white"
                    : dark
                    ? "bg-white/5 border border-white/10 hover:bg-white/10"
                    : "bg-white border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            ),
          )}
        </div>

        {/* ========================= */}
        {/* MATERIALS */}
        {/* ========================= */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredMaterials.map(
            (
              material,
              index,
            ) => (
              <div
                key={index}
                className={`rounded-3xl p-4 sm:p-5 transition-all hover:scale-[1.01] ${card}`}
              >
                {/* TOP */}

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* LEFT */}

                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${material.color} text-white flex items-center justify-center shrink-0`}
                    >
                      {
                        material.icon
                      }
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-base sm:text-lg md:text-xl leading-tight break-words">
                        {
                          material.title
                        }
                      </h2>

                      <div
                        className={`flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm ${fade}`}
                      >
                        <span>
                          {
                            material.subject
                          }
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {
                            material.lessons
                          }{" "}
                          Lessons
                        </span>

                        <span>
                          •
                        </span>

                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star
                            size={14}
                            fill="currentColor"
                          />

                          {
                            material.rating
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}

                  <div className="flex sm:flex-col lg:flex-row items-start sm:items-end lg:items-center gap-2 shrink-0">
                    <div
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${
                        dark
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {
                        material.type
                      }
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs sm:text-sm ${fade}`}
                    >
                      <Download
                        size={14}
                      />

                      {
                        material.downloads
                      }
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                  <div
                    className={`flex items-center gap-2 text-xs sm:text-sm ${fade}`}
                  >
                    <Clock3
                      size={15}
                    />

                    Updated Recently
                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-col xs:flex-row sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      className={`h-11 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
                        dark
                          ? "bg-white/5 hover:bg-white/10"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      <Download
                        size={16}
                      />

                      Save
                    </button>

                    <button className="h-11 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-all text-white font-semibold flex items-center justify-center gap-2 w-full sm:w-auto">
                      <Eye size={16} />

                      Open

                      <ChevronRight
                        size={16}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        {/* ========================= */}
        {/* EMPTY */}
        {/* ========================= */}

        {filteredMaterials.length ===
          0 && (
          <div
            className={`mt-10 rounded-3xl p-8 sm:p-12 text-center ${card}`}
          >
            <FileText
              size={50}
              className="mx-auto mb-4 text-indigo-500"
            />

            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              No Materials Found
            </h2>

            <p
              className={`text-sm sm:text-base ${fade}`}
            >
              Try another keyword
              or filter category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JambStudyMaterials;