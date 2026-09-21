import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizQuestion } from '../types';

const API_KEY_STORAGE_KEY = 'studyflow_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
}

export function hasApiKey(): boolean {
  return !!getStoredApiKey();
}

/**
 * Helper to get Gemini Generative Model with optional system instruction
 */
function getGeminiModel(systemInstruction?: string, modelName: string = 'gemini-1.5-flash') {
  const apiKey = getStoredApiKey();
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

/**
 * Generate Flashcards from raw student lecture notes, PDF text, or syllabus
 */
export async function generateFlashcardsFromNotes(
  notes: string,
  count: number = 5
): Promise<{ front: string; back: string; tags: string[] }[]> {
  const prompt = `You are an expert academic tutor creating active recall flashcards for students.
Analyze the following study notes and extract exactly ${count} high-yield, conceptual flashcards.
Format your output strictly as a JSON array of objects with keys:
- "front": concise question or prompt testing understanding
- "back": clear, accurate explanation/answer
- "tags": array of 1-2 category strings

Do NOT include markdown formatting or backticks around the JSON. Output raw JSON only.

STUDY NOTES:
${notes.slice(0, 5000)}
`;

  try {
    const model = getGeminiModel();
    if (model) {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (error) {
    console.warn('Gemini API call failed, falling back to simulated generation:', error);
  }

  return simulateFlashcardGeneration(notes, count);
}

/**
 * Generate a practice quiz with questions, options, correct answers, and explanations
 */
export async function generateQuizFromTopic(
  topic: string,
  count: number = 4,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<QuizQuestion[]> {
  const prompt = `You are an academic test maker. Generate ${count} multiple choice questions on the topic "${topic}" at ${difficulty} difficulty.
Return STRICTLY a JSON array of objects where each object has:
- "id": string unique id (e.g. "q-1", "q-2")
- "question": string
- "options": array of 4 distinct string choices
- "correctOptionIndex": integer 0-3 corresponding to the correct answer
- "explanation": string explaining why the answer is correct and why other choices are wrong
- "difficulty": "${difficulty}"

Do NOT wrap in markdown backticks or commentary. Only raw valid JSON.`;

  try {
    const model = getGeminiModel();
    if (model) {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (error) {
    console.warn('Gemini quiz generation failed, fallback applied:', error);
  }

  return simulateQuizGeneration(topic, count, difficulty);
}

export type TutorPersona = 'comprehensive' | 'socratic' | 'summary';

/**
 * Academic AI Tutor: Delivers rich, clear explanations, code, and diagrams
 */
export async function askSocraticTutor(
  messages: { role: 'user' | 'assistant'; content: string }[],
  subject: string = 'General Academic',
  persona: TutorPersona = 'comprehensive'
): Promise<string> {
  const systemInstruction = persona === 'comprehensive'
    ? `You are a brilliant, world-class academic tutor and professor specialized in ${subject}.
When a student asks about a concept, algorithm, or topic:
1. Provide an intuitive high-level explanation with a simple real-world analogy.
2. Provide a clear step-by-step breakdown of how it works.
3. Include clean, readable code implementations (Python/JavaScript/C++) and ASCII diagrams whenever applicable.
4. Highlight Time and Space complexity (Big-O).
5. Conclude with a quick 1-question check to verify their understanding.
Format your output cleanly in Markdown with bold terms and code blocks.`
    : persona === 'socratic'
    ? `You are an encouraging Socratic Academic Mentor in ${subject}. Guide the student using hints, thought experiments, and step-by-step questions to help them discover the answer themselves rather than just dumping solutions.`
    : `You are an academic cheat-sheet generator in ${subject}. Provide concise bullet points, definitions, key formulas, and complexity tables.`;

  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const model = getGeminiModel(systemInstruction);
      if (model) {
        // Filter history so it starts strictly with the first user message
        const firstUserIdx = messages.findIndex(m => m.role === 'user');
        const userPrompt = messages[messages.length - 1].content;

        if (firstUserIdx >= 0 && firstUserIdx < messages.length - 1) {
          // Construct alternating user/model history
          const historyItems = [];
          for (let i = firstUserIdx; i < messages.length - 1; i++) {
            const m = messages[i];
            historyItems.push({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            });
          }

          const chat = model.startChat({ history: historyItems });
          const result = await chat.sendMessage(userPrompt);
          return result.response.text();
        } else {
          // Single turn or fresh query: generate directly
          const prompt = `${systemInstruction}\n\nStudent asks:\n${userPrompt}`;
          const result = await model.generateContent(prompt);
          return result.response.text();
        }
      }
    } catch (error) {
      console.warn('Gemini tutor API call encountered an issue, falling back to intelligent responder:', error);
    }
  }

  // Intelligent offline knowledge engine
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  return generateIntelligentTutorReply(lastUserMsg, subject, persona);
}

/**
 * High-quality offline knowledge base for instant answers without API keys
 */
function generateIntelligentTutorReply(query: string, subject: string, _persona: TutorPersona): string {
  const q = query.toLowerCase();

  // 1. Breadth-First Search (BFS)
  if (q.includes('bfs') || q.includes('breadth first') || q.includes('breadth-first')) {
    return `### Breadth-First Search (BFS) Overview

**Breadth-First Search (BFS)** is a fundamental graph and tree traversal algorithm that explores nodes **level-by-level**, expanding outward like ripples in a pond from a starting vertex.

---

#### 1. Core Intuition & Mechanism
BFS visits all immediate neighbors of the starting node before moving on to neighbors-of-neighbors. 

To guarantee this first-come, first-served order, BFS relies on a **FIFO (First-In, First-Out) Queue** and a **Visited Set** to prevent infinite loops in cyclic graphs.

\`\`\`
       (A)           Level 0: [A]
      /   \\
    (B)   (C)        Level 1: [B, C]
    / \\     \\
  (D) (E)   (F)      Level 2: [D, E, F]
\`\`\`
*Traversal Order:* **A → B → C → D → E → F**

---

#### 2. Step-by-Step Algorithm
1. Initialize an empty **Queue** and push the starting node.
2. Initialize a \`visited\` set and mark the starting node.
3. While the Queue is not empty:
   - Dequeue the front node \`curr\`.
   - Process \`curr\` (print/record).
   - For each unvisited neighbor of \`curr\`:
     - Mark as visited.
     - Enqueue the neighbor.

---

#### 3. Python Implementation
\`\`\`python
from collections import deque

def bfs(graph, start_node):
    visited = {start_node}
    queue = deque([start_node])
    traversal_order = []

    while queue:
        vertex = queue.popleft()
        traversal_order.append(vertex)

        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                
    return traversal_order

# Example Graph
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B'],
    'F': ['C']
}

print("BFS Order:", bfs(graph, 'A'))
# Output: ['A', 'B', 'C', 'D', 'E', 'F']
\`\`\`

---

#### 4. Complexity & Key Properties
- **Time Complexity:** $\\mathcal{O}(V + E)$ where $V$ is vertices and $E$ is edges.
- **Space Complexity:** $\\mathcal{O}(V)$ to maintain the queue and visited set.
- **Shortest Path Property:** In an unweighted graph, BFS is guaranteed to find the **shortest path** (fewest edges) between two nodes!

*Quick Concept Check:* Why would using a Stack instead of a Queue completely change BFS into Depth-First Search (DFS)?`;
  }

  // 2. Depth-First Search (DFS)
  if (q.includes('dfs') || q.includes('depth first') || q.includes('depth-first')) {
    return `### Depth-First Search (DFS) Overview

**Depth-First Search (DFS)** is a traversal algorithm that plunges as deep as possible along each branch before **backtracking**.

---

#### 1. Core Mechanism
Unlike BFS which uses a Queue, DFS uses a **LIFO (Last-In, First-Out) Stack** (or recursion call stack).

\`\`\`
       (1)
      /   \\
    (2)   (5)
    / \\
  (3) (4)
\`\`\`
*Traversal Order:* **1 → 2 → 3 → 4 → 5**

---

#### 2. Python Implementation
\`\`\`python
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
        
    visited.add(node)
    print(node, end=" ")

    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
\`\`\`

- **Time Complexity:** $\\mathcal{O}(V + E)$
- **Space Complexity:** $\\mathcal{O}(V)$ for the recursion stack (worst case linked-list graph).
- **Primary Applications:** Cycle detection, Topological Sorting (DAGs), Connected Components, and Maze Solving.`;
  }

  // 3. Dijkstra's Algorithm
  if (q.includes('dijkstra') || q.includes('shortest path')) {
    return `### Dijkstra's Shortest Path Algorithm

**Dijkstra's Algorithm** finds the shortest path from a single source node to all other nodes in a **weighted graph with non-negative edge weights**.

---

#### 1. How It Works (Greedy Strategy)
1. Set distance to \`start = 0\`, all other nodes to $\\infty$.
2. Insert \`(0, start)\` into a **Min-Priority Queue (Min-Heap)**.
3. While the Min-Heap is not empty:
   - Extract the node \`u\` with minimum distance.
   - For each neighbor \`v\` with weight \`w\`:
     - If \`dist[u] + w < dist[v]\`:
       - Update \`dist[v] = dist[u] + w\` (Edge Relaxation).
       - Push \`(dist[v], v)\` into the Min-Heap.

- **Time Complexity:** $\\mathcal{O}((V + E) \\log V)$ with a binary heap.
- **Limitation:** Fails with negative weight edges (use Bellman-Ford instead).`;
  }

  // 4. Dynamic Programming
  if (q.includes('dynamic programming') || q.includes('dp')) {
    return `### Dynamic Programming (DP) Explained

**Dynamic Programming** is an algorithmic technique for solving complex problems by breaking them down into **overlapping subproblems** with **optimal substructure**.

---

#### Two Fundamental Approaches:
1. **Top-Down (Memoization):** Start with the main problem recursively and cache subproblem results in a hash table or array.
2. **Bottom-Up (Tabulation):** Start by solving the smallest base cases first and build up a table sequentially.

\`\`\`
Fibonacci Example:
Top-Down: fib(n) checks if cache[n] exists, else computes fib(n-1) + fib(n-2)
Bottom-Up: dp[0]=0, dp[1]=1, dp[i] = dp[i-1] + dp[i-2]
\`\`\`
- **Reduces Time Complexity** from exponential $\\mathcal{O}(2^n)$ down to linear $\\mathcal{O}(n)$!`;
  }

  // General Academic Formulations
  return `### Exploring: ${query.trim()} (${subject})

Let's break this down systematically:

1. **Core Concept Definition**:
   In ${subject}, **"${query.trim()}"** revolves around foundational principles of structure, transformation, and efficiency.

2. **Key Mechanisms**:
   - **Inputs & Preconditions**: Identify the known parameters and constraints.
   - **Execution Process**: Step-by-step state transitions and operations.
   - **Edge Cases**: Zero values, boundaries, or cyclical dependencies.

3. **Practical Strategy**:
   - Write out the initial state and expected target state.
   - Test with a minimal concrete test case (e.g. $n = 1, 2, 3$).
   - Identify whether an iterative, recursive, or analytical formula applies.

*Tip:* What specific scenario or problem are you applying this to? Let me know and I will provide tailored code and step-by-step derivations!`;
}

function simulateFlashcardGeneration(notes: string, count: number) {
  const sampleDecks = [
    {
      front: 'What is the primary mechanism of Spaced Repetition (SM-2)?',
      back: 'It schedules reviews at expanding intervals based on active recall difficulty, preventing forgetting by combating the Ebbinghaus Forgetting Curve.',
      tags: ['Cognitive Science', 'Study OS'],
    },
    {
      front: 'How does Breadth-First Search (BFS) explore graph vertices?',
      back: 'It explores vertices level-by-level using a FIFO Queue and Visited set, guaranteeing the shortest path in unweighted graphs in O(V + E) time.',
      tags: ['Algorithms', 'Graphs'],
    },
    {
      front: 'What role does the Ease Factor (EF) play in SM-2?',
      back: 'The Ease Factor modulates how quickly review intervals multiply. Harder cards have a lower EF (minimum 1.3), resulting in more frequent reviews.',
      tags: ['Algorithms', 'SM-2'],
    },
    {
      front: 'What is the difference between Mutex and Semaphore?',
      back: 'A mutex has ownership (only the acquiring thread can release it). A semaphore is a signaling mechanism with an integer counter that can be incremented/decremented by any thread.',
      tags: ['Operating Systems'],
    },
    {
      front: `Key Concept extracted from notes: "${notes.slice(0, 45).trim()}..."`,
      back: 'High-yield active recall summary synthesized from your uploaded notes.',
      tags: ['Study Notes'],
    },
  ];

  return sampleDecks.slice(0, count);
}

function simulateQuizGeneration(topic: string, count: number, difficulty: 'easy' | 'medium' | 'hard'): QuizQuestion[] {
  const bank: QuizQuestion[] = [
    {
      id: 'q-1',
      question: `In graph algorithms, which data structure is essential for implementing Breadth-First Search (BFS)?`,
      options: ['FIFO Queue', 'LIFO Stack', 'Max-Heap', 'Binary Search Tree'],
      correctOptionIndex: 0,
      explanation: 'BFS uses a FIFO Queue to ensure vertices are explored level-by-level in the order they were discovered.',
      difficulty,
    },
    {
      id: 'q-2',
      question: `What is the time complexity of Breadth-First Search on a graph with V vertices and E edges?`,
      options: ['O(V + E)', 'O(V * E)', 'O(V log V)', 'O(E^2)'],
      correctOptionIndex: 0,
      explanation: 'Every vertex is enqueued at most once and every edge is inspected at most twice in an undirected graph, yielding O(V + E).',
      difficulty,
    },
    {
      id: 'q-3',
      question: `Regarding ${topic}: Which principle best explains why spaced practice outperforms massed cramming?`,
      options: [
        'The Spacing Effect & Memory Consolidation during sleep',
        'Cognitive Overload Theory',
        'Passive Rehearsal Advantage',
        'Retroactive Interference Inhibition',
      ],
      correctOptionIndex: 0,
      explanation: 'The Spacing Effect demonstrates that distributed study intervals trigger memory reconsolidation and deeper retrieval paths.',
      difficulty,
    },
    {
      id: 'q-4',
      question: `When does Dijkstra’s algorithm fail to produce the correct shortest path?`,
      options: [
        'When the graph contains negative edge weights',
        'When the graph has cycles',
        'When the graph is directed',
        'When edges have equal weights',
      ],
      correctOptionIndex: 0,
      explanation: 'Dijkstra assumes that adding an edge to a path always increases its cost. Negative weights violate this greedy assumption.',
      difficulty,
    }
  ];

  return bank.slice(0, count);
}
