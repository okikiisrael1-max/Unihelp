import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileQuestion,
  Maximize2,
  Minimize2,
  Search,
  Sparkles,
  Trophy,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  BlockMath,
  InlineMath,
} from "react-katex";

import "katex/dist/katex.min.css";

import { motion } from "framer-motion";

import { questionBank } from "../../data/questionBank";

const QUESTIONS_PER_PAGE = 5;

const OPTION_LABELS = [
  "A",
  "B",
  "C",
  "D",
  "E",
];

/* -----------------------------------------------------
    SMART KATEX RENDERER
----------------------------------------------------- */

const containsMath = (text = "") => {
  const value = String(text);

  return (
    value.includes("\\") ||
    value.includes("^") ||
    value.includes("_") ||
    value.includes("\\frac") ||
    value.includes("\\sqrt") ||
    value.includes("=") ||
    value.includes("\\times") ||
    value.includes("\\pi")
  );
};

const renderMathContent = (
  content,
  dark = true,
  inline = false
) => {
  if (!content) return null;

  const text = String(content);

  if (!containsMath(text)) {
    return (
      <span
        className={
          dark
            ? "text-white"
            : "text-slate-900"
        }
      >
        {text}
      </span>
    );
  }

  try {
    return inline ? (
      <InlineMath math={text} />
    ) : (
      <BlockMath math={text} />
    );
  } catch (error) {
    return (
      <span
        className={
          dark
            ? "text-white"
            : "text-slate-900"
        }
      >
        {text}
      </span>
    );
  }
};

export default function PastQuestionViewer({
  dark,
}) {
  const navigate = useNavigate();

  const { subject } = useParams();

  const viewerRef = useRef(null);

  /* -----------------------------------------------------
      PREPARE QUESTION DATA
  ----------------------------------------------------- */

  const allQuestions = useMemo(() => {
    if (!questionBank) return [];

    return Object.entries(questionBank).flatMap(
      ([subjectName, subjectQuestions]) => {
        const groupedYears = {};

        (subjectQuestions || []).forEach(
          (question, index) => {
            const year = Number(
              question?.year || 2025
            );

            if (!groupedYears[year]) {
              groupedYears[year] = [];
            }

            groupedYears[year].push({
              ...question,
              uid:
                question?.id ||
                `${subjectName}-${year}-${index}`,
            });
          }
        );

        return Object.entries(groupedYears)
          .sort(
            ([a], [b]) =>
              Number(b) - Number(a)
          )
          .map(([year, questions]) => ({
            id: `${subjectName}-${year}`,
            year: Number(year),
            subject: subjectName,
            title: `JAMB ${subjectName} ${year}`,
            duration: "2 Hours",
            questions: questions.length,
            pages: Math.ceil(
              questions.length /
                QUESTIONS_PER_PAGE
            ),
            data: questions,
          }));
      }
    );
  }, []);

  const subjects = useMemo(() => {
    return [
      "All Subjects",
      ...Object.keys(questionBank || {}),
    ];
  }, []);

  const years = useMemo(() => {
    return [
      "All",
      ...new Set(
        allQuestions
          .map((item) => item.year)
          .sort((a, b) => b - a)
      ),
    ];
  }, [allQuestions]);

  /* -----------------------------------------------------
      STATES
  ----------------------------------------------------- */

  const [search, setSearch] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState(
      subject || "All Subjects"
    );

  const [selectedYear, setSelectedYear] =
    useState("All");

  const [selectedQuestion, setSelectedQuestion] =
    useState(null);

  const [page, setPage] =
    useState(1);

  const [zoomLevel, setZoomLevel] =
    useState(100);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [selectedAnswers, setSelectedAnswers] =
    useState({});

  /* -----------------------------------------------------
      FILTER
  ----------------------------------------------------- */

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(
      (item) => {
        const matchesSearch =
          item.title
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesSubject =
          selectedSubject ===
          "All Subjects"
            ? true
            : item.subject ===
              selectedSubject;

        const matchesYear =
          selectedYear === "All"
            ? true
            : item.year ===
              Number(selectedYear);

        return (
          matchesSearch &&
          matchesSubject &&
          matchesYear
        );
      }
    );
  }, [
    allQuestions,
    search,
    selectedSubject,
    selectedYear,
  ]);

  /* -----------------------------------------------------
      AUTO SELECT
  ----------------------------------------------------- */

  useEffect(() => {
    if (
      filteredQuestions.length === 0
    ) {
      setSelectedQuestion(null);
      return;
    }

    const exists =
      filteredQuestions.some(
        (q) =>
          q.id ===
          selectedQuestion?.id
      );

    if (!exists) {
      setSelectedQuestion(
        filteredQuestions[0]
      );

      setPage(1);
    }
  }, [
    filteredQuestions,
    selectedQuestion,
  ]);

  useEffect(() => {
    setPage(1);
  }, [selectedQuestion?.id]);

  /* -----------------------------------------------------
      FULLSCREEN
  ----------------------------------------------------- */

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement
        )
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, []);

  /* -----------------------------------------------------
      QUESTIONS
  ----------------------------------------------------- */

  const currentQuestions = useMemo(() => {
    return (
      selectedQuestion?.data?.slice(
        (page - 1) *
          QUESTIONS_PER_PAGE,
        page *
          QUESTIONS_PER_PAGE
      ) || []
    );
  }, [page, selectedQuestion]);

  const totalPages = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(
        (selectedQuestion?.data
          ?.length || 0) /
          QUESTIONS_PER_PAGE
      )
    );
  }, [selectedQuestion]);

  /* -----------------------------------------------------
      THEME
  ----------------------------------------------------- */

  const theme = {
    bg: dark
      ? "bg-[#030712]"
      : "bg-slate-100",

    card: dark
      ? "bg-white/[0.04] border-white/10"
      : "bg-white border-slate-200",

    text: dark
      ? "text-white"
      : "text-slate-900",

    subText: dark
      ? "text-slate-400"
      : "text-slate-500",

    input: dark
      ? "bg-white/[0.03] border-white/10 text-white"
      : "bg-slate-50 border-slate-200 text-slate-900",

    accent:
      "from-indigo-500 via-violet-500 to-fuchsia-500",
  };

  /* -----------------------------------------------------
      FUNCTIONS
  ----------------------------------------------------- */

  const zoomInHandler =
    useCallback(() => {
      setZoomLevel((prev) =>
        Math.min(prev + 10, 200)
      );
    }, []);

  const zoomOutHandler =
    useCallback(() => {
      setZoomLevel((prev) =>
        Math.max(prev - 10, 70)
      );
    }, []);

  const resetZoom =
    useCallback(() => {
      setZoomLevel(100);
    }, []);

  const toggleFullscreen =
    useCallback(async () => {
      try {
        if (
          !document.fullscreenElement
        ) {
          if (viewerRef.current) {
            await viewerRef.current.requestFullscreen();
          }
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error(error);
      }
    }, []);

  const handleSelectAnswer =
    useCallback(
      (questionId, answer) => {
        setSelectedAnswers(
          (prev) => {
            if (prev[questionId]) {
              return prev;
            }

            return {
              ...prev,
              [questionId]:
                answer,
            };
          }
        );
      },
      []
    );

  /* -----------------------------------------------------
      RENDER
  ----------------------------------------------------- */

  return (
    <div
      className={`min-h-screen ${theme.bg} transition-all duration-500`}
    >
      <div className="mx-auto flex max-w-[1900px] flex-col gap-5 px-3 py-4 sm:px-5 lg:flex-row lg:px-6 xl:px-8">
        {/* SIDEBAR */}

        <aside
          className={`w-full rounded-[32px] border ${theme.card} p-5 backdrop-blur-2xl lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:w-[360px] lg:overflow-hidden`}
        >
          {/* TOP */}

          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                navigate(-1)
              }
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all hover:scale-[1.03] ${theme.input}`}
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${theme.accent} text-white shadow-xl`}
            >
              <BookOpen size={22} />
            </div>
          </div>

          {/* HEADER */}

          <div className="mt-8">
            <h1
              className={`text-3xl font-black tracking-tight ${theme.text}`}
            >
              UniHelp CBT
            </h1>

            <p
              className={`mt-3 text-sm leading-relaxed ${theme.subText}`}
            >
              Practice real JAMB
              questions with smart
              explanations and KaTeX
              math rendering.
            </p>
          </div>

          {/* SEARCH */}

          <div className="mt-7 space-y-4">
            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${theme.input}`}
            >
              <Search
                size={18}
                className={
                  theme.subText
                }
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search subject..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            {/* FILTERS */}

            <div className="grid gap-3">
              <div
                className={`rounded-2xl border p-3 ${theme.input}`}
              >
                <select
                  value={
                    selectedSubject
                  }
                  onChange={(e) =>
                    setSelectedSubject(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent outline-none"
                >
                  {subjects.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                        className="text-black"
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                className={`rounded-2xl border p-3 ${theme.input}`}
              >
                <select
                  value={
                    selectedYear
                  }
                  onChange={(e) =>
                    setSelectedYear(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent outline-none"
                >
                  {years.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                        className="text-black"
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div
              className={`rounded-3xl border p-4 ${theme.card}`}
            >
              <div className="flex items-center justify-between">
                <Sparkles
                  size={20}
                  className="text-indigo-400"
                />

                <p
                  className={`text-xs ${theme.subText}`}
                >
                  Available
                </p>
              </div>

              <h2
                className={`mt-4 text-3xl font-black ${theme.text}`}
              >
                {
                  filteredQuestions.length
                }
              </h2>
            </div>

            <div
              className={`rounded-3xl border p-4 ${theme.card}`}
            >
              <div className="flex items-center justify-between">
                <Trophy
                  size={20}
                  className="text-yellow-400"
                />

                <p
                  className={`text-xs ${theme.subText}`}
                >
                  Questions
                </p>
              </div>

              <h2
                className={`mt-4 text-3xl font-black ${theme.text}`}
              >
                {selectedQuestion?.questions ||
                  0}
              </h2>
            </div>
          </div>

          {/* QUESTION LIST */}

          <div className="mt-7 max-h-[500px] space-y-3 overflow-y-auto pr-1">
            {filteredQuestions.map(
              (item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedQuestion(
                      item
                    );

                    setPage(1);
                  }}
                  className={`w-full rounded-3xl border p-4 text-left transition-all duration-300 hover:scale-[1.01] ${
                    selectedQuestion?.id ===
                    item.id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : theme.card
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2
                        className={`text-sm font-bold ${theme.text}`}
                      >
                        {item.title}
                      </h2>

                      <p
                        className={`mt-2 text-xs ${theme.subText}`}
                      >
                        {
                          item.questions
                        }{" "}
                        Questions
                      </p>
                    </div>

                    <div className="rounded-xl bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400">
                      {item.year}
                    </div>
                  </div>
                </button>
              )
            )}
          </div>
        </aside>

        {/* MAIN */}

        <main
          ref={viewerRef}
          style={{
            zoom: `${zoomLevel}%`,
          }}
          className={`flex-1 overflow-hidden rounded-[32px] border ${theme.card}`}
        >
          {/* TOPBAR */}

          <div
            className={`flex flex-col gap-4 border-b p-5 ${theme.card} lg:flex-row lg:items-center lg:justify-between`}
          >
            <div>
              <h2
                className={`text-2xl font-black ${theme.text}`}
              >
                {selectedQuestion?.title ||
                  "No Questions Found"}
              </h2>

              <div
                className={`mt-2 flex flex-wrap items-center gap-4 text-sm ${theme.subText}`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {
                    selectedQuestion?.year
                  }
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  {
                    selectedQuestion?.duration
                  }
                </div>

                <div className="flex items-center gap-2">
                  <FileQuestion size={16} />
                  {
                    selectedQuestion?.questions
                  }{" "}
                  Questions
                </div>
              </div>
            </div>

            {/* CONTROLS */}

            <div className="flex items-center gap-2">
              <button
                onClick={
                  zoomOutHandler
                }
                className={`rounded-2xl border p-3 ${theme.input}`}
              >
                <ZoomOut size={18} />
              </button>

              <button
                onClick={resetZoom}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${theme.input}`}
              >
                {zoomLevel}%
              </button>

              <button
                onClick={
                  zoomInHandler
                }
                className={`rounded-2xl border p-3 ${theme.input}`}
              >
                <ZoomIn size={18} />
              </button>

              <button
                onClick={
                  toggleFullscreen
                }
                className={`rounded-2xl border p-3 ${theme.input}`}
              >
                {isFullscreen ? (
                  <Minimize2
                    size={18}
                  />
                ) : (
                  <Maximize2
                    size={18}
                  />
                )}
              </button>
            </div>
          </div>

          {/* QUESTIONS */}

          <div className="space-y-7 overflow-y-auto p-5 sm:p-7 lg:p-8">
            {currentQuestions.length ===
            0 ? (
              <div className="py-20 text-center">
                <p
                  className={`text-lg font-semibold ${theme.text}`}
                >
                  No questions
                  available.
                </p>
              </div>
            ) : (
              currentQuestions.map(
                (
                  question,
                  index
                ) => {
                  const questionId =
                    question.uid;

                  const options =
                    Array.isArray(
                      question.options
                    )
                      ? question.options
                      : Object.values(
                          question.options ||
                            {}
                        );

                  const selectedAnswer =
                    selectedAnswers[
                      questionId
                    ];

                  return (
                    <motion.div
                      key={
                        questionId
                      }
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className={`rounded-[30px] border p-6 shadow-2xl backdrop-blur-xl ${theme.card}`}
                    >
                      {/* HEADER */}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-2xl bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-400">
                          Question{" "}
                          {(page - 1) *
                            QUESTIONS_PER_PAGE +
                            index +
                            1}
                        </span>

                        <span
                          className={`text-xs font-medium ${theme.subText}`}
                        >
                          {
                            selectedQuestion?.subject
                          }
                        </span>
                      </div>

                      {/* QUESTION */}

                      <div
                        className={`mt-6 overflow-x-auto text-lg leading-relaxed ${theme.text}`}
                      >
                        {renderMathContent(
                          question.question,
                          dark
                        )}
                      </div>

                      {/* IMAGE */}

                      {question.image && (
                        <img
                          src={
                            question.image
                          }
                          alt="Question diagram"
                          className="mt-6 max-h-[400px] w-full rounded-3xl border object-contain"
                        />
                      )}

                      {/* OPTIONS */}

                      <div className="mt-7 grid gap-4">
                        {options.map(
                          (
                            option,
                            optionIndex
                          ) => {
                            const label =
                              OPTION_LABELS[
                                optionIndex
                              ];

                            const isSelected =
                              selectedAnswer ===
                              label;

                            const answerValue =
                              question.answer;

                            const isCorrect =
                              Number(
                                answerValue
                              ) ===
                                optionIndex ||
                              String(
                                answerValue
                              )
                                .trim()
                                .toUpperCase() ===
                                label ||
                              String(
                                answerValue
                              )
                                .trim()
                                .toLowerCase() ===
                                String(
                                  option
                                )
                                  .trim()
                                  .toLowerCase();

                            const hasAnswered =
                              Boolean(
                                selectedAnswer
                              );

                            const showCorrectState =
                              hasAnswered &&
                              isCorrect;

                            const showWrongState =
                              hasAnswered &&
                              isSelected &&
                              !isCorrect;

                            return (
                              <button
                                key={
                                  label
                                }
                                disabled={
                                  hasAnswered
                                }
                                onClick={() =>
                                  handleSelectAnswer(
                                    questionId,
                                    label
                                  )
                                }
                                className={`group flex items-start gap-4 rounded-3xl border p-5 text-left transition-all duration-300 ${
                                  showCorrectState
                                    ? "border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10"
                                    : showWrongState
                                    ? "border-red-500 bg-red-500/10"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : `${theme.input} hover:border-indigo-500/40 hover:scale-[1.01]`
                                }`}
                              >
                                {/* LABEL */}

                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                                    showCorrectState
                                      ? "bg-emerald-500 text-white"
                                      : showWrongState
                                      ? "bg-red-500 text-white"
                                      : isSelected
                                      ? "bg-indigo-500 text-white"
                                      : "bg-white/10"
                                  }`}
                                >
                                  {
                                    label
                                  }
                                </div>

                                {/* OPTION */}

                                <div className="flex-1 overflow-x-auto">
                                  <div
                                    className={`text-sm leading-relaxed sm:text-base ${theme.text}`}
                                  >
                                    {renderMathContent(
                                      option,
                                      dark,
                                      true
                                    )}
                                  </div>
                                </div>

                                {/* ICON */}

                                {showCorrectState && (
                                  <CheckCircle2 className="text-emerald-400" />
                                )}

                                {showWrongState && (
                                  <XCircle className="text-red-400" />
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {/* EXPLANATION */}

                      {selectedAnswer &&
                        question.explanation && (
                          <div className="mt-7 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-5">
                            <div className="flex items-center gap-2">
                              <Eye className="text-indigo-400" />

                              <p className="text-sm font-bold text-indigo-400">
                                Explanation
                              </p>
                            </div>

                            <div
                              className={`mt-4 overflow-x-auto text-sm leading-relaxed sm:text-base ${theme.text}`}
                            >
                              {renderMathContent(
                                question.explanation,
                                dark
                              )}
                            </div>
                          </div>
                        )}
                    </motion.div>
                  );
                }
              )
            )}

            {/* PAGINATION */}

            {currentQuestions.length >
              0 && (
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                    )
                  }
                  className={`flex items-center justify-center gap-2 rounded-3xl border px-5 py-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${theme.input}`}
                >
                  <ChevronLeft
                    size={18}
                  />
                  Previous
                </button>

                <div
                  className={`rounded-3xl border px-6 py-4 text-sm font-bold ${theme.input}`}
                >
                  Page {page} of{" "}
                  {totalPages}
                </div>

                <button
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(
                        prev + 1,
                        totalPages
                      )
                    )
                  }
                  className={`flex items-center justify-center gap-2 rounded-3xl border px-5 py-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${theme.input}`}
                >
                  Next
                  <ChevronRight
                    size={18}
                  />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}