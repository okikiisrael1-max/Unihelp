import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BrainCircuit,
  TrendingUp,
  Trophy,
  Clock3,
  Flame,
  BookOpen,
  Sparkles,
  Target,
  CalendarDays,
  Activity,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

import { db } from "../../../firebase/config";
import { AuthContext } from "../../context/AuthContext";

export default function AnalyticsPage({
  dark = true,
}) {
  const { user } = useContext(AuthContext);

  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const analyticsRef = collection(
      db,
      "users",
      user.uid,
      "analytics"
    );

    const q = query(analyticsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAnalytics(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalStudyHours = useMemo(() => {
    return analytics.reduce(
      (acc, item) => acc + (item.studyHours || 0),
      0
    );
  }, [analytics]);

  const averageScore = useMemo(() => {
    if (analytics.length === 0) return 0;

    const total = analytics.reduce(
      (acc, item) => acc + (item.score || 0),
      0
    );

    return Math.round(total / analytics.length);
  }, [analytics]);

  const highestScore = useMemo(() => {
    if (analytics.length === 0) return 0;

    return Math.max(
      ...analytics.map((item) => item.score || 0)
    );
  }, [analytics]);

  const weeklyProgress = [
    {
      week: "Mon",
      score: 120,
    },
    {
      week: "Tue",
      score: 180,
    },
    {
      week: "Wed",
      score: 210,
    },
    {
      week: "Thu",
      score: 250,
    },
    {
      week: "Fri",
      score: 290,
    },
    {
      week: "Sat",
      score: 310,
    },
    {
      week: "Sun",
      score: 330,
    },
  ];

  const subjectPerformance = [
    {
      subject: "Math",
      score: 82,
    },
    {
      subject: "English",
      score: 75,
    },
    {
      subject: "Physics",
      score: 90,
    },
    {
      subject: "Chemistry",
      score: 78,
    },
  ];

  return (
    <div
      className={`min-h-screen px-4 py-8 md:px-8
      ${
        dark
          ? "bg-[#070B14] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-5">
              <Sparkles
                size={16}
                className="text-purple-400"
              />

              <span className="text-sm text-gray-300">
                Smart Performance Analytics
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent ml-3">
                Analytics
              </span>
            </h1>

            <p className="text-gray-400 mt-4 max-w-2xl text-lg leading-relaxed">
              Monitor your JAMB preparation progress, performance,
              consistency, and study habits.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-3xl px-5 py-4 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <BrainCircuit size={28} />
            </div>

            <div>
              <p className="text-gray-400 text-sm">
                AI Insights
              </p>

              <h2 className="text-xl font-bold mt-1">
                Improving Daily
              </h2>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">
                  Average Score
                </p>

                <h2 className="text-4xl font-black mt-2">
                  {averageScore}
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400">
                <TrendingUp size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">
                  Highest Score
                </p>

                <h2 className="text-4xl font-black mt-2">
                  {highestScore}
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Trophy size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">
                  Study Hours
                </p>

                <h2 className="text-4xl font-black mt-2">
                  {totalStudyHours}
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Clock3 size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">
                  Daily Streak
                </p>

                <h2 className="text-4xl font-black mt-2">
                  24
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400">
                <Flame size={26} />
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid xl:grid-cols-2 gap-7 mb-10">
          {/* AREA CHART */}
          <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  Weekly Progress
                </h2>

                <p className="text-gray-400 mt-1">
                  Your performance trend this week.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Activity size={22} />
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress}>
                  <defs>
                    <linearGradient
                      id="colorScore"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#a855f7"
                        stopOpacity={0.8}
                      />

                      <stop
                        offset="95%"
                        stopColor="#a855f7"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1f2937"
                  />

                  <XAxis
                    dataKey="week"
                    stroke="#9ca3af"
                  />

                  <YAxis stroke="#9ca3af" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#a855f7"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  Subject Analysis
                </h2>

                <p className="text-gray-400 mt-1">
                  Breakdown of your strongest subjects.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                <BookOpen size={22} />
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1f2937"
                  />

                  <XAxis
                    dataKey="subject"
                    stroke="#9ca3af"
                  />

                  <YAxis stroke="#9ca3af" />

                  <Tooltip />

                  <Bar
                    dataKey="score"
                    fill="#ec4899"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
              <Target size={24} />
            </div>

            <h3 className="text-2xl font-bold">
              Goal Progress
            </h3>

            <p className="text-gray-400 mt-3 leading-relaxed">
              You are improving steadily and moving closer toward
              your target JAMB score.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 mb-5">
              <CalendarDays size={24} />
            </div>

            <h3 className="text-2xl font-bold">
              Study Consistency
            </h3>

            <p className="text-gray-400 mt-3 leading-relaxed">
              Your daily study routine has been very consistent this
              month.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-5">
              <BrainCircuit size={24} />
            </div>

            <h3 className="text-2xl font-bold">
              AI Recommendation
            </h3>

            <p className="text-gray-400 mt-3 leading-relaxed">
              Focus more on English comprehension and Chemistry
              calculations for better scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
