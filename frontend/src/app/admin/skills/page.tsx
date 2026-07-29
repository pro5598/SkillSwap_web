"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/api/axios";

interface Category {
  _id: string;
  name: string;
}

interface Skill {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isApproved: boolean;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isApproved, setIsApproved] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [skillsRes] = await Promise.all([
        axiosInstance.get("/skills?all=true")
      ]);
      setSkills(skillsRes.data.data.skills || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const data = { name, description, isActive, isApproved };
      if (editingId) {
        await axiosInstance.put(`/skills/${editingId}`, data);
        setSuccessMsg("Skill updated successfully");
      } else {
        await axiosInstance.post("/skills", data);
        setSuccessMsg("Skill created successfully");
      }
      handleCancel();
      fetchData();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill._id);
    setName(skill.name);
    setDescription(skill.description || "");
    setIsActive(skill.isActive);
    setIsApproved(skill.isApproved);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      await axiosInstance.delete(`/skills/${id}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setIsApproved(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Skills</h1>
      </div>

      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{errorMsg}</div>}
      {successMsg && <div className="p-4 bg-green-100 text-green-700 rounded-lg">{successMsg}</div>}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-black">{editingId ? "Edit Skill" : "Add New Skill"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              />
            </div>
            <div className="flex items-center gap-6 md:col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isApproved"
                  checked={isApproved}
                  onChange={e => setIsApproved(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isApproved" className="text-sm font-medium text-gray-700">Approved</label>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
              {editingId ? "Update Skill" : "Create Skill"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Approval</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading skills...</td></tr>
            ) : skills.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No skills found.</td></tr>
            ) : (
              skills.map(skill => (
                <tr key={skill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{skill.name}</td>
                  <td className="px-6 py-4">{skill.description || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${skill.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {skill.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${skill.isApproved ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {skill.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleEdit(skill)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(skill._id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
