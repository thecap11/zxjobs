import { InternshalaSource } from "./src/lib/job-sources/internshala-source";
import { SimplyHiredSource } from "./src/lib/job-sources/simplyhired-source";
import { FreshersworldSource } from "./src/lib/job-sources/freshersworld-source";

async function run() {
  const criteria = {
    location: "Hyderabad",
    experience: 3,
    jobTitles: ["digital marketing"],
  };

  const is = new InternshalaSource();
  const sh = new SimplyHiredSource();
  const fw = new FreshersworldSource();

  console.log("Testing Internshala...");
  const jobs1 = await is.searchJobs(criteria);
  console.log("Internshala Jobs:", jobs1.length);

  console.log("Testing SimplyHired...");
  const jobs2 = await sh.searchJobs(criteria);
  console.log("SimplyHired Jobs:", jobs2.length);

  console.log("Testing Freshersworld...");
  const jobs3 = await fw.searchJobs(criteria);
  console.log("Freshersworld Jobs:", jobs3.length);

  process.exit(0);
}
run().catch(console.error);
