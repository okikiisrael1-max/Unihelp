import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  CheckCircle2,
  Clock3,
  Crown,
  Eye,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  User2,
  Wallet,
  XCircle,
  RefreshCw,
  Filter,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";

import { db } from "../../firebase/config";

const AdminSubscriptionPanel = ({
  dark = true,
}) => {
  /**
   * ====================================
   * STATES
   * ====================================
   */

  const [loading, setLoading] =
    useState(true);

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [processingId, setProcessingId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  /**
   * ====================================
   * THEME
   * ====================================
   */

  const bg = dark
    ? "bg-[#050816] text-white"
    : "bg-slate-100 text-slate-900";

  const card = dark
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
    : "bg-white border border-slate-200 shadow-sm";

  const soft = dark
    ? "text-slate-400"
    : "text-slate-500";

  const input = dark
    ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500"
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";

  /**
   * ====================================
   * FETCH DATA
   * ====================================
   */

  const fetchSubscriptions =
    async () => {
      try {
        setLoading(true);

        const q = query(
          collection(
            db,
            "subscriptions"
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        );

        const snapshot =
          await getDocs(q);

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setSubscriptions(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  /**
   * ====================================
   * APPROVE
   * ====================================
   */

  const approvePayment =
    async (userId) => {
      try {
        setProcessingId(userId);

        await updateDoc(
          doc(
            db,
            "subscriptions",
            userId
          ),
          {
            "subscription.status":
              "approved",

            "subscription.active":
              true,

            reviewed: true,

            approvedAt:
              serverTimestamp(),
          }
        );

        fetchSubscriptions();
      } catch (error) {
        console.log(error);
      } finally {
        setProcessingId("");
      }
    };

  /**
   * ====================================
   * REJECT
   * ====================================
   */

  const rejectPayment =
    async (userId) => {
      try {
        setProcessingId(userId);

        await updateDoc(
          doc(
            db,
            "subscriptions",
            userId
          ),
          {
            "subscription.status":
              "rejected",

            "subscription.active":
              false,

            reviewed: true,

            rejectedAt:
              serverTimestamp(),
          }
        );

        fetchSubscriptions();
      } catch (error) {
        console.log(error);
      } finally {
        setProcessingId("");
      }
    };

  /**
   * ====================================
   * FILTERED USERS
   * ====================================
   */

  const filteredUsers =
    useMemo(() => {
      return subscriptions.filter(
        (item) => {
          const matchesSearch =
            item?.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            item?.email
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "all"
              ? true
              : item?.subscription
                  ?.status ===
                filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      subscriptions,
      search,
      filter,
    ]);

  /**
   * ====================================
   * STATS
   * ====================================
   */

  const stats = useMemo(() => {
    return {
      total:
        subscriptions.length,

      approved:
        subscriptions.filter(
          (item) =>
            item?.subscription
              ?.status ===
            "approved"
        ).length,

      pending:
        subscriptions.filter(
          (item) =>
            item?.subscription
              ?.status ===
            "pending"
        ).length,

      rejected:
        subscriptions.filter(
          (item) =>
            item?.subscription
              ?.status ===
            "rejected"
        ).length,
    };
  }, [subscriptions]);

  /**
   * ====================================
   * LOADING
   * ====================================
   */

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${bg}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-5" />

          <h2 className="text-2xl font-black">
            Loading Admin Panel...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${bg}`}
    >
      {/* BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-purple-500/10 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      {/* MAIN */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* HEADER */}

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold mb-5">
            <Sparkles size={16} />
            Subscription Management
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black">
                Admin Panel
              </h1>

              <p
                className={`mt-3 ${soft}`}
              >
                Review and approve
                premium subscription
                payments manually.
              </p>
            </div>

            <button
              onClick={
                fetchSubscriptions
              }
              className="h-14 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 transition-all text-white font-semibold flex items-center justify-center gap-3"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* TOTAL */}

          <div
            className={`${card} rounded-[30px] p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={soft}>
                  Total Users
                </p>

                <h2 className="text-4xl font-black mt-3">
                  {stats.total}
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <User2 className="text-indigo-500" />
              </div>
            </div>
          </div>

          {/* APPROVED */}

          <div
            className={`${card} rounded-[30px] p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={soft}>
                  Approved
                </p>

                <h2 className="text-4xl font-black mt-3 text-green-400">
                  {
                    stats.approved
                  }
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="text-green-500" />
              </div>
            </div>
          </div>

          {/* PENDING */}

          <div
            className={`${card} rounded-[30px] p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={soft}>
                  Pending
                </p>

                <h2 className="text-4xl font-black mt-3 text-yellow-400">
                  {stats.pending}
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                <Clock3 className="text-yellow-500" />
              </div>
            </div>
          </div>

          {/* REJECTED */}

          <div
            className={`${card} rounded-[30px] p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={soft}>
                  Rejected
                </p>

                <h2 className="text-4xl font-black mt-3 text-red-400">
                  {
                    stats.rejected
                  }
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <div
          className={`${card} rounded-[30px] p-5 mb-8`}
        >
          <div className="flex flex-col lg:flex-row gap-5">
            {/* SEARCH */}

            <div className="flex-1 relative">
              <Search
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${soft}`}
              />

              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className={`w-full h-14 rounded-2xl border pl-12 pr-4 outline-none transition-all ${input}`}
              />
            </div>

            {/* FILTER */}

            <div className="relative">
              <Filter
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${soft}`}
              />

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value
                  )
                }
                className={`h-14 rounded-2xl border pl-12 pr-10 outline-none transition-all ${input}`}
              >
                <option value="all">
                  All
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="grid xl:grid-cols-3 gap-8">
          {/* USERS */}

          <div className="xl:col-span-2 space-y-5">
            {filteredUsers.length ===
            0 ? (
              <div
                className={`${card} rounded-[35px] p-10 text-center`}
              >
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-5">
                  <Wallet className="text-purple-500" />
                </div>

                <h2 className="text-2xl font-black">
                  No Subscriptions
                </h2>

                <p
                  className={`mt-3 ${soft}`}
                >
                  No users found
                </p>
              </div>
            ) : (
              filteredUsers.map(
                (item) => {
                  const status =
                    item
                      ?.subscription
                      ?.status;

                  return (
                    <div
                      key={item.id}
                      className={`${card} rounded-[35px] p-6`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* LEFT */}

                        <div className="flex items-start gap-5">
                          <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-xl">
                            {item?.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="text-2xl font-black">
                                {
                                  item.name
                                }
                              </h2>

                              {status ===
                                "approved" && (
                                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">
                                  Approved
                                </div>
                              )}

                              {status ===
                                "pending" && (
                                <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-semibold">
                                  Pending
                                </div>
                              )}

                              {status ===
                                "rejected" && (
                                <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                                  Rejected
                                </div>
                              )}
                            </div>

                            <p
                              className={`mt-2 ${soft}`}
                            >
                              {
                                item.email
                              }
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Crown
                                  size={
                                    16
                                  }
                                  className="text-yellow-500"
                                />

                                <span>
                                  UniHelp
                                  Premium
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Wallet
                                  size={
                                    16
                                  }
                                  className="text-green-500"
                                />

                                <span>
                                  ₦2,500
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              setSelectedUser(
                                item
                              )
                            }
                            className={`h-12 px-5 rounded-2xl flex items-center gap-2 transition-all ${
                              dark
                                ? "bg-white/10 hover:bg-white/20"
                                : "bg-slate-200 hover:bg-slate-300"
                            }`}
                          >
                            <Eye
                              size={18}
                            />
                            View
                          </button>

                          <button
                            disabled={
                              processingId ===
                                item.id ||
                              status ===
                                "approved"
                            }
                            onClick={() =>
                              approvePayment(
                                item.id
                              )
                            }
                            className={`h-12 px-5 rounded-2xl text-white font-semibold flex items-center gap-2 transition-all ${
                              status ===
                              "approved"
                                ? "bg-green-700 opacity-60 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {processingId ===
                            item.id ? (
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2
                                size={18}
                              />
                            )}

                            Approve
                          </button>

                          <button
                            disabled={
                              processingId ===
                                item.id ||
                              status ===
                                "rejected"
                            }
                            onClick={() =>
                              rejectPayment(
                                item.id
                              )
                            }
                            className={`h-12 px-5 rounded-2xl text-white font-semibold flex items-center gap-2 transition-all ${
                              status ===
                              "rejected"
                                ? "bg-red-700 opacity-60 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            <XCircle
                              size={18}
                            />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>

          {/* DETAILS */}

          <div
            className={`${card} rounded-[35px] p-6 h-fit sticky top-5`}
          >
            {!selectedUser ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="text-purple-500" />
                </div>

                <h2 className="text-2xl font-black">
                  User Details
                </h2>

                <p
                  className={`mt-3 ${soft}`}
                >
                  Select a user to
                  view payment proof
                </p>
              </div>
            ) : (
              <div>
                {/* TOP */}

                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-3xl mx-auto">
                    {selectedUser?.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <h2 className="text-3xl font-black mt-5">
                    {
                      selectedUser.name
                    }
                  </h2>

                  <p
                    className={`mt-2 ${soft}`}
                  >
                    {
                      selectedUser.email
                    }
                  </p>
                </div>

                {/* DETAILS */}

                <div className="mt-8 space-y-5">
                  <div
                    className={`rounded-3xl p-5 ${dark ? "bg-white/5" : "bg-slate-50"}`}
                  >
                    <p
                      className={`text-sm ${soft}`}
                    >
                      Plan
                    </p>

                    <h3 className="text-xl font-black mt-2">
                      UniHelp Premium
                    </h3>
                  </div>

                  <div
                    className={`rounded-3xl p-5 ${dark ? "bg-white/5" : "bg-slate-50"}`}
                  >
                    <p
                      className={`text-sm ${soft}`}
                    >
                      Amount
                    </p>

                    <h3 className="text-xl font-black mt-2">
                      ₦2,500
                    </h3>
                  </div>

                  <div
                    className={`rounded-3xl p-5 ${dark ? "bg-white/5" : "bg-slate-50"}`}
                  >
                    <p
                      className={`text-sm ${soft}`}
                    >
                      Status
                    </p>

                    <div className="mt-3">
                      {selectedUser
                        ?.subscription
                        ?.status ===
                        "approved" && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400">
                          <BadgeCheck
                            size={16}
                          />
                          Approved
                        </div>
                      )}

                      {selectedUser
                        ?.subscription
                        ?.status ===
                        "pending" && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                          <Clock3
                            size={16}
                          />
                          Pending
                        </div>
                      )}

                      {selectedUser
                        ?.subscription
                        ?.status ===
                        "rejected" && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400">
                          <XCircle
                            size={16}
                          />
                          Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PAYMENT PROOF */}

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-black">
                      Payment Proof
                    </h3>

                    {selectedUser?.paymentProof && (
                      <a
                        href={
                          selectedUser.paymentProof
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 flex items-center gap-2 text-sm font-semibold"
                      >
                        Open
                        <ArrowUpRight
                          size={16}
                        />
                      </a>
                    )}
                  </div>

                  {selectedUser?.paymentProof ? (
                    <img
                      src={
                        selectedUser.paymentProof
                      }
                      alt="payment-proof"
                      className="w-full rounded-[28px] border border-white/10 object-cover"
                    />
                  ) : (
                    <div
                      className={`rounded-[28px] p-10 text-center ${dark ? "bg-white/5" : "bg-slate-50"}`}
                    >
                      <p
                        className={
                          soft
                        }
                      >
                        No proof uploaded
                      </p>
                    </div>
                  )}
                </div>

                {/* QUICK ACTIONS */}

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={() =>
                      approvePayment(
                        selectedUser.id
                      )
                    }
                    className="h-12 rounded-2xl bg-green-600 hover:bg-green-700 transition-all text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2
                      size={18}
                    />
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectPayment(
                        selectedUser.id
                      )
                    }
                    className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 transition-all text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <XCircle
                      size={18}
                    />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionPanel;