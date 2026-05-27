import { useEffect, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";

import {
  Upload,
  Download,
  Star,
  Search,
  X,
  Loader2,
  FileText,
  Sparkles,
  Bell,
  HelpCircle,
  Send,
  ImageIcon,
  Lock,
  LayoutGrid,
  MessageSquareMore,
  Flame,
  Clock3,
  ChevronRight,
  Crown,
  CheckCircle2,
} from "lucide-react";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import { db, storage } from "../../firebase/config";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default function LectureNotesMarketplace({
  dark,
}) {
  /* ======================================================
      STATES
  ====================================================== */

  const [notes, setNotes] = useState([]);
  const [requests, setRequests] = useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showUpload, setShowUpload] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [compressing, setCompressing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [notifications, setNotifications] =
    useState([]);

  const [requestText, setRequestText] =
    useState("");

  const [file, setFile] = useState(null);

  const [compressedSize, setCompressedSize] =
    useState(0);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [userProfile, setUserProfile] =
    useState(null);

  const [tab, setTab] = useState("notes");

  const [form, setForm] = useState({
    title: "",
    course: "",
    dept: "",
    lecturer: "",
    school: "",
  });

  const auth = getAuth();

  /* ======================================================
      THEME
  ====================================================== */

  const bg = dark
    ? "bg-[#060816] text-white"
    : "bg-[#f5f7ff] text-[#0f172a]";

  const card = dark
    ? "bg-white/[0.04] border border-white/10 backdrop-blur-xl"
    : "bg-white border border-gray-200";

  const input = `
  w-full h-14 rounded-2xl px-4 outline-none transition-all
  ${
    dark
      ? "bg-[#0f172a] border border-white/10 focus:border-indigo-500"
      : "bg-gray-100 border border-gray-200 focus:border-indigo-500"
  }
`;

  /* ======================================================
      AUTH
  ====================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          setCurrentUser(user);

          if (!user) return;

          try {
            const snap =
              await getDoc(
                doc(
                  db,
                  "users",
                  user.uid
                )
              );

            if (snap.exists()) {
              setUserProfile(
                snap.data()
              );
            }
          } catch (err) {
            console.log(err);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  const isPremium =
    userProfile?.premium === true;

  /* ======================================================
      FETCH NOTES
  ====================================================== */

  const fetchNotes = async () => {
    try {
      setLoading(true);

      const snap = await getDocs(
        query(
          collection(db, "notes"),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );

      const data = snap.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      setNotes(data);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ======================================================
      AUTO DELETE REQUESTS AFTER 48H
  ====================================================== */

  useEffect(() => {
    const deleteExpiredRequests =
      async () => {
        try {
          const snap =
            await getDocs(
              collection(
                db,
                "requests"
              )
            );

          const now =
            Date.now();

          snap.forEach(
            async (document) => {
              const data =
                document.data();

              const created =
                data.createdAt
                  ?.seconds *
                1000;

              if (!created) return;

              const diff =
                now - created;

              const hours =
                diff /
                (1000 *
                  60 *
                  60);

              if (
                hours >= 48
              ) {
                await deleteDoc(
                  doc(
                    db,
                    "requests",
                    document.id
                  )
                );
              }
            }
          );
        } catch (err) {
          console.log(err);
        }
      };

    deleteExpiredRequests();
  }, []);

  /* ======================================================
      REQUESTS LISTENER
  ====================================================== */

  useEffect(() => {
    const q = query(
      collection(
        db,
        "requests"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setRequests(data);
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /* ======================================================
      NOTIFICATIONS
  ====================================================== */

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(
        db,
        "notifications"
      ),
      where(
        "userId",
        "==",
        currentUser.uid
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setNotifications(
            data
          );
        }
      );

    return () =>
      unsubscribe();
  }, [currentUser]);

  /* ======================================================
      FILTERED NOTES
  ====================================================== */

  const filtered = useMemo(() => {
    return notes.filter(
      (n) =>
        n.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        n.course
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        n.dept
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );
  }, [notes, search]);

  /* ======================================================
      FILE COMPRESSION
  ====================================================== */

  const compressFile =
    async (file) => {
      try {
        if (
          file.type.startsWith(
            "image/"
          )
        ) {
          return await imageCompression(
            file,
            {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1600,
              useWebWorker: true,
              fileType:
                "image/webp",
            }
          );
        }

        return file;
      } catch (err) {
        console.log(err);

        return file;
      }
    };

  /* ======================================================
      DOWNLOAD ACCESS
  ====================================================== */

  const canDownload = (
    note
  ) => {
    if (!currentUser)
      return false;

    if (
      note.uploadedBy ===
      currentUser.uid
    )
      return true;

    if (isPremium)
      return true;

    return false;
  };

  /* ======================================================
      UPLOAD
  ====================================================== */

  const handleUpload =
    async () => {
      if (!file)
        return alert(
          "Select a file"
        );

      try {
        setUploading(true);
        setCompressing(true);

        const optimizedFile =
          await compressFile(
            file
          );

        setCompressedSize(
          optimizedFile.size
        );

        setCompressing(false);

        const storageRef = ref(
          storage,
          `notes/${Date.now()}-${
            optimizedFile.name
          }`
        );

        const uploadTask =
          uploadBytesResumable(
            storageRef,
            optimizedFile
          );

        uploadTask.on(
          "state_changed",

          (snapshot) => {
            const percent =
              (snapshot.bytesTransferred /
                snapshot.totalBytes) *
              100;

            setProgress(
              Math.round(
                percent
              )
            );
          },

          console.error,

          async () => {
            const url =
              await getDownloadURL(
                uploadTask
                  .snapshot.ref
              );

            await addDoc(
              collection(
                db,
                "notes"
              ),
              {
                ...form,
                fileUrl: url,
                fileName:
                  optimizedFile.name,
                uploadedBy:
                  currentUser?.uid,
                downloads: 0,
                rating: 0,
                createdAt:
                  serverTimestamp(),
              }
            );

            setUploading(
              false
            );

            setShowUpload(
              false
            );

            setProgress(0);

            setFile(null);

            setCompressedSize(0);

            setForm({
              title: "",
              course: "",
              dept: "",
              lecturer:
                "",
              school: "",
            });

            fetchNotes();
          }
        );
      } catch (err) {
        console.log(err);

        setUploading(
          false
        );

        setCompressing(
          false
        );
      }
    };

  /* ======================================================
      DOWNLOAD
  ====================================================== */

  const handleDownload =
    async (note) => {
      if (
        !canDownload(note)
      ) {
        return alert(
          "Premium required 🚀"
        );
      }

      window.open(
        note.fileUrl,
        "_blank"
      );

      try {
        await updateDoc(
          doc(
            db,
            "notes",
            note.id
          ),
          {
            downloads:
              increment(1),
          }
        );

        fetchNotes();
      } catch (err) {
        console.log(err);
      }
    };

  /* ======================================================
      RATING
  ====================================================== */

  const rateNote =
    async (
      noteId,
      value
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "notes",
            noteId
          ),
          {
            rating: value,
          }
        );

        fetchNotes();
      } catch (err) {
        console.log(err);
      }
    };

  /* ======================================================
      REQUEST NOTE
  ====================================================== */

  const submitRequest =
    async () => {
      if (!requestText)
        return;

      try {
        await addDoc(
          collection(
            db,
            "requests"
          ),
          {
            text: requestText,
            userId:
              currentUser?.uid,
            status: "open",
            createdAt:
              serverTimestamp(),
          }
        );

        setRequestText("");

        alert(
          "Request submitted 🚀"
        );
      } catch (err) {
        console.log(err);
      }
    };

  /* ======================================================
      FILE TYPE
  ====================================================== */

  const getFileType = (
    fileName
  ) => {
    if (
      fileName
        ?.toLowerCase()
        .includes(".pdf")
    )
      return "PDF";

    if (
      fileName
        ?.toLowerCase()
        .includes(".doc")
    )
      return "DOC";

    if (
      fileName
        ?.toLowerCase()
        .includes(".ppt")
    )
      return "PPT";

    return "FILE";
  };

  return (
    <div
      className={`min-h-screen w-full overflow-hidden md:pt-20 ${bg}`}
    >
      {/* BACKGROUND */}

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-700 h-700 bg-indigo-600/20 blur-[140px]" />

        <div className="absolute bottom-0 right-0 w-100 h-100 bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className={`${card} sticky top-3 z-50 rounded-4xl p-4 sm:p-6 shadow-2xl`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            {/* LEFT */}

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                <FileText
                  size={30}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-2xl md:text-4xl font-black">
                  Lecture Notes
                </h1>

                <p className="opacity-70 mt-1">
                  Premium campus note sharing experience
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

              {/* SEARCH */}

              <div
                className={`flex items-center gap-3 h-14 px-4 rounded-2xl min-w-full sm:min-w-[320px] ${
                  dark
                    ? "bg-white/5"
                    : "bg-gray-100"
                }`}
              >
                <Search
                  size={18}
                  className="opacity-60"
                />

                <input
                  placeholder="Search notes..."
                  className="bg-transparent outline-none w-full"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              {/* NOTIFICATIONS */}

              <div className="relative">

                <button
                  onClick={() =>
                    setShowNotifications(
                      !showNotifications
                    )
                  }
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    dark
                      ? "bg-white/5"
                      : "bg-gray-100"
                  }`}
                >
                  <Bell size={20} />

                  {notifications.filter(
                    (n) => !n.read
                  ).length > 0 && (
                    <div className="absolute top-1 right-1 min-w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {
                        notifications.filter(
                          (
                            n
                          ) =>
                            !n.read
                        ).length
                      }
                    </div>
                  )}
                </button>

                {/* DROPDOWN */}

                {showNotifications && (
                  <div
                    className={`${card} absolute right-0 mt-3 w-[320px] rounded-3xl overflow-hidden shadow-2xl`}
                  >
                    <div className="p-4 font-semibold border-b border-white/10">
                      Notifications
                    </div>

                    <div className="max-h-100 overflow-y-auto">

                      {notifications.length ===
                      0 ? (
                        <p className="p-5 text-sm opacity-70">
                          No notifications
                        </p>
                      ) : (
                        notifications.map(
                          (
                            n
                          ) => (
                            <div
                              key={
                                n.id
                              }
                              className={`p-4 border-b text-sm ${
                                dark
                                  ? "border-white/5"
                                  : "border-gray-100"
                              }`}
                            >
                              {
                                n.message
                              }
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* UPLOAD */}

              <button
                onClick={() =>
                  setShowUpload(
                    true
                  )
                }
                className="h-14 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Upload size={18} />

                Upload
              </button>
            </div>
          </div>

          {/* ======================================================
              TOGGLE
          ====================================================== */}

          <div className="mt-6 flex items-center gap-3">

            <button
              onClick={() =>
                setTab("notes")
              }
              className={`h-12 px-5 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
                tab === "notes"
                  ? "bg-indigo-600 text-white"
                  : dark
                  ? "bg-white/5"
                  : "bg-gray-100"
              }`}
            >
              <LayoutGrid size={18} />
              Notes
            </button>

            <button
              onClick={() =>
                setTab(
                  "requests"
                )
              }
              className={`h-12 px-5 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
                tab ===
                "requests"
                  ? "bg-green-500 text-white"
                  : dark
                  ? "bg-white/5"
                  : "bg-gray-100"
              }`}
            >
              <MessageSquareMore
                size={18}
              />
              Requests
            </button>
          </div>
        </div>

        {/* ======================================================
            NOTES TAB
        ====================================================== */}

        {tab === "notes" && (
          <div className="mt-6">

            {/* STATS */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              {[
                {
                  label:
                    "Total Notes",
                  value:
                    notes.length,
                  icon:
                    FileText,
                },
                {
                  label:
                    "Downloads",
                  value:
                    notes.reduce(
                      (
                        a,
                        b
                      ) =>
                        a +
                        (b.downloads ||
                          0),
                      0
                    ),
                  icon:
                    Download,
                },
                {
                  label:
                    "Premium",
                  value:
                    isPremium
                      ? "Active"
                      : "Free",
                  icon:
                    Crown,
                },
                {
                  label:
                    "Trending",
                  value: "Hot",
                  icon: Flame,
                },
              ].map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={index}
                    className={`${card} rounded-3xl p-5`}
                  >
                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-sm opacity-60">
                          {
                            item.label
                          }
                        </p>

                        <h2 className="text-3xl font-black mt-2">
                          {
                            item.value
                          }
                        </h2>
                      </div>

                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <item.icon size={24} />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* NOTES */}

            {loading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="animate-spin" />
              </div>
            ) : filtered.length ===
              0 ? (
              <div
                className={`${card} rounded-4xl p-16 text-center`}
              >
                <Sparkles
                  size={50}
                  className="mx-auto opacity-50 mb-4"
                />

                <h2 className="text-2xl font-bold">
                  No notes found
                </h2>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

                {filtered.map(
                  (note) => (
                    <div
                      key={
                        note.id
                      }
                      className={`${card} rounded-4xl p-5 hover:scale-[1.02] transition-all duration-300`}
                    >
                      {/* TOP */}

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h2 className="font-bold text-xl leading-tight">
                            {
                              note.title
                            }
                          </h2>

                          <p className="text-sm opacity-70 mt-2">
                            {
                              note.course
                            }{" "}
                            •{" "}
                            {
                              note.dept
                            }
                          </p>
                        </div>

                        <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-semibold">
                          {getFileType(
                            note.fileName
                          )}
                        </div>
                      </div>

                      {/* MID */}

                      <div className="mt-6 flex items-center justify-between">

                        <div className="flex items-center gap-2">
                          <Star
                            size={18}
                            className="text-yellow-400 fill-yellow-400"
                          />

                          <span className="font-semibold">
                            {note.rating ||
                              0}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm opacity-70">
                          <Download size={16} />
                          {
                            note.downloads
                          }
                        </div>
                      </div>

                      {/* BUTTON */}

                      <button
                        onClick={() =>
                          handleDownload(
                            note
                          )
                        }
                        className={`mt-6 h-14 rounded-2xl w-full font-semibold text-white flex items-center justify-center gap-2 ${
                          canDownload(
                            note
                          )
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-gray-500"
                        }`}
                      >
                        {canDownload(
                          note
                        ) ? (
                          <>
                            <Download
                              size={18}
                            />
                            Download
                          </>
                        ) : (
                          <>
                            <Lock
                              size={18}
                            />
                            Premium
                          </>
                        )}
                      </button>

                      {/* RATING */}

                      <div className="flex items-center justify-center gap-2 mt-5">

                        {[1, 2, 3, 4, 5].map(
                          (
                            star
                          ) => (
                            <button
                              key={
                                star
                              }
                              onClick={() =>
                                rateNote(
                                  note.id,
                                  star
                                )
                              }
                            >
                              <Star
                                size={
                                  18
                                }
                                className="text-yellow-400"
                              />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            REQUEST TAB
        ====================================================== */}

        {tab === "requests" && (
          <div className="mt-6 grid lg:grid-cols-[420px_1fr] gap-6">

            {/* REQUEST FORM */}

            <div
              className={`${card} rounded-4xl p-6 h-fit sticky top-32`}
            >
              <div className="flex items-center gap-4 mb-6">

                <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                  <HelpCircle size={24} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Request Notes
                  </h2>

                  <p className="text-sm opacity-60">
                    Requests auto-delete after 48 hours
                  </p>
                </div>
              </div>

              <textarea
                value={requestText}
                onChange={(e) =>
                  setRequestText(
                    e.target
                      .value
                  )
                }
                placeholder="Need CSC301 Lecture Notes..."
                className={`w-full min-h-45 rounded-3xl p-5 outline-none resize-none ${
                  dark
                    ? "bg-[#0f172a]"
                    : "bg-gray-100"
                }`}
              />

              <button
                onClick={
                  submitRequest
                }
                className="w-full mt-5 h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Submit Request
              </button>
            </div>

            {/* REQUESTS */}

            <div className="space-y-4">

              {requests.length ===
              0 ? (
                <div
                  className={`${card} rounded-4xl p-16 text-center`}
                >
                  <Clock3
                    size={44}
                    className="mx-auto opacity-50 mb-4"
                  />

                  <h2 className="text-2xl font-bold">
                    No active requests
                  </h2>
                </div>
              ) : (
                requests.map(
                  (req) => (
                    <div
                      key={
                        req.id
                      }
                      className={`${card} rounded-[30px] p-5`}
                    >
                      <div className="flex items-start justify-between gap-5">

                        <div>
                          <div className="flex items-center gap-2 mb-3">

                            <CheckCircle2
                              size={
                                18
                              }
                              className={
                                req.status ===
                                "fulfilled"
                                  ? "text-green-500"
                                  : "text-yellow-500"
                              }
                            />

                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
                                req.status ===
                                "fulfilled"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }`}
                            >
                              {
                                req.status
                              }
                            </span>
                          </div>

                          <h2 className="font-semibold text-lg">
                            {
                              req.text
                            }
                          </h2>
                        </div>

                        <button className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          UPLOAD MODAL
      ====================================================== */}

      {showUpload && (
        <div className="fixed inset-0 z-501 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">

          <div
            className={`${card} w-full max-w-2xl rounded-[36px] overflow-hidden shadow-2xl`}
          >
            {/* HEADER */}

            <div className="p-6 border-b border-white/10 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-black">
                  Upload Note
                </h2>

                <p className="text-sm opacity-60 mt-1">
                  Fast upload with optimized compression
                </p>
              </div>

              <button
                onClick={() =>
                  setShowUpload(
                    false
                  )
                }
                className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}

            <div className="p-6 space-y-4">

              {[
                {
                  key: "title",
                  placeholder:
                    "Lecture Note Title",
                },
                {
                  key: "course",
                  placeholder:
                    "Course Code",
                },
                {
                  key: "dept",
                  placeholder:
                    "Department",
                },
                {
                  key: "school",
                  placeholder:
                    "School",
                },
              ].map((item) => (
                <input
                  key={item.key}
                  placeholder={
                    item.placeholder
                  }
                  value={
                    form[item.key]
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [item.key]:
                        e.target
                          .value,
                    })
                  }
                  className={
                    input
                  }
                />
              ))}

              {/* FILE */}

              <label
                className={`rounded-4xl border-2 border-dashed min-h-55 flex flex-col items-center justify-center cursor-pointer ${
                  dark
                    ? "border-white/10 hover:bg-white/5"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Upload
                  size={40}
                  className="opacity-60 mb-4"
                />

                <h2 className="font-semibold text-lg">
                  Upload your file
                </h2>

                <p className="text-sm opacity-60 mt-2">
                  PDF, DOC, PPT, Images
                </p>

                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                  onChange={(e) =>
                    setFile(
                      e.target
                        .files[0]
                    )
                  }
                />
              </label>

              {/* FILE INFO */}

              {file && (
                <div
                  className={`rounded-3xl p-5 ${
                    dark
                      ? "bg-white/5"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <ImageIcon size={22} />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {file.name}
                      </p>

                      <p className="text-xs opacity-60 mt-1">
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(
                          2
                        )}{" "}
                        MB
                      </p>
                    </div>
                  </div>

                  {compressedSize >
                    0 && (
                    <p className="mt-4 text-sm text-green-500">
                      Optimized to{" "}
                      {(
                        compressedSize /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )}{" "}
                      MB
                    </p>
                  )}
                </div>
              )}

              {/* PROGRESS */}

              {uploading && (
                <div>

                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      Uploading...
                    </span>

                    <span>
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full overflow-hidden bg-gray-300">

                    <div
                      style={{
                        width: `${progress}%`,
                      }}
                      className="h-full bg-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* COMPRESSING */}

              {compressing && (
                <div className="text-indigo-500 text-sm flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Compressing file...
                </div>
              )}

              {/* BUTTON */}

              <button
                onClick={
                  handleUpload
                }
                disabled={
                  uploading
                }
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold"
              >
                {uploading
                  ? "Uploading..."
                  : "Compress & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}