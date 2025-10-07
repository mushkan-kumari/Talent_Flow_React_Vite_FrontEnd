// src/mocks/mockServer.js

/*
import { createServer, Response } from "miragejs";
import { db } from "../db/indexedDB"; // Your Dexie database

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    routes() {
      this.namespace = "/";

      // ================= JOB ROUTES =================
      this.get("jobs", async (schema, request) => {
        const search = request.queryParams.search || "";
        const status = request.queryParams.status;
        const page = parseInt(request.queryParams.page || "1", 10);
        const pageSize = parseInt(request.queryParams.pageSize || "25", 10);

        const jobs = await db.jobs.toArray();
        const filtered = jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(search.toLowerCase()) &&
            (!status || job.status === status)
        );

        const start = (page - 1) * pageSize;
        const paginated = filtered.slice(start, start + pageSize);

        return {
          total: filtered.length,
          page,
          pageSize,
          jobs: paginated,
        };
      });

      this.post("jobs", async (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const newJob = { id: crypto.randomUUID(), ...body };
        await db.jobs.add(newJob);
        return newJob;
      });

      this.patch("jobs/:id", async (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const id = request.params.id;
        await db.jobs.update(id, body);
        return await db.jobs.get(id);
      });

      this.patch("jobs/:id/reorder", async (schema, request) => {
        const { fromOrder, toOrder } = JSON.parse(request.requestBody);

        // Simulate random server error
        if (Math.random() < 0.2) {
          return new Response(500, {}, { error: "Reorder failed (simulated)" });
        }

        // Get all jobs
        const jobs = await db.jobs.toArray();

        // Find the job being moved
        const movingJob = jobs.find((j) => j.order === fromOrder);
        if (!movingJob) return new Response(404, {}, { error: "Job not found" });

        // Shift orders of other jobs
        const updatedJobs = jobs.map((j) => {
          if (j.id === movingJob.id) return { ...j, order: toOrder };
          if (fromOrder < toOrder && j.order > fromOrder && j.order <= toOrder)
            return { ...j, order: j.order - 1 };
          if (fromOrder > toOrder && j.order < fromOrder && j.order >= toOrder)
            return { ...j, order: j.order + 1 };
          return j;
        });

        await db.jobs.bulkPut(updatedJobs);
        return { success: true };
      });

      // ================= CANDIDATE ROUTES =================
      this.get("candidates", async (schema, request) => {
        const search = request.queryParams.search || "";
        const stage = request.queryParams.stage;
        const page = parseInt(request.queryParams.page || "1", 10);
        const pageSize = parseInt(request.queryParams.pageSize || "25", 10);

        const candidates = await db.candidates.toArray();
        const filtered = candidates.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) &&
            (!stage || c.stage === stage)
        );

        const start = (page - 1) * pageSize;
        const paginated = filtered.slice(start, start + pageSize);

        return {
          total: filtered.length,
          page,
          pageSize,
          candidates: paginated,
        };
      });

      this.post("candidates", async (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const newCandidate = { id: crypto.randomUUID(), ...body };
        await db.candidates.add(newCandidate);
        return newCandidate;
      });

      this.patch("candidates/:id", async (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const id = request.params.id;
        await db.candidates.update(id, body);
        return await db.candidates.get(id);
      });

      this.get("candidates/:id/timeline", async (schema, request) => {
        const id = request.params.id;
        const candidate = await db.candidates.get(id);
        if (!candidate) return new Response(404, {}, { error: "Not found" });

        const timeline = await db.timelines
          .where("candidateId")
          .equals(id)
          .sortBy("date");

        return timeline.length
          ? timeline
          : [
              { date: "2024-01-01", action: "Applied" },
              { date: "2024-01-03", action: "Screening" },
            ];
      });

      // ================= ASSESSMENTS =================
      this.get("assessments/:jobId", async (schema, request) => {
        const { jobId } = request.params;
        const assessment = await db.assessments.get(jobId);
        return assessment || { jobId, questions: [] };
      });

      this.put("assessments/:jobId", async (schema, request) => {
        const { jobId } = request.params;
        const body = JSON.parse(request.requestBody);
        await db.assessments.put({ jobId, ...body });
        return { success: true };
      });

      this.post("assessments/:jobId/submit", async (schema, request) => {
        const { jobId } = request.params;
        const response = JSON.parse(request.requestBody);
        await db.assessmentResponses.add({ jobId, ...response });
        return { submitted: true };
      });
    },
  });
}

*/
// src/mock/mockServer.js

/*
import { createServer, Response } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,
    routes() {
      this.namespace = "/";

      // === Assessments ===
      this.get("/assessments/:jobId", (schema, request) => {
        const { jobId } = request.params;
        const saved = localStorage.getItem(`assessment_${jobId}`);
        if (saved) {
          return JSON.parse(saved);
        }
        // fallback assessment
        return { title: "Frontend Assessment", sections: [] };
      });

      this.put("/assessments/:jobId", (schema, request) => {
        const { jobId } = request.params;
        const data = JSON.parse(request.requestBody);
        localStorage.setItem(`assessment_${jobId}`, JSON.stringify(data));
        return { success: true };
      });

      this.post("/assessments/:jobId/submit", (schema, request) => {
        const { jobId } = request.params;
        const response = JSON.parse(request.requestBody);
        localStorage.setItem(`assessment_submit_${jobId}`, JSON.stringify(response));
        return { submitted: true };
      });
    }
  });
}
  */


/*

import { createServer, Response } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    seeds(server) {
      // ===== Seed Candidates =====
      const firstNames = ["John","Jane","Alice","Bob","Michael","Emily","David","Sophia"];
      const lastNames = ["Smith","Johnson","Brown","Taylor","Anderson","Thomas","Lee","Martinez"];
      const stages = ["Applied", "Screen", "Technical", "Offer", "Hired"];
      const statuses = ["active", "archived"];

      const candidates = Array.from({ length: 1000 }, (_, i) => {
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

      const jobs = Array.from({ length: 25 }, (_, i) => ({
        id: `job-${i + 1}`,
        title: `Job ${i + 1}`,
        status: statuses[i % statuses.length]
      }));

      server.db.loadData({
        candidates,
        jobs
      });
    },

    routes() {
      this.namespace = "/";

      // ===== Candidates =====
      this.get("candidates", (schema, request) => {
        const search = request.queryParams.search?.toLowerCase() || "";
        const stage = request.queryParams.stage;

        let all = schema.db.candidates;
        if (search) {
          all = all.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search)
          );
        }
        if (stage) {
          all = all.filter(c => c.stage === stage);
        }
        return all;
      });

      this.get("candidates/:id", (schema, request) => {
        const candidate = schema.db.candidates.find(request.params.id);
        return candidate || new Response(404, {}, { error: "Not found" });
      });

      this.patch("candidates/:id", (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const id = request.params.id;
        schema.db.candidates.update(id, body);
        return schema.db.candidates.find(id);
      });

      // ===== Jobs =====
      this.get("jobs", (schema, request) => {
        const search = request.queryParams.search?.toLowerCase() || "";
        const status = request.queryParams.status;
        let all = schema.db.jobs;
        if (search) all = all.filter(j => j.title.toLowerCase().includes(search));
        if (status) all = all.filter(j => j.status === status);
        return all;
      });

      this.post("jobs", (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const newJob = { id: `job-${Date.now()}`, ...body };
        schema.db.jobs.insert(newJob);
        return newJob;
      });

      this.patch("jobs/:id", (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const id = request.params.id;
        schema.db.jobs.update(id, body);
        return schema.db.jobs.find(id);
      });

      this.patch("jobs/:id/reorder", (schema, request) => {
        const id = request.params.id;
        const body = JSON.parse(request.requestBody);

        // Simulate random server error (20% chance)
        if (Math.random() < 0.2) {
          return new Response(500, {}, { error: "Reorder failed (simulated)" });
        }

        schema.db.jobs.update(id, { order: body.toOrder });
        return { success: true };
      });

      // ===== Assessments =====
      this.get("/assessments/:jobId", (schema, request) => {
        const { jobId } = request.params;
        const saved = localStorage.getItem(`assessment_${jobId}`);
        if (saved) return JSON.parse(saved);
        return { title: "Frontend Assessment", sections: [] };
      });

      this.put("/assessments/:jobId", (schema, request) => {
        const { jobId } = request.params;
        const data = JSON.parse(request.requestBody);
        localStorage.setItem(`assessment_${jobId}`, JSON.stringify(data));
        return { success: true };
      });

      this.post("/assessments/:jobId/submit", (schema, request) => {
        const { jobId } = request.params;
        const response = JSON.parse(request.requestBody);
        localStorage.setItem(`assessment_submit_${jobId}`, JSON.stringify(response));
        return { submitted: true };
      });
    }
  });
}

*/


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

