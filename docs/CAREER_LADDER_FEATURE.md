# Career Ladder Builder & Assessment Feature

## 🎯 **The Problem We're Solving**

### **For Employees:**
- ❌ "When will I be promoted?"
- ❌ "Why were others promoted ahead of me?"
- ❌ "What do I need to do to get promoted?"
- ❌ "How do I know if I'm ready?"
- ❌ "What skills am I missing?"

### **For Managers:**
- ❌ "How do I create a clear career ladder?"
- ❌ "How do I assess my team objectively?"
- ❌ "Who's ready for promotion?"
- ❌ "How do I have career conversations?"
- ❌ "How do I retain top talent?"

---

## 💡 **The Solution**

### **AI-Powered Career Development Platform**

**For Managers:**
1. Upload company docs → AI builds career ladder
2. Customize per role (Engineer, PM, Designer)
3. Assign to team members
4. Track team progress
5. Identify promotion candidates

**For Employees:**
1. Upload company career ladder
2. AI-powered self-assessment
3. Get objective scoring (9-box model)
4. Upload performance review → AI analyzes gaps
5. Generate OKRs & SMART goals
6. 6-month development plan
7. Track promotion readiness

---

## 🎨 **User Flows**

### **Flow 1: Manager Creates Career Ladder**

```
1. Manager uploads company docs
   - Engineering levels doc
   - Competency framework
   - Role expectations

2. AI extracts structure
   - Identifies levels (L1-L6+)
   - Extracts competencies per level
   - Maps technical vs. leadership skills

3. Manager customizes
   - Adjust level names
   - Add/remove competencies
   - Set expectations per level

4. Publish to team
   - Assign to engineers
   - Make visible in dashboard
   - Enable self-assessment

5. Track team progress
   - See who's ready for promotion
   - Identify skill gaps
   - Plan development
```

### **Flow 2: Employee Self-Assessment**

```
1. Employee selects career ladder
   - Company ladder (if provided)
   - Industry template (Google, Meta, etc.)
   - Custom upload

2. AI-powered assessment
   - Answer 20-30 questions
   - AI scores against criteria
   - Objective rating per competency

3. Get results
   - "You're 75% ready for L5"
   - Strengths: Communication, Code Quality
   - Gaps: System Design, Leadership

4. Generate development plan
   - OKRs for next quarter
   - SMART goals per gap
   - Learning resources
   - Project recommendations

5. Track progress
   - Complete goals
   - Collect evidence
   - Update readiness %
   - Prepare for promotion conversation
```

### **Flow 3: Performance Review Analysis**

```
1. Upload performance review
   - PDF, Word, or paste text
   - AI extracts feedback

2. AI analyzes
   - Identifies strengths
   - Extracts areas for improvement
   - Maps to career ladder criteria
   - Compares to next level

3. Get insights
   - "Your manager values your communication"
   - "Gap: Need more system design experience"
   - "Strength: Code quality is L5-level"

4. Action plan
   - 3 OKRs to close gaps
   - Recommended projects
   - Skills to develop
   - Timeline to promotion
```

---

## 🏗️ **Technical Architecture**

### **Data Models**

```typescript
interface CareerLadder {
  _id: ObjectId;
  companyId: string;
  name: string; // "Engineering Ladder"
  levels: CareerLevel[];
  createdBy: string; // Manager ID
  createdAt: Date;
  isPublic: boolean;
}

interface CareerLevel {
  level: number; // 1-6+
  title: string; // "Senior Engineer"
  competencies: Competency[];
  expectations: string[];
  impactScope: string;
  yearsExperience?: string;
}

interface Competency {
  category: 'technical' | 'leadership' | 'communication' | 'impact';
  name: string;
  description: string;
  examples: string[];
  weight: number; // 0-100
}

interface SelfAssessment {
  _id: ObjectId;
  userId: string;
  ladderId: ObjectId;
  currentLevel: number;
  targetLevel: number;
  scores: CompetencyScore[];
  overallReadiness: number; // 0-100%
  gaps: Gap[];
  createdAt: Date;
}

interface CompetencyScore {
  competency: string;
  selfScore: number; // 1-5
  aiScore: number; // 1-5
  evidence: string[];
  gap: number; // Difference from target level
}

interface DevelopmentPlan {
  _id: ObjectId;
  userId: string;
  assessmentId: ObjectId;
  goals: SMARTGoal[];
  okrs: OKR[];
  milestones: Milestone[];
  targetDate: Date;
  progress: number; // 0-100%
}

interface SMARTGoal {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: Date;
  competency: string;
  status: 'not-started' | 'in-progress' | 'completed';
}
```

### **AI Prompts**

#### **1. Career Ladder Extraction**
```
You are a career development expert. Analyze these company documents and extract a structured career ladder.

Documents: [uploaded docs]

Extract:
1. All career levels (L1-L6+)
2. Competencies per level
3. Expectations and requirements
4. Impact scope
5. Technical vs. leadership balance

Output as structured JSON.
```

#### **2. Self-Assessment Scoring**
```
You are an objective career assessor. Based on the user's responses, score them against L5 criteria.

Career Ladder: [L5 criteria]
User Responses: [assessment answers]

For each competency:
1. Score 1-5 (1=beginner, 5=expert)
2. Provide evidence from responses
3. Identify gaps vs. L5
4. Suggest improvements

Be honest and objective.
```

#### **3. Performance Review Analysis**
```
Analyze this performance review and extract career insights.

Review: [uploaded review]
Career Ladder: [company ladder]
Current Level: L4
Target Level: L5

Extract:
1. Strengths mentioned
2. Areas for improvement
3. Map to career ladder competencies
4. Identify gaps for L5
5. Generate 3 OKRs to close gaps
```

#### **4. OKR Generation**
```
Generate quarterly OKRs to help this person reach L5.

Current Level: L4
Target Level: L5
Gaps: [System Design, Technical Leadership]
Timeline: 6 months

Generate 3-5 OKRs with:
- Objective (what to achieve)
- 3-4 Key Results (measurable)
- Aligned to career ladder gaps
```

---

## 📊 **UI Components**

### **1. Career Ladder Builder (Manager)**
```tsx
<CareerLadderBuilder>
  <UploadDocs />
  <AIExtraction />
  <LevelEditor>
    <Level number={4} title="Senior Engineer">
      <Competency category="technical">
        System Design: Design scalable systems...
      </Competency>
    </Level>
  </LevelEditor>
  <PublishToTeam />
</CareerLadderBuilder>
```

### **2. Self-Assessment Tool**
```tsx
<SelfAssessment>
  <SelectLadder />
  <AssessmentQuestions>
    <Question competency="System Design">
      How often do you design systems that serve 1M+ users?
      <Rating value={3} />
    </Question>
  </AssessmentQuestions>
  <Results>
    <ReadinessScore>75%</ReadinessScore>
    <Gaps>
      <Gap>System Design: Need more experience</Gap>
    </Gaps>
  </Results>
</SelfAssessment>
```

### **3. Development Plan**
```tsx
<DevelopmentPlan>
  <OKRList>
    <OKR>
      Objective: Demonstrate L5 System Design skills
      <KeyResult>Design 2 systems serving 1M+ users</KeyResult>
      <KeyResult>Present architecture to team</KeyResult>
    </OKR>
  </OKRList>
  <ProgressTracker>
    <Milestone>Complete system design course</Milestone>
    <Milestone>Lead architecture review</Milestone>
  </ProgressTracker>
</DevelopmentPlan>
```

---

## 💰 **Business Value**

### **For Companies (B2B)**
- ✅ Transparent career progression
- ✅ Objective promotion decisions
- ✅ Reduced turnover (people see path)
- ✅ Consistent standards across teams
- ✅ Data-driven development planning
- ✅ **Justifies training budget**

### **For Employees**
- ✅ Clear path to promotion
- ✅ Objective self-assessment
- ✅ Actionable development plan
- ✅ Evidence for promotion case
- ✅ Answers "when will I be promoted?"
- ✅ **Reduces anxiety and uncertainty**

### **For Managers**
- ✅ Easy career conversations
- ✅ Objective assessment framework
- ✅ Identify promotion candidates
- ✅ Retain top talent
- ✅ Fair and consistent decisions
- ✅ **Saves hours per 1:1**

---

## 🎯 **Pricing Strategy**

### **Free Tier**
- Self-assessment (1 per month)
- Basic development plan
- Industry templates

### **Pro ($29/month)**
- Unlimited self-assessments
- Performance review analysis
- Custom career ladders
- OKR generation
- Progress tracking

### **Team ($99/month per manager)**
- Team career ladder builder
- Team assessment dashboard
- Promotion pipeline
- Manager tools
- Analytics

### **Enterprise (Custom)**
- Custom career ladders
- SSO integration
- API access
- White-label
- Dedicated support

---

## 🚀 **Implementation Priority**

### **Phase 1: MVP (5 commits)**
1. Career ladder data model
2. Self-assessment questionnaire
3. Basic scoring algorithm
4. Development plan generator
5. Simple UI

### **Phase 2: AI Integration (5 commits)**
1. Document upload & parsing
2. AI ladder extraction
3. AI assessment scoring
4. Performance review analysis
5. OKR generation

### **Phase 3: Manager Tools (4 commits)**
1. Team dashboard
2. Promotion pipeline
3. Career conversation templates
4. Analytics

### **Phase 4: Polish (4 commits)**
1. 9-box model visualization
2. Progress tracking
3. Evidence collection
4. Export/sharing

---

## 🎉 **Why This is a KILLER Feature**

### **1. Solves REAL Pain**
- Every engineer asks "when will I be promoted?"
- Every manager struggles with career conversations
- Companies want transparent career paths

### **2. Sticky & Valuable**
- Users come back monthly for assessments
- Managers use for every 1:1
- Companies integrate into performance process

### **3. B2B Revenue**
- Companies will PAY for this
- Retention tool (reduces turnover)
- Training budget justification
- HR/People Ops will love it

### **4. Differentiator**
- No one else has AI-powered career ladders
- Combines with prompt engineering (unique!)
- Solves career + AI skills together

### **5. Network Effects**
- Managers share with teams
- Teams share with other teams
- Companies standardize on platform

---

## 📈 **Success Metrics**

- **Engagement**: % of users who complete self-assessment
- **Retention**: Users who return monthly
- **B2B**: Teams using career ladder builder
- **Revenue**: Team plan conversions
- **Impact**: "I got promoted using Engify" testimonials

---

**This feature alone could be a $10M+ business.** 🚀
