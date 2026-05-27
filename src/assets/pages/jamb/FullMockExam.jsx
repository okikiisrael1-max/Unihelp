import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { evaluate } from "mathjs";

import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Flag,
  Grid2X2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

import { BlockMath } from "react-katex";

import "katex/dist/katex.min.css";

import { db } from "../../../firebase/config";

import { AuthContext } from "../../context/AuthContext";

import { questionBank } from "../../data/questionBank";

/* =========================================================
STORAGE
========================================================= */

const STORAGE_KEY =
  "unihelp-jamb-full-mock-v7";

/* =========================================================
SUBJECT LIMITS
========================================================= */

const SUBJECT_LIMITS = {
  english: 60,
  mathematics: 40,
  physics: 40,
  chemistry: 40,
  biology: 40,
  economics: 40,
  government: 40,
  literature: 40,
  commerce: 40,
  geography: 40,
  crs: 40,
  irs: 40,
  agricultural: 40,
  history: 40,
  computerstudies: 40,
  music: 40,
  french: 40,
  finearts: 40,
};

/* =========================================================
UTILS
========================================================= */

const shuffleArray = (
  array = [],
) => {
  const arr = [...array];

  for (
    let i = arr.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1),
    );

    [arr[i], arr[j]] = [
      arr[j],
      arr[i],
    ];
  }

  return arr;
};

const formatSubjectKey = (
  subject = "",
) =>
  subject
    .toLowerCase()
    .replace(/\s/g, "");

const formatTime = (
  seconds,
) => {
  const hrs = Math.floor(
    seconds / 3600,
  );

  const mins = Math.floor(
    (seconds % 3600) / 60,
  );

  const secs = seconds % 60;

  return `${hrs}:${mins
    .toString()
    .padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const OPTION_LABELS = [
  "A",
  "B",
  "C",
  "D",
  "E",
];

/* =========================================================
COMPONENT
========================================================= */

const FullMockExam = ({
  dark = true,
}) => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { user } =
    useContext(AuthContext);

  const timerRef =
    useRef(null);

  /* =========================================================
  THEME
  ========================================================= */

  const theme = {
    bg: dark
      ? "bg-[#030712] text-white"
      : "bg-[#f5f7fb] text-slate-900",

    card: dark
      ? "bg-[#0b1120]/90 border border-white/10"
      : "bg-white border border-slate-200",

    soft: dark
      ? "bg-white/[0.05]"
      : "bg-slate-100",

    text: dark
      ? "text-slate-400"
      : "text-slate-500",

    option: dark
      ? "bg-[#111827] border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.04]"
      : "bg-white border-slate-200 hover:bg-slate-50",

    selected: dark
      ? "border-indigo-500 bg-indigo-500/10"
      : "border-indigo-500 bg-indigo-50",
  };

  /* =========================================================
  SUBJECTS
  ========================================================= */

  const selectedSubjects =
    useMemo(() => {
      return (
        location.state
          ?.subjects || [
          "English",
          "Mathematics",
          "Physics",
          "Chemistry",
        ]
      );
    }, [location.state]);

  /* =========================================================
  ACCESS STATES
  ========================================================= */

  const [
    subscriptionActive,
    setSubscriptionActive,
  ] = useState(false);

  const [
    freeAttemptUsed,
    setFreeAttemptUsed,
  ] = useState(false);

  const [
    checkingAccess,
    setCheckingAccess,
  ] = useState(true);

  const [blocked, setBlocked] =
    useState(false);

  /* =========================================================
  STATE
  ========================================================= */

  const [
    questionGroups,
    setQuestionGroups,
  ] = useState({});

  const [
    activeSubject,
    setActiveSubject,
  ] = useState(
    selectedSubjects[0],
  );

  const [
    subjectIndexes,
    setSubjectIndexes,
  ] = useState({});

  const [
    selectedAnswers,
    setSelectedAnswers,
  ] = useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(7200);

  const [loading, setLoading] =
    useState(true);

  const [showMap, setShowMap] =
    useState(false);

  const [
    showCalculator,
    setShowCalculator,
  ] = useState(false);

  const [
    calculatorValue,
    setCalculatorValue,
  ] = useState("");

  const [
    showSubmitModal,
    setShowSubmitModal,
  ] = useState(false);

  const [
    savingResult,
    setSavingResult,
  ] = useState(false);

  /* =========================================================
  CHECK ACCESS
  ========================================================= */

  useEffect(() => {
    const checkAccess =
      async () => {
        try {
          if (!user?.uid) {
            setBlocked(true);
            setCheckingAccess(
              false,
            );
            return;
          }

          const userRef = doc(
            db,
            "users",
            user.uid,
          );

          const userSnap =
            await getDoc(
              userRef,
            );

          if (
            userSnap.exists()
          ) {
            const data =
              userSnap.data();

            const subscribed =
              data?.subscriptionActive ===
              true;

            const used =
              data?.freeMockUsed ===
              true;

            setSubscriptionActive(
              subscribed,
            );

            setFreeAttemptUsed(
              used,
            );

            if (
              !subscribed &&
              used
            ) {
              setBlocked(
                true,
              );
            }
          }
        } catch (error) {
          console.log(error);
        } finally {
          setCheckingAccess(
            false,
          );
        }
      };

    checkAccess();
  }, [user]);

  /* =========================================================
  GENERATE QUESTIONS
  ========================================================= */

  const generatedQuestions =
    useMemo(() => {
      const result = {};

      selectedSubjects.forEach(
        (subject) => {
          const key =
            formatSubjectKey(
              subject,
            );

          const bank =
            questionBank?.[
              key
            ] || [];

          const limit =
            SUBJECT_LIMITS[
              key
            ] || 40;

          result[
            subject
          ] = shuffleArray(
            bank,
          )
            .slice(0, limit)
            .map(
              (
                question,
                index,
              ) => ({
                ...question,

                id:
                  question.id ||
                  `${key}-${index}`,

                uniqueId: `${key}-${
                  question.id ||
                  index
                }`,

                number:
                  index + 1,

                subject,
              }),
            );
        },
      );

      return result;
    }, [selectedSubjects]);

  /* =========================================================
  LOAD STORAGE
  ========================================================= */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY,
        );

      setQuestionGroups(
        generatedQuestions,
      );

      if (!saved) {
        setLoading(false);
        return;
      }

      const parsed =
        JSON.parse(saved);

      setActiveSubject(
        parsed.activeSubject ||
          selectedSubjects[0],
      );

      setSubjectIndexes(
        parsed.subjectIndexes ||
          {},
      );

      setSelectedAnswers(
        parsed.selectedAnswers ||
          {},
      );

      setTimeLeft(
        parsed.timeLeft ||
          7200,
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [
    generatedQuestions,
    selectedSubjects,
  ]);

  /* =========================================================
  SAVE STORAGE
  ========================================================= */

  useEffect(() => {
    if (
      !Object.keys(
        questionGroups,
      ).length
    )
      return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeSubject,
        subjectIndexes,
        selectedAnswers,
        timeLeft,
      }),
    );
  }, [
    activeSubject,
    subjectIndexes,
    selectedAnswers,
    timeLeft,
    questionGroups,
  ]);

  /* =========================================================
  CURRENT QUESTION
  ========================================================= */

  const currentIndex =
    subjectIndexes[
      activeSubject
    ] || 0;

  const activeQuestions =
    questionGroups?.[
      activeSubject
    ] || [];

  const currentQuestion =
    activeQuestions[
      currentIndex
    ];

  const allQuestions =
    useMemo(() => {
      return Object.values(
        questionGroups,
      ).flat();
    }, [questionGroups]);

  /* =========================================================
  STATS
  ========================================================= */

  const totalQuestions =
    allQuestions.length;

  const answeredCount =
    Object.keys(
      selectedAnswers,
    ).length;

  const unansweredCount =
    totalQuestions -
    answeredCount;

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answeredCount /
            totalQuestions) *
            100,
        )
      : 0;

  /* =========================================================
  SCORE
  ========================================================= */

  const score = useMemo(() => {
    let total = 0;

    allQuestions.forEach(
      (question) => {
        if (
          selectedAnswers[
            question.uniqueId
          ] ===
          question.answer
        ) {
          total++;
        }
      },
    );

    return total;
  }, [
    allQuestions,
    selectedAnswers,
  ]);

  const percentage =
    totalQuestions > 0
      ? Math.round(
          (score /
            totalQuestions) *
            100,
        )
      : 0;

  /* =========================================================
  SUBMIT
  ========================================================= */

  const handleSubmit =
    useCallback(async () => {
      if (submitted) return;

      setSubmitted(true);

      setSavingResult(true);

      clearInterval(
        timerRef.current,
      );

      try {
        const payload = {
          uid: user?.uid || "",
          subjects:
            selectedSubjects,
          score,
          percentage,
          totalQuestions,
          selectedAnswers,
          createdAt:
            serverTimestamp(),
        };

        if (user?.uid) {
          await addDoc(
            collection(
              db,
              "jambUsers",
              user.uid,
              "mockResults",
            ),
            payload,
          );

          if (
            !subscriptionActive
          ) {
            await setDoc(
              doc(
                db,
                "users",
                user.uid,
              ),
              {
                freeMockUsed:
                  true,
              },
              {
                merge: true,
              },
            );
          }
        }

        localStorage.removeItem(
          STORAGE_KEY,
        );
      } catch (error) {
        console.log(error);
      } finally {
        setSavingResult(false);
        setShowSubmitModal(
          false,
        );
      }
    }, [
      submitted,
      user,
      selectedSubjects,
      score,
      percentage,
      totalQuestions,
      selectedAnswers,
      subscriptionActive,
    ]);

  /* =========================================================
  TIMER
  ========================================================= */

  useEffect(() => {
    if (
      submitted ||
      loading ||
      blocked
    )
      return;

    timerRef.current =
      setInterval(() => {
        setTimeLeft(
          (prev) => {
            if (
              prev <= 1
            ) {
              clearInterval(
                timerRef.current,
              );

              handleSubmit();

              return 0;
            }

            return prev - 1;
          },
        );
      }, 1000);

    return () => {
      clearInterval(
        timerRef.current,
      );
    };
  }, [
    submitted,
    loading,
    blocked,
    handleSubmit,
  ]);

  /* =========================================================
  ANSWER
  ========================================================= */

  const handleSelect = (
    index,
  ) => {
    if (submitted) return;

    setSelectedAnswers(
      (prev) => ({
        ...prev,

        [currentQuestion.uniqueId]:
          index,
      }),
    );
  };

  /* =========================================================
  NAVIGATION
  ========================================================= */

  const updateSubjectIndex = (
    subject,
    value,
  ) => {
    setSubjectIndexes(
      (prev) => ({
        ...prev,
        [subject]: value,
      }),
    );
  };

  const nextQuestion =
    () => {
      if (
        currentIndex <
        activeQuestions.length - 1
      ) {
        updateSubjectIndex(
          activeSubject,
          currentIndex + 1,
        );

        return;
      }

      const subjectIndex =
        selectedSubjects.indexOf(
          activeSubject,
        );

      if (
        subjectIndex <
        selectedSubjects.length - 1
      ) {
        setActiveSubject(
          selectedSubjects[
            subjectIndex + 1
          ],
        );
      }
    };

  const previousQuestion =
    () => {
      if (currentIndex > 0) {
        updateSubjectIndex(
          activeSubject,
          currentIndex - 1,
        );

        return;
      }

      const subjectIndex =
        selectedSubjects.indexOf(
          activeSubject,
        );

      if (subjectIndex > 0) {
        const prevSubject =
          selectedSubjects[
            subjectIndex - 1
          ];

        const questions =
          questionGroups[
            prevSubject
          ] || [];

        setActiveSubject(
          prevSubject,
        );

        updateSubjectIndex(
          prevSubject,
          questions.length - 1,
        );
      }
    };

  /* =========================================================
  CALCULATOR
  ========================================================= */

  const handleCalculator = (
    value,
  ) => {
    if (value === "=") {
      try {
        const result =
          evaluate(
            calculatorValue ||
              "0",
          );

        setCalculatorValue(
          result.toString(),
        );
      } catch {
        setCalculatorValue(
          "Error",
        );
      }

      return;
    }

    if (value === "C") {
      setCalculatorValue("");
      return;
    }

    if (value === "⌫") {
      setCalculatorValue(
        (prev) =>
          prev.slice(0, -1),
      );

      return;
    }

    setCalculatorValue(
      (prev) => prev + value,
    );
  };

  /* =========================================================
  RESTART
  ========================================================= */

  const restartExam = () => {
    localStorage.removeItem(
      STORAGE_KEY,
    );

    clearInterval(
      timerRef.current,
    );

    setQuestionGroups(
      generatedQuestions,
    );

    setActiveSubject(
      selectedSubjects[0],
    );

    setSubjectIndexes({});

    setSelectedAnswers({});

    setSubmitted(false);

    setTimeLeft(7200);
  };

  /* =========================================================
  MATH RENDER
  ========================================================= */

  const renderMathContent = (
    content,
  ) => {
    if (!content)
      return null;

    const text =
      String(content);

    const hasMath =
      text.includes("\\") ||
      text.includes("^") ||
      text.includes("_") ||
      text.includes("=");

    if (!hasMath) {
      return <span>{text}</span>;
    }

    try {
      return (
        <BlockMath math={text} />
      );
    } catch {
      return <span>{text}</span>;
    }
  };

  /* =========================================================
  LOADING
  ========================================================= */

  if (
    checkingAccess ||
    loading
  ) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.bg}`}
      >
        <div className="text-center">
          <div className="w-28 h-28 rounded-[32px] bg-indigo-600 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain size={48} />
          </div>

          <h1 className="text-4xl font-black">
            Loading CBT...
          </h1>
        </div>
      </div>
    );
  }

  /* =========================================================
  BLOCKED
  ========================================================= */

  if (blocked) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-5 ${theme.bg}`}
      >
        <div
          className={`w-full max-w-lg rounded-[40px] p-8 text-center ${theme.card}`}
        >
          <div className="w-28 h-28 rounded-[30px] bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <Crown
              size={52}
              className="text-white"
            />
          </div>

          <h1 className="text-5xl font-black mb-4">
            Premium Required
          </h1>

          <p
            className={`text-lg leading-relaxed mb-8 ${theme.text}`}
          >
            Your free mock exam
            has already been
            used.
          </p>

          <div className="space-y-4">
            <button
              onClick={() =>
                navigate(
                  "/subscription",
                )
              }
              className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center gap-3"
            >
              <Crown size={20} />
              Upgrade Now
            </button>

            <button
              onClick={() =>
                navigate(-1)
              }
              className={`w-full h-14 rounded-2xl font-bold ${theme.soft}`}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.bg}`}
    >
      <div className="max-w-[1900px] mx-auto p-3 lg:p-5">
        {/* TOPBAR */}

        <div
          className={`rounded-[30px] p-5 mb-5 ${theme.card}`}
        >
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  navigate(-1)
                }
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.soft}`}
              >
                <ArrowLeft size={22} />
              </button>

              <div>
                <h1 className="text-3xl font-black">
                  UniHelp CBT
                </h1>

                <p
                  className={`mt-1 ${theme.text}`}
                >
                  Real JAMB Mock
                  Experience
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="h-14 px-6 rounded-2xl bg-red-600 text-white flex items-center gap-3 font-black">
                <Clock3 size={20} />

                {formatTime(
                  timeLeft,
                )}
              </div>

              <button
                onClick={() =>
                  setShowCalculator(
                    true,
                  )
                }
                className="w-14 h-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center"
              >
                <Calculator size={20} />
              </button>

              <button
                onClick={() =>
                  setShowMap(
                    !showMap,
                  )
                }
                className={`w-14 h-14 rounded-2xl xl:hidden flex items-center justify-center ${theme.soft}`}
              >
                <Grid2X2 size={20} />
              </button>
            </div>
          </div>

          {/* SUBJECTS */}

          <div className="flex flex-wrap gap-3 mt-6">
            {selectedSubjects.map(
              (subject) => {
                const active =
                  activeSubject ===
                  subject;

                return (
                  <button
                    key={subject}
                    onClick={() =>
                      setActiveSubject(
                        subject,
                      )
                    }
                    className={`h-12 px-6 rounded-2xl font-bold transition-all ${
                      active
                        ? "bg-indigo-600 text-white"
                        : `${theme.soft}`
                    }`}
                  >
                    {subject}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* BODY */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* MAIN */}

          <div className="xl:col-span-9">
            <div
              className={`rounded-[30px] p-5 sm:p-7 min-h-[85vh] ${theme.card}`}
            >
              {/* QUESTION HEADER */}

              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black">
                    Question{" "}
                    {currentIndex +
                      1}
                  </div>

                  <div
                    className={`px-5 py-3 rounded-2xl font-bold ${theme.soft}`}
                  >
                    {
                      activeSubject
                    }
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`px-5 py-3 rounded-2xl ${theme.soft}`}
                  >
                    Answered:{" "}
                    {
                      answeredCount
                    }
                  </div>

                  <div
                    className={`px-5 py-3 rounded-2xl ${theme.soft}`}
                  >
                    Remaining:{" "}
                    {
                      unansweredCount
                    }
                  </div>
                </div>
              </div>

              {/* QUESTION */}

              <div className="mb-10">
                <div className="text-xl sm:text-2xl font-semibold leading-relaxed">
                  {
                    currentQuestion.number
                  }
                  .{" "}
                  {renderMathContent(
                    currentQuestion.question,
                  )}
                </div>
              </div>

              {/* IMAGE */}

              {currentQuestion.image && (
                <div className="mb-8">
                  <img
                    src={
                      currentQuestion.image
                    }
                    alt="diagram"
                    className="max-w-full rounded-3xl border border-white/10"
                  />
                </div>
              )}

              {/* OPTIONS */}

              <div className="space-y-4">
                {currentQuestion.options?.map(
                  (
                    option,
                    index,
                  ) => {
                    const selected =
                      selectedAnswers[
                        currentQuestion
                          .uniqueId
                      ] === index;

                    const correct =
                      submitted &&
                      currentQuestion.answer ===
                        index;

                    const wrong =
                      submitted &&
                      selected &&
                      currentQuestion.answer !==
                        index;

                    return (
                      <button
                        key={index}
                        disabled={
                          submitted
                        }
                        onClick={() =>
                          handleSelect(
                            index,
                          )
                        }
                        className={`w-full border rounded-[26px] p-5 text-left transition-all duration-300 ${
                          selected
                            ? theme.selected
                            : theme.option
                        } ${
                          correct
                            ? "!border-green-500 !bg-green-500/10"
                            : ""
                        } ${
                          wrong
                            ? "!border-red-500 !bg-red-500/10"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-5">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                              selected
                                ? "bg-indigo-600 text-white"
                                : `${theme.soft}`
                            } ${
                              correct
                                ? "!bg-green-500 text-white"
                                : ""
                            } ${
                              wrong
                                ? "!bg-red-500 text-white"
                                : ""
                            }`}
                          >
                            {
                              OPTION_LABELS[
                                index
                              ]
                            }
                          </div>

                          <div className="flex-1 pt-2 text-lg font-medium leading-relaxed">
                            {renderMathContent(
                              option,
                            )}
                          </div>

                          {correct && (
                            <CheckCircle2 className="text-green-400 mt-2" />
                          )}

                          {wrong && (
                            <XCircle className="text-red-400 mt-2" />
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>

              {/* EXPLANATION */}

              {submitted &&
                currentQuestion.explanation && (
                  <div className="mt-8 rounded-[28px] border border-indigo-500/20 bg-indigo-500/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="text-indigo-400" />

                      <h2 className="text-xl font-black text-indigo-400">
                        Explanation
                      </h2>
                    </div>

                    <div className="text-lg leading-relaxed">
                      {renderMathContent(
                        currentQuestion.explanation,
                      )}
                    </div>
                  </div>
                )}

              {/* ACTIONS */}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={
                    previousQuestion
                  }
                  className={`h-14 px-7 rounded-2xl font-bold flex items-center gap-3 ${theme.soft}`}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={
                      restartExam
                    }
                    className="h-14 px-7 rounded-2xl bg-orange-500 text-white font-bold flex items-center gap-3"
                  >
                    <RotateCcw size={20} />
                    Restart
                  </button>

                  {activeSubject ===
                    selectedSubjects[
                      selectedSubjects.length -
                        1
                    ] &&
                  currentIndex ===
                    activeQuestions.length -
                      1 ? (
                    <button
                      onClick={() =>
                        setShowSubmitModal(
                          true,
                        )
                      }
                      className="h-14 px-8 rounded-2xl bg-green-600 text-white font-black flex items-center gap-3"
                    >
                      <Flag size={20} />
                      Submit
                    </button>
                  ) : (
                    <button
                      onClick={
                        nextQuestion
                      }
                      className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black flex items-center gap-3"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* RESULT */}

              {submitted && (
                <div className="mt-10 rounded-[32px] border border-green-500/20 bg-green-500/10 p-7">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-7">
                    <div>
                      <div className="w-24 h-24 rounded-[28px] bg-green-500 text-white flex items-center justify-center mb-5">
                        <Trophy size={45} />
                      </div>

                      <h1 className="text-4xl font-black mb-3">
                        Exam Submitted
                      </h1>

                      <p
                        className={
                          theme.text
                        }
                      >
                        Your CBT
                        result has
                        been saved.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`rounded-3xl p-6 min-w-[170px] ${theme.soft}`}
                      >
                        <p
                          className={`text-sm mb-2 ${theme.text}`}
                        >
                          Score
                        </p>

                        <h2 className="text-5xl font-black text-green-400">
                          {score}
                        </h2>

                        <p
                          className={
                            theme.text
                          }
                        >
                          /
                          {
                            totalQuestions
                          }
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl p-6 min-w-[170px] ${theme.soft}`}
                      >
                        <p
                          className={`text-sm mb-2 ${theme.text}`}
                        >
                          Percentage
                        </p>

                        <h2 className="text-5xl font-black text-cyan-400">
                          {
                            percentage
                          }
                          %
                        </h2>

                        <p
                          className={
                            theme.text
                          }
                        >
                          Overall
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}

          <div
            className={`xl:col-span-3 ${
              showMap
                ? "block"
                : "hidden xl:block"
            }`}
          >
            <div
              className={`rounded-[30px] p-5 sticky top-5 ${theme.card}`}
            >
              <div className="flex items-center gap-4 mb-7">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles size={24} />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    CBT Overview
                  </h2>

                  <p
                    className={`text-sm ${theme.text}`}
                  >
                    Track progress
                  </p>
                </div>
              </div>

              <div
                className={`rounded-3xl p-6 mb-8 ${theme.soft}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm mb-2 ${theme.text}`}
                    >
                      Progress
                    </p>

                    <h2 className="text-5xl font-black">
                      {progress}%
                    </h2>
                  </div>

                  <ShieldCheck className="text-indigo-500" />
                </div>

                <div className="mt-5 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{
                      width: `${progress}%`,
                    }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-black">
                    Question Map
                  </h2>

                  <p
                    className={`text-sm ${theme.text}`}
                  >
                    Quick access
                  </p>
                </div>

                <Grid2X2 className="text-indigo-400" />
              </div>

              <div className="grid grid-cols-5 gap-3">
                {activeQuestions.map(
                  (
                    question,
                    index,
                  ) => {
                    const answered =
                      selectedAnswers[
                        question
                          .uniqueId
                      ] !==
                      undefined;

                    const active =
                      currentIndex ===
                      index;

                    return (
                      <button
                        key={
                          question.uniqueId
                        }
                        onClick={() =>
                          updateSubjectIndex(
                            activeSubject,
                            index,
                          )
                        }
                        className={`h-12 rounded-xl font-bold transition-all ${
                          active
                            ? "bg-indigo-600 text-white"
                            : answered
                            ? "bg-green-500/15 border border-green-500/30 text-green-400"
                            : `${theme.soft}`
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT MODAL */}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-[32px] p-7 ${theme.card}`}
          >
            <div className="text-center">
              <div className="w-24 h-24 rounded-[28px] bg-green-600 text-white flex items-center justify-center mx-auto mb-6">
                <Flag size={42} />
              </div>

              <h1 className="text-4xl font-black mb-3">
                Submit Exam?
              </h1>

              <p
                className={`mb-8 ${theme.text}`}
              >
                You still have
                <span className="text-yellow-400 font-bold ml-2 mr-2">
                  {
                    unansweredCount
                  }
                </span>
                unanswered
                questions.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setShowSubmitModal(
                      false,
                    )
                  }
                  className={`h-14 rounded-2xl font-bold ${theme.soft}`}
                >
                  Continue
                </button>

                <button
                  disabled={
                    savingResult
                  }
                  onClick={
                    handleSubmit
                  }
                  className="h-14 rounded-2xl bg-green-600 text-white font-bold"
                >
                  {savingResult
                    ? "Submitting..."
                    : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR */}

      {showCalculator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-[32px] overflow-hidden ${theme.card}`}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black">
                  Calculator
                </h2>

                <p
                  className={`text-sm ${theme.text}`}
                >
                  Quick
                  calculations
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCalculator(
                    false,
                  )
                }
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.soft}`}
              >
                <X />
              </button>
            </div>

            <div className="p-5">
              <div
                className={`h-24 rounded-2xl mb-5 flex items-end justify-end px-5 py-4 text-4xl font-black overflow-hidden ${theme.soft}`}
              >
                {calculatorValue ||
                  "0"}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  "7",
                  "8",
                  "9",
                  "/",
                  "4",
                  "5",
                  "6",
                  "*",
                  "1",
                  "2",
                  "3",
                  "-",
                  "0",
                  ".",
                  "+",
                  "=",
                ].map((btn) => (
                  <button
                    key={btn}
                    onClick={() =>
                      handleCalculator(
                        btn,
                      )
                    }
                    className={`h-16 rounded-2xl font-black text-lg ${
                      btn === "="
                        ? "bg-green-500 text-white"
                        : [
                            "+",
                            "-",
                            "*",
                            "/",
                          ].includes(
                            btn,
                          )
                        ? "bg-indigo-600 text-white"
                        : `${theme.soft}`
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() =>
                    handleCalculator(
                      "⌫",
                    )
                  }
                  className="h-14 rounded-2xl bg-yellow-500 text-white font-bold"
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    handleCalculator(
                      "C",
                    )
                  }
                  className="h-14 rounded-2xl bg-red-500 text-white font-bold"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullMockExam;