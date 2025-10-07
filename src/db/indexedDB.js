/*import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB_v2");
db.version(1).stores({
  assessments: "jobId",
  assessmentResponses: "++id,jobId,candidateId,date",
});
*/

/*
import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB_v1");

db.version(1).stores({
  jobs: "id, title, slug, status, order, tags",
  candidates: "id, name, email, stage, jobId",
  timelines: "++id, candidateId, stage, date, note",
  notes: "++id, candidateId, author, date, content",
  assessments: "jobId",
  assessmentResponses: "++id, jobId, candidateId, date",
});

export async function seedJobsAndCandidates() {
  const jobCount = await db.jobs.count();
  if(jobCount === 0){
    // Seed 25 jobs
    const jobs = Array.from({length:25},(_,i)=>({
      id:`job-${i+1}`,
      title:`Job ${i+1}`,
      slug:`job-${i+1}`,
      status:"open",
      order:i
    }));
    await db.jobs.bulkAdd(jobs);

    // Seed 1000 candidates
    const candidates = Array.from({length:1000},(_,i)=>({
      id:`candidate-${i+1}`,
      name:`Candidate ${i+1}`,
      email:`candidate${i+1}@example.com`,
      stage:["applied","screen","tech","offer","hired"][i%5],
      jobId:`job-${(i%25)+1}`
    }));
    await db.candidates.bulkAdd(candidates);
    console.log("Seeded 25 jobs and 1000 candidates");
  }
}


// Seed a sample job assessment
export async function seedAssessment() {
  const jobId = "job-1";
  const exists = await db.assessments.get(jobId);
  if (!exists) {
    await db.assessments.put({
      jobId,
      title: "Frontend Screening",
      sections: [
        {
          id: "sec1",
          title: "React Basics",
          questions: [
            { id: "q1", type: "single", label: "Do you have React experience?", options: ["Yes","No"], required: true },
            { id: "q2", type: "number", label: "Years of React experience", min: 0, max: 20, required: true, condition: { qId: "q1", value: "Yes" } },
            { id: "q3", type: "multi", label: "UI Libraries used", options: ["Tailwind","Bootstrap","Material UI"], required: false }
          ]
        },
        {
          id: "sec2",
          title: "Portfolio",
          questions: [
            { id: "q4", type: "file", label: "Upload portfolio (pdf)", required: false }
          ]
        }
      ]
    });
  }
}

*/


/*
import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB_v1");

db.version(2).stores({
  jobs: "id,title,slug,status,order",
  candidates: "id,name,email,stage,jobId",
  timelines: "++id,candidateId,stage,date,note",
  notes: "++id,candidateId,author,date,content",
  assessments: "jobId",
  assessmentResponses: "++id,jobId,candidateId,date,responses"
});

export async function ensureSeed() {
  const cCount = await db.candidates.count();
  if (cCount === 0) {
    console.log("Seeding sample data...");

    // Seed 25 Jobs
    const statuses = ["active", "archived"];
    const jobs = Array.from({ length: 25 }, (_, i) => ({
      id: `job-${i + 1}`,
      title: `Job ${i + 1}`,
      slug: `frontend-engineer-${i + 1}`,
      status: statuses[i % statuses.length],
      order: i
    }));
    await db.jobs.bulkPut(jobs);

    // Seed 1000 Candidates

  const firstNames = ["John","Jane","Alice","Bob","Michael","Emily","David","Sophia"];
  const lastNames = ["Smith","Johnson","Brown","Taylor","Anderson","Thomas","Lee","Martinez"];
  const stages = ["Applied", "Screen", "Technical", "Offer", "Hired"];
  const candidates = Array.from({ length: 1000}, (_, i) => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    id: `candidate-${i + 1}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i+1}@example.com`,
    stage: stages[i % stages.length],
    jobId: `job-${(i % 25) + 1}`
  };
});
    await db.candidates.bulkPut(candidates);


    // Seed 3 assessments
  
  const existing = await db.assessments.count();
  if (existing > 0) return; // Already seeded

  const assessments = [];

  for (let i = 1; i <= 3; i++) {
    const sections = [];
    for (let s = 1; s <= 3; s++) { // 3 sections per assessment
      const questions = [];
      for (let q = 1; q <= 4; q++) { // 4+ questions per section => 12 total
        questions.push({
          id: `q-${i}-${s}-${q}`,
          label: `Question ${q} in Section ${s} of Assessment ${i}`,
          type: ["text", "number", "single", "multi"][Math.floor(Math.random()*4)],
          options: ["single","multi"].includes(["text","number","single","multi"][Math.floor(Math.random()*4)]) ? ["Option 1","Option 2","Option 3"] : [],
          required: Math.random() > 0.3,
          condition: null,
          min: 1,
          max: 10
        });
      }
      sections.push({ id: `sec-${i}-${s}`, title: `Section ${s}`, questions });
    }

    assessments.push({
      id: `assessment-${i}`,
      jobId: `job-${i}`,
      title: `Assessment ${i}`,
      sections
    });
  

  await db.assessments.bulkPut(assessments);
};
    console.log("Database seeded with 25 jobs and 1000 candidates.");
  } else {
    console.log("DB already contains data — skipping seed.");
  }
}

*/



import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB_v2");

db.version(2).stores({
  jobs: "id,title,slug,status,order",
  candidates: "id,name,email,stage,jobId",
  timelines: "++id,candidateId,stage,date,note",
  notes: "++id,candidateId,author,date,content",
  assessments: 'id, title, sections',  // <-- id is primary key
  assessmentResponses: "++id,jobId,candidateId,date,responses"
});

export async function ensureSeed() {
  // Check if candidates already exist
  const candidateCount = await db.candidates.count();
  if (candidateCount > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  // ===== Seed Jobs =====
  const statuses = ["active", "archived"];
  const jobs = Array.from({ length: 25 }, (_, i) => ({
    id: `job-${i + 1}`,
    title: `Job ${i + 1}`,
    slug: `frontend-engineer-${i + 1}`,
    status: statuses[i % statuses.length],
    order: i
  }));
  await db.jobs.bulkPut(jobs);

  // ===== Seed Candidates =====
  const firstNames = ["John","Jane","Alice","Bob","Michael","Emily","David","Sophia"];
  const lastNames = ["Smith","Johnson","Brown","Taylor","Anderson","Thomas","Lee","Martinez"];
  const stages = ["Applied", "Screen", "Technical", "Offer", "Hired"];

  const candidates = Array.from({ length: 1000 }, (_, i) => {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      id: `candidate-${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i+1}@talent.com`,
      stage: stages[Math.floor(Math.random() * stages.length)],
      jobId: `job-${Math.floor(Math.random() * 25) + 1}`
    };
  });
  await db.candidates.bulkPut(candidates);

  // ===== Seed Assessments =====
  const assessments = [];
  for (let i = 1; i <= 3; i++) {
    const sections = [];
    for (let s = 1; s <= 3; s++) { // 3 sections per assessment
      const questions = [];
      for (let q = 1; q <= 4; q++) { // 4 questions per section => 12+ per assessment
        const types = ["text", "number", "single", "multi"];
        const type = types[Math.floor(Math.random() * types.length)];
        const options = ["single","multi"].includes(type) ? ["Option 1","Option 2","Option 3"] : [];

        questions.push({
          id: `q-${i}-${s}-${q}`,
          label: `Question ${q} in Section ${s} of Assessment ${i}`,
          type,
          options,
          required: Math.random() > 0.3,
          condition: null,
          min: type === "number" ? 1 : null,
          max: type === "number" ? 10 : null
        });
      }
      sections.push({ id: `sec-${i}-${s}`, title: `Section ${s}`, questions });
    }

    assessments.push({
      id: `assessment-${i}`,
      jobId: `job-${i}`,
      title: `Assessment ${i}`,
      sections
    });
  }
  await db.assessments.bulkPut(assessments);

  console.log("Seeding completed: 25 jobs, 1000 candidates, 3 assessments.");
}

