import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

// Strict output schema for summary
const GithubSummarySchema = z.object({
  summary: z.string().describe("A 2-4 sentence summary of the GitHub repository"),
  cool_facts: z
    .array(z.string())
    .describe("A list of 3-5 interesting or cool facts about the repository"),
});

const parser = StructuredOutputParser.fromZodSchema(GithubSummarySchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You will be given the content of a repository's README.md file. " +
      "Generate a short summary (2-4 sentences) as well as a list of 3-5 interesting or cool facts. " +
      "Respond strictly in the output JSON schema described below. " +
      "{format_instructions}",
  ],
  [
    "human",
    "Here is the README content:\n\n{readmeContent}",
  ],
]);

// Preload instructions (so you can await inside handler)
export async function getSummarizeGithubReadmeChain(llm) {
  const partialedPrompt = await prompt.partial({
    format_instructions: parser.getFormatInstructions(),
  });
  return RunnableSequence.from([
    partialedPrompt,
    llm,
    parser,
  ]);
}

