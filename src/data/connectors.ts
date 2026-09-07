import { ConnectorDefinition, CloudSampleFile } from '../types';

export const ALL_CONNECTORS: ConnectorDefinition[] = [
  {
    id: 'google-search',
    name: 'Live Web Search & Grounding',
    category: 'productivity',
    description: 'Real-time live Google Search grounding to retrieve up-to-date web facts, news, documentation, and live data.',
    icon: 'Globe',
    badge: 'Live Grounding',
    enabled: true,
    isPopular: true,
    capabilities: ['Current news & live events', 'Real-time fact checking', 'External web citations & URLs', 'Latest tech releases'],
  },
  {
    id: 'code-sandbox',
    name: 'Python & JS Code Interpreter',
    category: 'developer',
    description: 'Sandboxed code execution environment that evaluates algorithms, computes complex math, parses datasets, and outputs structured visuals.',
    icon: 'Terminal',
    badge: 'Execution Engine',
    enabled: true,
    isPopular: true,
    capabilities: ['Execute JavaScript/Python logic', 'Data transformation & CSV analysis', 'Statistical calculations', 'Algorithm profiling'],
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage & Buckets (GCS/S3)',
    category: 'cloud-infra',
    description: 'Direct connector to virtual multi-cloud object storage buckets. Ingest CSV files, JSON config schemas, log dumps, and architectural specs.',
    icon: 'Cloud',
    badge: 'Multi-Cloud',
    enabled: true,
    isPopular: true,
    capabilities: ['Inspect bucket objects', 'Read CSV & JSON datasets', 'Analyze system logs', 'Synthesize cloud configuration'],
  },
  {
    id: 'sql-database',
    name: 'Enterprise SQL & Cloud Database',
    category: 'data-sql',
    description: 'Executes relational queries against PostgreSQL, Cloud SQL, and MySQL schemas with query optimization analysis and schema reflection.',
    icon: 'Database',
    badge: 'SQL Engine',
    enabled: true,
    isPopular: true,
    capabilities: ['Execute SELECT queries', 'Schema structure reflection', 'Explain plan analysis', 'Aggregated revenue/orders metrics'],
  },
  {
    id: 'github-devops',
    name: 'GitHub & CI/CD Pipelines',
    category: 'developer',
    description: 'Inspect repositories, pull request diffs, git commit history, GitHub Actions build workflows, and automated release notes.',
    icon: 'GitPullRequest',
    badge: 'DevOps',
    enabled: true,
    isPopular: true,
    capabilities: ['Review git diffs', 'Analyze open PRs & issues', 'CI/CD pipeline triage', 'Automated code review comments'],
  },
  {
    id: 'api-webhooks',
    name: 'REST API & Webhook Dispatcher',
    category: 'apis-webhooks',
    description: 'Test live external REST APIs, dispatch outbound webhooks, curl JSON endpoints, and parse API response payloads.',
    icon: 'Webhook',
    badge: 'HTTP Engine',
    enabled: true,
    isPopular: false,
    capabilities: ['Outbound HTTP GET/POST', 'Header & auth simulation', 'JSON response parsing', 'Webhook payload generation'],
  },
  {
    id: 'knowledge-rag',
    name: 'Enterprise Vector Knowledge (RAG)',
    category: 'knowledge-rag',
    description: 'Semantic vector retrieval over internal enterprise documents, security policies (SOC2/ISO27001), and developer runbooks.',
    icon: 'BookOpen',
    badge: 'Semantic Vector',
    enabled: true,
    isPopular: false,
    capabilities: ['SOC2 & compliance policies', 'DevOps incident runbooks', 'Architecture design RFCs', 'Internal HR & Engineering FAQs'],
  },
  {
    id: 'k8s-monitoring',
    name: 'Kubernetes & Cloud Observability',
    category: 'cloud-infra',
    description: 'Cluster health metrics, pod CPU/memory utilization, Kubernetes ingress status, and Prometheus alerting telemetry.',
    icon: 'Activity',
    badge: 'Telemetry',
    enabled: false,
    isPopular: false,
    capabilities: ['Pod health & restart counts', 'Node memory/CPU telemetry', 'CrashLoopBackOff diagnosis', 'Prometheus alert correlation'],
  },
  {
    id: 'slack-workspace',
    name: 'Slack & Teams Incident Messenger',
    category: 'productivity',
    description: 'Broadcast incident summaries, daily standup digests, and automated notifications to Slack channels and webhooks.',
    icon: 'MessageSquare',
    badge: 'Collaboration',
    enabled: false,
    isPopular: false,
    capabilities: ['Format rich Slack blocks', 'Broadcast channel alerts', 'Escalate urgent incidents', 'Draft team standup updates'],
  },
  {
    id: 'crm-stripe-billing',
    name: 'Stripe & CRM Revenue Engine',
    category: 'data-sql',
    description: 'Query MRR growth, churn rates, customer lifetime value (LTV), active SaaS subscriptions, and failed invoice retries.',
    icon: 'CreditCard',
    badge: 'FinOps',
    enabled: false,
    isPopular: false,
    capabilities: ['MRR / ARR calculations', 'Subscription renewal cohorts', 'Failed invoice analytics', 'Customer churn breakdown'],
  },
  {
    id: 'jira-project-tracker',
    name: 'Jira & Linear Agile Tracker',
    category: 'productivity',
    description: 'Track sprint velocities, epic burndown charts, backlog priority matrices, and engineering cycle times.',
    icon: 'CheckSquare',
    badge: 'Agile',
    enabled: false,
    isPopular: false,
    capabilities: ['Sprint velocity tracking', 'Unresolved blocker triage', 'Story point estimations', 'Release milestone audits'],
  },
  {
    id: 'security-scanner',
    name: 'Cloud Security & IAM Auditor',
    category: 'cloud-infra',
    description: 'Audit IAM permissions, public cloud bucket leaks, SSL certificate expirations, and CVE vulnerability databases.',
    icon: 'ShieldCheck',
    badge: 'SecOps',
    enabled: false,
    isPopular: false,
    capabilities: ['IAM over-privileged roles', 'Public storage bucket alerts', 'TLS/SSL certificate expiry', 'Dependency CVE vulnerability check'],
  }
];

export const SAMPLE_CLOUD_FILES: CloudSampleFile[] = [
  {
    name: 'q3_revenue_and_churn.csv',
    size: '142 KB',
    type: 'text/csv',
    bucket: 'prod-analytics-us-central1',
    updated: '2 hours ago',
    sampleContent: `date,region,mrr_usd,churn_rate,new_signups,enterprise_deals
2026-07-01,North America,482000,1.2%,1420,12
2026-07-15,Europe,315000,1.5%,980,8
2026-08-01,Asia-Pacific,210000,0.8%,840,5
2026-08-15,North America,510000,1.1%,1580,15
2026-09-01,Global,1140000,1.0%,4200,34`
  },
  {
    name: 'microservices_topology.json',
    size: '48 KB',
    type: 'application/json',
    bucket: 'infra-configs-us-east1',
    updated: 'Yesterday',
    sampleContent: `{
  "architecture": "Event-Driven Microservices",
  "gateway": "Kong Enterprise API Gateway (Port 443)",
  "services": [
    { "name": "auth-service", "runtime": "Go 1.22", "pods": 4, "p99_latency_ms": 14 },
    { "name": "voice-transcriber", "runtime": "Python 3.12 / GPU", "pods": 8, "p99_latency_ms": 120 },
    { "name": "connectors-hub", "runtime": "Node.js 22", "pods": 6, "p99_latency_ms": 42 },
    { "name": "database-cluster", "type": "Cloud SQL PostgreSQL 16 HA", "storage_gb": 500 }
  ]
}`
  },
  {
    name: 'incident_runbook_soc2.md',
    size: '85 KB',
    type: 'text/markdown',
    bucket: 'secops-compliance-vault',
    updated: '3 days ago',
    sampleContent: `# SOC2 Incident Handling Procedure
1. Severity P0: PagerDuty broadcast to Incident Commander within 3 minutes.
2. Voice Dispatch: Auto-call on-call engineers via Voice Gateway.
3. Containment: Rotate affected cloud API keys and invalidate active session tokens.
4. Post-Mortem: Publish root-cause analysis (RCA) within 48 hours to compliance board.`
  }
];

export const SAMPLE_SQL_TABLES = [
  {
    table: 'users',
    count: '24,510 rows',
    columns: ['id (UUID)', 'email (VARCHAR)', 'role (VARCHAR)', 'plan (VARCHAR)', 'created_at (TIMESTAMP)'],
    sampleData: [
      { id: 'usr_94a2', email: 'alex@cloudscale.io', role: 'DevOps Lead', plan: 'Enterprise Pro', created_at: '2026-02-14' },
      { id: 'usr_1b8c', email: 'sarah@fintech.co', role: 'CTO', plan: 'Enterprise', created_at: '2026-03-01' },
      { id: 'usr_7f3e', email: 'marcus@dataflow.ai', role: 'Staff ML Engineer', plan: 'Team', created_at: '2026-05-19' }
    ]
  },
  {
    table: 'cloud_connectors_telemetry',
    count: '1,492,030 events',
    columns: ['id (BIGINT)', 'connector_type (VARCHAR)', 'status_code (INT)', 'latency_ms (INT)', 'recorded_at (TIMESTAMP)'],
    sampleData: [
      { id: 98124, connector_type: 'google-search', status_code: 200, latency_ms: 184, recorded_at: '2026-09-07 06:45:00' },
      { id: 98125, connector_type: 'sql-database', status_code: 200, latency_ms: 28, recorded_at: '2026-09-07 06:50:12' },
      { id: 98126, connector_type: 'cloud-storage', status_code: 200, latency_ms: 64, recorded_at: '2026-09-07 07:01:22' }
    ]
  }
];
