const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Blog About Blogging',
        author: 'Donald Duck',
        url: 'www.ankkalinna.com',
        likes: 5
    },
    {
        title: 'How To Make Money With Blogging',
        author: 'Mickey Mouse',
        url: 'www.ankkalinna.com',
        likes: 45
    },
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON()) 
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs,
    blogsInDb,
    usersInDb
}