describe('Blog app', function() {
  beforeEach(function() {
    //cy.request('POST', 'http://localhost:3001/api/testing/reset')
    cy.request('POST', 'http://localhost:3001/api/testing/reset')
    const user = {
      name: 'Harry Potter',
      username: 'hpotter',
      password: 'gryffindor'
    }
    cy.request('POST', 'http://localhost:3001/api/users/', user)
    cy.visit('http://localhost:3000')
  })
  it('Login form is shown', function() {
    cy.contains('login').click()
  })

  describe('Login', function() {
    it('succeeds with correct credentials', function() {
      cy.contains('login').click()
      cy.get('#username').type('hpotter')
      cy.get('#password').type('gryffindor')
      cy.get('#login-button').click()

      cy.contains('Harry Potter logged in')
    })
    it('fails with wrong credentials', function() {
      cy.contains('login').click()
      cy.get('#username').type('hpotter')
      cy.get('#password').type('slytherin')
      cy.get('#login-button').click()

      cy.get('.error')
        .should('contain', 'wrong username or password')
        .and('have.css', 'color', 'rgb(139, 0, 0)')

      cy.get('html').should('not.contain', 'Harry Potter logged in')
    })
  })

  describe('when logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'hpotter', password: 'gryffindor' })
    })
    it('a new blog can be created', function() {
      cy.contains('new blog').click()
      cy.get('#title').type('How Harry Got the Snitch')
      cy.get('#author').type('Ron Weasley')
      cy.get('#url').type('www.quidditchathogwarts.co.uk')
      cy.get('#create-button').click()
            
      cy.contains('How Harry Got the Snitch')
    })

  describe('and a blog exists', function() {
    beforeEach(function() {
      cy.createBlog({
        title: 'The Rights of the House Elves',
        author: 'Hermione Granger',
        url: 'www.wizardworldlegal.com',
        likes: 6
      })
      cy.createBlog({
        title: 'My Live After Hogwarts',
        author: 'Draco Malfoy',
        url: 'www.wizardworld.com',
        likes: 3
      })
      cy.createBlog({
        title: 'Severus Snape in Memoriam',
        author: 'Harry Potter',
        url: 'www.potter-official.com',
        likes: 7
      })
    })
    it('a blog can be liked', function() {
      cy.contains('My Live After Hogwarts').as('theBlog')

      cy.get('@theBlog')
        .contains('view')
        .click()
                
      cy.get('@theBlog')
        .parent()
        .find('#like-button')
        .click()

      cy.get('@theBlog')
        .contains('likes 4')
    })

    it('a blog can be deleted by the user, who added it', function() {
      cy.contains('My Live After Hogwarts').as('theBlog')

      cy.get('@theBlog')
        .contains('view')
        .click()

      cy.get('@theBlog')
        .contains('Remove')
        .click()
                
      cy.get('html')
        .should('not.contain', 'My Live After Hogwarts')
        .and('contain', 'Blog removed')
    })

    it('a blog cannot be deleted by a person who did not add it', function() {                
      cy.contains('logout').click()

      const user2 = {
        name: 'Hermione Granger',
        username: 'hgranger',
        password: 'freethehouseelves'
      }
      cy.request('POST', 'http://localhost:3001/api/users/', user2)            
      cy.login({ username: 'hgranger', password: 'freethehouseelves' })

      cy.contains('My Live After Hogwarts').as('theBlog')

      cy.get('@theBlog')
        .contains('view')
        .click()
                
      cy.get('@theBlog')
        .should('not.contain', 'Remove')
    })

    it('blogs are in the order of most likes', function() {                      
                               
      cy.get('.list > #view-button').click({ multiple:true })
                
      cy.get('.list')
        .then(($el) => {                                             
          //console.log($el[0].innerText)
          cy.wrap($el[0].innerText).should('contain', 'Severus Snape in Memoriam')
          cy.wrap($el[1].innerText).should('contain', 'The Rights of the House Elves')
          cy.wrap($el[2].innerText).should('contain', 'My Live After Hogwarts')  
        })
                
      cy.contains('The Rights of the House Elves')
        .contains('like')
        .click()
                
      cy.contains('The Rights of the House Elves')
        .contains('like')
        .click()
                    
      cy.contains('The Rights of the House Elves')
        .contains('likes 8')

      cy.get('.list')
        .then(($el) => {                     
          //console.log($el[0].innerText)
          cy.wrap($el[0].innerText).should('contain', 'The Rights of the House Elves')
          cy.wrap($el[1].innerText).should('contain', 'Severus Snape in Memoriam')
          cy.wrap($el[2].innerText).should('contain', 'My Live After Hogwarts')
        })
    })
  })
  })  
})