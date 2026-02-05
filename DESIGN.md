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