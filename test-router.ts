import { aiRouter } from "./src/lib/ai/fallback-router";

async function run() {
  try {
    const text = await aiRouter.generateText("Hello! What model are you and who trained you? Respond in one sentence.");
    console.log("Response:", text);
  } catch (e) {
    console.error("Test failed:", e);
  }
}

run();
