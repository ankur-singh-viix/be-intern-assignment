## 1. Overview

This project implements the backend for a simple social media platform using Node.js, Express, TypeORM, and SQLite.

The goal of the implementation is to build a clean and extensible backend that supports common social media features such as users, posts, follows, likes, hashtags, feeds, and activity tracking.

The design prioritizes:

Clear data modeling

Strong data integrity through database constraints

Predictable schema evolution using migrations

Simple, readable APIs that can scale as the dataset grows

All schema changes are handled through migrations, and automatic synchronization is intentionally disabled to avoid unexpected schema drift.

## 2. Database Schema & Entity Relationships
User

The users table stores basic profile information for each user.

Fields

id (primary key)

firstName

lastName

email (unique)

createdAt

updatedAt

Relationships

A user can create multiple posts

A user can follow many users and be followed by many users

A user can like multiple posts

A unique constraint on email ensures that duplicate user accounts cannot be created.

Post

The posts table stores content created by users.

Fields

id (primary key)

content

authorId (foreign key → users.id)

createdAt

updatedAt

Relationships

Each post belongs to exactly one user (author)

A user can have many posts

A post can have many likes

A post can have many hashtags

Posts are automatically deleted if the author is deleted, ensuring referential integrity.

## 3. Follow System Design

The follow system models the social relationship where one user follows another user.

Database Design

Follow relationships are stored in a dedicated follows table rather than being embedded inside the users table. This keeps the schema normalized and allows efficient querying.

Fields

id (primary key)

followerId (foreign key → users.id)

followingId (foreign key → users.id)

createdAt

This is a self-referencing relationship on the users table.

Constraints & Data Integrity

A unique constraint on (followerId, followingId) prevents duplicate follow relationships

Users cannot follow themselves (validated at the API layer)

Foreign key constraints use CASCADE deletion so follow records are removed automatically when a user is deleted

Database-level constraints act as a safety net in case of race conditions or unexpected API usage.

API Design

Follow a user

Unfollow a user

Get followers of a user

Duplicate follow attempts return a clear client error instead of crashing the application.
Unfollow requests return a 404 if the relationship does not exist.

## 4. Like System Design

The like system allows users to express engagement with posts.

Database Design

Likes are stored in a separate likes table.

Fields

id (primary key)

userId (foreign key → users.id)

postId (foreign key → posts.id)

createdAt

Each record represents one user liking one post.

Constraints & Integrity

A unique constraint on (userId, postId) ensures a user can like a post only once

Foreign keys use cascading deletes so likes are removed automatically if the user or post is deleted

Duplicate likes are handled gracefully at the API level

Indexing

An index on postId supports fast lookups when calculating like counts or listing likes for a post

## 5. Hashtag System Design

The hashtag system allows posts to be categorized and discovered using reusable tags.

Database Design

Hashtags are stored in a separate hashtags table and linked to posts using a join table.

Hashtags Table

id (primary key)

name (unique, lowercase)

createdAt

Join Table (post_hashtags)

postId (foreign key → posts.id)

hashtagId (foreign key → hashtags.id)

This supports a many-to-many relationship between posts and hashtags.

Design Decisions

Hashtags are normalized and reused across posts

Hashtag names are stored in lowercase to ensure case-insensitive matching

Join table records are cleaned up automatically when a post is deleted

Indexing

An index on hashtags.name allows fast hashtag-based searches

## 6. Feed System Design (GET /api/posts/feed)
Overview

The feed endpoint returns a personalized list of posts for a user.
Only posts created by users that the current user follows are included.

This mirrors real-world social media behavior and avoids unnecessary data loading.

How the Feed Works

userId is read from query parameters

The list of users followed by the current user is fetched from the follows table

Posts are retrieved where the author belongs to that followed user list

Each post is joined with:

author details

associated hashtags

Like counts are calculated using aggregation

Posts are sorted by createdAt (newest first)

Pagination is applied using limit and offset

If a user does not follow anyone, the feed returns an empty list.

API Details

Endpoint

GET /api/posts/feed


Query Parameters

userId

limit

offset

Example

/api/posts/feed?userId=1&limit=10&offset=0

Performance Considerations

An index on (authorId, createdAt) keeps feed queries fast

Like counts are calculated without loading full like records

Pagination prevents large result sets from impacting performance

Future Improvements

Cursor-based pagination

Feed caching for highly active users

Ranking logic based on engagement

## 7.Activity Tracking System Design
Overview

The activity endpoint provides a unified timeline of user actions such as:

Creating a post

Following a user

Liking a post

Instead of storing activities in a separate table, activities are derived from existing entities.

This avoids data duplication and ensures consistency.

How Activity Tracking Works

Post creation events come from the posts table

Follow actions come from the follows table

Likes come from the likes table

Results are merged, normalized into a common response format, and sorted by time

API Details

Endpoint

GET /api/users/:id/activity


Query Parameters

limit

offset

Response Format

{
  "type": "like",
  "createdAt": "...",
  "data": {
    "postId": 1
  }
}

Design Rationale

No extra activity table reduces storage overhead

Timeline always reflects the source of truth

Easy to extend with new activity types

### Migration Strategy

Automatic schema synchronization is disabled

All schema changes are handled through migrations

Migrations are tested by recreating the database from scratch

This ensures predictable schema evolution and prevents environment-specific issues.

### Scalability Considerations

Pagination on all list endpoints

Indexes added based on actual query patterns

Normalized schema supports growth without refactoring

Future caching and background processing can be added cleanly


## API Overview

The backend exposes REST-style APIs grouped by core features.  
Endpoints are designed to be simple, predictable, and easy to extend.

---

### User APIs

- **POST /api/users**  
  Creates a new user.  
  Email is enforced as unique to prevent duplicate accounts.

- **GET /api/users**  
  Returns all users (pagination-ready).

- **GET /api/users/:id**  
  Fetches a single user by ID.

---

### Post APIs

- **POST /api/posts**  
  Creates a new post for a user.  
  Supports optional hashtag extraction during creation.

- **GET /api/posts**  
  Returns all posts with author details.

- **GET /api/posts/:id**  
  Fetches a single post along with author information.

- **GET /api/posts/hashtag/:tag**  
  Returns all posts associated with a given hashtag.

---

### Follow APIs

- **POST /api/follows**  
  Allows one user to follow another user.  
  Duplicate follows are prevented.

- **DELETE /api/follows**  
  Unfollows a user if the follow relationship exists.

- **GET /api/follows/:userId**  
  Returns followers of a given user.

---

### Like APIs

- **POST /api/likes**  
  Likes a post on behalf of a user.  
  A user can like a post only once.

- **DELETE /api/likes**  
  Removes a like from a post.

- **GET /api/likes/:postId**  
  Returns the total like count for a post.

---

### Feed API

- **GET /api/posts/feed**  

  Returns a personalized feed for a user based on who they follow.

  **Query Params**
  - userId
  - limit
  - offset

  Posts are ordered by most recent first and include:
  - author details
  - hashtags
  - total like count

---

### Activity API

- **GET /api/users/:id/activity**

  Returns recent activities performed by a user, including:
  - post creation
  - follows
  - likes

  Results are ordered by time and support pagination.

---

### Error Handling

- Invalid requests return clear client-friendly error messages.
- Duplicate actions (like duplicate follow or like) are handled gracefully.
- Database constraints act as a safety net for edge cases.

---

This API structure keeps responsibilities clearly separated and allows new features to be added without breaking existing endpoints.

---

## Final Notes

The system is designed with correctness and clarity first, while leaving room for optimization as usage grows.

All implemented features are backed by migrations, tested via Postman, and structured in a way that reflects real-world backend engineering practices.