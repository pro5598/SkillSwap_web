"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";
import { getReviewsForUser } from "@/api/reviews";
import { getAllSkills, proposeSkill, searchSkills } from "@/api/skills";
import MultiSelect from "@/components/MultiSelect";

interface Review {
  _id: string;
  reviewerId: { firstName: string; lastName: string; imageUrl?: string };
  rating: number;
  comment?: string;
  createdAt: string;
}

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
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  
  const [availableSkills, setAvailableSkills] = useState<{ value: string; label: string }[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);

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
      setSkillsOffered(user.skillsOffered || []);
      setSkillsWanted(user.skillsWanted || []);
      if (user.imageUrl) {
        setPreviewImage(`${user.imageUrl}`);
      }

      // Fetch reviews for this user
      const userId = user._id || user.id;
      if (userId) {
        getReviewsForUser(userId).then((res) => {
          setReviews(res.data?.reviews || []);
          setAvgRating(res.data?.averageRating || 0);
        }).catch(() => {});
      }
    }
  }, [user]);

  useEffect(() => {
    // Fetch predefined skills created by admin
    getAllSkills(false).then(res => {
      if (res.data?.data?.skills) {
        const options = res.data.data.skills.map((skill: any) => ({
          value: skill.name,
          label: skill.name
        }));
        setAvailableSkills(options);
      }
    }).catch(err => console.error("Failed to fetch skills", err));
  }, []);

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

  const handleSearchSkills = useCallback(async (query: string) => {
    const res = await searchSkills(query);
    const skills = res.data?.data?.skills || [];
    return skills.map((skill: { name: string }) => ({
      value: skill.name,
      label: skill.name,
    }));
  }, []);

  const handleProposeSkill = async (skillName: string, type: 'offered' | 'wanted') => {
    try {
      const res = await proposeSkill(skillName);
      if (res.data?.data?.skill) {
        const newSkill = res.data.data.skill;
        setAvailableSkills(prev => {
          if (prev.find(s => s.value.toLowerCase() === newSkill.name.toLowerCase())) return prev;
          return [...prev, { value: newSkill.name, label: newSkill.name }];
        });
        if (type === 'offered') {
          setSkillsOffered(prev => {
            if (prev.some(s => s.toLowerCase() === newSkill.name.toLowerCase())) return prev;
            return [...prev, newSkill.name];
          });
        } else {
          setSkillsWanted(prev => {
            if (prev.some(s => s.toLowerCase() === newSkill.name.toLowerCase())) return prev;
            return [...prev, newSkill.name];
          });
        }
        setSuccessMsg(`Skill "${newSkill.name}" added successfully.`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to add skill.");
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
      
      if (skillsOffered.length > 0) {
        formData.append("skillsOffered", JSON.stringify(skillsOffered));
      }
      
      if (skillsWanted.length > 0) {
        formData.append("skillsWanted", JSON.stringify(skillsWanted));
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
                    <MultiSelect 
                      label="Skills Offered"
                      options={availableSkills}
                      selectedValues={skillsOffered}
                      onChange={setSkillsOffered}
                      onPropose={(val) => handleProposeSkill(val, 'offered')}
                      onSearch={handleSearchSkills}
                      placeholder="Select skills you can teach..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <MultiSelect 
                      label="Skills Wanted"
                      options={availableSkills}
                      selectedValues={skillsWanted}
                      onChange={setSkillsWanted}
                      onPropose={(val) => handleProposeSkill(val, 'wanted')}
                      onSearch={handleSearchSkills}
                      placeholder="Select skills you want to learn..."
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

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0D1236]">Reviews Received</h2>
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="text-lg font-semibold text-gray-800">{avgRating}</span>
              <span className="text-sm text-gray-500">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          </div>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {review.reviewerId.imageUrl ? (
                      <img src={review.reviewerId.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold text-sm">{review.reviewerId.firstName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.reviewerId.firstName} {review.reviewerId.lastName}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      ))}
                      <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-600 ml-11">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


