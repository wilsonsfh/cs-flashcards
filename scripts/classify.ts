import type { CardCategory } from '../src/types/database'

type Rule = { category: CardCategory; pattern: RegExp }

const RULES: Rule[] = [
  {
    category: 'networking',
    pattern: /\b(TCP|UDP|HTTP[S]?|DNS|OSI|TLS|SSL|IPv[46]|subnet|CIDR|socket|packet|router|switch|PDU|ethernet|MAC address|three[- ]way handshake|SYN|ACK|network layer|transport layer|data link layer|ICMP)\b/i,
  },
  {
    category: 'os',
    pattern: /\b(context switch|scheduler|mutex|semaphore|deadlock|page table|virtual memory|fork|exec|interrupt|system call|kernel|MMU|DMA|TLB|PCB|livelock|race condition|critical section|spinlock|pipeline stall|cache line|cache coherenc[ey]|superscalar|NUMA)\b/i,
  },
  {
    category: 'algorithms',
    pattern: /\b(quicksort|merge\s?sort|heapsort|radix sort|counting sort|insertion sort|selection sort|bubble sort|timsort|DFS|BFS|Dijkstra|Bellman[- ]Ford|Floyd[- ]Warshall|Prim|Kruskal|topological sort|dynamic programming|Ford[- ]Fulkerson|KMP|Boyer[- ]Moore|Rabin[- ]Karp|Huffman|binary search|greedy|backtracking|divide and conquer|NP[- ](Complete|Hard)|traveling salesman|knapsack|FFT|shortest path|minimum spanning tree|maximum flow|Big[- ]O|time complexity|space complexity)\b/i,
  },
  {
    category: 'data_structures',
    pattern: /\b(binary tree|BST|AVL tree|red[- ]black tree|splay tree|treap|trie|B[- ]tree|linked list|adjacency list|adjacency matrix|skip list|van Emde Boas|Bloom filter|disjoint set|union[- ]find|suffix tree|hash table|priority queue|deque|stack|queue)\b/i,
  },
]

// "process" and "thread" need special handling to avoid false positives
const OS_CONTEXT_PATTERN = /\b(process(?:es|ing)?|thread(?:s|ing)?)\b/i
const OS_CONTEXT_QUALIFIERS = /\b(schedul|context switch|mutex|semaphore|deadlock|kernel|fork|exec|CPU|concurren|synchroniz|IPC|PID|parent process|child process|multi[- ]?thread|user[- ]?space|kernel[- ]?space)\b/i

// "heap" needs context to distinguish data structure from OS memory
const HEAP_DS_PATTERN = /\b(heap(?:s|ify)?)\b/i
const HEAP_DS_QUALIFIERS = /\b(min[- ]?heap|max[- ]?heap|heapify|binary heap|heap sort|priority queue|extract[- ]?min|extract[- ]?max|sift|percolate)\b/i

export function classifyCard(front: string, back: string, originalType: number): CardCategory {
  if (originalType === 2) return 'code'

  const text = `${front} ${back}`

  // Check priority-ordered rules
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return rule.category
    }
  }

  // Check process/thread with OS context
  if (OS_CONTEXT_PATTERN.test(text) && OS_CONTEXT_QUALIFIERS.test(text)) {
    return 'os'
  }

  // Check heap with data structure context
  if (HEAP_DS_PATTERN.test(text) && HEAP_DS_QUALIFIERS.test(text)) {
    return 'data_structures'
  }

  return 'general'
}
