const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')
//const blogsRouter = require('../controllers/blogs')

let token

describe('when there are some notes saved initially', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('How To Make Money With Blogging')
  })

  test('id exists', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('addition of new blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()

    const login = {
      username: 'root',
      password: 'sekret'
    }

    const res = await api
      .post('/api/login')
      .send(login)

    token = 'bearer ' + res.body.token
    //console.log(token)
  })
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'The Newest Blog about blogging',
      author: 'Daisy Duck',
      url: 'www.ankkalinna.com',
      likes: 8
    }

    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain('The Newest Blog about blogging')
  })

  test('if likes is empty it gets value 0', async () => {
    const newBlog = {
      title: 'The Newest Blog about blogging',
      author: 'Daisy Duck',
      url: 'www.ankkalinna.com',
      likes: undefined
    }

    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    const likes = blogsAtEnd.map(b => b.likes)
    console.log(likes[likes.length - 1])
    expect(likes[likes.length - 1]).toBe(0)
  })

  test('added blog contains fields title and url', async () => {
    const newBlog = {
      author: 'Daisy Duck',
      likes: 65
    }

    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(400)
  })

  test('a blog cannot be added without a proper token', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const newBlog = {
      title: 'The Newest Blog about blogging',
      author: 'Daisy Duck',
      url: 'www.ankkalinna.com',
      likes: 8
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})

describe('handling of one blog', () => {
  test.skip('a blog can be deleted', async () => {
    //needs to be fixed in order to work with a token
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

  test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      title: 'This is the blog that is updated',
      author: 'Scrooge McDuck',
      url: 'www.ankkalinna.org',
      likes: 800,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd[0]).toEqual({
      title: 'This is the blog that is updated',
      author: 'Scrooge McDuck',
      url: 'www.ankkalinna.org',
      likes: 800,
      id: blogToUpdate.id
    })
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hpotter',
      name: 'Harry Potter',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'SuperUser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is undefined', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hgranger',
      name: 'Hermione Granger',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('no password')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username length under 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hg',
      name: 'Hermione Granger',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('is shorter than the minimum allowed length (3)')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password under 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hgranger',
      name: 'Hermione Granger',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password is less than required length of 3')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})

