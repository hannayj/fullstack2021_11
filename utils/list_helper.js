const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const sumOfLikes = _.sumBy(blogs, 'likes')
  /*const sumOfLikes = blogs.reduce((sum, item) =>
        sum + item.likes, 0)*/
  return sumOfLikes
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    const mostLikes = _.maxBy(blogs, 'likes')
    //console.log('mostlikes', mostLikes)

    const favorite = {
      title: mostLikes.title,
      author: mostLikes.author,
      likes: mostLikes.likes
    }
    return favorite
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    const amountOfBlogs = _.countBy(blogs, 'author')
    //console.log(amountOfBlogs)
    const author = _.max(Object.keys(amountOfBlogs), o => amountOfBlogs[o])
    const amount = amountOfBlogs[author]
    //console.log('most', author)
    //console.log('amount', amount)

    const authorAndAmount = {
      author: author,
      blogs: amount
    }
    return authorAndAmount
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    const authorsAndLikes =
            _(blogs)
              .groupBy('author')
              .map((objs, key) => ({
                'author': key,
                'likes': _.sumBy(objs, 'likes')
              })).value()
    //console.log(authorsAndLikes)
    const mostLikesFirst = authorsAndLikes.sort((a, b) => b.likes - a.likes)
    //console.log(sorted)
    return mostLikesFirst[0]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}