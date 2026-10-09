const skillGroups = [
  `JavaScript
TypeScript
Python
Java
C
C++
C#
Go
Rust
Ruby
PHP
Swift
Kotlin
Dart
Scala
Groovy
Perl
R
Julia
MATLAB
Bash
PowerShell
Lua
Elixir
Erlang
Haskell
Clojure
F#
OCaml
Solidity
Vyper
Assembly
Fortran
COBOL
Objective-C
Visual Basic .NET
SQL
PL/SQL
T-SQL
HTML
CSS
SCSS
Sass
Less
XML
JSON
YAML
Markdown
GraphQL
Protocol Buffers
WebAssembly
Regular expressions`,
  `Semantic HTML
HTML forms
CSS fundamentals
CSS Grid
Flexbox
Responsive design
Mobile-first design
Cross-browser development
Web accessibility
WCAG
ARIA
DOM manipulation
Browser APIs
Web Components
Custom Elements
Shadow DOM
Progressive Web Apps
Service Workers
Web storage
WebSockets
Server-sent events
Canvas API
WebGL
SVG
Web animations
CSS animations
CSS architecture
CSS Modules
Design tokens
Internationalization
Localization
Web performance
Core Web Vitals
SEO fundamentals
Micro-frontends
Frontend testing
Client-side routing
State management
Hydration
Server-side rendering
Static site generation
Content Security Policy
Browser DevTools
Responsive typography
Email development
Web standards
Web security fundamentals
Frontend architecture
UI engineering
Web forms
File uploads
Web notifications
WebRTC
WebAssembly performance
Browser compatibility`,
  `React
React Hooks
React Router
React Server Components
Next.js
Remix
Gatsby
Vue.js
Vue Router
Nuxt
Angular
Angular CLI
RxJS
NgRx
Svelte
SvelteKit
SolidJS
Astro
Qwik
Lit
Stencil
jQuery
Redux
Redux Toolkit
Zustand
MobX
Recoil
Pinia
Vuex
TanStack Query
Apollo Client
Relay
React Native
Expo
Tailwind CSS
Bootstrap
Foundation CSS
Material UI
Chakra UI
Ant Design
Radix UI
shadcn/ui
Emotion
Styled Components
Storybook
Webpack
Vite
Parcel
Rollup
esbuild
Babel
PostCSS
Lerna
Nx
Turborepo
Lighthouse`,
  `Node.js
Express.js
NestJS
Fastify
Koa
Hono
Deno
Bun
Django
Flask
FastAPI
Pyramid
Ruby on Rails
Sinatra
Laravel
Symfony
ASP.NET Core
Spring Boot
Quarkus
Micronaut
Gin
Echo
Fiber
Actix Web
Axum
Rocket
Phoenix Framework
AdonisJS
Meteor
Strapi
Directus
WordPress development
Drupal development
Server-side development
Backend architecture
Background jobs
Message queues
Webhooks
Authentication
Authorization
Session management
OAuth 2.0
OpenID Connect
JWT
Rate limiting
Caching
API versioning
File processing
Email services
Payment integration
Search implementation
Templating engines
Dependency injection
Middleware development
Serverless functions
Edge functions`,
  `REST APIs
REST API design
GraphQL API design
gRPC
OpenAPI
Swagger
API documentation
API testing
API integration
API security
HTTP fundamentals
HTTP caching
HTTP/2
HTTP/3
WebSocket APIs
Webhook design
JSON Schema
AsyncAPI
OAuth API integration
Pagination design
API rate limiting
API gateways
API observability
SOAP
XML-RPC
Event-driven APIs
Microservices APIs
Contract-first development
API mocking
Postman
Insomnia`,
  `PostgreSQL
MySQL
MariaDB
SQLite
Microsoft SQL Server
Oracle Database
MongoDB
CouchDB
Cassandra
DynamoDB
Redis
Elasticsearch
OpenSearch
Neo4j
ArangoDB
InfluxDB
TimescaleDB
ClickHouse
Snowflake
BigQuery
Amazon Redshift
Azure Cosmos DB
Firebase Firestore
Supabase
PlanetScale
CockroachDB
CockroachDB SQL
Database design
Relational modeling
Database normalization
Index design
Query optimization
SQL querying
Advanced SQL
Window functions
Stored procedures
Database migrations
Database administration
Data modeling
Schema design
Transactions
ACID properties
Replication
Sharding
Database backup and recovery
Connection pooling
ORMs
Prisma
Drizzle ORM
Sequelize
TypeORM
Mongoose
Entity Framework
Hibernate
SQLAlchemy
Alembic
Flyway
Liquibase
Database security
Vector databases
pgvector
Data warehousing`,
  `Amazon Web Services
AWS Lambda
Amazon EC2
Amazon S3
Amazon RDS
Amazon DynamoDB
Amazon CloudFront
Amazon API Gateway
Amazon ECS
Amazon EKS
AWS Fargate
AWS IAM
AWS CDK
AWS CloudFormation
Microsoft Azure
Azure Functions
Azure App Service
Azure Blob Storage
Azure SQL Database
Azure Kubernetes Service
Azure DevOps
Google Cloud Platform
Google Cloud Run
Google Kubernetes Engine
Google Cloud Functions
Google Cloud Storage
Google BigQuery
Firebase
Cloudflare
Cloudflare Workers
Vercel
Netlify
Render
Fly.io
DigitalOcean
Heroku
Oracle Cloud Infrastructure
IBM Cloud
Cloud architecture
Cloud migration
Cloud cost optimization
Cloud security
Cloud networking
Multi-cloud strategy
Hybrid cloud`,
  `Docker
Docker Compose
Kubernetes
Helm
Podman
Containerization
Container security
Terraform
OpenTofu
Pulumi
Ansible
Chef
Puppet
SaltStack
Infrastructure as Code
GitHub Actions
GitLab CI/CD
Jenkins
CircleCI
Buildkite
TeamCity
Argo CD
Flux CD
Continuous integration
Continuous delivery
Continuous deployment
Release engineering
Deployment automation
Blue-green deployment
Canary releases
Feature flags
Observability
Monitoring
Prometheus
Grafana
Datadog
New Relic
OpenTelemetry
Log aggregation
Distributed tracing
Incident response
Site reliability engineering
Platform engineering
DevOps
GitOps
Configuration management
Secrets management
Vault
Nginx
Apache HTTP Server
Traefik
Load balancing
Linux administration
Shell scripting
Build systems
Artifact management
Package management`,
  `Apache Kafka
Apache Spark
Apache Flink
Apache Beam
Apache Airflow
Dagster
Prefect
dbt
Fivetran
Airbyte
Meltano
Apache NiFi
Apache Hadoop
HDFS
Databricks
Delta Lake
Apache Iceberg
Apache Hudi
Data engineering
Data pipelines
ETL
ELT
Data orchestration
Data ingestion
Data transformation
Stream processing
Batch processing
Change data capture
Data lakehouse
Data lakes
Data warehouse design
Dimensional modeling
Star schema
Data quality
Data observability
Data governance
Metadata management
Data lineage
Master data management
Data cataloging
Data mesh
Data contracts
Event streaming
Feature engineering
Feature stores
Vector search
Real-time analytics
DataOps
Parquet
Apache Avro
Apache Arrow
Data serialization
Data replication`,
  `Data analysis
Exploratory data analysis
Statistical analysis
Applied statistics
Probability
Descriptive statistics
Hypothesis testing
Experimental design
A/B testing
Data visualization
Dashboard design
Business intelligence
Looker
Looker Studio
Tableau
Power BI
Microsoft Excel
Google Sheets
Apache Superset
Metabase
Mode Analytics
ThoughtSpot
Plotly
Matplotlib
Seaborn
Altair
ggplot2
D3.js
Observable Plot
Jupyter Notebook
JupyterLab
Pandas
Polars
NumPy
SciPy
R tidyverse
Data storytelling
KPI design
Metric design
Product analytics
Web analytics
Customer analytics
Financial analytics
Time series analysis
Forecasting
Survey analysis
Geospatial analysis
GIS
QGIS
ArcGIS
Reporting automation`,
  `Machine learning
Supervised learning
Unsupervised learning
Reinforcement learning
Deep learning
Neural networks
Natural language processing
Computer vision
Generative AI
Large language models
Prompt engineering
Retrieval-augmented generation
AI agents
Agentic workflows
Model evaluation
AI safety
Responsible AI
TensorFlow
PyTorch
Keras
JAX
scikit-learn
XGBoost
LightGBM
CatBoost
Hugging Face
Transformers
LangChain
LlamaIndex
Semantic Kernel
MLflow
Kubeflow
Weights & Biases
ONNX
Model serving
Model deployment
MLOps
LLMOps
Model monitoring
Fine-tuning
Transfer learning
Embedding models
Vector embeddings
Vector databases
Recommendation systems
Ranking systems
Anomaly detection
Classification
Regression
Clustering
Dimensionality reduction
Feature selection
Natural language understanding
Speech recognition
Text-to-speech
Image generation
AI application development
AI API integration
Data labeling
Synthetic data`,
  `Application security
Web application security
Cybersecurity
Security engineering
Threat modeling
Secure coding
OWASP Top 10
OWASP ASVS
Penetration testing
Vulnerability assessment
Vulnerability management
Security testing
Static application security testing
Dynamic application security testing
Software composition analysis
Dependency scanning
SAST
DAST
Fuzz testing
Cryptography
Encryption
Public key infrastructure
Identity and access management
Zero trust security
Network security
Cloud security posture management
Container security scanning
Secrets scanning
SIEM
Splunk
Microsoft Sentinel
Security operations
Digital forensics
Incident handling
Privacy engineering
Data privacy
GDPR
HIPAA compliance
SOC 2
PCI DSS
Risk assessment
Security architecture
Secure SDLC
Supply chain security
Endpoint security
Firewall administration
Linux security
Browser security
Authentication security
Authorization design
Passwordless authentication
Passkeys
Security awareness`,
  `Software testing
Unit testing
Integration testing
End-to-end testing
Acceptance testing
Regression testing
Smoke testing
Performance testing
Load testing
Stress testing
Reliability testing
Accessibility testing
Visual regression testing
Contract testing
Mutation testing
Property-based testing
Test-driven development
Behavior-driven development
Jest
Vitest
Mocha
Jasmine
Playwright
Cypress
Selenium
WebdriverIO
Puppeteer
Testing Library
JUnit
TestNG
Pytest
Unittest
RSpec
PHPUnit
NUnit
xUnit
Robot Framework
Postman testing
K6
JMeter
Locust
Quality assurance
Quality engineering
Test automation
Test planning
Test case design
Test data management
Mocking and stubbing
Code coverage
Continuous testing
Production testing
Chaos engineering
Bug triage
Defect management`,
  `Git
GitHub
GitLab
Bitbucket
Version control
Branching strategies
Code review
Pull request workflows
Monorepo management
Semantic versioning
Conventional Commits
npm
pnpm
yarn
Bun package manager
pip
Poetry
uv
Conda
Maven
Gradle
Cargo
Composer
NuGet
Make
CMake
Bazel
Just
VS Code
Visual Studio
IntelliJ IDEA
PyCharm
WebStorm
Neovim
Vim
Emacs
Postman
Insomnia
Figma
Miro
Linear
Jira
Confluence
Notion
Technical documentation
Developer experience
Developer tooling
CLI development
Automation scripting
Code generation
Linting
ESLint
Prettier
Ruff
Black formatter
Static analysis`,
  `Operating systems
Linux
Ubuntu
Debian
Fedora
Red Hat Enterprise Linux
Alpine Linux
Windows Server
macOS development
POSIX
Computer networking
TCP/IP
DNS
HTTP networking
TLS
SSH
VPNs
Subnetting
Routing
Switching
Network troubleshooting
Network protocols
Reverse proxies
Content delivery networks
Virtualization
VMware
Hyper-V
KVM
Storage systems
File systems
Concurrency
Parallel computing
Distributed systems
Distributed consensus
Fault tolerance
High availability
Scalability engineering
Systems programming
Memory management
Garbage collection
Operating system internals
Kernel development
Embedded systems
Internet of Things
Edge computing
Real-time systems
Computer architecture
Performance profiling
Network observability`,
  `iOS development
Android development
Mobile app development
Cross-platform development
Flutter
SwiftUI
Jetpack Compose
Xamarin
.NET MAUI
Ionic
Capacitor
Mobile UI design
Mobile accessibility
Mobile performance
Mobile testing
App Store deployment
Google Play deployment
Push notifications
Offline-first mobile apps
Mobile security
Kotlin Multiplatform
Unity development
Unreal Engine
Game development
Game programming
Game physics
Graphics programming
3D rendering
AR development
VR development
Spatial computing
Robotics software`,
  `Object-oriented programming
Functional programming
Procedural programming
Reactive programming
Asynchronous programming
Concurrent programming
Design patterns
Domain-driven design
Clean architecture
Hexagonal architecture
Layered architecture
Event-driven architecture
Microservices architecture
Service-oriented architecture
Monolithic architecture
Modular architecture
Distributed architecture
System design
Software architecture
API architecture
Data architecture
Cloud-native architecture
Serverless architecture
Resilience engineering
Technical debt management
Refactoring
Code maintainability
Algorithm design
Data structures
Complexity analysis
Problem solving
Pair programming
Agile software development
Scrum
Kanban
Extreme programming
Lean software development
Product engineering
Technical leadership
Engineering management
Estimation and planning
Requirements analysis
Architecture decision records
Design documentation
Technical communication
Mentoring developers
Cross-functional collaboration
Product management
User research
UX design
UI design
Interaction design
Information architecture
Prototyping
Usability testing
Design systems
Human-computer interaction
Inclusive design
Content design
Visual design
Wireframing
Journey mapping
Product discovery
Product strategy
Experimentation
Digital accessibility
Developer relations`,
];

const skillsByGroup = skillGroups.map((group) => group.split('\n').map((skill) => skill.trim()).filter(Boolean));
const uniqueSkills = [];
const seenSkills = new Set();
const longestGroup = Math.max(...skillsByGroup.map((group) => group.length));

for (let index = 0; index < longestGroup && uniqueSkills.length < 500; index += 1) {
  for (const group of skillsByGroup) {
    const skill = group[index];
    const normalizedSkill = skill?.toLowerCase();
    if (skill && !seenSkills.has(normalizedSkill)) {
      seenSkills.add(normalizedSkill);
      uniqueSkills.push(skill);
    }
    if (uniqueSkills.length === 500) break;
  }
}

export const skillCatalog = uniqueSkills.sort((first, second) => first.localeCompare(second));