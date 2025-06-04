"use client";
import { useState, useEffect } from "react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    status: "active",
  });

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subject", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.data);
      } else {
        console.log("error fetching subjects");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      await fetchSubjects();
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData._id ? "PUT" : "POST";
    const url = "/api/subject";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        await fetchSubjects();
        setFormData({
          name: "",
          description: "",
          image: "",
          status: "active",
        });
      } else {
        console.log("Error saving subject");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openModal = (data = {name:"",description:"",image:"",status:"active"}) => {
    setFormData(data);
    setIsModalOpen(true);
  };

  const deleteSubject = async (id) => {
    try {
      const response = await fetch(`/api/subject?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchSubjects();
      } else {
        console.log("error deleting subject");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-full bg-[#0F172A]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Subjects</h1>
        <button
          onClick={() => openModal()}
          className="bg-[#2563EB] text-[#F8FAFC] px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Add Subject
        </button>
      </div>

      {/* Subjects List */}
      <div className="bg-[#1E293B] rounded-lg shadow-xl overflow-hidden border border-[#334155]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#334155]">
            <thead className="bg-[#1E293B]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {subjects.map((subject) => (
                <tr key={subject._id} className="hover:bg-[#334155] transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-[#F8FAFC]">
                    <div className="flex items-center">
                      <span className="font-medium">{subject.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#F8FAFC]">{subject.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        subject.status === "active"
                          ? "bg-[#059669] bg-opacity-20 text-[#34D399]"
                          : "bg-[#DC2626] bg-opacity-20 text-[#F87171]"
                      }`}
                    >
                      {subject.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openModal(subject)}
                      className="text-[#A78BFA] hover:text-[#FFD700] mr-4 transition-colors duration-150 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSubject(subject._id)}
                      className="text-[#F87171] hover:text-red-400 transition-colors duration-150 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#1E293B] p-8 rounded-lg w-full max-w-md shadow-2xl border border-[#334155]">
            <h2 className="text-2xl font-bold mb-6 text-[#F8FAFC]">
              {formData._id ? "Update Subject" : "Add Subject"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                  required
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-[#334155] rounded-lg text-[#F8FAFC] hover:bg-[#334155] transition-colors duration-150 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2563EB] text-[#F8FAFC] rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium"
                >
                  {formData._id ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
