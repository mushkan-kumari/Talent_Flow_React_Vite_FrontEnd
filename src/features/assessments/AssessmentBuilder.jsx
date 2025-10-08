import React, { useState, useEffect } from "react";
import { db } from "../../db/indexedDB";

export const AssessmentBuilder = ({ assessmentId }) => {
  const [assessment, setAssessment] = useState({ title: "", sections: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(null);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const emptyQuestion = { label: "", type: "text", options: [], required: false, condition: null, min: null, max: null };
  const [newQuestion, setNewQuestion] = useState(emptyQuestion);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const loadAssessment = async () => {
      setLoading(true);
      try {
        const data = await db.assessments.get(assessmentId);
        if (data) setAssessment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (assessmentId) loadAssessment();
  }, [assessmentId]);

  // Save assessment whenever it changes
  useEffect(() => {
    if (!loading && assessmentId) {
      db.assessments.put(assessment).catch(err => console.error(err));
    }
  }, [assessment, loading, assessmentId]);

  // Add section
  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    const updatedSections = [...assessment.sections, { id: `sec-${Date.now()}`, title: newSectionTitle, questions: [] }];
    setAssessment({ ...assessment, sections: updatedSections });
    setNewSectionTitle("");
    setSelectedSectionIdx(updatedSections.length - 1);
  };

  // Delete section
  const deleteSection = (idx) => {
    const updatedSections = [...assessment.sections];
    updatedSections.splice(idx, 1);
    setAssessment({ ...assessment, sections: updatedSections });
    setSelectedSectionIdx(null);
  };

  // Clear form
  const clearForm = () => {
    setAssessment({ ...assessment, sections: [] });
    setSelectedSectionIdx(null);
    setEditingQuestionIdx(null);
    setNewQuestion(emptyQuestion);
  };

  // Add or update question
  const addOrUpdateQuestion = () => {
    if (!newQuestion.label.trim() || selectedSectionIdx === null) return;
    const updatedSections = [...assessment.sections];
    const questions = updatedSections[selectedSectionIdx].questions;

    if (editingQuestionIdx !== null) {
      questions[editingQuestionIdx] = { ...questions[editingQuestionIdx], ...newQuestion };
      setEditingQuestionIdx(null);
    } else {
      questions.push({ id: `q-${Date.now()}`, ...newQuestion });
    }

    updatedSections[selectedSectionIdx].questions = questions;
    setAssessment({ ...assessment, sections: updatedSections });
    setNewQuestion(emptyQuestion);
  };

  // Handle response change
  const handleResponseChange = (q, value) => {
    setResponses(prev => ({ ...prev, [q.id]: value }));
  };

  // Submit responses
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let sec of assessment.sections) {
      for (let q of sec.questions) {
        if (q.condition && responses[q.condition.qId] !== q.condition.value) continue;
        const val = responses[q.id];
        if (q.required && (val === undefined || val === "" || (Array.isArray(val) && val.length === 0))) {
          alert(`Question "${q.label}" is required`);
          return;
        }
        if (q.type === "number") {
          const num = Number(val);
          if ((q.min !== null && num < q.min) || (q.max !== null && num > q.max)) {
            alert(`Question "${q.label}" must be between ${q.min} and ${q.max}`);
            return;
          }
        }
      }
    }

    // Save responses
    await db.assessmentResponses.add({ assessmentId, responses, date: new Date().toISOString() });
    alert("Assessment submitted successfully!");
    setResponses({});
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl p-4">
      {/* Assessment Builder panel */}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
  <input
    type="text"
    value={assessment.title}
    onChange={e => setAssessment({ ...assessment, title: e.target.value })}
    className="text-2xl font-bold text-violet-950 border-indigo-300 p-1 w-full"
  />
  <div className="flex gap-2">
    <button
      className="bg-violet-700 text-white px-3 py-1 rounded hover:bg-violet-800"
      onClick={async () => {
        await db.assessments.put(assessment);
        if (onAssessmentChange) onAssessmentChange(assessment); 
        alert("Assessment title saved!");
      }}
    >
      Save Changes
    </button>
    <button
      className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
      onClick={clearForm}
    >
      Clear Form
    </button>
  </div>
</div>


        {/* Add Section */}
        <div className="mb-4 flex gap-2">
          <input type="text" placeholder="Section title" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} className="w-full p-2 border rounded"/>
          <button onClick={addSection} className="bg-violet-700 text-white px-3 py-1 rounded hover:bg-violet-800">Add Section</button>
        </div>

        {/* Sections */}
        {assessment.sections.map((sec, idx) => (
          <div key={sec.id} className={`mb-4 p-3 border rounded cursor-pointer ${selectedSectionIdx === idx ? "bg-indigo-50" : "bg-white"}`} onClick={() => setSelectedSectionIdx(idx)}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold">{sec.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{sec.questions.length} question(s)</span>
                <button onClick={e => { e.stopPropagation(); deleteSection(idx); }} className="text-red-500">Delete Section</button>
              </div>
            </div>

            {sec.questions.map((q, qIdx) => (
              <div key={q.id} className="text-sm text-gray-700 ml-2 flex justify-between items-center">
                <span>{q.label} ({q.type}) {q.required && "*"}</span>
                <div className="space-x-2">
                  <button onClick={e => { e.stopPropagation(); setNewQuestion(q); setEditingQuestionIdx(qIdx); }} className="text-blue-500 text-xs">Edit</button>
                  <button onClick={e => { e.stopPropagation(); sec.questions.splice(qIdx, 1); setAssessment({ ...assessment }); if(editingQuestionIdx===qIdx) setEditingQuestionIdx(null); }} className="text-red-500 text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Question Form */}
        {selectedSectionIdx !== null && (
          <div className="mt-4 p-3 border rounded bg-indigo-50">
            <h4 className="font-semibold mb-2">{editingQuestionIdx !== null ? "Edit Question" : "Add Question"} in "{assessment.sections[selectedSectionIdx].title}"</h4>
            <input type="text" placeholder="Question label" value={newQuestion.label} onChange={e => setNewQuestion({...newQuestion,label:e.target.value})} className="w-full p-2 border rounded mb-2"/>
            <select value={newQuestion.type} onChange={e => setNewQuestion({...newQuestion,type:e.target.value})} className="w-full p-2 border rounded mb-2">
              <option value="text">Short Text</option>
              <option value="long">Long Text</option>
              <option value="number">Number</option>
              <option value="single">Single Choice</option>
              <option value="multi">Multiple Choice</option>
              <option value="file">File Upload</option>
            </select>

            {["single","multi"].includes(newQuestion.type) && (
              <div className="mb-2">
                {newQuestion.options.map((opt,i) =>
                  <input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={e => { const o=[...newQuestion.options]; o[i]=e.target.value; setNewQuestion({...newQuestion,options:o})}} className="w-full mb-1 p-2 border rounded"/>
                )}
                <button onClick={() => setNewQuestion({...newQuestion,options:[...newQuestion.options,""]})} className="bg-green-100 text-green-700 px-2 py-1 rounded">Add Option</button>
              </div>
            )}

            <label className="block mb-2">
              <input type="checkbox" checked={newQuestion.required} onChange={e => setNewQuestion({...newQuestion,required:e.target.checked})}/> Required
            </label>

            <div className="flex gap-2">
              <button onClick={addOrUpdateQuestion} className="bg-violet-700 text-white px-3 py-1 rounded hover:bg-violet-800">{editingQuestionIdx!==null ? "Save Question" : "Add Question"}</button>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Panel*/}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Live Preview</h2>
        <form onSubmit={handleSubmit}>
          {assessment.sections.length === 0 && <p className="text-gray-500">No sections yet. Add a section to start adding questions.</p>}
          {assessment.sections.map(sec => (
            <div key={sec.id} className="mb-4">
              <h3 className="font-semibold mb-2">{sec.title}</h3>
              {sec.questions.map(q => {
                const val = responses[q.id] || (q.type==="multi" ? [] : "");
                if (q.condition && responses[q.condition.qId] !== q.condition.value) return null;

                return (
                  <div key={q.id} className="mb-2">
                    <label className="block font-medium">{q.label} {q.required && "*"}</label>
                    {q.type==="text" && <input type="text" className="w-full border p-2 rounded" value={val} onChange={e => handleResponseChange(q,e.target.value)}/>}
                    {q.type==="long" && <textarea className="w-full border p-2 rounded" value={val} onChange={e => handleResponseChange(q,e.target.value)}/>}
                    {q.type==="number" && <input type="number" min={q.min} max={q.max} className="w-full border p-2 rounded" value={val} onChange={e => handleResponseChange(q,e.target.value)}/>}
                    {q.type==="single" && <select className="w-full border p-2 rounded" value={val} onChange={e => handleResponseChange(q,e.target.value)}><option value="">Select</option>{q.options.map(o => <option key={o} value={o}>{o}</option>)}</select>}
                    {q.type==="multi" && q.options.map(o => (
                      <label key={o} className="block"><input type="checkbox" checked={val.includes(o)} onChange={e => handleResponseChange(q, val.includes(o)?val.filter(x => x!==o):[...val,o])} className="mr-2"/>{o}</label>
                    ))}
                    {q.type==="file" && <input type="file" className="w-full border p-2 rounded" onChange={e => handleResponseChange(q,e.target.files[0])}/>}
                  </div>
                );
              })}
            </div>
          ))}
          {assessment.sections.length>0 && <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Submit Assessment</button>}
        </form>
      </div>
    </div>
  );
};

