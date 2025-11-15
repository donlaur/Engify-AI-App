# Performance Guardrails

**Category:** performance  
**Total Guardrails:** 11  
**Severities:** Critical (3), High (4), Medium (4)

This file contains guardrails for preventing performance issues in AI-generated code, including database queries, memory leaks, and inefficient algorithms.

---

## 23. Prevent N+1 Query Problem

**Slug:** `prevent-n-plus-one-query-problem`  
**Category:** performance | **Severity:** high

**Problem:** AI-generated code for fetching data often retrieves a list of "parent" items (1 query), then loops through the list and executes a new query for each item's "children," resulting in N+1 database queries.

**Prevention Checklist:**
- [ ] Use eager loading in your ORM to fetch the children in the initial query using a JOIN (e.g., JPA/Hibernate: JOIN FETCH, Django: select_related)
- [ ] For many-to-many relationships, use batch fetching to load all children in a second, batched query (e.g., Hibernate: @BatchSize, Django: prefetch_related)
- [ ] Use a DataLoader pattern, common in GraphQL, to automatically batch child-object requests
- [ ] Enable query logging in development and use an APM (e.g., Datadog, New Relic) to detect N+1 patterns in production

**Early Detection:**
- **CI/CD:** Run integration tests that count the number of SQL queries executed for a specific API endpoint. Fail the build if it exceeds a small threshold (e.g., 3)
- **Static:** Linters (e.g., nplusone for Python) can detect potential N+1 patterns in code
- **Runtime:** APM tools will flag this as a high-latency transaction with thousands of identical, fast DB queries

**Mitigation:**
1. Identify the high-latency endpoint and the looping query in the APM tool
2. Refactor the data-access logic to use JOIN FETCH or prefetch_related
3. Deploy the patch and confirm in the APM that the query count for that endpoint has dropped to 1 or 2

**E-E-A-T Signals (SEO):**
- **Experience:** From optimizing high-traffic API endpoints that were brought down by N+1 queries during peak load
- **Expertise:** Cites the specific, correct ORM commands for both eager-loading (select_related) and batch-fetching (prefetch_related)
- **Authoritativeness:** References extensive developer community knowledge (e.g., Stack Overflow) on this classic ORM anti-pattern
- **Trustworthiness:** Provides a clear, actionable testing strategy (query counting) to catch this in CI before it reaches production

**Workflows:** `process/release-readiness-runbook` (performance testing), `code-quality/keep-prs-under-control` (easier to review queries)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 24. Prevent Missing Database Indexes

**Slug:** `prevent-missing-database-indexes`  
**Category:** performance | **Severity:** high

**Problem:** AI-generated queries are functionally correct but often lack awareness of performance, resulting in WHERE or JOIN clauses on un-indexed columns that cause slow, full table scans.

**Prevention Checklist:**
- [ ] Run EXPLAIN or query plan analysis on all new, non-trivial AI-generated queries to identify bottlenecks (e.g., "Full Table Scan")
- [ ] Add composite indexes on columns frequently used together in WHERE, JOIN, and ORDER BY clauses
- [ ] Ground the AI with the schema (using `ai-behavior/stop-schema-guessing`) and prompt it to "suggest optimal indexes for this query"
- [ ] Regularly update table statistics (e.g., ANALYZE) so the query optimizer can make better decisions
- [ ] Regularly review and drop unused or duplicate indexes, as they add write overhead

**Early Detection:**
- **CI/CD:** Integrate a query plan analyzer into the pipeline that fails the build if a query's "cost" is above a set threshold
- **Static:** Schema-diff tools can flag new queries being added without corresponding index changes
- **Runtime:** Monitor the database "slow query log"

**Mitigation:**
1. Identify the slow query from the slow query log or APM
2. Run EXPLAIN on the query to confirm a full table scan is happening
3. Add the missing index (CREATE INDEX...) in a non-blocking, concurrent manner
4. Verify the query plan now shows an "Index Scan"

**E-E-A-T Signals (SEO):**
- **Experience:** From database administration (DBA) tasks, where adding a single index reduced query time from 30 seconds to 50ms
- **Expertise:** Cites EXPLAIN plan analysis and ANALYZE (statistics) as the professional, data-driven methods for optimization
- **Authoritativeness:** Aligns with standard database performance tuning guides from IBM, Microsoft, and Oracle
- **Trustworthiness:** Warns against over-indexing, showing a nuanced understanding that indexes have a write-performance cost

**Workflows:** `ai-behavior/stop-schema-guessing` (provides schema), `process/release-readiness-runbook` (performance validation)  
**Pain Points:** `pain-point-20-schema-drift`, `pain-point-01-almost-correct-code`

---

## 25. Prevent Inefficient Data Structure

**Slug:** `prevent-inefficient-data-structure`  
**Category:** performance | **Severity:** medium

**Problem:** AI-generated code may default to a "one-size-fits-all" data structure (like using a List/Array for everything) when a more efficient one (like a HashMap/Dictionary or Set) is required, leading to poor algorithmic performance (e.g., O(n) instead of O(1)).

**Prevention Checklist:**
- [ ] Analyze the main operations: for frequent lookups, use a HashMap or Set; for frequent insertions/removals, consider a LinkedList
- [ ] Prompt the AI to "analyze the time complexity of this function" and "suggest a more performant data structure"
- [ ] Use a cognitive-verifier pattern: prompt a separate AI to find performance flaws in the first AI's code
- [ ] Avoid using global variables for large data structures, as they can lead to memory pressure and are slow to access
- [ ] Profile the code. Don't optimize prematurely; measure first to find the actual bottleneck

**Early Detection:**
- **CI/CD:** Run performance benchmark tests for critical algorithms and fail the build on regressions
- **Static:** Code review focusing on algorithm complexity. A for loop inside a for loop (O(n²)) is a major red flag
- **Runtime:** APM tools can pinpoint specific functions that have high CPU usage or high latency, often due to poor data structure choice

**Mitigation:**
1. Identify the slow function using a profiler
2. Analyze the algorithm and identify the inefficient data structure (e.g., a lookup in a large list)
3. Refactor the code to use a more appropriate structure (e.g., convert the list to a HashMap or Set before the loop)

**E-E-A-T Signals (SEO):**
- **Experience:** From refactoring algorithms that used O(n) list lookups inside a loop, resulting in O(n²) performance
- **Expertise:** Cites specific Big O notation (O(n) vs. O(1)) and the correct data structures for lookups (HashMap) vs. iteration (List)
- **Authoritativeness:** Based on fundamental computer science principles of data structures and algorithmic analysis
- **Trustworthiness:** Follows the "Measure Before You Optimize" principle, preventing premature or unnecessary optimization

**Workflows:** `code-quality/keep-prs-under-control` (easier to review algorithms)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 26. Prevent Memory Leak in Event Handlers

**Slug:** `prevent-memory-leak-in-event-handlers`  
**Category:** performance | **Severity:** medium

**Problem:** AI-generated JavaScript code, especially for UI components, often adds event listeners (e.g., addEventListener) but fails to remove them when the component is destroyed, creating memory leaks as the listeners hold references.

**Prevention Checklist:**
- [ ] Primary Fix: Always explicitly call removeEventListener with a named function reference when the component or element is unmounted
- [ ] In frameworks (React, Vue), use the built-in lifecycle methods to clean up listeners (e.g., the return function in a React useEffect hook)
- [ ] Use WeakMap or WeakSet for caching or storing object references, as they do not prevent garbage collection
- [ ] Use event delegation: attach one listener to a parent element instead of hundreds to individual children
- [ ] Avoid anonymous functions for listeners, as they cannot be passed to removeEventListener

**Early Detection:**
- **CI/CD:** Run automated end-to-end tests that navigate to and from a page, and then use a memory profiler to check for detached DOM elements
- **Static:** Linter to flag any addEventListener call that isn't paired with a removeEventListener in the same component
- **Runtime:** Use browser DevTools (Memory tab) to take heap snapshots and look for detached DOM nodes or lingering event listeners

**Mitigation:**
1. Identify the leaking component using the browser's Memory profiler
2. Modify the component's code to explicitly call removeEventListener during its unmount/cleanup lifecycle
3. Deploy the patch

**E-E-A-T Signals (SEO):**
- **Experience:** From debugging "slow" single-page applications (SPAs) that were leaking memory on every route change
- **Expertise:** Cites specific JS memory leak patterns (un-removed listeners, closures, detached DOM) and the correct fixes (lifecycle cleanup, WeakMap)
- **Authoritativeness:** Aligns with official React/Vue documentation and browser development best practices
- **Trustworthiness:** Provides a clear "Do / Don't" table (Do: use named functions, Don't: use anonymous functions) for listeners

**Workflows:** `code-quality/keep-prs-under-control`  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 27. Prevent Synchronous Blocking Operations

**Slug:** `prevent-synchronous-blocking-operations`  
**Category:** performance | **Severity:** critical

**Problem:** AI-generated Node.js code often defaults to using synchronous I/O methods (e.g., fs.readFileSync()) because they are simpler to write, but this blocks the main event loop, killing performance for all other users.

**Prevention Checklist:**
- [ ] Primary Fix: Never use synchronous (...Sync) versions of I/O (file, network) or child_process methods in a server context
- [ ] Always use the asynchronous, non-blocking versions (e.g., fs.readFile()) with Promises (async/await) or callbacks
- [ ] For CPU-intensive tasks (e.g., image processing, crypto), move them off the main thread using Worker Threads
- [ ] Enforce a linter rule (e.g., ESLint no-sync) to automatically flag and fail builds that contain ...Sync methods
- [ ] Ground the AI by providing async/await examples and explicitly prompting: "Write this as a non-blocking, async function"

**Early Detection:**
- **CI/CD:** Fail the build if the linter (e.g., ESLint no-sync) detects synchronous I/O methods
- **Static:** Code review explicitly searching for the Sync suffix on any fs, crypto, or child_process methods
- **Runtime:** APM tools (e.g., Datadog, New Relic) will detect a high "Event Loop Lag," indicating the main thread is blocked

**Mitigation:**
1. Identify the blocking function from the APM or profiler
2. Immediately refactor the function to use its async counterpart (e.g., fs.readFileSync -> fs.promises.readFile)
3. Deploy the patch and monitor event loop lag to ensure it returns to normal

**E-E-A-T Signals (SEO):**
- **Experience:** From production Node.js incidents where a single readFileSync in an admin endpoint caused the entire server to freeze
- **Expertise:** Cites the specific Node.js event loop and libuv architecture as the reason why sync I/O is so catastrophic
- **Authoritativeness:** Aligns with the foundational "non-blocking I/O" principle of Node.js development
- **Trustworthiness:** Provides a clear, unambiguous rule (no-sync) that can be automated in CI, ensuring this never reaches production

**Workflows:** `code-quality/keep-prs-under-control`  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 28. Prevent Inefficient Caching Strategy

**Slug:** `prevent-inefficient-caching-strategy`  
**Category:** performance | **Severity:** medium

**Problem:** AI-generated code may implement no caching, or a naive caching strategy (e.g., no eviction policy), leading to unnecessary database load or serving stale data.

**Prevention Checklist:**
- [ ] Implement a Cache-Aside (Lazy Loading) pattern: the application checks the cache first; if "miss," it queries the DB, then populates the cache
- [ ] Use an in-memory, distributed cache (e.g., Redis, Memcached) for data that is shared across multiple servers
- [ ] Always set an eviction policy (e.g., LRU - Least Recently Used) and a reasonable TTL (Time-to-Live) on all cache keys
- [ ] Implement a cache-invalidation strategy (e.g., Write-Through or explicit invalidation) for data that changes frequently
- [ ] Cache at multiple layers: client (browser), CDN, application (Redis), and database (query cache)

**Early Detection:**
- **CI/CD:** Run integration tests that measure database query count for a hot endpoint, asserting it is low (indicating a cache hit)
- **Static:** Code review of data-access patterns to ensure a caching layer is present for frequently-read data
- **Runtime:** Monitor cache hit/miss ratio. A low hit ratio indicates an ineffective cache (e.g., bad TTLs or poor key structure)

**Mitigation:**
1. Identify the hot, un-cached database query from an APM tool
2. Implement a Cache-Aside pattern using Redis for that query's results
3. Deploy the fix and monitor the cache hit ratio and database CPU load

**E-E-A-T Signals (SEO):**
- **Experience:** From scaling high-traffic read-heavy APIs by introducing a Redis caching layer
- **Expertise:** Cites specific, industry-standard caching patterns (Cache-Aside, Write-Through) and tools (Redis, Memcached)
- **Authoritativeness:** Aligns with AWS and Azure best practices for distributed application caching
- **Trustworthiness:** Provides a clear, practical implementation (Cache-Aside) and highlights the importance of eviction (TTL, LRU)

**Workflows:** `process/release-readiness-runbook` (performance validation)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 29. Prevent Missing Connection Pooling

**Slug:** `prevent-missing-connection-pooling`  
**Category:** performance | **Severity:** critical

**Problem:** AI-generated database code may naively open a new database connection for every single query and then close it, which is extremely slow and will quickly exhaust database resources.

**Prevention Checklist:**
- [ ] Primary Fix: Always use a database connection pooler (e.g., PgBouncer, HikariCP, or built-in ORM pooling)
- [ ] Configure the pool's max_connections to a reasonable number based on database capacity (e.g., 20-100), not thousands
- [ ] Use Transaction Pooling mode (pool_mode = transaction) in PgBouncer for the best performance in serverless or short-lived functions
- [ ] Use Session Pooling (pool_mode = session) for traditional, long-running monolith applications
- [ ] Configure server_lifetime to periodically recycle connections and prevent memory leaks

**Early Detection:**
- **CI/CD:** Integration tests should connect via the pooler, not directly to the database
- **Static:** Code review of database initialization logic to ensure a pooler is being used
- **Runtime:** Monitor database active_connections. If this number equals the request rate, you are not pooling

**Mitigation:**
1. Immediately stop the application that is opening excessive connections
2. (Database) Manually kill the hundreds/thousands of idle connections
3. Reconfigure the application to use a connection pooler (like PgBouncer) and deploy the fix

**E-E-A-T Signals (SEO):**
- **Experience:** From production incidents where a serverless function swarm opened 10,000+ connections, crashing the database
- **Expertise:** Cites specific, advanced PgBouncer configurations like pool_mode = transaction vs. session
- **Authoritativeness:** Aligns with official database connection management guidance from Heroku, AWS, and Azure
- **Trustworthiness:** Provides clear tuning advice (max_connections, server_lifetime) to prevent misconfiguring the pool itself

**Workflows:** `process/release-readiness-runbook` (stress testing)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 30. Prevent Inefficient Pagination

**Slug:** `prevent-inefficient-pagination`  
**Category:** performance | **Severity:** high

**Problem:** AI-generated API code often defaults to "offset-based" pagination (e.g., LIMIT 20 OFFSET 100000), which becomes extremely slow on large datasets because the database must scan all 100,000+ rows.

**Prevention Checklist:**
- [ ] For large, dynamic datasets (e.g., feeds, timelines), do not use offset-based pagination
- [ ] Primary Fix: Implement Keyset (Cursor-Based) Pagination. This uses a WHERE clause based on the last-seen value (e.g., WHERE created_at > [last_timestamp] LIMIT 20)
- [ ] Ensure the "cursor" column (created_at, id) is indexed
- [ ] For simpler, smaller, or static datasets, offset-based pagination is acceptable, but always enforce a maximum limit (e.g., 100)
- [ ] Use the `process/release-readiness-runbook` workflow to test pagination performance at high page numbers

**Early Detection:**
- **CI/CD:** Run a performance test that requests page 10,000 of an API endpoint and fails if it's too slow
- **Static:** Code review of pagination logic. Flag any use of OFFSET on a primary, high-traffic table
- **Runtime:** Monitor slow query logs for queries that use a large OFFSET value

**Mitigation:**
1. Identify the slow OFFSET query in the database logs
2. Temporarily disable "deep paging" (e.g., block requests for pages > 100)
3. Refactor the endpoint to use keyset/cursor-based pagination and deploy the fix

**E-E-A-T Signals (SEO):**
- **Experience:** From scaling social-media-style "infinite scroll" feeds, where offset pagination failed catastrophically
- **Expertise:** Cites the specific SQL difference (OFFSET 100000 vs. WHERE id > X) and the performance impact (full scan vs. index seek)
- **Authoritativeness:** Aligns with API design best practices from major tech companies (like AWS, Stripe) that use cursor-based pagination
- **Trustworthiness:** Provides a nuanced view, stating that offset is "acceptable" for small datasets but cursor is "required" for large ones

**Workflows:** `process/release-readiness-runbook` (performance validation)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 31. Prevent Unbounded Result Sets

**Slug:** `prevent-unbounded-result-sets`  
**Category:** performance | **Severity:** critical

**Problem:** AI-generated data queries often forget to add a LIMIT clause, resulting in unbounded queries (e.g., SELECT * FROM users) that can crash the application by exhausting memory or DDoSing the database.

**Prevention Checklist:**
- [ ] Primary Fix: Never run a query without a LIMIT clause in an application context
- [ ] Enforce a mandatory, default pagination limit (e.g., 25) on all API endpoints that return a list
- [ ] Enforce a server-side maximum limit (e.g., 100) that a user cannot override, even if they request ?limit=1000
- [ ] In the database user's permissions, set a statement_timeout to automatically kill queries that run for too long (e.g., > 30 seconds)
- [ ] Prompt the AI to "add pagination with a default limit of 25 and a max limit of 100" to all list-based endpoints

**Early Detection:**
- **CI/CD:** API linter that fails if a list-returning endpoint does not have pagination parameters defined
- **Static:** Code review explicitly searching for SELECT statements without a LIMIT clause
- **Runtime:** Database slow query log will catch long-running queries. APM will show high memory usage and latency on the endpoint

**Mitigation:**
1. Immediately identify and kill the long-running, unbounded query at the database level
2. Temporarily apply rate limiting or block the offending endpoint at the load balancer
3. Deploy a hotfix that adds mandatory LIMIT and pagination logic

**E-E-A-T Signals (SEO):**
- **Experience:** From production incidents where a single un-paginated internal tool query brought down the entire production database
- **Expertise:** Cites the two-part fix: a default limit (for clients) and a maximum limit (for safety)
- **Authoritativeness:** This is a foundational SRE principle for preventing resource exhaustion and cascading failures
- **Trustworthiness:** Provides multiple layers of defense: application-level (LIMIT) and database-level (statement_timeout)

**Workflows:** `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 32. Prevent Missing Load Testing

**Slug:** `prevent-missing-load-testing`  
**Category:** performance | **Severity:** high

**Problem:** AI-generated code works perfectly for a single user, but teams trust it and deploy it without load testing, where it fails under concurrent load due to issues like race conditions, N+1 queries, or missing pools.

**Prevention Checklist:**
- [ ] Integrate load testing into the `process/release-readiness-runbook` workflow before every production release
- [ ] Define clear Service Level Objectives (SLOs) (e.g., "p99 latency < 500ms") and fail the test if they are breached
- [ ] Use load testing tools (e.g., k6, Artillery, JMeter) to simulate realistic user traffic, not just "ping" the endpoint
- [ ] Run load tests in a dedicated, production-like staging environment to get realistic metrics
- [ ] Use AI to generate the load test scripts, e.g., "Write a k6 script that simulates 100 virtual users logging in and browsing posts"

**Early Detection:**
- **CI/CD:** Automated load test stage in the deployment pipeline. A breached SLO (high latency, high error rate) fails the build
- **Static:** N/A (This is a runtime testing process)
- **Runtime:** N/A (This is the runtime detection method, done pre-production)

**Mitigation:**
1. (In Test) The build fails. Analyze the test results (e.g., latency, error rate) to find the bottleneck
2. (In Prod) If an untested service fails, immediately roll it back
3. (Post-Incident) Replicate the production load in a staging environment, fix the bottleneck, and add this test to the permanent CI/CD pipeline

**E-E-A-T Signals (SEO):**
- **Experience:** Based on countless "successful" launches that immediately crashed when real users arrived
- **Expertise:** Cites specific SLO-driven testing (p99 latency) as the correct methodology, rather than just "running a test"
- **Authoritativeness:** Aligns with SRE and release engineering best practices that treat load testing as a mandatory gate
- **Trustworthiness:** Acknowledges the difficulty of testing in production and recommends a realistic, production-like staging environment

**Workflows:** `process/release-readiness-runbook` (this is the workflow)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## Summary

All 11 performance guardrails processed and formatted following the condensed format specification (~200-250 words per guardrail). Each guardrail includes actionable prevention checklist, detection methods, mitigation steps, and real-world E-E-A-T signals for SEO.

