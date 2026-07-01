// Default prompts for LLM Wiki generation
// Users can customize these via AI Settings

export const DefaultWikiPrompts = {
  // 全书综合 Wiki 生成
  fullBookWiki: `You are a literary analyst creating a comprehensive wiki for a book. 

Based on the FULL book text provided below, generate a structured wiki in Markdown format covering:

## Characters
For each major character, provide:
- **Name**: character's name
- **Role**: protagonist/antagonist/supporting
- **Description**: personality, appearance, background
- **Relationships**: connections to other characters
- **Key Quotes**: memorable quotes (with chapter reference if available)

## Plot Summary
- **Main Plot**: the central storyline
- **Key Events**: major turning points (with approximate chapter locations)
- **Ending**: how the story concludes (if the full book is provided)

## World / Setting
- **World**: description of the fictional world, if applicable (e.g. cultivation realms, magic systems, futuristic society)
- **Key Locations**: important places and their significance
- **Power Systems**: magic, technology, or cultivation systems if relevant

## Glossary
- Key terms, concepts, or jargon specific to this book with definitions

## Themes
- Major themes explored in the book

Format requirements:
- Use Markdown headings (##, ###)
- Be comprehensive but concise
- If the text is truncated or incomplete, note which parts are covered
- Write in the SAME LANGUAGE as the book text
- Do NOT invent information not present in the text — if unsure, say "not specified in the provided text"

Book text:
{text}`,

  // 仅角色分析
  characters: `You are a literary analyst. Based on the book text below, create detailed character profiles.

For each character, provide:
- **Name**: 
- **Role**: protagonist / antagonist / supporting
- **Personality**: 
- **Appearance**: 
- **Background**: 
- **Relationships**: 
- **Key Quotes**:

Write in the SAME LANGUAGE as the book text. Only include information from the text.

Book text:
{text}`,

  // 仅剧情摘要
  plotSummary: `You are a literary analyst. Based on the book text below, write a structured plot summary.

Include:
- **Main Plot**: the central storyline in 2-3 sentences
- **Arc Breakdown**: key story arcs with chapter ranges
- **Key Events**: major turning points
- **Ending**: how it concludes (if text includes the ending)

Write in the SAME LANGUAGE as the book text.

Book text:
{text}`,

  // 仅术语/世界观
  glossary: `You are a literary analyst. Based on the book text below, extract all special terms, jargon, and world-building elements.

For each term, provide:
- **Term**: the word or phrase
- **Definition**: what it means in context
- **Category**: e.g. magic system, technology, organization, location, item, concept

Write in the SAME LANGUAGE as the book text.

Book text:
{text}`,
};

export const wikiCategoryLabels: Record<string, string> = {
  character: "Characters",
  plot: "Plot Summary",
  glossary: "Glossary",
  worldbuilding: "World / Setting",
  custom: "Custom",
};

export const wikiCategoryIcons: Record<string, string> = {
  character: "👤",
  plot: "📖",
  glossary: "📚",
  worldbuilding: "🌍",
  custom: "📝",
};
