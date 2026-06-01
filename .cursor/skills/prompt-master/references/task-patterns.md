# Task-Specific Prompt Patterns

Concrete prompt templates for common task types. Use these as starting scaffolds and customize per user's context.

---

## Research & Analysis

### Deep Research on a Topic
**Technique:** Generate Knowledge + Prompt Chaining
```
You are a senior research analyst.

Your task is to produce a structured research brief on: {{TOPIC}}

Cover the following:
1. Overview & definition (2-3 sentences)
2. Current state / key developments (bullet points)
3. Main debates or open questions in the field
4. Key players / organizations / papers to know
5. Practical implications for: {{CONTEXT_OR_ROLE}}

Be factual, cite specific names/events where possible. Avoid vague generalities.
```

### Summarize a Research Paper / Article
**Technique:** Zero-Shot with structured output
```
Summarize the following research paper in plain language for a {{TARGET_AUDIENCE}}.

Structure your summary as:
- **One-line TL;DR**
- **Problem being solved**
- **Key method or approach**
- **Main findings**
- **Limitations**
- **Why it matters**

Paper: {{PAPER_TEXT_OR_URL}}
```

### Compare Two Topics / Options
**Technique:** Few-Shot or Zero-Shot structured
```
Compare {{OPTION_A}} and {{OPTION_B}} across the following dimensions:
- {{DIMENSION_1}}
- {{DIMENSION_2}}
- {{DIMENSION_3}}

Format as a side-by-side table, then give a brief recommendation for: {{USE_CASE}}
```

---

## Planning

### Project Plan Generator
**Technique:** CoT + structured output
```
You are an experienced project manager.

Create a detailed project plan for: {{PROJECT_DESCRIPTION}}

Think through the following before producing the plan:
- What are the major phases?
- What dependencies exist between tasks?
- What are the biggest risks?

Then produce the plan in this format:
**Phase [N]: [Name]**
- Milestone: [what's achieved]
- Tasks: [list]
- Duration: [estimate]
- Dependencies: [what must come before]
- Risks: [what could go wrong]

Project context: {{CONTEXT}}
Timeline: {{TIMELINE}}
Team size: {{TEAM_SIZE}}
```

### Decision Framework
**Technique:** Tree of Thoughts
```
I need to make a decision about: {{DECISION}}

Context: {{CONTEXT}}
Constraints: {{CONSTRAINTS}}
Goal: {{GOAL}}

Generate 3 distinct approaches to this decision. For each:
1. Summarize the approach in one sentence
2. List 3 pros
3. List 3 cons
4. Rate it (1-10) for fit with my goal

Then recommend the best option and explain your reasoning.
```

---

## Coding

### Generate a Function / Feature
**Technique:** Zero-Shot CoT
```
Write {{LANGUAGE}} code that {{WHAT_IT_SHOULD_DO}}.

Requirements:
- {{REQUIREMENT_1}}
- {{REQUIREMENT_2}}

Constraints:
- {{CONSTRAINT_1}}

Think through the logic before writing code.
Include:
- The function/class
- Brief inline comments on non-obvious logic
- A usage example at the bottom
```

### Debug / Fix Code
**Technique:** CoT + Reflexion
```
The following {{LANGUAGE}} code has a bug. 

Code:
```{{LANGUAGE}}
{{CODE}}
```

Error / Unexpected behavior:
{{ERROR_OR_DESCRIPTION}}

Step 1: Identify what is wrong and why.
Step 2: Provide the corrected code.
Step 3: Explain what the fix does.
```

### Code Review
**Technique:** Reflexion
```
Review the following {{LANGUAGE}} code for:
1. Correctness — does it do what it's supposed to?
2. Performance — any obvious inefficiencies?
3. Readability — is it clear and well-structured?
4. Security — any potential vulnerabilities?
5. Best practices — any violations of {{LANGUAGE}} conventions?

For each issue found, provide:
- Location (line or function)
- Issue description
- Suggested fix

Code:
```{{LANGUAGE}}
{{CODE}}
```
```

### Generate SQL Query
**Technique:** Few-Shot
```
Write a SQL query to: {{WHAT_YOU_WANT}}

Database schema:
{{SCHEMA}}

Example of similar query:
-- {{EXAMPLE_QUERY}}

Requirements:
- {{REQUIREMENT}}
- Optimize for readability
- Add comments explaining non-obvious logic
```

---

## Data / Information Extraction

### Extract Structured Data from Text
**Technique:** Few-Shot
```
Extract the following fields from the text below and return as JSON.

Fields to extract:
- {{FIELD_1}}: [description]
- {{FIELD_2}}: [description]
- {{FIELD_3}}: [description]

If a field is not present, use null.

Example:
Text: [example text]
Output: {"field_1": "value", "field_2": "value"}

Text to process:
{{INPUT_TEXT}}

Output (JSON only):
```

### Classify / Label Content
**Technique:** Few-Shot
```
Classify the following {{CONTENT_TYPE}} into one of these categories:
{{CATEGORY_LIST}}

Rules:
- {{RULE_1}}
- {{RULE_2}}

Examples:
Input: "{{EXAMPLE_1}}" → {{LABEL_1}}
Input: "{{EXAMPLE_2}}" → {{LABEL_2}}

Now classify:
Input: "{{INPUT}}"
Output:
```

---

## Summarization

### Long Document Summary
**Technique:** Zero-Shot with structured output
```
Summarize the following {{DOCUMENT_TYPE}} for a {{AUDIENCE}}.

Requirements:
- Keep it under {{WORD_COUNT}} words
- Preserve the most important information
- Use plain language, avoid jargon unless essential
- Structure: [executive summary] → [key points] → [takeaways]

Document:
{{DOCUMENT}}
```

### Meeting Notes → Action Items
**Technique:** Zero-Shot
```
From the following meeting notes, extract:

1. **Key Decisions Made** (bullet list)
2. **Action Items** (table: Task | Owner | Due Date)
3. **Open Questions / Unresolved Issues**
4. **One-paragraph summary** of what was discussed

Meeting notes:
{{NOTES}}
```

---

## Question Answering

### Closed-Domain Q&A (from document)
**Technique:** RAG
```
Answer the question based only on the provided context.
If the answer isn't in the context, say: "This isn't covered in the provided information."

Context:
{{CONTEXT}}

Question: {{QUESTION}}
Answer:
```

### Open-Domain Expert Q&A
**Technique:** Role + Zero-Shot CoT
```
You are a world-class expert in {{DOMAIN}}.

Answer the following question thoroughly and accurately.
If there are multiple perspectives or schools of thought, present them.
Think carefully before answering.

Question: {{QUESTION}}
```

---

## Image Generation Prompts

### Photo-realistic Image
```
[Subject description], [lighting], [camera details], [style]

Example structure:
A {{SUBJECT}} in {{SETTING}}, {{LIGHTING}} lighting, shot on {{CAMERA}}, 
{{STYLE}} style, highly detailed, 8k resolution

Negative prompt: blurry, low quality, cartoon, distorted
```

### Illustration / Art Style
```
{{SUBJECT}}, {{ART_STYLE}} style, by {{ARTIST_REFERENCE}},
{{COLOR_PALETTE}}, {{MOOD}}, detailed, trending on ArtStation

Negative prompt: photo-realistic, 3d render, watermark
```

---

## Evaluation / Grading

### Grade a Written Response
**Technique:** Zero-Shot structured
```
You are an expert evaluator.

Evaluate the following response to the given task using this rubric:
- **Accuracy** (1-5): Is the content factually correct?
- **Completeness** (1-5): Does it address all parts of the task?
- **Clarity** (1-5): Is it easy to understand?
- **Quality** (1-5): Is it well-written and well-structured?

For each criterion, give a score and a one-sentence justification.
Then give an overall score (average) and 1-2 suggestions for improvement.

Task: {{TASK}}
Response: {{RESPONSE}}
```
