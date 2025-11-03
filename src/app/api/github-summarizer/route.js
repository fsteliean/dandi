import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSummarizeGithubReadmeChain } from '@/lib/chain';

// POST - Validate an API key
export async function POST(request) {
  try {
    const body = await request.json();
    const { githubUrl } = body || {};
    const apiKey = request.headers.get('x-api-key');
    const key = apiKey; // 'key' variable used later for supabase query
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'API key is missing from the request headers'
        },
        { status: 400 }
      );
    }


    // Check if the API key exists in the database
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key, monthly_limit, permissions, created_at, last_used')
      .eq('key', key)
      .single();

    if (error || !data) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Invalid API key'
      });
    }

    // Update last_used timestamp
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', data.id);

    // TODO: Add GitHub summarization logic here
    // This is where you should implement the GitHub repository summarization functionality
    // The API key has been validated and you have access to the validated key data
    // You can now proceed with the GitHub API calls and summarization logic

    // Call the GitHub README function and log the result
    console.log('Fetching README content for:', githubUrl);
    const readmeContent = await getRepoReadmeContent(githubUrl);
    console.log('README Content:', readmeContent);

    async function getRepoReadmeContent(githubUrl) {
      try {
        // Parse the githubUrl to extract owner and repo
        const regex = /github\.com\/([^\/]+)\/([^\/]+)(\/|$)/;
        const match = githubUrl.match(regex);
        if (!match || match.length < 3) {
          throw new Error('Invalid GitHub URL');
        }
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");

        // Try fetching README from github API (default branch)
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
        const response = await fetch(apiUrl, {
          headers: {
            "Accept": "application/vnd.github.v3.raw"
          }
        });

        if (!response.ok) {
          throw new Error(`Could not fetch README.md: ${response.statusText}`);
        }
        const readmeContent = await response.text();
        return readmeContent;
      } catch (err) {
        return null;
      }
    }




    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        id: data.id,
        name: data.name,
        key: data.key,
        monthlyLimit: data.monthly_limit,
        permissions: data.permissions,
        createdAt: data.created_at,
        lastUsed: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}


// -- After fetching the README, call the chain and get the summary object --

// Below assumes you have an LLM instance called 'llm', and 'readmeContent' string is available.
// For example, if using OpenAI: import { ChatOpenAI } from "@langchain/openai"; const llm = new ChatOpenAI({ model: "gpt-4o" });
//
// If you want to tie into your current API handler logic,
// add this after you fetch 'readmeContent':

// --- Example invocation logic: ---

const llm = ... // Your LLM instance
if (!readmeContent) {
  return NextResponse.json(
    { success: false, error: 'README content not found' },
    { status: 404 }
  );
}
try {
  const chain = await getSummarizeGithubReadmeChain(llm);
  const summaryObj = await chain.invoke({ readmeContent });
  // summaryObj is { summary: string, cool_facts: string[] }
  return NextResponse.json({
    success: true,
    summary: summaryObj.summary,
    cool_facts: summaryObj.cool_facts,
  });
} catch (e) {
  return NextResponse.json(
    { success: false, error: `Summarization failed: ${e.message}` },
    { status: 500 }
  );
}




