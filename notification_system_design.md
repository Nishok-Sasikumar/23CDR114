# Stage 1

## Notification System API Design

The notification system should support:
- Create notification
- Fetch notifications
- Fetch unread notifications
- Mark notification as read
- Realtime updates

### Create Notification

```http
POST /api/v1/notifications

Request:

{
  "studentId": 1042,
  "notificationType": "Placement",
  "message": "AMD hiring started"
}

Response:

{
  "success": true,
  "message": "Notification created"
}
Get Notifications
GET /api/v1/notifications/1042
Mark as Read
PATCH /api/v1/notifications/1/read
Realtime Notifications

I would use WebSockets with Socket.IO for realtime notification updates because it allows instant notification delivery without repeated API requests.

# Stage 2
Database Choice

I would use MongoDB because:

flexible schema
easy to scale
good for large notification data
faster development with Node.js
Notification Schema
{
  studentId: Number,
  notificationType: String,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
Problems When Data Increases
Slow queries
High DB load
Slow notification fetching
Solutions
Indexing
Pagination
Redis caching
Database sharding
Sample Query
db.notifications.find({
  studentId: 1042,
  isRead: false
})
Stage 3

Given Query:

SELECT * FROM notifications
WHERE studentId = 1042 AND isRead = false
ORDER BY createdAt DESC;

The query is correct but may become slow because millions of records can cause full table scans and sorting overhead.

Improvement

Create index:

CREATE INDEX idx_notification
ON notifications(studentId, isRead, createdAt DESC);

Without index:

O(n)

With index:

approximately O(log n)

Adding indexes on every column is not recommended because it increases storage and slows insert/update operations.

Placement Notification Query
SELECT DISTINCT studentId
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL 7 DAY;
Stage 4

Fetching notifications on every page load increases database load.

Improvements
Redis Caching

Reduces repeated database queries.

WebSockets

Realtime updates without polling.

Pagination

Loads notifications in smaller batches.

Lazy Loading

Load older notifications only when needed.

These methods improve performance and reduce server load.

Stage 5

Problems in Existing Implementation
Sequential execution is slow
No retry mechanism
Failure handling missing
Difficult to scale for 50,000 students

If email sending fails, some students may not receive notifications.

Better Approach

Use asynchronous queue-based processing using tools like RabbitMQ or BullMQ.

Separate workers can handle:

email sending
database storage
push notifications
Improved Pseudocode
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

Database save and email sending should be handled separately because email delivery may fail temporarily while notification data still needs to be stored.