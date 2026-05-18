# Notification System Design

## Stage 1 — API Design

The notification system supports the following operations:

- Create notification
- Fetch notifications
- Fetch unread notifications
- Mark notification as read
- Realtime updates

### Create Notification

```http
POST /api/v1/notifications
```

**Request:**
```json
{
  "studentId": 1042,
  "notificationType": "Placement",
  "message": "AMD hiring started"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created"
}
```

### Get Notifications

```http
GET /api/v1/notifications/1042
```

### Mark as Read

```http
PATCH /api/v1/notifications/1/read
```

### Realtime Notifications

WebSockets with **Socket.IO** will be used for realtime notification updates. This allows instant notification delivery without repeated API polling.

---

## Stage 2 — Database Design

### Database Choice

**MongoDB** is chosen for the following reasons:

- Flexible schema
- Easy to scale
- Well-suited for large notification datasets
- Faster development with Node.js

### Notification Schema

```json
{
  "studentId": "Number",
  "notificationType": "String",
  "message": "String",
  "isRead": "Boolean",
  "createdAt": "Date"
}
```

### Problems When Data Increases

- Slow queries
- High database load
- Slow notification fetching

### Solutions

- **Indexing** — Speed up frequent queries
- **Pagination** — Limit results per request
- **Redis caching** — Reduce repeated DB hits
- **Database sharding** — Distribute data across nodes

### Sample Query

```js
db.notifications.find({
  studentId: 1042,
  isRead: false
})
```

---

## Stage 3 — Query Optimization

### Given Query

```sql
SELECT * FROM notifications
WHERE studentId = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

This query is correct but may become slow at scale due to full table scans and sorting overhead over millions of records.

### Improvement — Add a Composite Index

```sql
CREATE INDEX idx_notification
ON notifications(studentId, isRead, createdAt DESC);
```
> **Note:** Adding indexes on every column is not recommended — it increases storage usage and slows `INSERT`/`UPDATE` operations.

### Placement Notification Query

```sql
SELECT DISTINCT studentId
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL 7 DAY;
```

---

## Stage 4 — Performance Improvements

Fetching notifications on every page load increases database load unnecessarily.

### Recommended Improvements

 Technique          Benefit                                    
 **Redis Caching** : Reduces repeated database queries          
 **WebSockets**    : Realtime updates without polling           
 **Pagination**    : Loads notifications in smaller batches     
 **Lazy Loading**  : Loads older notifications only when needed 

These methods improve performance and reduce overall server load.

---

## Stage 5 — Bulk Notification Processing

### Problems in Existing Implementation

- Sequential execution is slow
- No retry mechanism
- Missing failure handling
- Difficult to scale for 50,000+ students
- If email sending fails, some students may not receive notifications

### Better Approach

Use **asynchronous queue-based processing** with tools like **RabbitMQ** or **BullMQ**.

Separate workers can handle:
- Email sending
- Database storage
- Push notifications

### Improved Pseudocode

```
function notify_all(student_ids, message):
    for student_id in student_ids:
        add_job_to_queue({
            student_id,
            message
        })

worker_process():
    while jobs_available():
        job = get_next_job()
        try:
            save_to_db(job.student_id, job.message)
            send_email(job.student_id, job.message)
            push_to_app(job.student_id, job.message)
        catch error:
            retry_job(job)
```
