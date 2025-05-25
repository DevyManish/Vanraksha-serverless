import { db, FieldValue } from '../firebase.js';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

export const createPost = async (postData) => {
    const postId = uuidv4();
    const postRef = db.collection('posts').doc(postId);

    const post = {
        postId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        likes: [],
        comments: [],
        ...postData
    };

    await postRef.set(post);
    return post;
};

export const getPosts = async (limit = 10) => {
    const snapshot = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map(doc => doc.data());
};

export const getPostById = async (postId) => {
    const doc = await db.collection('posts').doc(postId).get();
    return doc.exists ? doc.data() : null;
};

export const deletePost = async (postId, userId) => {
    const postRef = db.collection('posts').doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) throw new Error('Post not found');
    if (doc.data().authorId !== userId) throw new Error('Unauthorized');

    await postRef.delete();
};

export const updatePost = async (postId, userId, updateData) => {
    const postRef = db.collection('posts').doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) throw new Error('Post not found');
    if (doc.data().authorId !== userId) throw new Error('Unauthorized');

    await postRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
    });
};

export const toggleLike = async (postId, userId) => {
    const postRef = db.collection('posts').doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) throw new Error('Post not found');

    const likes = doc.data().likes || [];
    const likeIndex = likes.indexOf(userId);

    if (likeIndex === -1) {
        await postRef.update({
            likes: FieldValue.arrayUnion(userId)
        });
        return { action: 'liked' };
    } else {
        await postRef.update({
            likes: FieldValue.arrayRemove(userId)
        });
        return { action: 'unliked' };
    }
};

export const addComment = async (postId, userId, commentData) => {
    const commentId = uuidv4();
    const comment = {
        commentId,
        userId,
        createdAt: new Date().toISOString(), // client-side timestamp instead
        ...commentData
    };

    await db.collection('posts').doc(postId).update({
        comments: FieldValue.arrayUnion(comment)
    });

    return comment;
};