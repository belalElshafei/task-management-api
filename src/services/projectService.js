const Project = require('../models/Project');
const Task = require('../models/Task');
const { getClient } = require('../config/redis');

class ProjectService {
    /**
     * Get all projects for a user (with caching)
     * @param {string} userId
     */
    async getProjects(userId) {
        const redisClient = getClient();
        const cacheKey = `projects:${userId}`;

        // 1. Try Cache
        if (redisClient && redisClient.isOpen) {
            try {
                const cachedProjects = await redisClient.get(cacheKey);
                if (cachedProjects) {
                    return JSON.parse(cachedProjects);
                }
            } catch (err) {
                console.error('Redis Get Error:', err);
            }
        }

        // 2. DB Query
        const projects = await Project.find({
            owner: userId
        }).populate('owner', 'name email');

        // 3. Set Cache
        if (redisClient && redisClient.isOpen) {
            try {
                await redisClient.setEx(cacheKey, 60, JSON.stringify(projects));
            } catch (err) {
                console.error('Redis Set Error:', err);
            }
        }

        return projects;
    }

    /**
     * Get single project
     * @param {string} userId
     * @param {string} projectId
     */
    async getProject(userId, projectId) {
        return await Project.findOne({
            _id: projectId,
            owner: userId
        }).populate('owner', 'name email')
            .populate('members', 'name email');
    }

    /**
     * Create new project
     * @param {string} userId
     * @param {Object} projectData
     */
    async createProject(userId, projectData) {
        // DATA CONSISTENCY: Owner must represent in members list
        const initialMembers = [...new Set([...(projectData.members || []), userId])];

        const project = await Project.create({
            ...projectData,
            owner: userId,
            members: initialMembers
        });

        await this._invalidateCache(userId);
        return project;
    }

    /**
     * Update project
     * @param {string} userId
     * @param {string} projectId
     * @param {Object} updateData
     */
    async updateProject(userId, projectId, updateData) {
        const project = await Project.findOneAndUpdate(
            {
                _id: projectId,
                owner: userId
            },
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (project) {
            await this._invalidateCache(userId);
        }
        return project;
    }

    /**
     * Delete project
     * @param {string} userId
     * @param {string} projectId
     */
    async deleteProject(userId, projectId) {
        const project = await Project.findOneAndDelete({
            _id: projectId,
            owner: userId
        });

        if (project) {
            // CASCADING DELETE: Remove all tasks associated with this project
            await Task.deleteMany({ project: projectId });

            await this._invalidateCache(userId);
        }
        return project;
    }

    /**
     * Helper to invalidate user projects cache
     * @param {string} userId
     */
    async _invalidateCache(userId) {
        const redisClient = getClient();
        if (redisClient && redisClient.isOpen) {
            try {
                await redisClient.del(`projects:${userId}`);
            } catch (err) {
                console.error('Redis Del Error:', err);
            }
        }
    }
}

module.exports = new ProjectService();
