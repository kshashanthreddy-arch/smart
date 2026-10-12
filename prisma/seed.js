const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for Smart Study Management System...');

  // Clean existing data
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.flashcardDeck.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // Create primary demo student
  const user = await prisma.user.create({
    data: {
      id: 'demo-student-id',
      name: 'Alex Morgan',
      email: 'alex@university.edu',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      targetGpa: 3.85,
      studyStreak: 5,
      totalStudyMinutes: 840,
    },
  });

  // Create Subjects
  const dsa = await prisma.subject.create({
    data: {
      userId: user.id,
      code: 'CS301',
      title: 'Data Structures & Algorithms',
      color: '#4f46e5', // Indigo
      instructor: 'Dr. Arthur Mitchell',
      room: 'SciTech Hall 402',
      credits: 4,
      targetGrade: 'A',
      attendancePresent: 22,
      attendanceTotal: 24,
    },
  });

  const ai = await prisma.subject.create({
    data: {
      userId: user.id,
      code: 'CS305',
      title: 'Artificial Intelligence & Machine Learning',
      color: '#7c3aed', // Purple
      instructor: 'Prof. Linda Zhao',
      room: 'Turing Lab B',
      credits: 4,
      targetGrade: 'A',
      attendancePresent: 18,
      attendanceTotal: 20,
    },
  });

  const db = await prisma.subject.create({
    data: {
      userId: user.id,
      code: 'CS312',
      title: 'Database Systems & Cloud Architecture',
      color: '#0891b2', // Cyan
      instructor: 'Prof. Robert Davis',
      room: 'Hall 105',
      credits: 3,
      targetGrade: 'A-',
      attendancePresent: 19,
      attendanceTotal: 20,
    },
  });

  const math = await prisma.subject.create({
    data: {
      userId: user.id,
      code: 'MATH204',
      title: 'Probability & Linear Algebra',
      color: '#059669', // Emerald
      instructor: 'Dr. K. Raman',
      room: 'Euler Complex 201',
      credits: 3,
      targetGrade: 'B+',
      attendancePresent: 15,
      attendanceTotal: 18,
    },
  });

  // Tasks / Assignments
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        subjectId: dsa.id,
        title: 'Implement Dijkstra & A* Shortest Path Algorithms',
        description: 'Complete the pathfinding assignment with priority queue benchmarks and time complexity comparisons.',
        dueDate: new Date(now.getTime() + 3 * day),
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        estimatedMinutes: 90,
        weight: 15,
      },
      {
        userId: user.id,
        subjectId: ai.id,
        title: 'Convolutional Neural Network Lab Report',
        description: 'Analyze training curves, loss gradients, and accuracy metrics for the CIFAR-10 classification model.',
        dueDate: new Date(now.getTime() + 1 * day),
        priority: 'URGENT',
        status: 'TODO',
        estimatedMinutes: 120,
        weight: 20,
      },
      {
        userId: user.id,
        subjectId: db.id,
        title: 'Design 3NF Relational Database Schema',
        description: 'Create normalized ER diagrams, SQL DDL scripts, and indexing strategies for the e-commerce store.',
        dueDate: new Date(now.getTime() - 2 * day),
        priority: 'MEDIUM',
        status: 'COMPLETED',
        estimatedMinutes: 60,
        weight: 10,
      },
      {
        userId: user.id,
        subjectId: math.id,
        title: 'Eigenvalues and Diagonalization Problem Set 5',
        description: 'Solve problem questions 1 to 14 from chapter 5 with full step-by-step matrix decompositions.',
        dueDate: new Date(now.getTime() + 5 * day),
        priority: 'MEDIUM',
        status: 'TODO',
        estimatedMinutes: 75,
        weight: 10,
      },
      {
        userId: user.id,
        subjectId: ai.id,
        title: 'Read & Annotate Attention Is All You Need Paper',
        description: 'Review self-attention mechanisms, multi-head projections, and positional encoding methods.',
        dueDate: new Date(now.getTime() + 7 * day),
        priority: 'LOW',
        status: 'IN_PROGRESS',
        estimatedMinutes: 45,
        weight: 5,
      },
    ],
  });

  // Notes
  await prisma.note.create({
    data: {
      userId: user.id,
      subjectId: dsa.id,
      title: 'Master Theorem for Divide & Conquer Recurrences',
      content: `The Master Theorem provides a cookbook solution in asymptotic terms (using Big O) for recurrence relations that occur in many divide-and-conquer algorithms.

Equation form: T(n) = a * T(n/b) + f(n)
Where:
- a >= 1: number of subproblems in the recursion
- b > 1: factor by which the subproblem size is divided
- f(n): cost of the work done outside recursive calls (dividing & combining)

Case 1: If f(n) = O(n^(log_b(a) - epsilon)) for some epsilon > 0, then T(n) = Theta(n^(log_b(a))).
Case 2: If f(n) = Theta(n^(log_b(a)) * log^k(n)), then T(n) = Theta(n^(log_b(a)) * log^(k+1)(n)).
Case 3: If f(n) = Omega(n^(log_b(a) + epsilon)) and regularity condition holds, then T(n) = Theta(f(n)).`,
      summary: '• Fast method for solving T(n) = a*T(n/b) + f(n)\n• Compare f(n) with n^(log_b(a))\n• Case 1: tree leaves dominate; Case 2: balanced tree; Case 3: root dominates.',
      tags: 'Algorithms, Divide and Conquer, Big-O, Asymptotic Analysis',
    },
  });

  await prisma.note.create({
    data: {
      userId: user.id,
      subjectId: ai.id,
      title: 'Supervised vs Reinforcement Learning',
      content: `Supervised Learning:
The model is trained on labeled pairs (input X, ground truth Y). The loss function directly penalizes predictions differing from ground truth (e.g. Cross-Entropy, MSE).
Examples: Linear regression, ResNet, BERT.

Reinforcement Learning:
An agent interacts with an environment sequentially. At state S_t, it takes action A_t, receives reward R_{t+1}, and transitions to state S_{t+1}.
Key challenges:
1. Exploration vs Exploitation tradeoff
2. Credit assignment problem (delayed rewards)
3. Policy gradient vs Q-learning methods`,
      summary: '• Supervised: Explicit ground truth labels, static feedback.\n• RL: Trial-and-error agent in environment with scalar rewards and delayed feedback.\n• Policy & Value functions guide action selection.',
      tags: 'AI, Machine Learning, Reinforcement Learning, Overview',
    },
  });

  await prisma.note.create({
    data: {
      userId: user.id,
      subjectId: db.id,
      title: 'ACID Transactions & B-Tree Indexing in RDBMS',
      content: `ACID Properties:
- Atomicity: All operations in a transaction succeed or all fail together.
- Consistency: Database moves only from one valid state to another valid state.
- Isolation: Concurrent transactions do not interfere; levels include Read Committed, Repeatable Read, Serializable.
- Durability: Once committed, state changes survive power failures via Write-Ahead Logging (WAL).

B-Trees and B+ Trees:
Self-balancing m-way search trees tailored for block storage. In B+ trees, all values are stored in linked leaf nodes for rapid range queries, while internal nodes store only routing keys.`,
      summary: '• ACID guarantees relational integrity.\n• WAL provides durability.\n• B+ Trees optimize disk I/O and sequential range scans.',
      tags: 'Database, ACID, B-Trees, Transactions, SQL',
    },
  });

  // Flashcard Deck 1
  const deck1 = await prisma.flashcardDeck.create({
    data: {
      userId: user.id,
      subjectId: dsa.id,
      title: 'Data Structures Core Concepts',
      description: 'Essential Big-O complexities, data structure properties, and common interview questions.',
      cards: {
        create: [
          {
            front: 'What is the average and worst-case time complexity of QuickSort?',
            back: 'Average: O(n log n). Worst-case: O(n²) when the pivot chosen is consistently the smallest or largest element.',
            difficulty: 'MEDIUM',
            mastered: true,
            reviewCount: 3,
          },
          {
            front: 'What is the difference between a Tree and a Graph?',
            back: 'A tree is a connected, undirected acyclic graph. In a tree with N vertices, there are exactly N-1 edges and no cycles.',
            difficulty: 'EASY',
            mastered: true,
            reviewCount: 4,
          },
          {
            front: 'How does a Hash Table resolve collisions using Open Addressing?',
            back: 'When a collision occurs, it probes alternate slots in the array sequentially (Linear Probing), quadratically (Quadratic Probing), or using a second hash function (Double Hashing).',
            difficulty: 'HARD',
            mastered: false,
            reviewCount: 1,
          },
          {
            front: 'What is the time complexity of searching in an AVL Tree or Red-Black Tree?',
            back: 'O(log n) worst-case and average-case, because self-balancing rotations guarantee height is bounded by O(log n).',
            difficulty: 'MEDIUM',
            mastered: false,
            reviewCount: 2,
          },
          {
            front: 'Why is Breadth-First Search (BFS) used to find the shortest path in unweighted graphs?',
            back: 'BFS explores nodes layer by layer (by distance 1, 2, 3...), guaranteeing that the first time a target vertex is reached, the path taken is minimal.',
            difficulty: 'EASY',
            mastered: true,
            reviewCount: 5,
          },
        ],
      },
    },
  });

  // Flashcard Deck 2
  await prisma.flashcardDeck.create({
    data: {
      userId: user.id,
      subjectId: ai.id,
      title: 'Machine Learning Terminology',
      description: 'Key definitions and foundations for AI and Deep Learning.',
      cards: {
        create: [
          {
            front: 'What is Overfitting, and how can it be mitigated?',
            back: 'Overfitting occurs when a model learns noise and details in training data so closely that it generalizes poorly to unseen data. Mitigations: Regularization (L1/L2), Dropout, Data Augmentation, Early Stopping.',
            difficulty: 'MEDIUM',
            mastered: true,
            reviewCount: 4,
          },
          {
            front: 'What is the vanishing gradient problem in Deep Neural Networks?',
            back: 'As backpropagation travels backward through many layers, gradients multiplied by small derivatives (like Sigmoid < 0.25) shrink exponentially towards 0, stalling learning in early layers. Solution: ReLU activation, Residual connections (ResNet).',
            difficulty: 'HARD',
            mastered: false,
            reviewCount: 2,
          },
          {
            front: 'What is the difference between Precision and Recall?',
            back: 'Precision = TP / (TP + FP) (How many selected items are relevant?). Recall = TP / (TP + FN) (How many relevant items were selected?).',
            difficulty: 'MEDIUM',
            mastered: true,
            reviewCount: 3,
          },
        ],
      },
    },
  });

  // Quiz 1
  const quiz1 = await prisma.quiz.create({
    data: {
      userId: user.id,
      subjectId: dsa.id,
      title: 'Data Structures Mastery Assessment',
      topic: 'Sorting, Trees, and Algorithmic Complexity',
      score: 80,
      totalQuestions: 4,
      completedAt: new Date(now.getTime() - 1 * day),
      questions: {
        create: [
          {
            question: 'Which sorting algorithm has a worst-case time complexity of O(n log n) and is stable?',
            options: JSON.stringify(['QuickSort', 'MergeSort', 'HeapSort', 'SelectionSort']),
            correctAnswer: 1,
            userAnswer: 1,
            explanation: 'MergeSort divides the array into halves and merges them in O(n log n) time in all cases while maintaining the relative order of equal elements (stable). HeapSort is not stable, and QuickSort is O(n²) worst-case.',
          },
          {
            question: 'What is the maximum number of nodes in a binary tree of depth k (with root at depth 0)?',
            options: JSON.stringify(['2^k', '2^(k+1) - 1', '2^(k-1)', 'k^2']),
            correctAnswer: 1,
            userAnswer: 1,
            explanation: 'A full binary tree has sum_{i=0}^k 2^i = 2^(k+1) - 1 total nodes.',
          },
          {
            question: 'What data structure is typically used to implement Breadth-First Search (BFS)?',
            options: JSON.stringify(['Stack', 'Priority Queue', 'Queue (FIFO)', 'Hash Map']),
            correctAnswer: 2,
            userAnswer: 2,
            explanation: 'BFS explores neighbors level by level in First-In-First-Out order, so a Queue is used.',
          },
          {
            question: 'What is the space complexity of an in-place QuickSort algorithm (recursive call stack)?',
            options: JSON.stringify(['O(1)', 'O(log n) average', 'O(n) worst-case', 'Both B and C']),
            correctAnswer: 3,
            userAnswer: 0,
            explanation: 'The call stack takes O(log n) auxiliary space on average and can degrade to O(n) space in the worst unbalanced case.',
          },
        ],
      },
    },
  });

  // Study Sessions (Pomodoro logs for the past 7 days)
  const sessionData = [
    { durationMinutes: 50, sessionType: 'POMODORO', subjectId: dsa.id, offsetDays: 0, notes: 'Completed graph problems' },
    { durationMinutes: 25, sessionType: 'POMODORO', subjectId: ai.id, offsetDays: 0, notes: 'Reviewed CNN architectures' },
    { durationMinutes: 45, sessionType: 'POMODORO', subjectId: db.id, offsetDays: 1, notes: 'SQL index optimization' },
    { durationMinutes: 50, sessionType: 'POMODORO', subjectId: math.id, offsetDays: 2, notes: 'Eigenvector calculation' },
    { durationMinutes: 60, sessionType: 'POMODORO', subjectId: dsa.id, offsetDays: 3, notes: 'Dynamic programming memoization' },
    { durationMinutes: 50, sessionType: 'POMODORO', subjectId: ai.id, offsetDays: 4, notes: 'Attention mechanism reading' },
    { durationMinutes: 30, sessionType: 'POMODORO', subjectId: db.id, offsetDays: 5, notes: 'Transactions and isolation levels' },
  ];

  for (const s of sessionData) {
    await prisma.studySession.create({
      data: {
        userId: user.id,
        subjectId: s.subjectId,
        durationMinutes: s.durationMinutes,
        sessionType: s.sessionType,
        notes: s.notes,
        createdAt: new Date(now.getTime() - s.offsetDays * day - 1000 * 60 * 30),
      },
    });
  }

  console.log('Database seeded successfully with demo student, subjects, tasks, notes, flashcards, quiz, and study sessions!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
