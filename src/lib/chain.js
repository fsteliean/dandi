import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Strict output schema for summary
const GithubSummarySchema = z.object({
  summary: z.string().describe("A 2-4 sentence summary of the GitHub repository"),
  cool_facts: z
    .array(z.string())
    .describe("A list of 3-5 interesting or cool facts about the repository"),
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You will be given the content of a repository's README.md file. " +
      "Generate a short summary (2-4 sentences) as well as a list of 3-5 interesting or cool facts.",
  ],
  [
    "human",
    "Here is the README content:\n\n{readmeContent}",
  ],
]);

// Bind structured output schema to model and create chain
export async function getSummarizeGithubReadmeChain(llm) {
  const modelWithStructure = llm.withStructuredOutput(GithubSummarySchema);
  return prompt.pipe(modelWithStructure);
}

