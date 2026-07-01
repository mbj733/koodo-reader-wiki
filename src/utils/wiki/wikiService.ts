import { chatStream } from "../request/common";
import { ConfigService } from "../../assets/lib/kookit-extra-browser.min";
import type { AIModelConfig } from "../../containers/settings/aiSetting/interface";
import WikiEntry from "../../models/Wiki";
import { DefaultWikiPrompts, wikiCategoryLabels } from "./prompts";
import i18n from "../../i18n";

// Storage key for wiki entries
export const WIKI_DB_NAME = "wikis";

// Config keys for wiki settings
const WIKI_MODEL_CONFIG_KEY = "aiWikiModel";
const WIKI_PROMPT_CONFIG_KEY = "aiWikiPrompt";

// Get the AI model config that user selected for Wiki
export function getWikiModelConfig(): AIModelConfig | null {
  const modelKey = ConfigService.getReaderConfig(WIKI_MODEL_CONFIG_KEY);
  if (!modelKey) return null;
  const entry = ConfigService.getObjectConfig(modelKey, "aiModelConfig", null);
  if (!entry || !entry.config) return null;
  return entry.config as AIModelConfig;
}

// Get the wiki prompt (user customized or default)
export function getWikiPrompt(): string {
  return (
    ConfigService.getReaderConfig(WIKI_PROMPT_CONFIG_KEY) ||
    DefaultWikiPrompts.fullBookWiki
  );
}

// Extract full book text from HtmlBook's flattenChapters
export function extractBookText(htmlBook: any): string {
  if (!htmlBook || !htmlBook.flattenChapters) return "";
  return htmlBook.flattenChapters
    .map(
      (ch: any) =>
        `## ${ch.label || ""}\n\n${(ch.text || "").replace(/<[^>]*>/g, "")}`
    )
    .join("\n\n");
}

// Generate wiki for a book
export async function generateWiki(
  bookKey: string,
  _bookName: string,
  htmlBook: any,
  onProgress: (message: string) => void,
  onComplete: (entries: WikiEntry[]) => void,
  onError: (error: string) => void
): Promise<void> {
  const modelConfig = getWikiModelConfig();
  if (!modelConfig) {
    onError(i18n.t("Please configure a Wiki model in AI settings first"));
    return;
  }

  const bookText = extractBookText(htmlBook);
  if (!bookText || bookText.trim().length === 0) {
    onError(i18n.t("No book text available for analysis"));
    return;
  }

  // Rough token estimation for Chinese: ~2 chars per token, English: ~4 chars
  const isChinese = /[\u4e00-\u9fff]/.test(bookText.substring(0, 1000));
  const estimatedTokens = isChinese
    ? Math.ceil(bookText.length / 1.5)
    : Math.ceil(bookText.length / 4);

  onProgress(
    i18n.t("Analyzing book") +
      ` (${(bookText.length / 10000).toFixed(1)} ${i18n.t("ten thousand characters")}, ~${estimatedTokens} tokens)...`
  );

  const prompt = getWikiPrompt().replace("{text}", bookText);

  try {
    let fullResponse = "";
    await chatStream(
      modelConfig.endpoint,
      modelConfig.providerId,
      modelConfig.apiKey,
      modelConfig.modelId,
      prompt,
      [],
      (result: { text: string }) => {
        fullResponse += result.text;
      }
    );

    // Parse the Markdown response into WikiEntry objects
    const entries = parseWikiResponse(fullResponse, bookKey);
    onComplete(entries);
  } catch (e: any) {
    onError(e.message || "Wiki generation failed");
  }
}

// Parse the LLM's Markdown response into structured WikiEntry objects
export function parseWikiResponse(
  markdown: string,
  bookKey: string
): WikiEntry[] {
  const entries: WikiEntry[] = [];
  const lines = markdown.split("\n");

  let currentCategory = "custom";
  let currentTitle = "";
  let currentContent: string[] = [];

  const flush = () => {
    if (currentTitle && currentContent.length > 0) {
      entries.push(
        new WikiEntry(
          bookKey,
          currentTitle.trim(),
          currentContent.join("\n").trim(),
          currentCategory,
          [currentCategory]
        )
      );
    }
    currentTitle = "";
    currentContent = [];
  };

  for (const line of lines) {
    // Detect sections
    if (line.trim() === "## Characters" || line.trim().startsWith("## Character")) {
      flush();
      currentCategory = "character";
      continue;
    }
    if (line.trim() === "## Plot Summary" || line.trim().startsWith("## Plot")) {
      flush();
      currentCategory = "plot";
      continue;
    }
    if (line.trim() === "## Glossary" || line.trim().startsWith("## Glossary")) {
      flush();
      currentCategory = "glossary";
      continue;
    }
    if (
      line.trim() === "## World / Setting" ||
      line.trim().startsWith("## World") ||
      line.trim().startsWith("## Setting")
    ) {
      flush();
      currentCategory = "worldbuilding";
      continue;
    }
    if (line.trim() === "## Themes") {
      flush();
      currentCategory = "worldbuilding"; // themes go under worldbuilding
      continue;
    }

    // h3: new entry
    if (/^###\s+/.test(line)) {
      flush();
      currentTitle = line.replace(/^###\s+/, "").replace(/\*\*/g, "").trim();
      continue;
    }

    // h4: nested entry (e.g. relationships under character)
    if (/^####\s+/.test(line)) {
      if (currentTitle) {
        currentContent.push(line.trim());
      } else {
        flush();
        currentTitle = line.replace(/^####\s+/, "").replace(/\*\*/g, "").trim();
      }
      continue;
    }

    // Content lines
    if (currentTitle) {
      currentContent.push(line);
    }
  }

  flush();

  // If no structured entries were parsed, create a single "Full Wiki" entry
  if (entries.length === 0 && markdown.trim()) {
    entries.push(
      new WikiEntry(bookKey, "Full Wiki", markdown.trim(), "custom", ["wiki"])
    );
  }

  return entries;
}

// Generate wiki for a specific category only
export async function generateWikiCategory(
  bookKey: string,
  htmlBook: any,
  category: string,
  onProgress: (message: string) => void,
  onComplete: (entries: WikiEntry[]) => void,
  onError: (error: string) => void
): Promise<void> {
  const modelConfig = getWikiModelConfig();
  if (!modelConfig) {
    onError(i18n.t("Please configure a Wiki model in AI settings first"));
    return;
  }

  const bookText = extractBookText(htmlBook);
  if (!bookText) {
    onError(i18n.t("No book text available for analysis"));
    return;
  }

  const categoryPrompts: Record<string, string> = {
    character: DefaultWikiPrompts.characters,
    plot: DefaultWikiPrompts.plotSummary,
    glossary: DefaultWikiPrompts.glossary,
  };

  const prompt =
    categoryPrompts[category] || DefaultWikiPrompts.fullBookWiki;
  const finalPrompt = prompt.replace("{text}", bookText);

  onProgress(
    i18n.t("Generating") +
      ` ${wikiCategoryLabels[category] || category}...`
  );

  try {
    let fullResponse = "";
    await chatStream(
      modelConfig.endpoint,
      modelConfig.providerId,
      modelConfig.apiKey,
      modelConfig.modelId,
      finalPrompt,
      [],
      (result: { text: string }) => {
        fullResponse += result.text;
      }
    );

    const entries = parseWikiResponse(fullResponse, bookKey);
    // Tag with the requested category
    entries.forEach((e) => (e.category = category));
    onComplete(entries);
  } catch (e: any) {
    onError(e.message || "Wiki generation failed");
  }
}
