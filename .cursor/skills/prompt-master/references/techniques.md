# Techniques Reference
*From: DAIR Prompt Engineering Guide — github.com/dair-ai/Prompt-Engineering-Guide*

---

## Table of Contents
1. [Zero-Shot Prompting](#zero-shot)
2. [Few-Shot Prompting](#few-shot)
3. [Chain-of-Thought (CoT)](#cot)
4. [Meta Prompting](#meta-prompting)
5. [Self-Consistency](#self-consistency)
6. [Generate Knowledge Prompting](#generate-knowledge)
7. [Prompt Chaining](#prompt-chaining)
8. [Tree of Thoughts (ToT)](#tot)
9. [ReAct](#react)
10. [Reflexion](#reflexion)
11. [Directional Stimulus Prompting (DSP)](#dsp)
12. [Program-Aided Language Models (PAL)](#pal)
13. [Automatic Prompt Engineer (APE)](#ape)
14. [RAG Pattern](#rag)

---

## 1. Zero-Shot Prompting {#zero-shot}

**When to use:** Simple, well-defined tasks. The model has enough training knowledge to respond without examples. Best for: direct instructions, factual Q&A, basic summarization, code snippets.

**Structure:**
```
[Optional Role]
[Task instruction — be specific and direct]
[Output format requirement]
```

**Example:**
```
You are an expert data analyst.
Classify the sentiment of the following customer review as Positive, Negative, or Neutral.
Return only the label, nothing else.

Review: {{REVIEW_TEXT}}
```

**Tips:**
- Be explicit about format
- Add role for domain-specific tasks
- Specify length constraints if needed

---

## 2. Few-Shot Prompting {#few-shot}

**When to use:** When you need consistent formatting, specific output style, or the task is nuanced. Great for: classification, extraction, structured outputs, creative templates.

**Structure:**
```
[Task description]

Example 1:
Input: [example input]
Output: [example output]

Example 2:
Input: [example input]
Output: [example output]

Now do this:
Input: {{INPUT}}
Output:
```

**Tips:**
- Use 2–5 examples; more isn't always better
- Examples should cover edge cases
- Keep format perfectly consistent across examples
- Label format explicitly (Input: / Output:)

---

## 3. Chain-of-Thought (CoT) Prompting {#cot}

**When to use:** Complex reasoning tasks — math, logic, multi-step problems, strategy. Also helps with debugging code or decisions where the reasoning matters.

**Two variants:**

**A) Standard CoT** — instruct the model to think step by step:
```
[Task]
Think step by step before giving your final answer.
```

**B) Few-Shot CoT** — show examples with reasoning included:
```
Question: [example question]
Reasoning: [step-by-step reasoning]
Answer: [final answer]

Question: {{QUESTION}}
Reasoning:
```

**Zero-Shot CoT trigger phrase:** `"Let's think step by step."`

**Tips:**
- Use CoT when the answer depends on intermediate steps
- Ask for reasoning *before* the answer, not after
- Works especially well on math, logic, planning tasks

---

## 4. Meta Prompting {#meta-prompting}

**When to use:** When you need the model to generate, improve, or evaluate other prompts. Good for prompt refinement workflows, auto-generating task prompts.

**Structure:**
```
You are an expert prompt engineer.
Given the following task description, generate a high-quality prompt that would get an AI model to complete it effectively.

Task: {{TASK_DESCRIPTION}}
Requirements: [any constraints on the prompt]

Output the prompt only, without explanation.
```

**Tips:**
- Useful for bootstrapping new prompts
- Can be chained: generate → test → refine

---

## 5. Self-Consistency {#self-consistency}

**When to use:** High-stakes reasoning tasks where you need the most reliable answer. Works by sampling multiple reasoning paths and taking the majority vote.

**Prompt pattern:**
```
[CoT prompt — same as CoT but run it N times]
```
Then aggregate responses programmatically or by asking the model:
```
Here are 3 different reasoned answers to the question below. 
Identify the most consistent/correct answer and explain why.

Answer 1: ...
Answer 2: ...
Answer 3: ...
```

**Tips:**
- Best implemented programmatically (call model 3–5x, aggregate)
- Increases reliability at the cost of token usage
- Most valuable for math and logic problems

---

## 6. Generate Knowledge Prompting {#generate-knowledge}

**When to use:** When the model needs domain knowledge activated before answering. Good for niche topics, nuanced questions.

**Two-step structure:**
```
Step 1 — Generate knowledge:
Generate 5 key facts about {{TOPIC}} that are relevant to answering: {{QUESTION}}

Step 2 — Answer using knowledge:
Using the facts above, answer the following question:
{{QUESTION}}
```

**Or in one prompt:**
```
Before answering, list relevant facts or context you know about {{TOPIC}}.
Then use those facts to answer: {{QUESTION}}
```

---

## 7. Prompt Chaining {#prompt-chaining}

**When to use:** Complex multi-step tasks where one prompt's output feeds the next. Research pipelines, document transformation, code generation + review + testing.

**Pattern:**
```
Prompt 1: [First step — produces intermediate output]
→ Output 1

Prompt 2: Using the output from the previous step: {{OUTPUT_1}}
[Second step]
→ Output 2

Prompt 3: ...
```

**Tips:**
- Break complex tasks into atomic, testable steps
- Pass outputs explicitly using {{PREV_OUTPUT}} placeholders
- Each prompt should have a single clear responsibility

---

## 8. Tree of Thoughts (ToT) {#tot}

**When to use:** Open-ended exploration, creative problem-solving, strategy, situations with multiple valid paths. Good for: business decisions, architecture design, writing outlines.

**Structure:**
```
Consider the following problem: {{PROBLEM}}

Generate 3 different high-level approaches to solving it.
For each approach, briefly outline:
- The core idea
- Key steps
- Potential risks

Then evaluate which approach is most promising and why.
```

**Or multi-turn ToT:**
```
Turn 1: Generate 3 candidate next steps
Turn 2: Evaluate each step's merit
Turn 3: Choose best path, generate next 3 steps
... repeat
```

---

## 9. ReAct (Reason + Act) {#react}

**When to use:** Agentic tasks where the model needs to reason and use tools interleaved. Best for: web search + answer, code execution + debug, API calls.

**Structure:**
```
You have access to the following tools:
- {{TOOL_1}}: [description]
- {{TOOL_2}}: [description]

To answer the user's question, reason about what to do, then act using a tool, then observe the result, then reason again.

Format:
Thought: [your reasoning]
Action: [tool name]
Action Input: [input to tool]
Observation: [result — filled by system]
... repeat ...
Final Answer: [your answer]

Question: {{QUESTION}}
```

---

## 10. Reflexion {#reflexion}

**When to use:** Iterative tasks where the model should self-critique and improve its output. Good for: code review, essay improvement, strategy refinement.

**Structure:**
```
Step 1 — Initial response:
[Task prompt]
{{INPUT}}

Step 2 — Self-critique:
Review your response above.
Identify: What's missing? What could be more accurate? What's unclear?

Step 3 — Improved response:
Now rewrite your response addressing the issues you identified.
```

**Or single-prompt version:**
```
Complete the task, then critique your own output, then produce a final improved version.

Task: {{TASK}}
```

---

## 11. Directional Stimulus Prompting (DSP) {#dsp}

**When to use:** When you want to guide the model toward a specific style, tone, or direction without writing a full example. Useful for copywriting, creative writing, tone control.

**Structure:**
```
[Task]

Hints/Direction: {{DIRECTIONAL_HINT}}
[Example: "Make it punchy", "Focus on the emotional benefit", "Use second person", "Be skeptical"]
```

**Tips:**
- Great for copywriting — pair with role and tone instructions
- The hint acts as a soft constraint that steers without over-specifying

---

## 12. Program-Aided Language Models (PAL) {#pal}

**When to use:** Math, data processing, symbolic tasks where code is more reliable than pure language reasoning.

**Structure:**
```
Solve the following problem by writing Python code that computes the answer.
Show your code, then run it and give the final answer.

Problem: {{PROBLEM}}

```python
# Your solution here
```

Final answer: [derived from code output]
```

**Tips:**
- Best when paired with a code execution environment
- Use for: calculations, data transformations, algorithmic problems

---

## 13. Automatic Prompt Engineer (APE) {#ape}

**When to use:** When you want to auto-generate and test variations of a prompt to find the best one.

**Structure:**
```
I will give you a task. Generate 5 different prompt variants that would effectively instruct an AI model to complete this task. Each variant should take a different approach (role-based, instruction-based, example-based, etc.).

Task: {{TASK_DESCRIPTION}}

Output each prompt numbered, without commentary.
```

---

## 14. RAG Pattern {#rag}

**When to use:** When the model needs to answer based on provided external documents, not just its training knowledge. Good for: document Q&A, knowledge base search, legal/research tasks.

**Structure:**
```
Use the following context to answer the question. 
If the answer is not in the context, say "I don't know based on the provided information."

Context:
{{DOCUMENT_OR_CHUNKS}}

Question: {{QUESTION}}

Answer:
```

**Tips:**
- Keep context focused — don't dump entire documents
- Instruct the model explicitly to stay grounded in the context
- Add "cite the relevant part of the context" for transparency
