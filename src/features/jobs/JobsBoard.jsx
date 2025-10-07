/*import React, { useState, useEffect } from "react";
import { db } from "../../db/indexedDB";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Modal from "react-modal";

Modal.setAppElement("#root");

export const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobTags, setJobTags] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const navigate = useNavigate();
  const pageSize = 5;

  useEffect(() => {
    const loadJobs = async () => {
      const allJobs = await db.jobs.toArray();
      setJobs(allJobs.sort((a,b) => a.order - b.order));
    };
    loadJobs();
  }, []);

  useEffect(() => {
    let filtered = [...jobs];
    if (search) filtered = filtered.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) filtered = filtered.filter(j => j.status === statusFilter);
    if (tagFilter) filtered = filtered.filter(j => j.tags?.includes(tagFilter));
    setFilteredJobs(filtered);
    setPage(1);
  }, [search, statusFilter, tagFilter, jobs]);

  const openModal = (job=null) => {
    if (job) {
      setEditingJob(job);
      setJobTitle(job.title);
      setJobTags(job.tags?.join(", ") || "");
    } else {
      setEditingJob(null);
      setJobTitle("");
      setJobTags("");
    }
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const saveJob = async () => {
    if (!jobTitle) return alert("Title required");
    const slug = jobTitle.toLowerCase().replace(/\s+/g, "-");
    const exists = await db.jobs.where("slug").equals(slug).count();
    if (exists && (!editingJob || editingJob.slug !== slug)) return alert("Slug must be unique");

    if (editingJob) {
      const updatedJob = { ...editingJob, title: jobTitle, slug, tags: jobTags.split(",").map(t=>t.trim()).filter(t=>t) };
      await db.jobs.put(updatedJob);
      setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    } else {
      const newJob = {
        id: uuidv4(),
        title: jobTitle,
        slug,
        status: "active",
        order: jobs.length,
        tags: jobTags.split(",").map(t=>t.trim()).filter(t=>t)
      };
      await db.jobs.add(newJob);
      setJobs([...jobs, newJob]);
    }
    closeModal();
  };

  const toggleStatus = async (job) => {
    const updatedJob = { ...job, status: job.status === "active" ? "archived" : "active" };
    await db.jobs.put(updatedJob);
    setJobs(jobs.map(j => j.id === job.id ? updatedJob : j));
  };

  const deleteJob = async (job) => {
    if (window.confirm(`Delete job "${job.title}"?`)) {
      await db.jobs.delete(job.id);
      setJobs(jobs.filter(j => j.id !== job.id));
    }
  };

  const goToJob = (job) => navigate(`/jobs/${job.id}`);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(jobs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    items.forEach((j,i) => j.order = i);
    setJobs(items);
    try {
      if (Math.random() < 0.1) throw new Error("Random failure");
      for (let j of items) await db.jobs.put(j);
    } catch (err) {
      alert("Reorder failed, rolling back");
      setJobs([...jobs]);
    }
  };

  const paginatedJobs = filteredJobs.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-600">Jobs Board</h2>
        <button onClick={() => openModal()} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Add Job</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-1/3"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <input
          type="text"
          placeholder="Filter by tag..."
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          className="p-2 border rounded w-1/3"
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jobs">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {paginatedJobs.map((job, idx) => (
                <Draggable key={job.id} draggableId={job.id} index={idx}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between p-4 mb-4 bg-white rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                     
                        <span {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600 text-xl">☰</span>

                       
                        <div className="flex items-center justify-center w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-center text-sm">
                          {job.title.length > 2 ? job.title.substring(0,2).toUpperCase() : job.title}
                        </div>

                        <div>
                          <div className="font-medium text-lg">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.status}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => openModal(job)} className="text-green-600 hover:underline text-sm">Edit</button>
                        <button onClick={() => toggleStatus(job)} className="text-blue-600 hover:underline text-sm">
                          {job.status === "active" ? "Archive" : "Unarchive"}
                        </button>
                        <button onClick={() => deleteJob(job)} className="text-red-600 hover:underline text-sm">Delete</button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-center gap-2 mt-4">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-2 py-1 border rounded hover:bg-gray-100">Prev</button>
        <span className="px-2 py-1">Page {page}/{totalPages}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-2 py-1 border rounded hover:bg-gray-100">Next</button>
      </div>

      
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="bg-white p-6 rounded-lg max-w-lg mx-auto mt-20 outline-none shadow-lg"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">{editingJob ? "Edit Job" : "Create Job"}</h2>
        <input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={jobTags}
          onChange={e => setJobTags(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
          <button onClick={saveJob} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
        </div>
      </Modal>
    </div>
  );
};
*/

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Modal from "react-modal";

Modal.setAppElement("#root");

export const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobTags, setJobTags] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const navigate = useNavigate();
  const pageSize = 5;

  // Load jobs from Mirage
  const loadJobs = async () => {
    const query = new URLSearchParams({
      search,
      status: statusFilter,
    });
    const res = await fetch(`/jobs?${query.toString()}`);
    const data = await res.json();
    setJobs(data.sort((a, b) => a.order - b.order));
  };

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter]);

  useEffect(() => {
    let filtered = [...jobs];
    if (tagFilter) filtered = filtered.filter(j => j.tags?.includes(tagFilter));
    setFilteredJobs(filtered);
    setPage(1);
  }, [tagFilter, jobs]);

  const openModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setJobTitle(job.title);
      setJobTags(job.tags?.join(", ") || "");
    } else {
      setEditingJob(null);
      setJobTitle("");
      setJobTags("");
    }
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const saveJob = async () => {
    if (!jobTitle) return alert("Title required");
    const slug = jobTitle.toLowerCase().replace(/\s+/g, "-");
    const body = {
      title: jobTitle,
      slug,
      tags: jobTags.split(",").map(t => t.trim()).filter(t => t),
    };

    if (editingJob) {
      const res = await fetch(`/jobs/${editingJob.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const updatedJob = await res.json();
      setJobs(jobs.map(j => (j.id === updatedJob.id ? updatedJob : j)));
    } else {
      const res = await fetch("/jobs", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const newJob = await res.json();
      setJobs([...jobs, newJob]);
    }
    closeModal();
  };

  const toggleStatus = async (job) => {
    const updatedJob = { ...job, status: job.status === "active" ? "archived" : "active" };
    const res = await fetch(`/jobs/${job.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: updatedJob.status }),
    });
    const data = await res.json();
    setJobs(jobs.map(j => (j.id === data.id ? data : j)));
  };

  const deleteJob = async (job) => {
    if (window.confirm(`Delete job "${job.title}"?`)) {
      await fetch(`/jobs/${job.id}`, { method: "DELETE" });
      setJobs(jobs.filter(j => j.id !== job.id));
    }
  };

  const goToJob = (job) => navigate(`/jobs/${job.id}`);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(jobs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    items.forEach((j, i) => j.order = i);
    setJobs(items);

    // Update order in Mirage
    for (let j of items) {
      await fetch(`/jobs/${j.id}`, { method: "PATCH", body: JSON.stringify({ order: j.order }) });
    }
  };

  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  return (
    <div className="p-4 max-w-6xl mx-auto bg-violet-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-violet-950">Jobs Board</h2>
        <button onClick={() => openModal()} className="bg-violet-800 text-white px-3 py-1 rounded hover:bg-violet-900">Add Job</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-1/3 bg-violet-100 text-violet-900"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded bg-violet-100 text-violet-900">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <input
          type="text"
          placeholder="Filter by tag..."
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          className="p-2 border rounded w-1/3 bg-violet-100 text-violet-900"
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jobs">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {paginatedJobs.map((job, idx) => (
                <Draggable key={job.id} draggableId={job.id} index={idx}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between p-4 mb-4 bg-violet-100 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span {...provided.dragHandleProps} className="cursor-grab text-violet-400 hover:text-violet-600 text-xl">☰</span>
                        <div className="flex items-center justify-center w-14 h-14 bg-violet-300 text-violet-950 rounded-full font-semibold text-center text-sm">
                          {job.title.length > 2 ? job.title.substring(0, 2).toUpperCase() : job.title}
                        </div>
                        <div>
                          <div className="font-medium text-lg">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.status}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 font-semibold">
                        <button onClick={() => openModal(job)} className="text-violet-800 hover:underline text-sm hover:text-violet-950">Edit</button>
                        <button onClick={() => toggleStatus(job)} className="text-violet-800 hover:underline text-sm hover:text-violet-950">
                          {job.status === "active" ? "Archive" : "Unarchive"}
                        </button>
                        <button onClick={() => deleteJob(job)} className="text-violet-800 hover:underline text-sm hover:text-violet-950">Delete</button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded bg-violet-700 hover:bg-violet-800 text-white">Prev</button>
        <span className="px-2 py-1 text-violet-950 font-bold">Page {page}/{totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded bg-violet-700 hover:bg-violet-800 text-white">Next</button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="bg-white p-6 rounded-lg max-w-lg mx-auto mt-20 outline-none shadow-lg"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">{editingJob ? "Edit Job" : "Create Job"}</h2>
        <input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={jobTags}
          onChange={e => setJobTags(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
          <button onClick={saveJob} className="px-4 py-2 bg-violet-700 text-white rounded hover:bg-violet-800">Save</button>
        </div>
      </Modal>
    </div>
  );
};

