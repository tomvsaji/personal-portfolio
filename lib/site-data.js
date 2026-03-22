export const expertiseGroups = [
  {
    title: 'AI & Agentic Systems',
    items: [
      'Azure OpenAI (GPT-4o)',
      'Semantic Kernel',
      'LangChain',
      'LangGraph',
      'Retrieval-Augmented Generation',
      'Microsoft Foundry Agent Service',
      'Model Context Protocol (MCP)',
    ],
  },
  {
    title: 'Cloud & Infrastructure',
    items: [
      'Azure AI Search',
      'Azure Container Apps',
      'Azure Functions',
      'Cosmos DB',
      'Service Bus',
      'Blob Storage',
      'Entra ID & RBAC',
      'Azure DevOps',
    ],
  },
  {
    title: 'Real-Time AI Systems',
    items: [
      'Azure Speech Services (TTS Avatar)',
      'WebRTC streaming',
      'WebSocket real-time AI',
      'Whisper speech processing',
    ],
  },
  {
    title: 'Engineering Stack',
    items: [
      'Python (FastAPI, Quart)',
      'TypeScript',
      'React / Next.js',
      'Node.js',
      'PostgreSQL',
      'Docker',
      'Microservices',
    ],
  },
]

export const featuredProjects = [
  {
    title: 'Botaina — Enterprise AI Chatbot (Qatar Foundation)',
    points: [
      'Enterprise chatbot built with Azure OpenAI and Azure AI Search',
      'Handles 3,000+ daily queries',
      'Achieves ~90% resolution rate',
      'Built secure private architecture using Entra ID and RBAC',
      'Supports multi-language RAG pipelines',
    ],
    architecture: 'Users → API Layer → RAG Orchestrator → Azure AI Search + GPT-4o → Guardrails + RBAC',
  },
  {
    title: 'Al Jazeera — Multilingual Video AI Platform',
    points: [
      'Hybrid Whisper + Azure transcription pipeline',
      'Supports 10+ languages for transcription and translation',
      'Includes AI content moderation in the processing loop',
      'Reduced editorial review time from hours to minutes',
    ],
    architecture: 'Ingest → Speech-to-Text (Whisper + Azure) → Translation → Moderation → Editorial Delivery',
  },
  {
    title: 'Real-Time AI Avatar Platform',
    points: [
      'WebRTC video streaming with low-latency response loops',
      'WebSocket audio pipelines for conversational flow',
      'Semantic Kernel tool calling integrated with business systems',
      'Azure Speech TTS avatars for production deployments',
      'Supports 50+ concurrent sessions across multiple products',
    ],
    architecture: 'Client ↔ WebRTC Session ↔ Real-Time Agent Core ↔ Tooling + TTS Avatar + Enterprise APIs',
  },
  {
    title: 'Government AI Agents (Foundry)',
    points: [
      'Private agentic AI systems for government entities',
      'Built on Microsoft Foundry Agents with secure tenancy boundaries',
      'Bing Custom Search grounding and multi-agent orchestration',
      'Secure Entra ID access controls for enterprise-grade governance',
      'Used by 200+ users across multiple departments',
    ],
    architecture: 'Entra ID Auth → Foundry Agent Mesh → Grounding Services → Department Workflows',
  },
]

export const sideProjects = [
  {
    title: 'AI Agent Builder Platform',
    href: 'https://github.com/tomvsaji/ui-form-based-agent-builder',
    label: 'github.com/tomvsaji/ui-form-based-agent-builder',
    items: [
      'Visual agent builder',
      'Self-hostable runtime',
      'Built-in RAG knowledge base',
      'Versioned configuration publishing',
      'Docker deployment',
    ],
  },
  {
    title: 'LangChain RAG Agent',
    href: 'https://github.com/tomvsaji/langchain-agent',
    label: 'github.com/tomvsaji/langchain-agent',
    items: [
      'Persistent chat memory',
      'Vector database',
      'REST API',
      'Full test suite',
    ],
  },
]

export const profile = {
  name: 'Tom Vellavoor Saji',
  role: 'Senior AI Engineer',
  headline: 'Senior AI Engineer — Azure AI, Agentic Systems, and Enterprise LLM Platforms',
  summary:
    'I design and build production AI systems using Azure OpenAI, Retrieval-Augmented Generation, and multi-agent orchestration. My work powers enterprise and government AI deployments across Qatar.',
  highlights:
    '90+ AI systems in production · Scaled AI engineering from 3 to 30+ engineers · Delivered for Qatar Foundation, Al Jazeera, Qatar News Agency, and Invest Qatar.',
  email: 'tomvellavoor@gmail.com',
  github: 'https://github.com/tomvsaji',
  linkedin: 'https://linkedin.com/in/tom-v-saji',
  x: 'https://twitter.com/tomvsaji2',
}
