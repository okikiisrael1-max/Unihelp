import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  auth,
  db,
} from "../../firebase/config";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  signOut,
  updateProfile,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  Calendar,
  Camera,
  Edit3,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Save,
  School,
  ShieldCheck,
  Sparkles,
  User2,
  X,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

const Profile = ({ dark = true }) => {
  const navigate = useNavigate();

  const { user } =
    useContext(AuthContext);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [roleLoading, setRoleLoading] =
    useState(false);

  const [edit, setEdit] =
    useState(false);

  const [msg, setMsg] =
    useState("");

  const [form, setForm] =
    useState({
      username: "",
      school: "",
      department: "",
      level: "",
      bio: "",
      location: "",
    });

  /* ================= THEME ================= */

  const bg = dark
    ? "bg-[#020617] text-white"
    : "bg-[#f8fafc] text-black";

  const glass = dark
    ? "bg-white/5 border border-white/10 backdrop-blur-2xl"
    : "bg-white border border-gray-200";

  const inputStyle = dark
    ? "bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500"
    : "bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:border-indigo-500";

  const softText = dark
    ? "text-white/70"
    : "text-gray-500";

  /* ================= ROLES ================= */

  const roleThemes = {
    university: {
      label: "University",
      gradient:
        "from-indigo-500 to-blue-600",
      icon: (
        <GraduationCap size={22} />
      ),
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      description:
        "Access university dashboard, CGPA tools and campus resources.",
    },

    jamb: {
      label: "JAMB",
      gradient:
        "from-purple-500 to-pink-500",
      icon: (
        <BrainCircuit size={22} />
      ),
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      description:
        "Prepare for JAMB with CBT practice and AI study tools.",
    },
  };

  /* ================= FETCH PROFILE ================= */

  const fetchProfile = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const ref = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setProfile(data);

        setForm({
          username:
            data.username || "",
          school:
            data.school || "",
          department:
            data.department || "",
          level: data.level || "",
          bio: data.bio || "",
          location:
            data.location || "",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      setSaving(true);

      const ref = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      await setDoc(
        ref,
        {
          ...profile,
          ...form,
          updatedAt:
            serverTimestamp(),
        },
        { merge: true }
      );

      await updateProfile(
        auth.currentUser,
        {
          displayName:
            form.username,
        }
      );

      setMsg(
        "Profile updated successfully"
      );

      setEdit(false);

      fetchProfile();
    } catch (error) {
      console.log(error);

      setMsg(
        "Failed to update profile"
      );
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMsg("");
      }, 3000);
    }
  };

  /* ================= SWITCH ROLE ================= */

  const handleRoleSwitch =
    async (role) => {
      if (!auth.currentUser) return;

      try {
        setRoleLoading(true);

        const ref = doc(
          db,
          "users",
          auth.currentUser.uid
        );

        await setDoc(
          ref,
          {
            role,
            updatedAt:
              serverTimestamp(),
          },
          { merge: true }
        );

        setProfile((prev) => ({
          ...prev,
          role,
        }));

        navigate("/");
      } catch (error) {
        console.log(error);
      } finally {
        setRoleLoading(false);
      }
    };

  /* ================= LOGOUT ================= */

  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        navigate("/");
      } catch (error) {
        console.log(error);
      }
    };

  /* ================= INITIAL ================= */

  const initial = useMemo(() => {
    return (
      profile?.username
        ?.charAt(0)
        ?.toUpperCase() || "U"
    );
  }, [profile]);

  const currentRole =
    profile?.role || "university";

  const activeRole =
    roleThemes[currentRole] ||
    roleThemes.university;

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${bg}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-5" />

          <h2 className="text-xl font-bold">
            Loading Profile...
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

      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* HERO */}
      <button onClick={()=> navigate(-1)} className={`left-2.5 top-2.5 p-2.5 bg-inherit rounded-lg flex gap-0.5`}> <ArrowLeft/>Back</button>
        <div
          className={`relative overflow-hidden rounded-[36px] p-6 md:p-10 mb-8 ${glass}`}
        >
          {/* FIXED BUG HERE */}
          <div
            className={`absolute inset-0 opacity-10 bg-linear-to-br ${activeRole.gradient}`}
          />

          <div className="relative z-10 flex flex-col xl:flex-row gap-8 xl:items-center xl:justify-between">
            {/* LEFT */}

            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              {/* AVATAR */}

              <div className="relative mx-auto md:mx-0">
                <div
                  className={`w-32 h-32 rounded-full bg-gradient-to-br ${activeRole.gradient} flex items-center justify-center text-white text-5xl font-black shadow-2xl overflow-hidden`}
                >
                  {profile?.photo ? (
                    <img
                      src={
                        profile.photo
                      }
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>

                <button className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-indigo-500 hover:bg-indigo-600 transition flex items-center justify-center text-white shadow-lg">
                  <Camera size={18} />
                </button>
              </div>

              {/* INFO */}

              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                  <h1 className="text-3xl md:text-5xl font-black break-words">
                    {profile?.username ||
                      "Student"}
                  </h1>

                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${activeRole.bg} ${activeRole.text}`}
                  >
                    {activeRole.icon}
                    {activeRole.label}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 justify-center md:justify-start mt-3 flex-wrap ${softText}`}
                >
                  <Mail size={16} />

                  <span className="break-all">
                    {user?.email}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mt-5">
                  <div
                    className={`px-4 py-2 rounded-full ${glass} flex items-center gap-2`}
                  >
                    <ShieldCheck
                      size={16}
                      className="text-green-500"
                    />

                    <span className="text-sm font-medium">
                      Secure Account
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full ${glass} flex items-center gap-2`}
                  >
                    <Sparkles
                      size={16}
                      className="text-yellow-400"
                    />

                    <span className="text-sm font-medium">
                      Smart Learning
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
              <button
                onClick={() =>
                  setEdit(!edit)
                }
                className="h-14 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {edit ? (
                  <>
                    <X size={18} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3
                      size={18}
                    />
                    Edit Profile
                  </>
                )}
              </button>

              <button
                onClick={
                  handleLogout
                }
                className="h-14 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut
                  size={18}
                />

                Logout
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGE */}

        {msg && (
          <div className="mb-6">
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl p-4 text-sm text-center">
              {msg}
            </div>
          </div>
        )}

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* LEFT */}

          <div className="xl:col-span-2 space-y-8">
            {/* ROLE SWITCH */}

            <div
              className={`rounded-[32px] p-6 md:p-8 ${glass}`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black">
                    Switch Dashboard
                  </h2>

                  <p
                    className={`mt-1 ${softText}`}
                  >
                    Change your learning
                    experience instantly.
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <LayoutDashboard size={24} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(
                  roleThemes
                ).map(
                  ([key, value]) => (
                    <button
                      key={key}
                      disabled={
                        roleLoading
                      }
                      onClick={() =>
                        handleRoleSwitch(
                          key
                        )
                      }
                      className={`relative overflow-hidden rounded-[32px] p-7 border transition-all duration-300 text-left hover:scale-[1.02]
                      ${
                        currentRole ===
                        key
                          ? "border-indigo-500 bg-white/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      {/* FIXED BUG HERE */}
                      <div
                        className={`absolute inset-0 opacity-10 bg-gradient-to-br ${value.gradient}`}
                      />

                      <div className="relative z-10">
                        <div
                          className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mb-6`}
                        >
                          {value.icon}
                        </div>

                        <h3 className="text-2xl font-black">
                          {value.label}
                        </h3>

                        <p
                          className={`mt-4 leading-relaxed ${softText}`}
                        >
                          {
                            value.description
                          }
                        </p>

                        <div className="mt-7 flex items-center justify-between">
                          {currentRole ===
                          key ? (
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                              <CheckCircle2 size={16} />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                              Switch Role
                              <ArrowRight size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* EDIT PROFILE */}

            {edit && (
              <div
                className={`rounded-[32px] p-6 md:p-8 ${glass}`}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <Edit3 className="text-indigo-500" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black">
                      Edit Profile
                    </h2>

                    <p
                      className={
                        softText
                      }
                    >
                      Update your
                      account details
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    {
                      label:
                        "Username",
                      key: "username",
                    },

                    {
                      label:
                        "School",
                      key: "school",
                    },

                    {
                      label:
                        "Department",
                      key:
                        "department",
                    },

                    {
                      label:
                        "Level",
                      key: "level",
                    },

                    {
                      label:
                        "Location",
                      key:
                        "location",
                      full: true,
                    },
                  ].map((field) => (
                    <div
                      key={field.key}
                      className={
                        field.full
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      <label className="text-sm font-medium mb-2 block opacity-80">
                        {
                          field.label
                        }
                      </label>

                      <input
                        type="text"
                        value={
                          form[
                            field.key
                          ]
                        }
                        onChange={(
                          e
                        ) =>
                          setForm({
                            ...form,
                            [field.key]:
                              e.target
                                .value,
                          })
                        }
                        className={`w-full h-14 px-4 rounded-2xl outline-none transition-all ${inputStyle}`}
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block opacity-80">
                      Bio
                    </label>

                    <textarea
                      rows="5"
                      value={form.bio}
                      onChange={(
                        e
                      ) =>
                        setForm({
                          ...form,
                          bio: e
                            .target
                            .value,
                        })
                      }
                      className={`w-full p-4 rounded-2xl outline-none transition-all resize-none ${inputStyle}`}
                    />
                  </div>
                </div>

                <button
                  onClick={
                    handleSave
                  }
                  disabled={saving}
                  className={`mt-8 w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all ${
                    saving
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600"
                  }`}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save
                        size={18}
                      />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT */}

          <div className="space-y-8">
            {/* ABOUT */}

            <div
              className={`rounded-[32px] p-6 ${glass}`}
            >
              <h2 className="text-2xl font-black mb-6">
                About User
              </h2>

              <div className="space-y-5">
                {[
                  {
                    label:
                      "Username",
                    value:
                      profile?.username ||
                      "Not Added",
                    icon: (
                      <User2 className="text-indigo-500" />
                    ),
                    bg: "bg-indigo-500/10",
                  },

                  {
                    label:
                      "School",
                    value:
                      profile?.school ||
                      "Not Added",
                    icon: (
                      <School className="text-green-500" />
                    ),
                    bg: "bg-green-500/10",
                  },

                  {
                    label:
                      "Department",
                    value:
                      profile?.department ||
                      "Not Added",
                    icon: (
                      <GraduationCap className="text-orange-500" />
                    ),
                    bg: "bg-orange-500/10",
                  },

                  {
                    label:
                      "Location",
                    value:
                      profile?.location ||
                      "Not Added",
                    icon: (
                      <MapPin className="text-pink-500" />
                    ),
                    bg: "bg-pink-500/10",
                  },
                ].map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}
                      >
                        {
                          item.icon
                        }
                      </div>

                      <div>
                        <p
                          className={`text-sm ${softText}`}
                        >
                          {
                            item.label
                          }
                        </p>

                        <h3 className="font-bold mt-1 break-words">
                          {
                            item.value
                          }
                        </h3>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* STATS */}

            <div
              className={`rounded-[32px] p-6 ${glass}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black">
                    Activity
                  </h2>

                  <p
                    className={`mt-1 ${softText}`}
                  >
                    Your platform
                    statistics
                  </p>
                </div>

                <Sparkles className="text-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title:
                      "Uploads",
                    value: "0",
                    icon: (
                      <BookOpen />
                    ),
                    gradient:
                      "from-indigo-500 to-purple-600",
                  },

                  {
                    title:
                      "Joined",
                    value:
                      auth.currentUser?.metadata?.creationTime?.slice(
                        4,
                        16
                      ) || "2026",
                    icon: (
                      <Calendar />
                    ),
                    gradient:
                      "from-pink-500 to-rose-500",
                  },
                ].map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className={`${glass} rounded-3xl p-5`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5`}
                      >
                        {
                          item.icon
                        }
                      </div>

                      <p
                        className={`text-sm ${softText}`}
                      >
                        {
                          item.title
                        }
                      </p>

                      <h3 className="text-2xl font-black mt-2 break-words">
                        {
                          item.value
                        }
                      </h3>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;