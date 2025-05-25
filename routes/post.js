import express from 'express';
import {
    createPost,
    getPosts,
    getPostById,
    deletePost,
    updatePost,
    toggleLike,
    addComment
} from '../models/post.js';
import { authMiddleware } from '../middleware/auth.js';
import 'dotenv/config';

const router = express.Router();

// Create post
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { content, imageUrl } = req.body;

        if (!content && !imageUrl) {
            return res.status(400).json({ message: 'Content or image required' });
        }

        const post = await createPost({
            authorId: userId,
            authorName: req.user.name,
            authorAvatar: req.user.displayProfile || '',
            content: content || '',
            imageUrl: imageUrl || '',
            likes: [],
            comments: []
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const posts = await getPosts(limit);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});

// Get single post
router.get('/:postId', async (req, res) => {
    try {
        const post = await getPostById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Failed to fetch post' });
    }
});

// Update post
router.put('/:postId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { content, imageUrl } = req.body;

        await updatePost(req.params.postId, userId, {
            content: content || '',
            imageUrl: imageUrl || ''
        });

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        if (error.message === 'Post not found') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'Unauthorized') {
            res.status(403).json({ message: 'Not authorized to update this post' });
        } else {
            res.status(500).json({ message: 'Failed to update post' });
        }
    }
});

// Delete post
router.delete('/:postId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        await deletePost(req.params.postId, userId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        if (error.message === 'Post not found') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'Unauthorized') {
            res.status(403).json({ message: 'Not authorized to delete this post' });
        } else {
            res.status(500).json({ message: 'Failed to delete post' });
        }
    }
});

// Like/unlike post
router.post('/:postId/like', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const result = await toggleLike(req.params.postId, userId);
        res.json(result);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Failed to toggle like' });
    }
});

// Add comment
router.post('/:postId/comments', authMiddleware, async (req, res) => {
    try {
        const { userId, name } = req.user;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text required' });
        }

        const comment = await addComment(req.params.postId, userId, {
            text,
            userName: name,
            userAvatar: req.user.displayProfile || ''
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
});

export default router;