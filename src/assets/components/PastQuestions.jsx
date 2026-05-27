import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";

import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

import {
  FileText,
  Download,
  BookOpen,
  School,
  Calendar,
  User,
  HardDrive,
  Search,
  Star,
  Crown,
  Lock,
} from "lucide-react";

const Questions = ({ dark }) => {
  const [questions, setQuestions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");

  const [bookmarks, setBookmarks] = useState({});

  // PREMIUM STATE
  const [isPremium, setIsPremium] = useState(false);

  // -----------------------------
  // FETCH QUESTIONS
  // -----------------------------
  const fetchQuestions = async () => {
    try {
      const q = query(collection(db, "questions"));
      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(data);
      setFiltered(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FETCH BOOKMARKS
  // -----------------------------
  const fetchBookmarks = async () => {
    try {
      if (!auth.currentUser) return;

      const snap = await getDocs(
        collection(
          db,
          "users",
          auth.currentUser.uid,
          "bookmarks"
        )
      );

      const map = {};

      snap.forEach((doc) => {
        map[doc.id] = true;
      });

      setBookmarks(map);
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // CHECK PREMIUM STATUS
  // -----------------------------
  const fetchPremiumStatus = async () => {
    try {
      if (!auth.currentUser) return;

      const userRef = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();

        // EXPECTED FIELD:
        // premium: true

        setIsPremium(data?.premium === true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchBookmarks();
    fetchPremiumStatus();
  }, []);

  // -----------------------------
  // SEARCH + FILTER
  // -----------------------------
  useEffect(() => {
    let data = [...questions];

    if (search) {
      data = data.filter((q) =>
        `${q.title} ${q.courseCode} ${q.school}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (courseFilter) {
      data = data.filter(
        (q) => q.courseCode === courseFilter
      );
    }

    if (schoolFilter) {
      data = data.filter(
        (q) => q.school === schoolFilter
      );
    }

    setFiltered(data);
  }, [
    search,
    courseFilter,
    schoolFilter,
    questions,
  ]);

  // -----------------------------
  // BOOKMARK TOGGLE
  // -----------------------------
  const toggleBookmark = async (item) => {
    try {
      if (!auth.currentUser) {
        return alert("Login required");
      }

      const ref = doc(
        db,
        "users",
        auth.currentUser.uid,
        "bookmarks",
        item.id
      );

      if (bookmarks[item.id]) {
        await deleteDoc(ref);

        setBookmarks((prev) => {
          const updated = { ...prev };

          delete updated[item.id];

          return updated;
        });
      } else {
        await setDoc(ref, item);

        setBookmarks((prev) => ({
          ...prev,
          [item.id]: true,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // DOWNLOAD CONTROL
  // -----------------------------
  const handleDownload = (url) => {
    if (!auth.currentUser) {
      return alert(
        "Please login to access premium downloads."
      );
    }

    if (!isPremium) {
      return alert(
        "PDF downloads are only available for premium users 🚀"
      );
    }

    window.open(url, "_blank");
  };

  // -----------------------------
  // UNIQUE FILTER OPTIONS
  // -----------------------------
  const courses = [
    ...new Set(
      questions.map((q) => q.courseCode)
    ),
  ];

  const schools = [
    ...new Set(questions.map((q) => q.school)),
  ];

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div
      className={`min-h-screen px-4 py-6 ${
        dark
          ? "bg-[#0b0f1a] text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500 rounded-xl text-white">
              <BookOpen />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Past Questions
              </h1>

              <p className="text-sm opacity-70">
                Discover and download shared academic
                materials
              </p>
            </div>
          </div>

          {/* PREMIUM BADGE */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${
              isPremium
                ? "bg-yellow-500 text-black"
                : dark
                ? "bg-gray-800"
                : "bg-white"
            }`}
          >
            <Crown size={18} />

            {isPremium
              ? "Premium User"
              : "Free User"}
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div
          className={`p-4 rounded-xl flex flex-col md:flex-row gap-3 ${
            dark ? "bg-[#111827]" : "bg-white"
          }`}
        >
          {/* SEARCH */}
          <div className="flex items-center gap-2 flex-1">
            <Search size={18} />

            <input
              placeholder="Search by title, course, school..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full p-2 outline-none bg-transparent"
            />
          </div>

          {/* COURSE FILTER */}
          <select
            value={courseFilter}
            onChange={(e) =>
              setCourseFilter(e.target.value)
            }
            className={`p-2 rounded ${
              dark
                ? "bg-gray-800"
                : "bg-gray-100"
            }`}
          >
            <option value="">
              All Courses
            </option>

            {courses.map((c, i) => (
              <option key={i}>{c}</option>
            ))}
          </select>

          {/* SCHOOL FILTER */}
          <select
            value={schoolFilter}
            onChange={(e) =>
              setSchoolFilter(e.target.value)
            }
            className={`p-2 rounded ${
              dark
                ? "bg-gray-800"
                : "bg-gray-100"
            }`}
          >
            <option value="">
              All Schools
            </option>

            {schools.map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </select>
        </div>

        {/* PREMIUM NOTICE */}
        {!isPremium && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              dark
                ? "bg-yellow-500/10 border-yellow-500/20"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <Lock className="text-yellow-500" />

            <div>
              <h3 className="font-bold">
                Premium Download Required
              </h3>

              <p className="text-sm opacity-70">
                Free users can browse questions but
                cannot download PDFs.
              </p>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && <p>Loading...</p>}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div className="text-center mt-20 opacity-70">
            <FileText
              size={50}
              className="mx-auto mb-3"
            />

            <p>No matching results</p>
          </div>
        )}

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((q) => (
            <div
              key={q.id}
              className={`p-5 rounded-xl shadow-lg ${
                dark
                  ? "bg-[#111827]"
                  : "bg-white"
              }`}
            >
              {/* TITLE */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg text-indigo-500">
                  {q.title}
                </h2>

                <button
                  onClick={() =>
                    toggleBookmark(q)
                  }
                >
                  <Star
                    size={20}
                    className={
                      bookmarks[q.id]
                        ? "text-yellow-400 fill-yellow-400"
                        : "opacity-50"
                    }
                  />
                </button>
              </div>

              {/* META */}
              <div className="text-sm opacity-70 space-y-1 mb-3">
                <p className="flex items-center gap-2">
                  <School size={14} />
                  {q.school}
                </p>

                <p className="flex items-center gap-2">
                  <BookOpen size={14} />
                  {q.courseCode}
                </p>

                <p className="flex items-center gap-2">
                  <Calendar size={14} />
                  {q.year}
                </p>

                <p className="flex items-center gap-2">
                  <User size={14} />
                  {q.userEmail || "Anonymous"}
                </p>
              </div>

              {/* FILES */}
              <div className="space-y-2">
                {q.files?.map((file, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      handleDownload(file.url)
                    }
                    className={`w-full flex items-center justify-between p-3 rounded transition hover:scale-[1.02] ${
                      dark
                        ? "bg-gray-800"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm truncate">
                        {file.name}
                      </span>

                      <span className="text-xs opacity-60 flex items-center gap-1">
                        <HardDrive size={12} />

                        {(file.size / 1024).toFixed(
                          1
                        )}{" "}
                        KB
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPremium && (
                        <Lock
                          size={15}
                          className="text-yellow-500"
                        />
                      )}

                      <Download size={16} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questions;