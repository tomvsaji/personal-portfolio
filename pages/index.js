import Head from 'next/head'
import styles from '@/styles/Home.module.css'

const expertiseGroups = [
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

const projects = [
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

const seoDescription = 'Tom Vellavoor Saji is a Senior AI Engineer in Qatar specializing in Azure AI, RAG, agentic systems, and enterprise LLM platforms.'
const seoTitle = 'Tom Vellavoor Saji | Senior AI Engineer in Qatar'
const seoKeywords = 'Tom Vellavoor Saji, Senior AI Engineer Qatar, Azure OpenAI, RAG Engineer, Agentic Systems, Enterprise AI Architecture, Qatar Foundation AI, Al Jazeera AI'

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Tom Vellavoor Saji',
  jobTitle: 'Senior AI Engineer',
  description: seoDescription,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'Qatar',
  },
  knowsAbout: [
    'Azure OpenAI',
    'Retrieval-Augmented Generation',
    'Multi-agent orchestration',
    'Enterprise AI architecture',
    'AI infrastructure on Azure',
  ],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Anna University',
  },
  sameAs: [
    'https://github.com/tomvsaji',
    'https://linkedin.com/in/tom-v-saji',
  ],
}

export default function Home() {
  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content={seoDescription}
        />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index,follow,max-image-preview:large" />

        <meta property="og:type" content="profile" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:locale" content="en_QA" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </Head>

      <main className={styles.main}>
        <nav className={styles.navbar}>
          <a href="#expertise">Expertise</a>
          <a href="#projects">Projects</a>
          <a href="#open-source">Open Source</a>
          <a href="#contact">Contact</a>
        </nav>

        <section className={styles.hero}>
          <p className={styles.kicker}>Senior AI Engineer</p>
          <h1>Tom Vellavoor Saji</h1>
          <h2>Senior AI Engineer — Azure AI, Agentic Systems, and Enterprise LLM Platforms</h2>
          <p className={styles.location}>Based in Doha, Qatar · Building enterprise AI for public and private sector leaders</p>
          <p>
            I design and build production AI systems using Azure OpenAI, Retrieval-Augmented Generation,
            and multi-agent orchestration. My work powers enterprise and government AI deployments across
            Qatar.
          </p>
          <p className={styles.heroHighlights}>
            90+ AI systems in production · Scaled AI engineering from 3 to 30+ engineers · Delivered for
            Qatar Foundation, Al Jazeera, Qatar News Agency, and Invest Qatar.
          </p>
          <div className={styles.actions}>
            <a href="#projects">View Projects</a>
            <a href="https://github.com/tomvsaji" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/tom-v-saji" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="#contact">Contact</a>
          </div>
        </section>

        <section id="expertise" className={styles.section}>
          <h3>Expertise</h3>
          <div className={styles.grid}>
            {expertiseGroups.map((group) => (
              <article key={group.title} className={styles.card}>
                <h4>{group.title}</h4>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className={styles.section}>
          <h3>Key Projects</h3>
          <div className={styles.projectList}>
            {projects.map((project) => (
              <article key={project.title} className={styles.projectCard}>
                <h4>{project.title}</h4>
                <ul>
                  {project.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className={styles.architectureLabel}>Architecture</p>
                <p className={styles.architecture}>{project.architecture}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="open-source" className={styles.section}>
          <h3>Open Source</h3>
          <div className={styles.grid}>
            <article className={styles.card}>
              <h4>AI Agent Builder Platform</h4>
              <a href="https://github.com/tomvsaji/ui-form-based-agent-builder" target="_blank" rel="noreferrer">
                github.com/tomvsaji/ui-form-based-agent-builder
              </a>
              <ul>
                <li>Visual agent builder</li>
                <li>Self-hostable runtime</li>
                <li>Built-in RAG knowledge base</li>
                <li>Versioned configuration publishing</li>
                <li>Docker deployment</li>
              </ul>
            </article>
            <article className={styles.card}>
              <h4>LangChain RAG Agent</h4>
              <a href="https://github.com/tomvsaji/langchain-agent" target="_blank" rel="noreferrer">
                github.com/tomvsaji/langchain-agent
              </a>
              <ul>
                <li>Persistent chat memory</li>
                <li>Vector database</li>
                <li>REST API</li>
                <li>Full test suite</li>
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.grid}>
            <article className={styles.card}>
              <h3>Certifications</h3>
              <ul>
                <li>Microsoft Certified: Azure AI Engineer Associate</li>
                <li>Microsoft Certified: Azure Developer Associate</li>
              </ul>
            </article>
            <article className={styles.card}>
              <h3>Education</h3>
              <p>B.E Electrical &amp; Electronics Engineering</p>
              <p>Anna University — 2020</p>
            </article>
          </div>
        </section>

        <section id="contact" className={styles.section}>
          <h3>Contact</h3>
          <div className={styles.contactList}>
            <p>Email: <a href="mailto:tomvellavoor@gmail.com">tomvellavoor@gmail.com</a></p>
            <p>Phone: <a href="tel:+97431089681">+974 31089681</a></p>
            <p>LinkedIn: <a href="https://linkedin.com/in/tom-v-saji" target="_blank" rel="noreferrer">linkedin.com/in/tom-v-saji</a></p>
            <p>GitHub: <a href="https://github.com/tomvsaji" target="_blank" rel="noreferrer">github.com/tomvsaji</a></p>
          </div>
        </section>
      </main>
    </>
  )
}
