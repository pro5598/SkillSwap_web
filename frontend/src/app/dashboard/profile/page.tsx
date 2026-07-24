"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";

export default function ProfilePage() {
  const { user, checkSession } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [bio, setBio] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [location, setLocation] = useState("");
  const [availabilitySchedule, setAvailabilitySchedule] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setPhoneNumber(user.phoneNumber || "");
      setBio(user.bio || "");
      setExperienceLevel(user.experienceLevel || "");
      setLocation(user.location || "");
      setAvailabilitySchedule(user.availabilitySchedule || "");
      setSkillsOffered(user.skillsOffered?.join(", ") || "");
      setSkillsWanted(user.skillsWanted?.join(", ") || "");
      if (user.imageUrl) {
        setPreviewImage(`${user.imageUrl}`);
      }
    }
  }, [user]);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("username", username);
      formData.append("phoneNumber", phoneNumber);
      formData.append("bio", bio);
      formData.append("experienceLevel", experienceLevel);
      formData.append("location", location);
      formData.append("availabilitySchedule", availabilitySchedule);
      
      if (skillsOffered) {
        const skillsArray = skillsOffered.split(",").map(s => s.trim()).filter(s => s);
        formData.append("skillsOffered", JSON.stringify(skillsArray));
      }
      
      if (skillsWanted) {
        const skillsArray = skillsWanted.split(",").map(s => s.trim()).filter(s => s);
        formData.append("skillsWanted", JSON.stringify(skillsArray));
      }

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      if (newPassword) {
        formData.append("currentPassword", currentPassword);
        formData.append("newPassword", newPassword);
      }

      const response = await axiosInstance.put("/user/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMsg("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Update session to get the new data
      await checkSession();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-[#E2E8F0]">
        <div className="border-b border-[#E2E8F0] pb-6">
          <h1 className="text-3xl font-extrabold text-[#0D1236]">User Profile </h1>
          <p className="mt-2 text-sm text-[#4A5568]">
            Update your personal details and change your password.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#F8F9FE] shadow-md bg-gray-100 flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">
                      {firstName.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-[#F4A261] p-2 rounded-full text-white shadow-lg hover:bg-[#e28f4f] transition-transform transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">Click icon to change picture</p>
            </div>

            {/* Profile Details Section */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#0D1236] border-b pb-2 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-black font-medium cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
                  </div>
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-[#0D1236] border-b pb-2 mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium resize-none"
                      placeholder="Tell us a little bit about yourself..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Availability Schedule</label>
                    <input
                      type="text"
                      value={availabilitySchedule}
                      onChange={(e) => setAvailabilitySchedule(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                      placeholder="e.g. Weekends, Mon-Fri Evenings"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Skills Offered (comma separated)</label>
                    <input
                      type="text"
                      value={skillsOffered}
                      onChange={(e) => setSkillsOffered(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                      placeholder="e.g. React, Python, Guitar"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Skills Wanted (comma separated)</label>
                    <input
                      type="text"
                      value={skillsWanted}
                      onChange={(e) => setSkillsWanted(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                      placeholder="e.g. Spanish, SEO, Piano"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-[#0D1236] mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A5568] mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!currentPassword}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A5568] mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={!newPassword}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-transparent outline-none transition-all text-black font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-[#0D1236] hover:bg-[#1a235c] text-white font-semibold rounded-lg transition-colors shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


