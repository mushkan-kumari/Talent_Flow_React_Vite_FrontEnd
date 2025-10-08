import Dexie from "dexie";
import firstNames from "./data/firstnames.json";
import lastNames from "./data/lastnames.json";

export const db = new Dexie("TalentFlowDB_v2");

db.version(2).stores({
  jobs: "id,title,slug,status,order,tags",
  candidates: "id,name,email,stage,jobId",
  timelines: "++id,candidateId,stage,date,note",
  notes: "++id,candidateId,author,date,content",
  assessments: 'id, title, sections', 
  assessmentResponses: "++id,jobId,candidateId,date,responses"
});

export async function ensureSeed() {
  const candidateCount = await db.candidates.count();
  if (candidateCount > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  // ===== Seed Jobs =====
  const statuses = ["active", "archived"];
  const tagPool = ["Frontend", "Backend", "Fullstack", "React", "Node", "JavaScript", "Python", "DevOps", "QA", "UI/UX"];
  
  const getRandomTags = () => {
    const count = Math.floor(Math.random() * 3) + 1; 
    const shuffled = tagPool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const jobs = Array.from({ length: 25 }, (_, i) => ({
    id: `job-${i + 1}`,
    title: `Job ${i + 1}`,
    slug: `engineer-${i + 1}`,
    status: statuses[i % statuses.length],
    order: i,
    tags: getRandomTags()
  }));
  await db.jobs.bulkPut(jobs);

  // ===== Seed Candidates =====
  const stages = ["Applied", "Screen", "Technical", "Offer", "Hired", "Rejected"];

  const candidates = Array.from({ length: 1000 }, (_, i) => {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      id: `candidate-${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}_${last.toLowerCase()}${i+1}@talentflow.com`,
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
      for (let q = 1; q <= 4; q++) { // 4 questions per section 
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

