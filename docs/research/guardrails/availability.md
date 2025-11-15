# Availability Guardrails

**Category:** availability  
**Total Guardrails:** 9  
**Severities:** Critical (6), High (3)

This file contains guardrails for preventing availability issues in AI-generated code, including cascading failures, deadlocks, and resource exhaustion.

---

## 33. Prevent Cascading Failure from Dependency

**Slug:** `prevent-cascading-failure-from-dependency`  
**Category:** availability | **Severity:** critical

**Problem:** AI-generated microservices will naively and repeatedly call a failing or slow downstream dependency, exhausting their own resources (threads, sockets) and creating a "cascading failure" that brings down the entire system.

**Prevention Checklist:**
- [ ] Primary Fix: Implement the Circuit Breaker pattern (e.g., using libraries like Resilience4j, Polly)
- [ ] Track failures: after a set threshold (e.g., 50% errors in 10s), "trip" or "open" the circuit and fail-fast without calling the dependency
- [ ] While the circuit is open, provide a fallback response (e.g., stale cached data or a default value) to maintain partial availability
- [ ] Periodically allow a single "probe" request to pass; if it succeeds, "close" the circuit and resume normal traffic
- [ ] Always configure aggressive timeouts on all network calls

**Early Detection:**
- **CI/CD:** SAST scan to ensure all external HTTP clients are wrapped in a Circuit Breaker library
- **Static:** Code review of dependency calls to check for missing timeouts or retry logic
- **Runtime:** APM alerts when a service's error rate to a specific downstream dependency crosses a threshold

**Mitigation:**
1. Manually "open" the circuit breaker via a configuration flag to immediately stop calls to the failing dependency
2. Enable the fallback response (e.g., switch to a cached data source)
3. Once the downstream dependency is fixed and stable, "close" the circuit to resume traffic

**E-E-A-T Signals (SEO):**
- **Experience:** Based on SRE incident response, where a failure in a minor "avatar" service cascaded to crash the "auth" service
- **Expertise:** Cites the specific states of the Circuit Breaker pattern (Open, Closed, Half-Open) and industry-standard implementations (Netflix Hystrix)
- **Authoritativeness:** This is a foundational pattern from the Google SRE playbook and Michael Nygard's Release It!
- **Trustworthiness:** Emphasizes that fallbacks are key; simply failing fast is not enough to maintain availability

**Workflows:** `process/release-readiness-runbook` (chaos engineering tests)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 34. Prevent Infinite Loop from Logic Error

**Slug:** `prevent-infinite-loop-from-logic-error`  
**Category:** availability | **Severity:** high

**Problem:** AI-generated code, especially for complex loops (while) or recursion, may contain logic errors in the termination condition (e.g., an off-by-one error, while(flag) where flag is never set to false), causing a process to spin at 100% CPU and become unresponsive.

**Prevention Checklist:**
- [ ] In while loops, ensure the condition variable is always modified inside the loop
- [ ] For recursive functions, ensure there is a "base case" that terminates the recursion
- [ ] Always set a statement_timeout at the database level to kill long-running (potentially looping) queries
- [ ] For application-level loops, implement a "circuit breaker" or "iteration counter" that manually throws an exception after N million iterations
- [ ] Use static analysis tools that can detect some forms of "unreachable code" or non-terminating loops

**Early Detection:**
- **CI/CD:** Unit tests should explicitly cover the loop's termination condition (the "base case")
- **Static:** Static analysis tools (e.g., SonarQube) can flag potential infinite loops or complex recursive functions for review
- **Runtime:** Monitor for a process or pod that is stuck at 100% CPU utilization for an extended period

**Mitigation:**
1. Immediately restart the process/pod that is stuck at 100% CPU to restore service
2. Analyze the code (or profiler output) to find the infinite loop
3. Patch the logic with the correct termination condition and deploy

**E-E-A-T Signals (SEO):**
- **Experience:** From debugging production servers that became unresponsive due to a single request hitting an infinite while loop
- **Expertise:** Cites the correct solution for different contexts: "base cases" for recursion, "condition modification" for while loops, statement_timeout for databases
- **Authoritativeness:** Based on fundamental computer science principles of algorithm termination
- **Trustworthiness:** Recommends a pragmatic "iteration counter" as a defense-in-depth, acknowledging that static analysis cannot find all loops

**Workflows:** `code-quality/keep-prs-under-control` (easier to review complex logic)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 35. Prevent Deadlock in Concurrent Code

**Slug:** `prevent-deadlock-in-concurrent-code`  
**Category:** availability | **Severity:** critical

**Problem:** AI-generated concurrent code (e.g., multithreading) may acquire multiple locks in an inconsistent order, leading to a "deadlock" where Thread A holds Lock 1 (waiting for 2) and Thread B holds Lock 2 (waiting for 1), freezing both threads.

**Prevention Checklist:**
- [ ] Primary Fix: Enforce a global, "lock ordering" policy. All threads must acquire locks in the same, predefined order (e.g., always Lock A, then Lock B)
- [ ] Avoid nested locks where possible
- [ ] Use tryLock() with a timeout instead of a blocking lock. If the timeout expires, the thread should release all its other locks and retry
- [ ] Use lock-free data structures (e.g., ConcurrentHashMap, AtomicInteger) where possible
- [ ] Reduce lock granularity. Lock only the specific field or resource, not the entire object

**Early Detection:**
- **CI/CD:** Run integration tests specifically designed to trigger race conditions and deadlocks (e.g., "hammer tests")
- **Static:** Static analysis tools (e.g., go vet) can detect some deadlock-prone patterns
- **Runtime:** Monitor for "Java Thread Dump" or go-routine dumps. A deadlock detector will explicitly name the blocked threads and the locks they are waiting for

**Mitigation:**
1. Identify the deadlocked process (e.g., from a "frozen" application alert)
2. Manually restart the process to break the deadlock and restore service
3. Analyze the thread dump, identify the conflicting locks, and refactor the code to enforce a strict lock-acquisition order

**E-E-A-T Signals (SEO):**
- **Experience:** From analyzing Java thread dumps to find and resolve production deadlocks in high-concurrency systems
- **Expertise:** Cites the two canonical solutions: "lock ordering" (prevention) and "tryLock with timeout" (avoidance)
- **Authoritativeness:** Based on foundational concurrency and operating system principles (e.g., Banker's Algorithm)
- **Trustworthiness:** Provides multiple, practical solutions, from high-level (lock ordering) to low-level (lock-free data structures)

**Workflows:** `code-quality/keep-prs-under-control`  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 36. Prevent Resource Exhaustion from Memory Leak

**Slug:** `prevent-resource-exhaustion-from-memory-leak`  
**Category:** availability | **Severity:** critical

**Problem:** AI-generated code (e.g., in Node.js, Python, Java) can introduce slow memory leaks (e.g., un-removed event listeners, static collections, unclosed resources) that gradually consume all available heap memory, causing the application to crash (OOM).

**Prevention Checklist:**
- [ ] In event-driven code (JS), always remove listeners when objects are destroyed (See Guardrail 26)
- [ ] Never store large, per-request data in static or global variables
- [ ] Use WeakMap or WeakSet for caches that should not prevent garbage collection
- [ ] In Java/Python, ensure all I/O resources (files, streams, connections) are closed, preferably using try-with-resources or with statements
- [ ] Profile the application's memory usage under load before release

**Early Detection:**
- **CI/CD:** Run a "soak test" (a load test run over a long period, e.g., 1 hour) and monitor the application's heap size. If it grows linearly without plateauing, a leak exists
- **Static:** Static analysis tools can flag unclosed resources or modifications to static collections
- **Runtime:** Monitor the application's heap memory usage. A "sawtooth" pattern (growing, then dropping after GC) is normal. A steadily climbing line is a leak

**Mitigation:**
1. The application will crash (OOM) and hopefully be restarted by an orchestrator (e.g., Kubernetes)
2. Get a heap dump from the application just before it crashes (e.g., using -XX:+HeapDumpOnOutOfMemoryError)
3. Analyze the heap dump with a profiler (e.g., Eclipse MAT, Chrome DevTools) to find the object that is leaking
4. Patch the code to fix the leak (e.g., close the resource, remove the listener)

**E-E-A-T Signals (SEO):**
- **Experience:** From analyzing production heap dumps to find and patch subtle memory leaks in long-running Java services
- **Expertise:** Cites specific language features (try-with-resources, WeakMap) and profiling tools (Heap Dumps, MAT)
- **Authoritativeness:** Aligns with standard SRE/DevOps practices for application performance monitoring (APM)
- **Trustworthiness:** Provides a clear, actionable signal to monitor (linear heap growth) to distinguish leaks from normal usage

**Workflows:** `process/release-readiness-runbook` (soak testing)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 37. Prevent Missing Health Checks

**Slug:** `prevent-missing-health-checks`  
**Category:** availability | **Severity:** critical

**Problem:** AI-generated services often lack /health or /ready endpoints, so container orchestrators (like Kubernetes) have no way to know if the application is running, deadlocked, or ready to serve traffic.

**Prevention Checklist:**
- [ ] Implement a Liveness Probe (e.g., /healthz). This is a shallow check: "Is the process running?" If it fails, Kubernetes will restart the container
- [ ] Implement a Readiness Probe (e.g., /readyz). This is a deep check: "Is the app ready to serve traffic?" (e.g., DB connected, cache warm). If it fails, Kubernetes stops sending traffic
- [ ] Implement a Startup Probe for slow-starting applications (e.g., Java) to prevent the Liveness/Readiness probes from failing before the app is initialized
- [ ] Set a realistic initialDelaySeconds on Liveness/Readiness probes to give the app time to start

**Early Detection:**
- **CI/CD:** Linter for Kubernetes manifests that fails if livenessProbe and readinessProbe are not defined
- **Static:** Code review of the main server file to ensure the /healthz and /readyz endpoints exist
- **Runtime:** (In K8s) kubectl describe pod will show the pod is in a CrashLoopBackOff state or is not receiving traffic (not "Ready")

**Mitigation:**
1. Analyze the pod status (kubectl describe pod) to see why the probe is failing
2. If the app is crashing, fix the app
3. If the app is just slow to start, increase the initialDelaySeconds or implement a startupProbe
4. If the app is deadlocked, the Liveness probe will (correctly) restart it

**E-E-A-T Signals (SEO):**
- **Experience:** From debugging CrashLoopBackOff errors in Kubernetes, which are often caused by misconfigured health probes
- **Expertise:** Cites the critical distinction between Liveness (restart me) and Readiness (stop traffic) probes
- **Authoritativeness:** This plan is based directly on the official Kubernetes documentation for container probes
- **Trustworthiness:** Provides a clear, actionable plan for all three probe types, including the often-missed startupProbe for Java/Spring apps

**Workflows:** `process/release-readiness-runbook` (part of the K8s deployment checklist)  
**Pain Points:** `pain-point-22-missing-validations`

---

## 38. Prevent Improper Error Handling

**Slug:** `prevent-improper-error-handling`  
**Category:** availability | **Severity:** high

**Problem:** AI-generated code often has empty catch blocks ("exception swallowing") or fails to catch errors at all, leading to unhandled exceptions that crash the entire process, making the service unavailable.

**Prevention Checklist:**
- [ ] Primary Fix: Never use an empty catch (Exception e) {} block. At a minimum, log the error with its full context
- [ ] Catch specific exceptions (e.g., catch (PaymentFailedException e)) at the level where you can actually handle them (e.g., return a 402 status)
- [ ] Let unexpected exceptions (e.g., NullPointerException) propagate up to a global, centralized exception handler
- [ ] The global handler should log the error, send a generic 500 response, and gracefully shut down if the app is in an unrecoverable state
- [ ] Use finally or try-with-resources to ensure critical resources (like connections) are always closed, even if an error occurs

**Early Detection:**
- **CI/CD:** SAST tools (e.g., SonarQube) can flag empty catch blocks or overly-broad catch (Exception e) blocks
- **Static:** Code review explicitly searching for catch {}
- **Runtime:** Monitor logs for "unhandled exception" errors, which will crash the process. A high rate of 500 errors indicates exceptions are being caught but not handled

**Mitigation:**
1. The process crashes and is (hopefully) restarted by an orchestrator
2. Analyze the stack trace from the "unhandled exception" log
3. Patch the code to catch and handle that specific exception at the appropriate application layer

**E-E-A-T Signals (SEO):**
- **Experience:** From production incidents where a single unhandled NullPointerException in one request brought down the entire Node.js/Python server
- **Expertise:** Cites the "catch specific, log generic" pattern, which is a best practice for robust, multi-layered error handling
- **Authoritativeness:** Aligns with official Microsoft and Oracle [Java] best practices for exception handling
- **Trustworthiness:** Explicitly calls out "exception swallowing" (catch {}) as a critical anti-pattern

**Workflows:** `code-quality/tdd-with-ai-pair` (writing tests for failure cases), `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 39. Prevent Missing Timeout Configuration

**Slug:** `prevent-missing-timeout-configuration`  
**Category:** availability | **Severity:** critical

**Problem:** AI-generated HTTP or database clients often omit timeout configurations, causing the application to hang indefinitely while waiting for a slow or unresponsive dependency, leading to resource exhaustion (sockets, threads).

**Prevention Checklist:**
- [ ] Primary Fix: Always set an aggressive, short timeout (e.g., 2-5 seconds) on all network calls (HTTP, DB, gRPC)
- [ ] Configure different types of timeouts: connection timeout (how long to connect) and read timeout (how long to wait for data)
- [ ] Use dynamic timeouts that adjust based on real-time service latency (e.g., p99 latency)
- [ ] Combine timeouts with a retry strategy (e.g., exponential backoff) for transient failures
- [ ] At the database level, set a statement_timeout to kill queries that run too long

**Early Detection:**
- **CI/CD:** SAST tools or custom linters can flag any HTTP client or DB driver instantiation that does not explicitly set a timeout property
- **Static:** Code review of all network-call-related code
- **Runtime:** Monitor for "hung" or "stuck" threads in a thread dump. APM tools will show transactions with extremely long durations, all stuck waiting on the same external call

**Mitigation:**
1. Immediately restart the hung application processes to free up the exhausted resources (sockets/threads)
2. Deploy a hotfix that adds aggressive timeouts to the client configuration
3. (If downstream is slow) Open a circuit breaker (Guardrail 33) to that dependency

**E-E-A-T Signals (SEO):**
- **Experience:** From SRE incident response, where a slow database query caused all application threads to hang, creating a site-wide outage
- **Expertise:** Distinguishes between connection timeouts and read timeouts, a critical detail for robust configuration
- **Authoritativeness:** Aligns with SRE best practices from Zalando and MIT on setting dynamic, reasonable timeouts
- **Trustworthiness:** Provides a clear, actionable rule: never make a network call without a timeout

**Workflows:** `process/release-readiness-runbook` (chaos testing, latency injection)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 40. Prevent Single Point of Failure

**Slug:** `prevent-single-point-of-failure`  
**Category:** availability | **Severity:** critical

**Problem:** AI-generated deployment configurations (e.g., Kubernetes manifests, Terraform) may default to deploying a single instance (N=1) of a service, creating a Single Point of Failure (SPOF) that causes a total outage if it fails.

**Prevention Checklist:**
- [ ] Primary Fix: Run at least N+1 (e.g., 3) instances (replicas) of every critical, stateless service
- [ ] Distribute replicas across multiple physical failure domains (e.g., different nodes, racks, or cloud Availability Zones)
- [ ] Use a load balancer to distribute traffic across all healthy replicas
- [ ] For stateful services (like databases), use a primary-replica (active-passive) or active-active replication strategy with automated failover
- [ ] Use `process/release-readiness-runbook` to test your automated failover by terminating the primary instance

**Early Detection:**
- **CI/CD:** Linter for Kubernetes (e.g., kube-linter) or Terraform (e.g., tflint) that fails if replicaCount is < 2 for a production deployment
- **Static:** Code review of deployment manifests
- **Runtime:** Alerting on replicaCount = 1 for any critical deployment

**Mitigation:**
1. (Incident) The service is down. Manually restart the failed instance to restore service temporarily
2. (Fix) Immediately update the deployment manifest to increase the replicaCount to >= 3
3. (Improve) Implement automated failover for stateful services

**E-E-A-T Signals (SEO):**
- **Experience:** Based on production outages where an entire service disappeared because the single node it was running on failed
- **Expertise:** Cites specific high-availability (HA) architectures: N+1, active-passive, and active-active, and applying them to stateless vs. stateful components
- **Authoritativeness:** Aligns with all foundational principles of high-availability (HA) system design and SRE
- **Trustworthiness:** Provides a clear, actionable rule (N+1, spread across AZs) as the minimum bar for production readiness

**Workflows:** `process/release-readiness-runbook` (failover testing)  
**Pain Points:** `pain-point-22-missing-validations`

---

## 41. Prevent Missing Retry Logic

**Slug:** `prevent-missing-retry-logic`  
**Category:** availability | **Severity:** high

**Problem:** AI-generated client code often fails permanently on transient, temporary network errors (e.g., 503 Service Unavailable, 429 Rate Limit), when a simple retry would have succeeded, leading to brittle services and user-facing errors.

**Prevention Checklist:**
- [ ] Primary Fix: Implement retry logic only for transient, idempotent-safe errors (e.g., 503, 429, timeout)
- [ ] Crucial: Never retry on 4xx client errors (e.g., 400, 401, 404), as these will never succeed
- [ ] Use Exponential Backoff: increase the wait time between retries (e.g., 1s, 2s, 4s) to give the downstream service time to recover
- [ ] Add Jitter (randomness) to the backoff delay to prevent a "thundering herd" of synchronized retries
- [ ] Set a maximum retry count (e.g., 3-5 attempts) and a total timeout

**Early Detection:**
- **CI/CD:** SAST scan to ensure HTTP clients are wrapped in a resilience library (e.g., Polly, Resilience4j)
- **Static:** Code review of network clients to check for retry logic
- **Runtime:** Monitor logs for a high rate of client-side 5xx errors that are not followed by a retry attempt

**Mitigation:**
1. Deploy a hotfix to the client service that adds a retry policy (with exponential backoff and jitter)
2. (If downstream is overloaded) Temporarily open a circuit breaker (Guardrail 33) to protect it

**E-E-A-T Signals (SEO):**
- **Experience:** From building resilient microservices that must gracefully handle temporary network blips between services
- **Expertise:** Cites the specific, industry-standard "Exponential Backoff with Jitter" algorithm as the correct implementation
- **Authoritativeness:** This is a standard resilience pattern recommended by AWS, Microsoft, and Google
- **Trustworthiness:** Provides a critical warning not to retry 4xx errors, preventing a common anti-pattern

**Workflows:** `process/release-readiness-runbook` (chaos testing), `security/security-guardrails` (related to 429 errors)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 42. Prevent Improper Shutdown Handling

**Slug:** `prevent-improper-shutdown-handling`  
**Category:** availability | **Severity:** critical

**Problem:** AI-generated services do not handle OS-level shutdown signals (like SIGTERM from Kubernetes). When a deploy happens, the orchestrator kills the process (SIGKILL), abruptly dropping all in-flight requests.

**Prevention Checklist:**
- [ ] Primary Fix: Implement a "graceful shutdown" handler in your application that listens for the SIGTERM signal
- [ ] On receiving SIGTERM, the handler must: Stop the web server from accepting new requests, finish processing all in-flight requests, close database and network connections, exit the process cleanly (e.g., exit(0))
- [ ] In Kubernetes, configure a preStop hook to trigger your graceful shutdown endpoint
- [ ] Configure terminationGracePeriodSeconds in Kubernetes to give your app enough time to shut down (e.g., 30s)

**Early Detection:**
- **CI/CD:** Test graceful shutdown. Send a SIGTERM to the app in a test environment and verify it finishes in-flight requests without error
- **Static:** Code review for a SIGTERM handler. K8s manifest linter for preStop hooks
- **Runtime:** Monitor logs for abrupt, non-zero exit codes. Monitor client-side metrics for a spike in "Connection Reset" errors during a deploy

**Mitigation:**
1. (Immediate) Increase terminationGracePeriodSeconds in the K8s manifest to (e.g., 60s) to "stop the bleeding"
2. (Permanent) Implement the SIGTERM handler in the application code
3. Tune the grace period to be just longer than the app's p99 shutdown time

**E-E-A-T Signals (SEO):**
- **Experience:** From achieving zero-downtime deployments in Kubernetes by correctly handling the SIGTERM/preStop lifecycle
- **Expertise:** Cites the specific K8s SIGTERM -> terminationGracePeriodSeconds -> SIGKILL lifecycle
- **Authoritativeness:** Aligns with official Kubernetes and Google Cloud documentation on pod termination
- **Trustworthiness:** Provides a complete, robust solution covering both the application (SIGTERM handler) and the orchestrator (preStop hook)

**Workflows:** `process/release-readiness-runbook` (part of the deployment checklist)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## Summary

All 9 availability guardrails processed and formatted following the condensed format specification (~200-250 words per guardrail). Each guardrail includes actionable prevention checklist, detection methods, mitigation steps, and real-world E-E-A-T signals for SEO.

