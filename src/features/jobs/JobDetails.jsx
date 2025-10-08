import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../db/indexedDB";

export const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      const j = await db.jobs.get(jobId);
      setJob(j);
    };
    loadJob();
  }, [jobId]);

  if (!job) return <div className="text-center text-gray-500 mt-20">Loading job details...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10 bg-violet-100 shadow-lg rounded-lg border border-gray-200"
         style={{ height: "500px", overflowY: "auto" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-violet-900">{job.title}</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            job.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"
          }`}
        >
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-violet-800 mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {job.tags?.length ? (
            job.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-violet-200 text-violet-800 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-500">No tags assigned</span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-violet-800 mb-2">Job Details</h3>
        <p className="text-gray-900">
         Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ultrices elit eget enim laoreet condimentum. Quisque vel ante libero. Nulla eu blandit quam, quis feugiat diam. Maecenas laoreet faucibus augue, venenatis ultrices metus pretium vitae. Duis quis ligula tellus. Nulla facilisi. Aliquam auctor, purus vel volutpat porttitor, metus metus iaculis arcu, sit amet scelerisque sem nisl vel nisi. Morbi fringilla pellentesque convallis. Nullam in feugiat nulla, quis commodo metus. Fusce bibendum nibh nec nisi cursus tristique.
        </p>
      </div>

      <div className="mt-6">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-violet-800 text-white rounded hover:bg-violet-900"
        >
          Back to Jobs
        </button>
      </div>
    </div>
  );
};
