import React, { useEffect, useState } from "react";
import { AssessmentBuilder } from "./AssessmentBuilder";
import { db } from "../../db/indexedDB";

export const AssessmentBuilderWrapper = () => {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // Load assessments from IndexedDB
  useEffect(() => {
    const loadAssessments = async () => {
      const all = await db.assessments.toArray();
      setAssessments(all);
      if (all.length > 0 && !selectedAssessmentId) {
        setSelectedAssessmentId(all[0].id);
      }
    };
    loadAssessments();
  }, []);

  // Update assessment in wrapper state when it changes
  const updateAssessmentInState = (updated) => {
    setAssessments(prev =>
      prev.map(a => (a.id === updated.id ? updated : a))
    );
  };

  // Create a new assessment
  const createAssessment = async () => {
    const id = `assessment-${Date.now()}`;
    const newAssessment = {
      id,
      title: "New Assessment",
      sections: [],
    };
    await db.assessments.add(newAssessment);
    setAssessments(prev => [...prev, newAssessment]);
    setSelectedAssessmentId(id);
  };

  // Delete selected assessment
  const deleteAssessment = async (id) => {
    await db.assessments.delete(id);
    setAssessments(prev => prev.filter(a => a.id !== id));
    if (selectedAssessmentId === id) {
      setSelectedAssessmentId(assessments.length ? assessments[0].id : null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <select
          className="border p-2 rounded bg-violet-100 text-violet-900"
          value={selectedAssessmentId || ""}
          onChange={e => setSelectedAssessmentId(e.target.value)}
        >
          {assessments.map(a => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>

        <button
          className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800"
          onClick={createAssessment}
        >
          Create New Assessment
        </button>

        {selectedAssessmentId && (
          <button
            className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800"
            onClick={() => deleteAssessment(selectedAssessmentId)}
          >
            Delete Selected
          </button>
        )}
      </div>

      {selectedAssessmentId && (
        <AssessmentBuilder
          assessmentId={selectedAssessmentId}
          key={selectedAssessmentId}
          onAssessmentChange={updateAssessmentInState}
        />
      )}
    </div>
  );
};
