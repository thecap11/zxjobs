import { FreshersworldSource } from "./src/lib/job-sources/freshersworld-source";

async function run() {
  const fw = new FreshersworldSource();
  const jobs = await fw.searchJobs({
    jobTitles: ["digital marketing"],
    experience: 3,
    location: "Hyderabad"
  });
  console.log(`Freshersworld found: ${jobs.length} jobs`);
  if (jobs.length > 0) {
    console.log(jobs[0]);
  }
}
run().catch(console.error);
