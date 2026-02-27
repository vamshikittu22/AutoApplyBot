import { describe, it, expect } from 'vitest';
import { parseResume } from '../../../src/lib/parser/resume-parser';

describe('Vamshi Resume Test', () => {
  it('should parse Vamshi Krishna Pullaiahgari resume correctly', () => {
    const vamshiResume = `Vamshi Krishna Pullaiahgari
Software Engineer
+1 (913) 326-7373 | vamshikrishna2297@gmail.com | LinkedIn | GitHub | Portfolio
PROFESSIONAL SUMMARY												
Software Engineer with 6 years of experience designing and delivering scalable backend systems, distributed systems, and microservices architectures using Go, Java, Python, and AI agentic workflows. Proven expertise in RESTful APIs, real-time data flows, message queue architecture (Kafka), service-oriented architecture, high-availability systems, and production monitoring across high-volume environments. Strong focus on clean code, comprehensive testing practices, and cross-functional collaboration with Product, Design, and Business stakeholders.
TECHNICAL SKILLS													
Languages & Frameworks: Go, Java (8–17), Python, C, C#, Spring Boot, Spring Framework, Node.js, JavaScript, TypeScript
Backend & APIs: RESTful APIs, Microservices, Distributed Systems, Real-time Data Flows, Event-Driven Systems, GraphQL, High-Availability
Message Queue & Streaming: Apache Kafka, Apache Pulsar, Message Queue Architecture
Databases & Data: MySQL, PostgreSQL, MongoDB, Redis, ClickHouse, ElasticSearch, SQL, NoSQL, Hibernate, JPA
Cloud & Infrastructure: AWS (EC2, ECS, EKS, Lambda, S3, RDS), Docker, Kubernetes, Azure (AKS, Functions)
DevOps & Monitoring: CI/CD, Jenkins, GitHub Actions, Live System Metrics, Production Monitoring, CloudWatch
Testing & Quality: Unit Testing, Integration Testing, JUnit, Mockito, Test-Driven Development, QA Coordination
Tools & Collaboration: Git, GitHub, Maven, Gradle, JIRA, Confluence
Frontend: React, Angular, Vue.js
AI & Analytics: AI Agentic Workflow, OpenAI API, LLM Integration, Python Pipelines

PROFESSIONAL EXPERIENCE												
CVS Health | Software Engineer 								         Feb 2025 – Present| Texas, USA
Claims Management Dashboard – Java, Spring Boot, Angular, Vue.js, REST APIs, GraphQL, AWS ECS, RDS, D3.js.
•	Owned feature development through complete lifecycle: design, development, testing, release, and production monitoring, collaborating with Product and Design stakeholders to prioritize new features.
•	Monitored live system metrics, responded to alerts, and troubleshot production issues using CloudWatch dashboards and log analysis.
•	Designed Java Spring Boot RESTful APIs supporting high-volume claims processing workflows, implementing microservices architecture patterns and owning features through design, development, testing, release, and production monitoring.
•	Built scalable data ingestion pipelines processing large data volumes of healthcare claims, optimizing real-time data flows and ETL workflows for throughput and reliability across distributed systems using event-driven architecture and Kafka message queues.
•	Collaborated with cross-functional engineering and product teams to define data requirements, debug production issues, and deliver data-driven features supporting analytics and reporting workflows.
•	Monitored live system metrics through on-call rotation, responded to alerts, and troubleshot production issues by analyzing logs and performing root cause analysis to maintain system availability.
•	Orchestrated containerized deployment using Docker and CI/CD pipelines with automated unit and integration tests, achieving sub-500ms p95 latency through performance optimization and CloudWatch-based monitoring.
Citadel (Financial Services) | Software Engineer 						       Aug 2024 – Dec 2024 | Florida, USA
Trading & Risk Management Systems – Go, Java, Spring Boot, React.js, Kafka, PostgreSQL, Azure AKS, Microservices.
•	Designed and developed high-performance Go microservices for real-time financial transaction processing, handling 100K+ transactions/sec with sub-100ms latency, implementing distributed systems patterns (service discovery, circuit breakers, graceful degradation) to support 10x traffic growth in high-availability environments.
•	Collaborated with Product, Design, and Business stakeholders to plan and prioritize feature development, ensuring alignment with business requirements and customer experience goals.
•	Implemented comprehensive monitoring and observability solutions using Azure Monitor and Application Insights, establishing alerting mechanisms and dashboards for proactive incident response and system health tracking.
•	Scaled data pipelines using Apache Spark to process petabyte-scale financial transaction data volumes, implementing distributed computing strategies for improved throughput and cost-efficiency across Kafka-based event streams.
•	Collaborated with data science teams to design data infrastructure supporting A/B testing and metrics analysis, ensuring data quality and meeting business requirements for trading systems.
Mphasis | Software Engineer								       Feb 2021 – July 2023 | Pune, India
Digital Banking Modernization – Java, Spring Boot, C#, Angular, REST APIs, OAuth 2.0, Oracle, PostgreSQL, AWS EKS.
•	Designed and maintained Java Spring Boot RESTful APIs implementing business logic and integration patterns, owning features through design, development, testing, and release while collaborating in a responsive team environment to deliver features across multiple internal banking systems.
•	Built ETL pipelines and data ingestion services for banking systems, processing millions of customer transactions with data validation, quality checks, and compliance with regulatory requirements.
•	Improved scalability and maintainability of applications through SQL query optimization and database tuning in Oracle and PostgreSQL, reducing query latency for high-volume production workloads.
•	Wrote clean, maintainable, performant, and well-tested code with comprehensive unit tests and integration tests using JUnit and Mockito, achieving 85%+ code coverage and coordinating with QA for regression testing of new features.
Covantech Pvt Ltd | Associate Software Engineer					           Aug 2019 – Jan 2021 | Hyderabad, India
Healthcare CRM Platform Modernization – Python, Selenium WebDriver, REST APIs, Kafka, AWS ECS, Oracle, MongoDB.
•	Developed Python and Java-based data pipelines for healthcare CRM platform, implementing data ingestion and transformation workflows across distributed systems handling large data volumes.
•	Worked with QA teams to coordinate regression testing for new features, ensuring quality and reliability of data pipeline deployments across distributed systems.
•	Automated API testing and Kafka message queue verification using Selenium and Python, integrating test suites into Jenkins CI/CD pipelines for Docker-based deployments on AWS ECS.
•	Monitored and maintained production data services through on-call rotation, analyzing logs and metrics to diagnose data pipeline failures, performing root cause analysis, and escalating issues to partner teams.
PROJECTS														
Future Job Fit | AI Resume Creation & Job Optimization Platform
React, TypeScript, Supabase Edge Functions, LLM APIs (Gemini/OpenAI), Python (Pyodide), Node.js, AI Agentic Workflow
•	Developed a full-stack application for resume creation and job alignment, implementing AI agentic workflow to orchestrate autonomous agents for ATS-style keyword extraction, skill gap analysis, and job matching recommendations using real-time data flows.
•	Implemented accessible UI components and clean, maintainable frontend code following WCAG guidelines with keyboard navigation and screen reader compatibility.
•	Architected AI agentic workflow with pluggable LLM integration layer using Gemini and OpenAI APIs via Supabase Edge Functions, enabling autonomous agents to perform resume analysis, content generation, job optimization with secure server-side inference.
•	Integrated browser-based Python (Pyodide) for resume parsing and NLP preprocessing within the agentic workflow, coordinating multiple AI agents for document analysis, entity extraction, and semantic matching.
•	Designed modular React architecture with centralized state management to orchestrate multi-agent workflows, enabling extensible AI-driven resume editing, real-time feedback, and iterative optimization features.
WanderlustTrails | Full Stack Travel Booking Platform
React, PHP, REST APIs, MySQL, JWT Authentication
•	Designed and developed PHP REST APIs for travel booking platform with MySQL database modeling, JWT-based authentication, and role-based access control.
•	Implemented booking workflow REST APIs including search, availability checks, and reservations with transactional integrity, SQL query optimization, and comprehensive error handling.
•	Monitored live system metrics and troubleshot production issues, ensuring high-availability and performance of booking platform APIs.
•	Built secure authentication system using JWT tokens with role-based access control for customers, vendors, and administrators across API endpoints.
EDUCATION														
Masters in Computer Information Systems, University of Central Missouri, Warrensburg, USA.			               Dec 2024`;

    const result = parseResume(vamshiResume);

    console.log('\n' + '='.repeat(80));
    console.log('📊 Vamshi Resume Parse Test Results');
    console.log('='.repeat(80) + '\n');

    if (result.success) {
      const profile = result.data.profile;

      console.log('✅ PARSE SUCCESS!\n');
      console.log('📋 Contact Info:');
      console.log('  Name:', profile.personal?.name);
      console.log('  Email:', profile.personal?.email);
      console.log('  Phone:', profile.personal?.phone);

      console.log('\n💼 Work Experience:', profile.workHistory?.length, 'entries');
      profile.workHistory?.forEach((job, i) => {
        console.log(
          `  ${i + 1}. ${job.position} at ${job.company} (${job.startDate} → ${job.endDate})`
        );
      });

      console.log('\n🎓 Education:', profile.education?.length, 'entries');
      profile.education?.forEach((edu) => {
        console.log(`  - ${edu.degree} at ${edu.institution}`);
      });

      console.log('\n🛠 Skills:', profile.skills?.length, 'skills found');
      if (profile.skills && profile.skills.length > 0) {
        console.log('  Sample:', profile.skills.slice(0, 10).join(', '));
      }

      console.log('\n📊 Confidence Scores:');
      result.data.confidenceScores?.slice(0, 10).forEach((score) => {
        console.log(`  ${score.field}: ${score.confidence}%`);
      });

      // Assertions
      expect(result.success).toBe(true);
      expect(profile.personal?.name).toBeTruthy();
      expect(profile.personal?.email).toBe('vamshikrishna2297@gmail.com');
      expect(profile.personal?.phone).toBeTruthy();
      expect(profile.workHistory?.length).toBeGreaterThan(0);
      expect(profile.education?.length).toBeGreaterThan(0);
      expect(profile.skills?.length).toBeGreaterThan(0);
    } else {
      console.log('❌ PARSE FAILED');
      console.log('Error:', result.error);

      if (result.partialData) {
        console.log('\nPartial data:');
        console.log('  Name:', result.partialData.profile.personal?.name);
        console.log('  Email:', result.partialData.profile.personal?.email);
        console.log('  Phone:', result.partialData.profile.personal?.phone);
      }

      // Fail the test
      expect(result.success).toBe(true);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  });
});
