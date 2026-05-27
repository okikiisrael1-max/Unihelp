import { useEffect, useState } from "react";

import {
  Bell,
  CalendarDays,
  Clock3,
  Megaphone,
  Sparkles,
  Pin,
  Trash2,
  AlertTriangle,
  Loader2,
  BellRing,
  CheckCheck,
  X,
} from "lucide-react";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  db,
  auth,
} from "../../firebase/config";

export default function Announcements({
  dark,
}) {
  /* =========================================
      STATES
  ========================================= */

  const [announcements, setAnnouncements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("all");

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState(null);

  /* =========================================
      THEME
  ========================================= */

  const bg = dark
    ? "bg-[#070B14] text-white"
    : "bg-[#f5f7ff] text-black";

  const card = dark
    ? "bg-white/5 border-white/10"
    : "bg-white border-gray-200";

  const glass = dark
    ? "bg-black/30 border-white/10"
    : "bg-white border-gray-200";

  /* =========================================
      AUTH
  ========================================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);
        }
      );

    return () => unsubscribe();
  }, []);

  /* =========================================
      FETCH ANNOUNCEMENTS
  ========================================= */

  useEffect(() => {
    const q = query(
      collection(
        db,
        "announcements"
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
          const now =
            Date.now();

          const data =
            snapshot.docs
              .map(
                (doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })
              )
              .filter(
                (item) => {
                  if (
                    !item.expiresAt
                  )
                    return true;

                  const expire =
                    item
                      .expiresAt
                      ?.seconds *
                    1000;

                  return (
                    expire >
                    now
                  );
                }
              );

          setAnnouncements(
            data
          );

          setLoading(
            false
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /* =========================================
      FILTERS
  ========================================= */

  const pinnedAnnouncements =
    announcements.filter(
      (a) =>
        a.pinned ===
        true
    );

  const filteredAnnouncements =
    activeTab ===
    "pinned"
      ? pinnedAnnouncements
      : announcements;

  /* =========================================
      NOTIFICATIONS
  ========================================= */

  const unreadNotifications =
    announcements.filter(
      (
        announcement
      ) => {
        if (
          !currentUser
        )
          return false;

        return !announcement.readBy?.includes(
          currentUser.uid
        );
      }
    );

  const markAsRead =
    async (
      announcementId
    ) => {
      if (
        !currentUser
      )
        return;

      try {
        await updateDoc(
          doc(
            db,
            "announcements",
            announcementId
          ),
          {
            readBy:
              arrayUnion(
                currentUser.uid
              ),
          }
        );
      } catch (err) {
        console.log(
          err
        );
      }
    };

  const markAllAsRead =
    async () => {
      if (
        !currentUser
      )
        return;

      try {
        await Promise.all(
          unreadNotifications.map(
            (
              notification
            ) =>
              updateDoc(
                doc(
                  db,
                  "announcements",
                  notification.id
                ),
                {
                  readBy:
                    arrayUnion(
                      currentUser.uid
                    ),
                }
              )
          )
        );
      } catch (err) {
        console.log(
          err
        );
      }
    };

  /* =========================================
      HELPERS
  ========================================= */

  const formatDate = (
    timestamp
  ) => {
    if (!timestamp)
      return "Recently";

    const date =
      new Date(
        timestamp.seconds *
          1000
      );

    return date.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month:
          "short",
        year:
          "numeric",
      }
    );
  };

  const formatTime = (
    timestamp
  ) => {
    if (!timestamp)
      return "";

    const date =
      new Date(
        timestamp.seconds *
          1000
      );

    return date.toLocaleTimeString(
      "en-NG",
      {
        hour:
          "numeric",
        minute:
          "2-digit",
      }
    );
  };

  const getRemainingTime =
    (expiresAt) => {
      if (!expiresAt)
        return "No expiry";

      const expire =
        expiresAt.seconds *
        1000;

      const now =
        Date.now();

      const diff =
        expire - now;

      if (diff <= 0)
        return "Expired";

      const hours =
        Math.floor(
          diff /
            (1000 *
              60 *
              60)
        );

      const days =
        Math.floor(
          hours / 24
        );

      if (days > 0)
        return `${days}d left`;

      return `${hours}h left`;
    };

  return (
    <div
      className={`min-h-screen md:pt-20 w-full overflow-hidden ${bg}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at top, rgba(99,102,241,0.15), transparent 30%)",
      }}
    >
      {/* =========================================
          MAIN
      ========================================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* =========================================
            TOP BAR
        ========================================= */}

        <div className="flex items-center justify-end mb-5">

          <button
            onClick={() =>
              setShowNotifications(
                true
              )
            }
            className={`relative h-14 w-14 rounded-2xl border flex items-center justify-center transition ${glass}`}
          >
            <BellRing />

            {unreadNotifications.length >
              0 && (
              <div className="absolute -top-1 -right-1 h-6 min-w-6 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {
                  unreadNotifications.length
                }
              </div>
            )}
          </button>
        </div>

        {/* =========================================
            HERO
        ========================================= */}

        <div
          className={`relative overflow-hidden rounded-[36px] border p-6 sm:p-8 mb-8 shadow-xl ${card}`}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">

            {/* LEFT */}

            <div className="flex items-start gap-5">

              <div className="h-16 w-16 shrink-0 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl text-white">
                <Megaphone size={30} />
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black leading-tight">
                  Announcements
                </h1>

                <p className="opacity-70 mt-3 max-w-2xl text-sm sm:text-base">
                  Stay updated with
                  campus notices,
                  school activities,
                  platform updates
                  and important
                  academic info.
                </p>
              </div>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">

              <div
                className={`rounded-3xl p-5 min-w-37.5 border ${card}`}
              >
                <p className="text-sm opacity-60">
                  Total Posts
                </p>

                <h2 className="text-3xl font-black mt-2 text-indigo-500">
                  {
                    announcements.length
                  }
                </h2>
              </div>

              <div
                className={`rounded-3xl p-5 min-w-37.5 border ${card}`}
              >
                <p className="text-sm opacity-60">
                  Unread
                </p>

                <h2 className="text-3xl font-black mt-2 text-red-500">
                  {
                    unreadNotifications.length
                  }
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            FILTERS
        ========================================= */}

        <div className="flex flex-wrap gap-3 mb-8">

          <button
            onClick={() =>
              setActiveTab(
                "all"
              )
            }
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              activeTab ===
              "all"
                ? "bg-indigo-600 text-white"
                : dark
                ? "bg-white/5 hover:bg-white/10"
                : "bg-white hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Updates
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "pinned"
              )
            }
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              activeTab ===
              "pinned"
                ? "bg-yellow-500 text-black"
                : dark
                ? "bg-white/5 hover:bg-white/10"
                : "bg-white hover:bg-gray-100 border border-gray-200"
            }`}
          >
            📌 Pinned
          </button>
        </div>

        {/* =========================================
            LOADING
        ========================================= */}

        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {/* =========================================
            EMPTY
        ========================================= */}

        {!loading &&
          filteredAnnouncements.length ===
            0 && (
            <div
              className={`rounded-[36px] border p-12 text-center ${card}`}
            >
              <Bell
                size={50}
                className="mx-auto opacity-40 mb-4"
              />

              <h2 className="text-2xl font-bold">
                No Announcements
              </h2>

              <p className="opacity-60 mt-2">
                No updates have
                been posted yet.
              </p>
            </div>
          )}

        {/* =========================================
            ANNOUNCEMENTS
        ========================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {filteredAnnouncements.map(
            (
              announcement
            ) => {
              const isUnread =
                currentUser &&
                !announcement.readBy?.includes(
                  currentUser.uid
                );

              return (
                <div
                  key={
                    announcement.id
                  }
                  onClick={() =>
                    markAsRead(
                      announcement.id
                    )
                  }
                  className={`group relative overflow-hidden rounded-[36px] border p-6 transition hover:scale-[1.01] cursor-pointer ${card}`}
                >
                  {/* glow */}

                  <div className="absolute -top-20 -right-20 w-52 h-52 bg-indigo-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition" />

                  {/* unread dot */}

                  {isUnread && (
                    <div className="absolute top-5 left-5 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  )}

                  {/* pin */}

                  {announcement.pinned && (
                    <div className="absolute top-5 right-5">
                      <div className="h-11 w-11 rounded-2xl bg-yellow-500 text-black flex items-center justify-center shadow-lg">
                        <Pin size={18} />
                      </div>
                    </div>
                  )}

                  <div className="relative z-10">

                    {/* top */}

                    <div className="flex items-start gap-4">

                      <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                        <Bell size={24} />
                      </div>

                      <div className="flex-1 pr-14">

                        <h2 className="text-2xl font-black leading-tight">
                          {
                            announcement.title
                          }
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm opacity-70">

                          <div className="flex items-center gap-1">
                            <CalendarDays size={14} />

                            {formatDate(
                              announcement.createdAt
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock3 size={14} />

                            {formatTime(
                              announcement.createdAt
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* body */}

                    <div
                      className={`mt-6 rounded-3xl p-5 ${
                        dark
                          ? "bg-black/20"
                          : "bg-gray-50"
                      }`}
                    >
                      <p className="leading-8 text-[15px] sm:text-base whitespace-pre-wrap">
                        {
                          announcement.message
                        }
                      </p>
                    </div>

                    {/* footer */}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

                      <div className="flex items-center gap-2 flex-wrap">

                        <div className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-semibold">
                          {announcement.category ||
                            "General"}
                        </div>

                        {announcement.important && (
                          <div className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 text-sm font-semibold flex items-center gap-1">
                            <AlertTriangle size={14} />

                            Important
                          </div>
                        )}

                        {isUnread && (
                          <div className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 text-sm font-semibold">
                            New
                          </div>
                        )}
                      </div>

                      <div className="text-sm opacity-70 flex items-center gap-2">
                        <Trash2 size={14} />

                        {getRemainingTime(
                          announcement.expiresAt
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div></div>

      {/* =========================================
          NOTIFICATION MODAL
      ========================================= */}

      {showNotifications && (
        <div className="fixed inset-0 z-501 bg-black/70 backdrop-blur-sm flex justify-end">

          <div
            className={`w-full sm:w-107.5 h-full border-l shadow-2xl overflow-y-auto ${glass}`}
          >
            {/* HEADER */}

            <div className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-black">
                  Notifications
                </h2>

                <p className="text-sm opacity-60 mt-1">
                  {
                    unreadNotifications.length
                  }{" "}
                  unread updates
                </p>
              </div>

              <button
                onClick={() =>
                  setShowNotifications(
                    false
                  )
                }
                className="h-11 w-11 rounded-2xl hover:bg-white/10 flex items-center justify-center"
              >
                <X />
              </button>
            </div>

            {/* ACTION */}

            {unreadNotifications.length >
              0 && (
              <div className="p-4">
                <button
                  onClick={
                    markAllAsRead
                  }
                  className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCheck size={18} />
                  Mark All As Read
                </button>
              </div>
            )}

            {/* LIST */}

            <div className="p-4 space-y-4">

              {announcements.map(
                (
                  item
                ) => {
                  const unread =
                    currentUser &&
                    !item.readBy?.includes(
                      currentUser.uid
                    );

                  return (
                    <button
                      key={
                        item.id
                      }
                      onClick={() =>
                        markAsRead(
                          item.id
                        )
                      }
                      className={`w-full text-left rounded-3xl p-5 border transition hover:scale-[1.01] ${
                        unread
                          ? dark
                            ? "bg-indigo-500/10 border-indigo-500/30"
                            : "bg-indigo-50 border-indigo-200"
                          : glass
                      }`}
                    >
                      <div className="flex items-start gap-4">

                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <BellRing size={20} />
                        </div>

                        <div className="flex-1">

                          <div className="flex items-center justify-between gap-3">

                            <h3 className="font-bold text-base line-clamp-1">
                              {
                                item.title
                              }
                            </h3>

                            {unread && (
                              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                            )}
                          </div>

                          <p className="opacity-70 text-sm mt-2 line-clamp-2">
                            {
                              item.message
                            }
                          </p>

                          <div className="flex items-center gap-3 mt-4 text-xs opacity-60">

                            <div className="flex items-center gap-1">
                              <CalendarDays size={12} />

                              {formatDate(
                                item.createdAt
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock3 size={12} />

                              {formatTime(
                                item.createdAt
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}