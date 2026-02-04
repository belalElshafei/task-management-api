const Task = require('../models/Task');
const mongoose = require('mongoose');
const { getClient } = require('../config/redis');

class TaskService {
    /**
     * Create a new task
     * @param {string} userId - ID of the creating user
     * @param {string} projectId - ID of the project
     * @param {Object} taskData - The task data
     */
    async createTask(userId, projectId, taskData) {
        const task = await Task.create({
            ...taskData,
            project: projectId,
            createdBy: userId
        });

        await this._invalidateCache(projectId, [userId, task.assignedTo]);

        return task;
    }

    /**
     * Get all tasks with pagination
     * @param {string} userId - User ID for access check
     * @param {string} projectId - Project ID
     * @param {Object} queryOptions - page, limit
     */
    async getTasks(userId, projectId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        // Query condition: User is either assigned or creator
        const query = {
            project: projectId,
            $or: [
                { assignedTo: userId },
                { createdBy: userId }
            ]
        };

        const tasks = await Task.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Task.countDocuments(query);

        return {
            tasks,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get a single task
     * @param {string} userId 
     * @param {string} projectId 
     * @param {string} taskId 
     */
    async getTask(userId, projectId, taskId) {
        return await Task.findOne({
            _id: taskId,
            project: projectId,
            $or: [
                { assignedTo: userId },
                { createdBy: userId }
            ]
        });
    }

    /**
     * Update a task
     * @param {string} userId 
     * @param {string} projectId 
     * @param {string} taskId 
     * @param {Object} updateData 
     */
    async updateTask(userId, projectId, taskId, updateData) {
        // Filter out undefined fields is handled by the controller's extraction
        // But for safety, we rely on what's passed in updateData
        const task = await Task.findOneAndUpdate(
            {
                _id: taskId,
                project: projectId,
                $or: [
                    { assignedTo: userId },
                    { createdBy: userId }
                ]
            },
            updateData,
            { new: true, runValidators: true }
        );

        if (task) {
            await this._invalidateCache(projectId, [userId, task.assignedTo, task.createdBy]);
        }

        return task;
    }

    /**
     * Delete a task
     * @param {string} userId 
     * @param {string} projectId 
     * @param {string} taskId 
     */
    async deleteTask(userId, projectId, taskId) {
        const task = await Task.findOneAndDelete({
            _id: taskId,
            project: projectId,
            createdBy: userId // Stricter: only creator can delete
        });

        if (task) {
            await this._invalidateCache(projectId, [userId, task.assignedTo, task.createdBy]);
        }

        return task;
    }

    /**
     * Get task statistics (using Aggregation)
     * @param {string} userId 
     * @param {string} projectId 
     */
    async getTaskStats(userId, projectId) {
        const redisClient = getClient();
        const cacheKey = `stats:${projectId}:${userId}`;

        // 1. Try to get from cache
        if (redisClient && redisClient.isOpen) {
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                console.error('Redis Get Error:', err); // Non-blocking error
            }
        }

        // 2. Database Query (Expensive)
        const stats = await Task.aggregate([
            {
                $match: {
                    project: new mongoose.Types.ObjectId(projectId),
                    $or: [
                        { assignedTo: new mongoose.Types.ObjectId(userId) },
                        { createdBy: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    totalCount: [
                        { $count: 'total' }
                    ]
                }
            }
        ]);

        const result = stats[0];
        const totalTasks = result.totalCount[0] ? result.totalCount[0].total : 0;
        const formattedStats = result.byStatus.map(s => ({ status: s._id, count: s.count }));

        const responseData = {
            stats: formattedStats,
            summary: {
                totalTasks,
                lastUpdated: new Date()
            }
        };

        // 3. Save to Cache (60 seconds)
        if (redisClient && redisClient.isOpen) {
            try {
                await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));
            } catch (err) {
                console.error('Redis Set Error:', err);
            }
        }

        return responseData;
    }

    /**
     * Helper to invalidate cache for specific users
     */
    async _invalidateCache(projectId, userIds) {
        const redisClient = getClient();
        if (!redisClient || !redisClient.isOpen) return;

        const uniqueUsers = [...new Set(userIds.filter(id => id))];

        for (const uid of uniqueUsers) {
            const key = `stats:${projectId}:${uid.toString()}`;
            try {
                await redisClient.del(key);
            } catch (err) {
                console.error('Redis Del Error:', err);
            }
        }
    }
}

module.exports = new TaskService();
