import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import'@testing-library/jest-dom/extend-expect'
//import { prettyDOM } from '@testing-library/dom'
import AddBlogForm from './AddBlogForm'

test('<AddBlogForm /> updates parent state and calls onSubmit', () => {
  const createBlog = jest.fn()

  const component = render(
    <AddBlogForm createBlog={createBlog} />
  )

  const title = component.container.querySelector('#title')
  const author = component.container.querySelector('#author')
  const url = component.container.querySelector('#url')
  const form = component.container.querySelector('form')

  fireEvent.change(title, {
    target: { value: 'Blog Title' }
  })

  fireEvent.change(author, {
    target: { value: 'Hermione Granger' }
  })

  fireEvent.change(url, {
    target: { value: 'www.witchtoday.com' }
  })
  fireEvent.submit(form)
  console.log(createBlog.mock.calls[0][0].title)

  expect(createBlog.mock.calls).toHaveLength(1)
  //console.log(createBlog.mock.calls)
  expect(createBlog.mock.calls[0][0].title).toBe('Blog Title')
  expect(createBlog.mock.calls[0][0].author).toBe('Hermione Granger')
  expect(createBlog.mock.calls[0][0].url).toBe('www.witchtoday.com')

})