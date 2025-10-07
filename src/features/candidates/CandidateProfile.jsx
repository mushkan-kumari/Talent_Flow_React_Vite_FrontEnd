import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { db } from "../../db/indexedDB";

Modal.setAppElement("#root");

const STAGES = ["Applied", "Screen", "Technical", "Offer", "Hired"];

export const CandidateProfile = ({ candidateId, isOpen, onClose }) => {
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!candidateId) return;

    const loadCandidate = async () => {
      const c = await db.candidates.get(candidateId);
      setCandidate(c);

      const t = await db.timelines.where("candidateId").equals(candidateId).sortBy("date");
      setTimeline(t);

      const n = await db.notes.where("candidateId").equals(candidateId).sortBy("date");
      setNotes(n);
    };

    loadCandidate();
  }, [candidateId]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const noteObj = {
      id: Date.now().toString(),
      candidateId,
      author: "HR",
      date: new Date().toISOString(),
      content: newNote.trim()
    };
    await db.notes.add(noteObj);
    setNotes([...notes, noteObj]);
    setNewNote("");
  };

  if (!candidate) return <div>Loading candidate...</div>;

  const currentStageIndex = STAGES.indexOf(candidate.stage);
  const avatarUrl = `https://avatars.dicebear.com/api/avataaars/${candidate.id}.svg`;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-6 rounded-lg max-w-3xl mx-auto mt-20 outline-none shadow-lg max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600">{candidate.name}</h2>
        <button onClick={onClose} className="text-red-600 font-bold text-xl">&times;</button>
      </div>

      {/* Avatar + Info */}
      <div className="flex items-center gap-4 mb-6">
        <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full border" />
        <div>
          <div className="text-gray-700 font-medium">Email: {candidate.email}</div>
          <div className="text-gray-500">Current Stage: {candidate.stage}</div>
          <div className="text-gray-500">Job Applied: {candidate.jobId}</div>
        </div>
      </div>

      {/* Dot-Line Stage Chart */}
      <div className="mb-6">
        <h3 className="font-semibold text-indigo-600 mb-4">Progress</h3>
        <div className="flex items-center gap-2">
          {STAGES.map((stage, index) => {
            const completed = index <= currentStageIndex;
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full border-2 ${completed ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"}`}></div>
                  <span className="text-xs mt-1 text-center">{stage}</span>
                </div>
                {index < STAGES.length - 1 && (
                  <div className={`flex-1 h-1 ${index < currentStageIndex ? "bg-indigo-600" : "bg-gray-300"}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Timeline Events */}
      <div className="mb-6">
        <h3 className="font-semibold text-indigo-600 mb-2">Timeline</h3>
        <ul className="border-l-2 border-indigo-200 ml-4">
          {timeline.map(t => (
            <li key={t.id || t.date} className="mb-4 relative">
              <span className="absolute -left-3 top-0 w-6 h-6 bg-indigo-500 rounded-full border-2 border-white"></span>
              <div className="ml-4">
                <div className="text-gray-700 font-medium">{t.stage}</div>
                <div className="text-gray-500 text-sm">{new Date(t.date).toLocaleString()}</div>
                {t.note && <div className="text-gray-600">{t.note}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Notes Section */}
      <div>
        <h3 className="font-semibold text-indigo-600 mb-2">Notes</h3>
        <div className="flex flex-col gap-2 mb-2 max-h-64 overflow-y-auto">
          {notes.map(n => (
            <div key={n.id} className="bg-gray-100 p-2 rounded shadow-sm">
              <div className="text-sm text-gray-600 font-medium">{n.author} | {new Date(n.date).toLocaleString()}</div>
              <div className="text-gray-800">{n.content}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Add note with @mentions"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button onClick={addNote} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add</button>
        </div>
      </div>
    </Modal>
  );
};
