import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "./features/jobs/jobsSlice";
import candidatesReducer from "./features/candidates/candidatesSlice";

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    candidates: candidatesReducer
  }
});
