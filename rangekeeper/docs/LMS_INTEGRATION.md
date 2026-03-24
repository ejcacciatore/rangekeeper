# LMS Integration Research

> Research and implementation guide for Canvas, Blackboard, and Google Classroom integrations.

---

## Summary Matrix

| Feature | Canvas | Blackboard | Google Classroom |
|---------|--------|------------|-----------------|
| OAuth 2.0 | ✅ Full support | ✅ Requires institutional registration | ✅ Google OAuth |
| List enrolled courses | ✅ `/courses` | ✅ `/courses` | ✅ `/v1/courses` |
| Get assignments + due dates | ✅ Rich data | ✅ Gradebook columns | ✅ CourseWork |
| Assignment descriptions | ✅ HTML body | ✅ Content body | ✅ Description field |
| Grade weights | ✅ Assignment groups | ✅ Grade schemas | ⚠️ Max points only |
| Real-time updates | ❌ Polling only | ❌ Polling only | ✅ Push (Pub/Sub) |
| Syllabus access | ✅ Course syllabus body | ⚠️ Limited | ❌ Not available |
| Market share (US colleges) | ~35% | ~30% | ~15% (growing) |
| Self-hosted option | ✅ | ✅ | ❌ |
| Rate limits | 3000 req/hr | Varies by institution | 300 req/min |

---

## 1. Canvas LMS

### Overview

Canvas by Instructure is the most widely used LMS in US higher education (~35% market share). Its REST API is well-documented, consistently maintained, and developer-friendly.

### OAuth 2.0 Flow

```
1. Register your app as a Developer Key in Canvas admin
   → Admin: Accounts → Developer Keys → + Developer Key → API Key
   → Set: Redirect URI, Scopes, Icon URL
   → Get: Client ID, Client Secret

2. Authorization URL:
   GET https://{school}.instructure.com/login/oauth2/auth
     ?client_id={CLIENT_ID}
     &response_type=code
     &redirect_uri={REDIRECT_URI}
     &scope=url:GET|/api/v1/courses url:GET|/api/v1/courses/:id/assignments ...
     &state={CSRF_STATE_TOKEN}

3. Exchange code for token:
   POST https://{school}.instructure.com/login/oauth2/token
     Content-Type: application/x-www-form-urlencoded
     grant_type=authorization_code
     &code={AUTH_CODE}
     &client_id={CLIENT_ID}
     &client_secret={CLIENT_SECRET}
     &redirect_uri={REDIRECT_URI}

   Response:
   {
     "access_token": "...",
     "token_type": "Bearer",
     "user": { "id": 123, "name": "Alex Chen" },
     "refresh_token": "...",
     "expires_in": 3600
   }

4. Refresh token:
   POST https://{school}.instructure.com/login/oauth2/token
     grant_type=refresh_token
     &refresh_token={REFRESH_TOKEN}
     &client_id={CLIENT_ID}
     &client_secret={CLIENT_SECRET}
```

**Critical challenge:** Developer Keys are institution-specific. To support any Canvas school, we need:
- Option A: Multi-tenant developer keys (requires partnership with each institution)
- Option B: Direct API token (student pastes in manually — less friction than OAuth, but less secure)
- Option C: Canvas Data portal for bulk institutional partnerships (v2+ feature)

**Recommended for v1:** Support manual API token entry as primary, build OAuth for partner schools.

### Key API Endpoints

```
Base URL: https://{school}.instructure.com/api/v1

# Get all enrolled courses (active only)
GET /courses?enrollment_state=active&include[]=syllabus_body&include[]=total_scores

# Get assignments for a course
GET /courses/:courseId/assignments
  ?include[]=submission
  &include[]=score_statistics
  &order_by=due_at
  &bucket=upcoming        # only upcoming, not past
  Response includes: due_at, points_possible, assignment_group_id, 
                     description (HTML), submission_types[], lock_info

# Get assignment groups (for grade weight calculation)
GET /courses/:courseId/assignment_groups?include[]=assignments

# Get course modules (for understanding assignment context)
GET /courses/:courseId/modules?include[]=items

# Get student's calendar events
GET /calendar_events
  ?context_codes[]=course_{courseId}
  &start_date=2026-01-01
  &end_date=2026-05-31
  &type=assignment

# Get student's to-do list (Canvas's own prioritization)
GET /users/self/todo

# Get discussion topics (often graded, function as assignments)
GET /courses/:courseId/discussion_topics
  ?only_announcements=false
  &order_by=position
```

### Data We Get from Canvas

| Data Point | API Field | Quality |
|------------|-----------|---------|
| Assignment title | `name` | ✅ Excellent |
| Due date | `due_at` (ISO 8601) | ✅ Excellent |
| Assignment description | `description` (HTML) | ✅ Good — strip HTML |
| Points possible | `points_possible` | ✅ Excellent |
| Grade weight | Via assignment groups | ✅ Good |
| Submission status | Via `submission` include | ✅ Excellent |
| Assignment type | `submission_types[]` | ✅ Good (online_text, file_upload, etc.) |
| Lock dates | `lock_at`, `unlock_at` | ✅ Good |
| Course syllabus | `syllabus_body` on course | ⚠️ HTML, requires parsing |
| Exam dates | Calendar events | ⚠️ Only if professor adds to Canvas calendar |

### What Requires Manual Input (Canvas)

- Exam dates not entered by professor in Canvas
- Study time expectations (hidden in syllabus text, not structured data)
- Lab/office hours schedules
- Project proposal deadlines (sometimes only in syllabus PDF)

### Webhook/Real-time (Canvas)

Canvas has **no native webhooks** in the REST API for assignment changes.

**Solutions:**
1. **Polling (v1):** Sync every 4 hours. Compare `updated_at` field to detect changes.
2. **Canvas Data 2 (enterprise):** Real-time streaming events via Firehose. Requires institutional license agreement.
3. **LTI Deep Linking (v2):** Embed RangeKeeper as an LTI tool within Canvas — this gives real-time context but is complex.

### Rate Limits

- Default: 3,000 requests per hour per user token
- Exceeding limit: HTTP 403 with `X-Request-Cost` and `X-Rate-Limit-Remaining` headers
- Strategy: Cache aggressively, sync on 4h schedule, use conditional requests (`If-Modified-Since`)

---

## 2. Blackboard Learn

### Overview

Blackboard (now Anthology) has ~30% market share but is fragmented by version (Original vs. Ultra experience) and institutional configuration. The REST API (Learn REST API v3) is more restrictive than Canvas.

### OAuth 2.0 Flow

```
1. App registration — REQUIRES Blackboard partnership:
   → Register at https://developer.anthology.com
   → Create application, get Application ID
   → Institution must register your Application ID in their Blackboard admin

2. Get 3-legged OAuth token:
   GET https://{school}.blackboard.com/learn/api/public/v1/oauth2/authorizationcode
     ?response_type=code
     &client_id={APP_ID}
     &redirect_uri={REDIRECT_URI}
     &scope=read
     &state={CSRF_STATE}

3. Exchange code:
   POST https://{school}.blackboard.com/learn/api/public/v1/oauth2/token
     Authorization: Basic base64(APP_ID:APP_SECRET)
     Content-Type: application/x-www-form-urlencoded
     grant_type=authorization_code
     &code={CODE}
     &redirect_uri={REDIRECT_URI}

4. Token response:
   {
     "access_token": "...",
     "token_type": "bearer",
     "expires_in": 3600,
     "scope": "read",
     "user_id": "uuid..."
   }
   Note: Blackboard does NOT return a refresh_token in standard flow.
   Must re-authenticate when token expires.
```

**Critical challenge:** Every Blackboard institution must separately register your application. This creates a significant sales/partnerships bottleneck.

**Recommended for v1:** Deprioritize Blackboard. Canvas + Google Classroom covers 50%+ of market. Add Blackboard in v1.5 with institutional partnership model.

### Key API Endpoints

```
Base URL: https://{school}.blackboard.com/learn/api/public/v3

# Get enrolled courses
GET /users/me/memberships?expand=course

# Get course content (assignments are buried in content tree)
GET /courses/{courseId}/contents?recursive=true&fields=title,body,availability,contentHandler

# Get gradebook columns (each = an assignment)
GET /courses/{courseId}/gradebook/columns
  Response: id, name, description, due (timestamp), score.possible, 
            externalGrade (is this final grade?), grading.type

# Get specific assignment details
GET /courses/{courseId}/gradebook/columns/{columnId}

# Get submission status
GET /courses/{courseId}/gradebook/columns/{columnId}/users/me

# Get calendar events
GET /calendar/items
  ?courseId={courseId}
  &since=2026-01-01T00:00:00.000Z
  &type=GradebookColumn
```

### Data We Get from Blackboard

| Data Point | API Field | Quality |
|------------|-----------|---------|
| Assignment title | `name` on gradebook column | ✅ Good |
| Due date | `due` on gradebook column | ✅ Good |
| Assignment description | `body` on content item | ⚠️ Requires content tree traversal |
| Points possible | `score.possible` | ✅ Good |
| Grade weight | Via grade schema | ⚠️ Complex — schema-based |
| Submission status | Via student submission endpoint | ✅ Good |
| Assignment type | `contentHandler.id` | ⚠️ Non-standard handler IDs |

### What Requires Manual Input (Blackboard)

- Detailed assignment instructions (often in attached files, not API-accessible)
- Exam schedule (often only in syllabus)
- Assignment rubrics (not consistently available via API)
- Module structure context

### Version Complexity

Blackboard Original and Blackboard Ultra have **different data models**. The v3 REST API works better with Ultra. For Original, some features require workarounds or the Legacy SOAP API (deprecated).

---

## 3. Google Classroom

### Overview

Google Classroom has ~15% market share but is growing rapidly, especially in schools already in the Google Workspace ecosystem. The API is excellent — well-documented, consistent, and supports real-time push notifications.

### OAuth 2.0 Flow

```
Google Classroom uses standard Google OAuth 2.0.
Scopes needed:
  - https://www.googleapis.com/auth/classroom.courses.readonly
  - https://www.googleapis.com/auth/classroom.coursework.me.readonly
  - https://www.googleapis.com/auth/classroom.student-submissions.me.readonly
  - https://www.googleapis.com/auth/calendar.readonly  (same token, add scope)
  - https://www.googleapis.com/auth/gmail.readonly      (optional, for assignment emails)

1. Register app at https://console.cloud.google.com
   → Enable: Classroom API, Calendar API, Gmail API
   → Create OAuth 2.0 Client ID (Web application)
   → Set authorized redirect URIs

2. Authorization URL:
   GET https://accounts.google.com/o/oauth2/v2/auth
     ?client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URI}
     &response_type=code
     &scope={SCOPES_SPACE_SEPARATED}
     &access_type=offline    // CRITICAL — gets refresh_token
     &prompt=consent         // CRITICAL — ensures refresh_token returned
     &state={CSRF_STATE}

3. Exchange code:
   POST https://oauth2.googleapis.com/token
     code={CODE}
     &client_id={CLIENT_ID}
     &client_secret={CLIENT_SECRET}
     &redirect_uri={REDIRECT_URI}
     &grant_type=authorization_code

   Response:
   {
     "access_token": "ya29...",
     "expires_in": 3600,
     "refresh_token": "1//...",  // only on first authorization
     "scope": "...",
     "token_type": "Bearer"
   }

4. Refresh:
   POST https://oauth2.googleapis.com/token
     refresh_token={REFRESH_TOKEN}
     &client_id={CLIENT_ID}
     &client_secret={CLIENT_SECRET}
     &grant_type=refresh_token
```

### Key API Endpoints

```
Base URL: https://classroom.googleapis.com/v1

# List courses (enrolled as STUDENT)
GET /courses?studentId=me&courseStates=ACTIVE

# List assignments (courseWork) in a course
GET /courses/{courseId}/courseWork
  ?orderBy=dueDate asc
  Response: id, title, description, dueDate (date), dueTime (timeOfDay),
            maxPoints, workType (ASSIGNMENT|SHORT_ANSWER_QUESTION|MULTIPLE_CHOICE_QUESTION),
            state (PUBLISHED|DRAFT), alternateLink (URL to assignment in Classroom)

# Get student's submission for an assignment
GET /courses/{courseId}/courseWork/{courseWorkId}/studentSubmissions
  ?userId=me
  Response: id, state (TURNED_IN|RETURNED|NEW|RECLAIMED_BY_STUDENT),
            late, assignedGrade, draftGrade, updateTime

# Get all submissions across all courses
GET /courses/{courseId}/courseWork/-/studentSubmissions
  ?userId=me&states=NEW,RECLAIMED_BY_STUDENT

# Get course announcements
GET /courses/{courseId}/announcements
```

### Data We Get from Google Classroom

| Data Point | API Field | Quality |
|------------|-----------|---------|
| Assignment title | `title` | ✅ Excellent |
| Due date | `dueDate` + `dueTime` | ✅ Excellent |
| Assignment description | `description` | ✅ Good |
| Points possible | `maxPoints` | ✅ Good |
| Grade weight | Not available | ❌ Not in API |
| Submission status | `studentSubmissions.state` | ✅ Excellent |
| Assignment type | `workType` | ✅ Good |
| Assignment URL | `alternateLink` | ✅ Excellent |
| Attachments | `materials[]` | ✅ Good (Drive files, YouTube, links) |

### Real-Time Push Notifications ✅

Google Classroom supports push notifications via Google Cloud Pub/Sub:

```
1. Create a Pub/Sub topic in Google Cloud Console
2. Subscribe to Classroom changes:
   POST https://classroom.googleapis.com/v1/registrations
   {
     "feed": {
       "feedType": "COURSE_WORK_CHANGES",
       "courseId": "{courseId}"
     },
     "cloudPubsubTopic": {
       "topicName": "projects/{project}/topics/{topic}"
     }
   }

3. Set up Pub/Sub push subscription pointing to:
   https://rangekeeper.app/api/v1/webhooks/google/classroom

4. Process incoming events:
   {
     "courseId": "...",
     "courseWorkId": "...",
     "userId": "...",
     "changeType": "CREATED"  // or MODIFIED, DELETED
   }
```

**Registration expires after 7 days** — must be renewed. BullMQ cron job handles renewal.

### Rate Limits

- 300 requests per minute per project
- 500 requests per 100 seconds per user
- Strategy: Pub/Sub webhooks reduce polling dramatically

---

## 4. Integration Priority & Phasing

### Phase 1 (Launch)

| Integration | Approach | Effort |
|-------------|----------|--------|
| Google Classroom | Full OAuth + Pub/Sub webhooks | Medium |
| Canvas (partner schools) | API token entry OR OAuth per school | Medium |
| Manual entry | Always available fallback | Low |
| Google Calendar | OAuth (same token as Classroom) | Low |

### Phase 2

| Integration | Approach | Effort |
|-------------|----------|--------|
| Canvas (all schools) | Developer Key per institution OR LTI | High |
| Blackboard | Anthology partnership + REST API | High |
| iCalendar import | Student pastes .ics URL from any LMS | Low |
| Syllabus PDF upload | GPT-4o Vision extracts assignments | Medium |

### Phase 3

| Integration | Approach | Effort |
|-------------|----------|--------|
| Canvas Data 2 | Institutional partnership streaming | Very High |
| D2L Brightspace | REST API (similar to Blackboard flow) | High |
| Moodle | REST web services API | Medium |

---

## 5. Fallback: Syllabus Upload (Phase 2)

When no LMS API is available, students can upload their syllabus:

```
Accepted formats:
- PDF
- Word document (.docx)
- Image (JPG/PNG — professor distributed printed syllabus)
- URL (web-based syllabus)

Processing pipeline:
1. Student uploads file → stored in S3/R2
2. BullMQ job: extract text (pdfjs / mammoth / GPT-4o Vision for images)
3. GPT-4o prompt: "Extract all assignments, exams, quizzes, and due dates 
   from this syllabus. Return structured JSON."
4. Review screen: student confirms extracted items (trust but verify)
5. Confirmed items → Assignments table (lmsType = MANUAL)
```

---

## 6. iCalendar Fallback (Phase 2)

Almost every LMS supports subscribing to a personal .ics calendar URL. This is the lowest-friction universal fallback:

```
1. Student finds their LMS's "Calendar Feed URL" (every LMS has this)
2. Student pastes URL into RangeKeeper
3. RangeKeeper fetches .ics on sync schedule
4. Parses VEVENT blocks — title, DTSTART, DTEND, DESCRIPTION, URL
5. Map VEVENT → Assignment model (limited data vs. full API)

Limitation: iCal gives events but not submission status, grade weights, 
or structured assignment details. Still better than nothing.
```

---

## 7. Privacy & Data Handling

| Data Type | Stored? | Retention | Notes |
|-----------|---------|-----------|-------|
| OAuth access tokens | Yes (encrypted) | Until disconnected | AES-256 encryption |
| OAuth refresh tokens | Yes (encrypted) | Until disconnected | High security |
| Assignment titles + due dates | Yes | 1 year after course end | Core app data |
| Assignment descriptions | Yes | 90 days | LMS refresh on sync |
| Student grades | No | Not stored | Out of scope deliberately |
| LMS credentials (username/password) | Never | N/A | OAuth only |
| Syllabus content | Yes (temp) | 30 days after extraction | S3 with lifecycle policy |

**FERPA compliance note:** Under FERPA, LMS academic records are protected. Our OAuth tokens access data on behalf of the student (the rights holder), which is compliant. We must include clear data processing disclosures in our privacy policy and terms of service.
