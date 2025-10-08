import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { CandidateProfile } from "./CandidateProfile";

const STAGES = ["Applied", "Screen", "Technical", "Offer", "Hired", "Rejected"];
const STAGE_LABELS = {
  Applied: "Applied",
  Screen: "Screen",
  Technical: "Technical",
  Offer: "Offer",
  Hired: "Hired",
  Rejected: "Rejected"
};

export const CandidatesBoard = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(""); // <-- Job filter
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Load jobs for the filter dropdown
  useEffect(() => {
    fetch("/jobs")
      .then(res => res.json())
      .then(data => setJobs(data));
  }, []);

  // Load candidates whenever search or selectedJob changes
  useEffect(() => {
    let url = `/candidates?search=${search}`;
    if (selectedJob) url += `&jobId=${selectedJob}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setCandidates(data));
  }, [search, selectedJob]);

  const openProfile = (id) => {
    setSelectedCandidate(id);
    setModalOpen(true);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const candidate = candidates.find(c => c.id === draggableId);
    if (!candidate) return;

    const updatedCandidate = { ...candidate, stage: destination.droppableId };
    setCandidates(candidates.map(c => c.id === draggableId ? updatedCandidate : c));

    await fetch(`/candidates/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: destination.droppableId })
    });
  };

  const getStageCandidates = useCallback(
    (stage) => candidates.filter(c => c.stage === stage),
    [candidates]
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-violet-950 mb-4">Candidates Board</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name/email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-md bg-violet-100 text-violet-900"
        />
        <select
          value={selectedJob}
          onChange={e => setSelectedJob(e.target.value)}
          className="p-2 border rounded bg-violet-100 text-violet-900"
        >
          <option value="">All Jobs</option>
          {jobs.map(j => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 overflow-x-auto">
          {STAGES.map(stage => (
            <Droppable key={stage} droppableId={stage}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-violet-200 rounded-lg p-2 min-h-[500px] flex flex-col"
                >
                  <h3 className="text-center font-semibold text-violet-950 mb-2">{STAGE_LABELS[stage]}</h3>
                  <div className="flex flex-col gap-2">
                    {getStageCandidates(stage).map((c, index) => (
                      <Draggable key={c.id} draggableId={c.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openProfile(c.id)}
                            className="flex items-center p-2 bg-violet-100 rounded-full shadow hover:shadow-lg cursor-pointer"
                          >
                            <div className="flex items-center justify-center w-10 h-10 bg-violet-300 text-violet-950 rounded-full font-semibold mr-3">
                              {c.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{c.name}</div>
                             
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {modalOpen && selectedCandidate && (
        <CandidateProfile
          candidateId={selectedCandidate}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
