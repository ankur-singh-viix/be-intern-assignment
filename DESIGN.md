1. Overview

This project implements the backend for a simple social media platform. The current implementation focuses on core entities such as Users and Posts, providing clean CRUD APIs, proper database relationships, and a migration-based schema setup using TypeORM with SQLite.

The design emphasizes data integrity, clear entity relationships, and query patterns that can scale as the dataset grows.

2. Database Schema & Entity Relationships User

The users table stores basic profile information for each user.

Fields:

id (primary key)

firstName

lastName

email (unique)

createdAt

updatedAt

Relationships:
One user can create multiple posts.

This is implemented using a one-to-many relationship between User and Post.

A unique constraint is applied to the email field to prevent duplicate user accounts.

Post

The posts table stores content created by users.

Fields:

id (primary key)

content (text)

authorId (foreign key → users.id)

createdAt

updatedAt

Relationships:

Each post belongs to exactly one user (author).

A user can have multiple posts.

This many-to-one relationship allows efficient retrieval of posts along with their author details and supports feed-related queries in later stages.

Foreign key constraints are enforced, and posts are automatically deleted if their author is removed.

3. Indexing Strategy

Indexes are added based on expected query patterns.

An index on (authorId, createdAt) is created on the posts table.

This optimizes queries that fetch posts for a user in reverse chronological order.

This index will be especially useful for implementing the user feed feature.

A unique index on email is applied in the users table to ensure data integrity.

Indexes are kept minimal at this stage to avoid unnecessary overhead.

4. Migration Strategy

Database schema changes are managed using TypeORM migrations.

Automatic schema synchronization is disabled.

Each schema change (such as adding users or posts) is generated as a migration.

Migrations are tested by recreating the database from scratch to ensure reliability.

This approach ensures predictable schema evolution and prevents environment-specific inconsistencies.

5. API Design Decisions

RESTful conventions are followed for all endpoints.

Separate controllers and routes are used to keep responsibilities clear.

CRUD operations are implemented for both users and posts.

Post endpoints return author details where required to reduce additional API calls.

List endpoints are designed to be pagination-ready using limit and offset parameters in later stages.

6. Scalability Considerations

Pagination will be applied to list endpoints to handle large datasets.

Indexes are used to optimize read-heavy operations such as fetching posts.

Entity relationships are designed to support future features like feeds and activity tracking.

As the system grows, caching mechanisms (e.g., Redis) and background processing for activity logs can be introduced without major refactoring.

7. Future Enhancements

Planned additions include:

Follow system

Like system

Hashtags

Activity tracking

Personalized feed endpoint

The current schema is designed to support these features with minimal changes.



## Follow System Design

The follow system models the social relationship where one user follows another user.

Database Design

A separate follows table is used instead of embedding follow information in the users table. This keeps the schema normalized and allows efficient querying for followers and following relationships.

Fields:

id (primary key)

followerId (foreign key → users.id)

followingId (foreign key → users.id)

createdAt

Both followerId and followingId reference the users table, creating a self-referencing relationship.

Constraints & Data Integrity

A unique constraint is applied on (followerId, followingId) to prevent duplicate follow relationships.

A user cannot follow themselves, which is enforced at the API layer.

Foreign key constraints with CASCADE deletion ensure that follow records are removed automatically when a user is deleted.

These constraints ensure consistency even if API-level checks fail.

Indexing Strategy

An index is created on (followingId, createdAt) to optimize queries that fetch a user’s followers.

This index supports endpoints that list followers in reverse chronological order.

Indexes are chosen based on read-heavy access patterns rather than premature optimization.

API Design

The follow functionality is exposed through simple, action-based APIs:

Follow a user

Creates a new follow relationship.

Unfollow a user

Deletes an existing follow relationship.

Get followers of a user

Returns a paginated list of users who follow the given user.

Proper HTTP status codes are returned for edge cases such as duplicate follows or unfollowing a non-existent relationship.

Error Handling Strategy

Duplicate follow attempts return a clear client error instead of crashing the application.

Unfollow operations return a 404 response if the follow relationship does not exist.

Database-level constraints act as a safety net for race conditions.

This layered approach improves reliability and user experience.

Scalability Considerations

Follow relationships are stored in a dedicated table to allow efficient scaling.

Indexing supports fast lookup for follower lists as the user base grows.

The design can be extended to support “following” lists or mutual follow checks without schema changes.



## Like System Design

The like system allows users to express engagement with posts. Each like represents a relationship between a user and a post.

Database Design

Likes are stored in a separate likes table to keep the schema normalized and flexible.

Fields:

id (primary key)

userId (foreign key → users.id)

postId (foreign key → posts.id)

createdAt

Each record represents one user liking one post.

Constraints & Data Integrity

A unique constraint on (userId, postId) ensures that a user can like a post only once.

Foreign key constraints with CASCADE deletion automatically remove likes when the associated user or post is deleted.

Duplicate likes are handled gracefully at the API level to avoid application crashes.

These rules ensure data consistency even under concurrent requests.

Indexing Strategy

An index is added on postId to optimize queries that fetch all likes for a given post.

This supports features such as displaying like counts or listing users who liked a post.

Indexes are chosen based on actual query needs rather than adding them prematurely.

API Design

The like functionality is exposed through simple endpoints:

Like a post

Creates a new like record.

Unlike a post

Removes an existing like record.

Get likes for a post

Returns the total number of likes and basic user information.

Clear HTTP status codes are returned for edge cases such as duplicate likes or unliking a post that was not previously liked.

Error Handling Strategy

Duplicate like attempts return a client error instead of causing database exceptions.

Unliking a non-existent like returns a 404 response.

Database constraints act as a safety net for race conditions, while API checks provide meaningful feedback to clients.

This layered approach improves stability and clarity.

Scalability Considerations

Like records are stored independently, allowing the system to scale as engagement increases.

Indexed queries keep read operations efficient as the number of likes grows.

The current design can support future features such as activity tracking or popularity-based sorting without schema changes.


## Hashtag System Design

The hashtag system allows posts to be categorized and discovered using tags. Hashtags are shared across posts and are reused instead of being duplicated.

Database Design

Hashtags are stored in a separate hashtags table and connected to posts using a join table to support a many-to-many relationship.

Hashtag Table Fields:

id (primary key)

name (unique, stored in lowercase)

createdAt

Join Table (post_hashtags):

postId (foreign key → posts.id)

hashtagId (foreign key → hashtags.id)

This design allows efficient reuse of hashtags across multiple posts.

Relationship Design

A post can have multiple hashtags.

A hashtag can be associated with multiple posts.

A many-to-many relationship is implemented using an explicit join table (post_hashtags).

This keeps the schema normalized and avoids duplication of hashtag data.

Constraints & Data Integrity

Hashtag names are unique to prevent duplicate records.

Hashtags are normalized to lowercase at the application level to ensure case-insensitive matching.

Foreign key constraints with cascading behavior ensure that join records are cleaned up automatically when a post is deleted.

Indexing Strategy

An index is added on the name column of the hashtags table to support fast hashtag-based searches.

This improves performance for endpoints that fetch posts by hashtag.

Indexes are chosen based on actual query usage rather than premature optimization.

API Design

The hashtag system is exposed indirectly through post-related APIs:

Hashtags are created or reused automatically during post creation.

Posts can be fetched by hashtag using a dedicated endpoint.

This keeps the API simple while still supporting discoverability.

Scalability Considerations

Hashtags are stored independently and reused across posts, allowing the system to scale without data duplication.

Indexed lookups ensure hashtag searches remain efficient as the number of posts grows.

The design supports future features such as trending hashtags or hashtag analytics without schema changes.


 ## Activity Tracking System DesignFeed (/api/posts/feed)
Overview

The feed endpoint is responsible for showing users a personalized list of posts.
Instead of showing all posts in the system, the feed only includes posts created by users that the current user follows.

This mirrors how feeds work in real social media platforms, where users primarily see content from people they have chosen to follow.

How the Feed Works:
When a request is made to the feed endpoint, the backend performs the following steps:

The userId is taken from the query parameters.

All users followed by the given user are fetched from the follows table.

Posts are retrieved where the author belongs to that followed user list.

Each post is joined with its author details.

The number of likes on each post is calculated.

Posts are sorted by creation time, with the newest posts shown first.

Pagination is applied using limit and offset.

If the user does not follow anyone, the feed correctly returns an empty list.

API Details

Endpoint

GET /api/posts/feed


Query Parameters

userId – ID of the current user

limit – number of posts to return

offset – pagination offset

Example

/api/posts/feed?userId=1&limit=10&offset=0

Response Format

Each feed item contains:

post content

post creation time

author information

associated hashtags

total like count

Example response:

{
  "id": 3,
  "content": "Hello from sudh 👋",
  "createdAt": "2026-02-05T20:04:23.000Z",
  "author": {
    "id": 2,
    "firstName": "sudh",
    "lastName": "singh",
    "email": "sukurd@test.com"
  },
  "hashtags": [],
  "likeCount": 0
}

Performance Considerations

An index on authorId and createdAt is used to keep feed queries fast.

Like counts are calculated using aggregation instead of loading all likes.

Pagination ensures the endpoint remains efficient even with a large number of posts.

Edge Cases:
If a user does not follow anyone, the feed returns an empty array.

Invalid or missing query parameters are handled safely.

The endpoint never crashes due to malformed input.

Future Improvements:
Cursor-based pagination for better performance at scale.

Caching feed results for frequently active users.

Adding ranking logic based on likes or engagement.

Why This Design

The feed logic is intentionally kept simple and easy to reason about.
It focuses on correctness and clarity first, while still allowing room for optimization and scaling in the future.