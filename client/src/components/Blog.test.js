import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
//import { prettyDOM } from '@testing-library/dom'
import Blog from './Blog'

const blog = {
  title: 'The Title',
  author: 'Harry Potter',
  url: 'www.hogwarts.co.uk',
  likes: 35,
  user: 'Lisääjä'
}

const user = {
  id: 123,
  username: 'Lisääjä'
}

describe('testing Blog component', () => {
  test('renders title and author and nothing more', () => {
    const component = render(
      <Blog blog={blog} />
    )

    expect(component.container).toHaveTextContent(
      'The Title' && 'Harry Potter'
    )

    expect(component.container).not.toHaveTextContent(
      'www.hogwarts.co.uk' && '35'
    )

  })

  test('renders url and likes after view-button is pressed', () => {
  //const mockHandler = jest.fn()

    const component = render(
      <Blog blog={blog} user={user} />
    )

    const button = component.getByText('view')
    fireEvent.click(button)

    expect(component.container).toHaveTextContent(
      'The Title' && 'Harry Potter' && 'www.hogwarts.co.uk' && '35'
    )
  })

  test('clicking like button twice calls event handler twice', () => {
    const mockHandler = jest.fn()

    const component = render(
      <Blog blog={blog} addLike={mockHandler} user={user} />
    )

    const button = component.getByText('view')
    fireEvent.click(button)

    const like = component.getByText('like')
    fireEvent.click(like)
    expect(mockHandler.mock.calls).toHaveLength(1)

    fireEvent.click(like)
    expect(mockHandler.mock.calls).toHaveLength(2)
  })
})