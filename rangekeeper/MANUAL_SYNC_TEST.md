# Manual Sync Test

## Test if extension can reach backend

**Open Chrome DevTools Console** (F12) on any Blackboard page and paste this:

```javascript
// Test backend connection
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend reachable:', data))
  .catch(err => console.error('❌ Backend unreachable:', err));
```

**Expected result:** `✅ Backend reachable: {status: "healthy"}`

**If you see an error**, it means the extension can't reach localhost:3000 (CORS or network issue).

---

## Force a manual sync

**In Chrome DevTools Console**, paste this to manually trigger sync:

```javascript
// Get all data from IndexedDB
const request = indexedDB.open('RangeKeeperDB', 1);

request.onsuccess = function(event) {
  const db = event.target.result;
  
  // Get courses
  const coursesTx = db.transaction(['courses'], 'readonly');
  const coursesStore = coursesTx.objectStore('courses');
  const coursesReq = coursesStore.getAll();
  
  coursesReq.onsuccess = function() {
    const courses = coursesReq.result;
    console.log('📚 Found', courses.length, 'courses in IndexedDB');
    
    // Get assignments
    const assignmentsTx = db.transaction(['assignments'], 'readonly');
    const assignmentsStore = assignmentsTx.objectStore('assignments');
    const assignmentsReq = assignmentsStore.getAll();
    
    assignmentsReq.onsuccess = function() {
      const assignments = assignmentsReq.result;
      console.log('📝 Found', assignments.length, 'assignments in IndexedDB');
      
      // Send to backend
      const data = {
        courses: courses,
        assignments: assignments,
        grades: [],
        announcements: []
      };
      
      console.log('🚀 Sending to backend...');
      
      fetch('http://localhost:3000/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(result => {
        console.log('✅ Sync successful!', result);
      })
      .catch(err => {
        console.error('❌ Sync failed:', err);
      });
    };
  };
};
```

**Expected result:** `✅ Sync successful!` followed by backend logs showing received data.

---

**Run these two tests and tell me what you see!**
