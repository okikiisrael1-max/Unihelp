import React, { useMemo, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calculator,
  ChevronRight,
  FileQuestion,
  FlaskConical,
  Globe,
  Search,
  Target,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const JambSubjects = ({ dark }) => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const subjects = [
    {
      id: "english",
      name: "English Language",
      icon: <BookOpen size={22} />,
      questions: 2450,
    },
    {
      id: "mathematics",
      name: "Mathematics",
      icon: <Calculator size={22} />,
      questions: 1980,
    },
    {
      id: "physics",
      name: "Physics",
      icon: <Target size={22} />,
      questions: 1540,
    },
    {
      id: "chemistry",
      name: "Chemistry",
      icon: <FlaskConical size={22} />,
      questions: 1720,
    },
    {
      id: "biology",
      name: "Biology",
      icon: <Brain size={22} />,
      questions: 1860,
    },
    {
      id: "government",
      name: "Government",
      icon: <Globe size={22} />,
      questions: 980,
    },
    {
      id: "economics",
      name: "Economics",
      icon: <FileQuestion size={22} />,
      questions: 1240,
    },
    {
      id: "literature",
      name: "Literature",
      icon: <BookOpen size={22} />,
      questions: 860,
    },
  ];

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const openSubject = (id) => {
    navigate(`/subjects/${id}`);
  };

  return (
    <div
      className={`min-h-screen ${
        dark
          ? "bg-[#0f172a] text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* HEADER */}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              dark
                ? "bg-white/10 hover:bg-white/20"
                : "bg-white hover:bg-slate-200"
            }`}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Select Subject</h1>

            <p
              className={`text-sm ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Choose a subject to start CBT practice
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="relative mb-5">
          <Search
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          />

          <input
            type="text"
            placeholder="Search subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full h-12 rounded-xl pl-11 pr-4 outline-none border transition-all ${
              dark
                ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>

        {/* SUBJECT LIST */}

        <div className="space-y-3">
          {filteredSubjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => openSubject(subject.id)}
              className={`w-full flex items-center justify-between rounded-2xl p-4 transition-all ${
                dark
                  ? "bg-white/5 border border-white/10 hover:bg-white/10"
                  : "bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    dark
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {subject.icon}
                </div>

                <div className="text-left">
                  <h2 className="font-semibold text-base">
                    {subject.name}
                  </h2>

                  <p
                    className={`text-sm ${
                      dark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {subject.questions} Questions
                  </p>
                </div>
              </div>

              <ChevronRight
                size={20}
                className={
                  dark ? "text-slate-400" : "text-slate-500"
                }
              />
            </button>
          ))}
        </div>

        {/* EMPTY */}

        {filteredSubjects.length === 0 && (
          <div
            className={`mt-10 rounded-2xl p-8 text-center border ${
              dark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <Search
              size={40}
              className="mx-auto mb-4 text-slate-400"
            />

            <h2 className="text-xl font-bold mb-2">
              No Subject Found
            </h2>

            <p
              className={
                dark ? "text-slate-400" : "text-slate-500"
              }
            >
              Try another keyword.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JambSubjects;