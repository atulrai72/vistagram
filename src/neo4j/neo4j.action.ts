import { driver } from "../lib/index.js";

interface NeoUser {
    applicationId: number;
    email: string;
    name: string;
}

interface NeoPost {
    applicationId: number;
    file_url: string;
    file_type: string;
    caption: string;
    userId: number;
    tags: string[];
}

export const getUserById = async (id: string) => {
    const result = driver.executeQuery(
        `MATCH (u:User {applicationId: $applicationId}) RETURN u`,
        { applicationId: id }
    );

    const users = (await result).records.map((record) => record.get("u").properties);

    return users;
}

// Write to the database

export const createUser = async (user: NeoUser) => {
    const {applicationId, email, name} = user;
    await driver.executeQuery(
        `CREATE (u:User {applicationId: $applicationId, email: $email, name: $name})`,
        { applicationId, email, name }
    );
}

export const createPost = async (post: NeoPost) => {
    const {applicationId, file_url, file_type, caption, userId, tags} = post;
    
    const query = `
    MATCH (u:User {applicationId: $userId})
    CREATE (p:Post {applicationId: $applicationId, file_url: $file_url, file_type: $file_type, caption: $caption, createdAt: datetime()})
    
    CREATE (p)-[:POSTED]->(u)

    WITH p, $tags as hashtags
    UNWIND hashtags as tagName
    MERGE (t:Hashtag {name: tagName})
    MERGE (p)-[:TAGGED_WITH]->(t)
    `

    await driver.executeQuery(
       query,
       { applicationId, file_url, file_type, caption, userId, tags }
    );
}

export const likePost = async (postId: number, userId: number) => {
    const query = `
    MATCH (p:Post {applicationId: $postId})
    MATCH (u:User {applicationId: $userId})
    CREATE (u)-[:LIKES]->(p)
    `
    
    await driver.executeQuery(
        query,
        { postId, userId }
    );
}

export const followUser = async (currentUserId: number, otherUserId: number) => {
    const query = `
    MATCH (u:User {applicationId: $currentUserId})
    MATCH (v:User {applicationId: $otherUserId})
    CREATE (u)-[:FOLLOWS]->(v)
    `

    await driver.executeQuery(
        query,
        { currentUserId, otherUserId }
    );
}

export const commentUser = async (comment: string, posId: number, userId: number, commentId: number) => { 

    const query = `
    MATCH (p:Post {applicationId: $posId})
    MATCH (u:User {applicationId: $userId})
    
    CREATE (c:Comment {
        applicationId: $commentId, 
        text: $comment, 
        createdAt: datetime()
    })
    
    CREATE (u)-[:COMMENTED]->(c)
    CREATE (u)-[:COMMENTED_ON]->(p)
    CREATE (c)-[:ON]->(p)
    
    RETURN c
    `

    await driver.executeQuery(
        query,
        { comment, posId, userId, commentId }
    );
}

// Read from the database

/* 
 Home feed
*/

export const getHomeFeed = async (currentUserId: number, skip: number = 0, limit: number = 20) => {
    console.log(currentUserId);
    const query = `
    MATCH (me:User {applicationId: $currentUserId})
    
    MATCH (me)-[:FOLLOWS]->(friend:User)

    MATCH (friend)<-[:POSTED]-(post:Post)

    OPTIONAL MATCH (post)<-[:ON]-(c:Comment)
    OPTIONAL MATCH (post)<-[:LIKES]-(l:User)


    RETURN 
        friend.name AS author,
        post.applicationId AS postId,
        post.file_url AS url,
        post.caption AS caption,
        post.createdAt AS createdAt,
        count(DISTINCT l) AS likeCount,
        count(DISTINCT c) AS commentCount

    
    ORDER BY post.createdAt DESC
    LIMIT toInteger($limit)
    `

    const result = await driver.executeQuery(query, { currentUserId, skip, limit });

    return result.records.map((record) => record.toObject());
}

/*
    TODO: Toggle like and follow
*/

// Most interesting part of the graph db

// The explore feature (Search by tags)

export const getPostByTag = async (tagName: string) => {
    const query = `
    MATCH (t:Hashtag {name: $tagName})

    MATCH (p:Post)-[:TAGGED_WITH]->(t)
    MATCH (u:User)<-[:POSTED]-(p)

    OPTIONAL MATCH (p)<-[:ON]-(c:Comment)
    OPTIONAL MATCH (p)<-[:LIKES]-(l:User)

    RETURN 
        u.name AS author,
        p.applicationId AS postId,
        p.file_url AS url,
        p.caption AS caption,
        p.createdAt AS createdAt,
        count(DISTINCT l) AS likeCount,
        count(DISTINCT c) AS commentCount
    ORDER BY p.createdAt DESC
    LIMIT 50
    `

    const result = await driver.executeQuery(query, { tagName });

    return result.records.map((record) => record.toObject());
}

// The trending tags (What happening right now)

export const getTrendingTags = async () => {
    
}   











