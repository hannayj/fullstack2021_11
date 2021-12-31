import React, { useState } from 'react'

const Blog = ({ blog, addLike, removeBlog, user }) => {
  const [toggleButton, setToggleButton] = useState('view')

  const handleOnClick = () => {
    toggleButton === 'view' ? setToggleButton('hide') : setToggleButton('view')
  }

  const handleLikeClick = async () => {
    addLike({ ...blog, likes: blog.likes + 1 })
  }

  const deleteBlog = async () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)){
      removeBlog(blog.id)
    }
  }

  if (toggleButton === 'hide') {
    return (
      <div className='list'>
        {blog.title} {blog.author} <button id='view-button' onClick={handleOnClick}>{toggleButton}</button><br />
        {blog.url}<br />
        {blog.user.name}<br />
        likes {blog.likes} <button id='like-button' onClick={handleLikeClick}>like</button><br />
        {blog.user.username === user.username ? <button onClick={deleteBlog}>Remove</button> : null}
      </div>
    )
  }
  return (
    <div className='list'>
      {blog.title} {blog.author} <button id='view-button' onClick={handleOnClick}>{toggleButton}</button>
    </div>
  )
}

export default Blog
