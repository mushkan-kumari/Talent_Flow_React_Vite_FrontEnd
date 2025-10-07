import { createServer } from "miragejs";
import { db } from "../db/indexedDB";

export function makeServer() {
  return createServer({
    routes() {
      this.namespace = "/";

      // ===== Candidates =====
      this.get("/candidates", async (_, request) => {
        const all = await db.candidates.toArray();
        const search = request.queryParams.search?.toLowerCase() || "";
        const stage = request.queryParams.stage;
        let filtered = all;
        if (search) {
          filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search)
          );
        }
        if (stage) filtered = filtered.filter(c => c.stage === stage);
        return filtered;
      });

      this.get("/candidates", async (_, request) => {
  const all = await db.candidates.toArray();
  const search = request.queryParams.search?.toLowerCase() || "";
  const jobId = request.queryParams.jobId || "";

  let filtered = all;

  if (search) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search)
    );
  }

  if (jobId) {
    filtered = filtered.filter(c => c.jobId === jobId);
  }

  return filtered;
});

      this.get("/candidates/:id", async (_, request) => {
        return await db.candidates.get(request.params.id);
      });

      this.patch("/candidates/:id", async (_, request) => {
        const body = JSON.parse(request.requestBody);
        await db.candidates.update(request.params.id, body);
        return await db.candidates.get(request.params.id);
      });

      // ===== Jobs =====
      this.get("/jobs", async (_, request) => {
        const all = await db.jobs.toArray();
        const search = request.queryParams.search?.toLowerCase() || "";
        const status = request.queryParams.status;
        let filtered = all;
        if (search) filtered = filtered.filter(j => j.title.toLowerCase().includes(search));
        if (status) filtered = filtered.filter(j => j.status === status);
        return filtered;
      });

      this.get("/jobs/:id", async (_, request) => {
        return await db.jobs.get(request.params.id);
      });

      this.post("/jobs", async (_, request) => {
        const body = JSON.parse(request.requestBody);
        const newJob = { id: `job-${Date.now()}`, ...body };
        await db.jobs.add(newJob);
        return newJob;
      });

      this.patch("/jobs/:id", async (_, request) => {
        const body = JSON.parse(request.requestBody);
        await db.jobs.update(request.params.id, body);
        return await db.jobs.get(request.params.id);
      });

      this.delete("/jobs/:id", async (_, request) => {
        const id = request.params.id;
        await db.jobs.delete(id);  // remove job from IndexedDB
        return { message: "Job deleted successfully", id };
      });

      // ===== Assessments =====
      this.get("/assessments/:jobId", (_, request) => {
        const { jobId } = request.params;
        const saved = localStorage.getItem(`assessment_${jobId}`);
        if (saved) return JSON.parse(saved);
        return { title: "Frontend Assessment", sections: [] };
      });

      this.put("/assessments/:jobId", (_, request) => {
        const { jobId } = request.params;
        const data = JSON.parse(request.requestBody);
        localStorage.setItem(`assessment_${jobId}`, JSON.stringify(data));
        return { success: true };
      });

      this.post("/assessments/:jobId/submit", (_, request) => {
        const { jobId } = request.params;
        const response = JSON.parse(request.requestBody);
        localStorage.setItem(`assessment_submit_${jobId}`, JSON.stringify(response));
        return { submitted: true };
      });
    }
  });
}

