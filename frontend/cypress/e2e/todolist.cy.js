describe('Todo list', () => {
  // define variables that we need on multiple occasions
  let uid // user id
  let name // name of the user (firstName + ' ' + lastName)
  let email // email of the user
  let taskTitle
  let taskTodos
  let tid // task id
  let todo = "do something"

  before('create a fabricated user', () => {
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid
          name = user.firstName + ' ' + user.lastName
          email = user.email
        })
      })
  })

  before('create a fabricated task', () => {
    cy.fixture('task.json')
    .then((task) => {
      task.userid = uid
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/tasks/create',
        form: true,
        body: task
      }).then((response) => {
        taskTitle = response.body[0].title 
        taskTodos = response.body[0].todos
      })
    })
  })


  beforeEach(function () {
    // enter the main main page
    cy.visit('http://localhost:3000')
    // fill the email field with the user's email
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email)
    // submit the form on this page
    cy.get('form')
      .submit()
    // // open the task in detail view
    cy.contains('div', taskTitle)
    .click()
  })

  it('should create a todo', () => {
    cy.get('div.popup').find('input[type=text]').type(todo)
    cy.get('div.popup').find('input[type=submit]').click()
    
    cy.contains('li', `${todo}`)
    .should('exist');

  })

  it('should contain a disabled Add button', () => {
    cy.get('div.popup').find('input[type=submit]').should('be.disabled')
  })


  it('should cross through an active todo item when the icon in front of the description is clicked', () => {

    cy.contains('li', `${taskTodos[0].description}`)
      .find(`:contains(${taskTodos[0].description})`)
      .prev()
      .wait(1000)
      .click()
      .wait(1000)
      
      cy.contains('li', `${taskTodos[0].description}`)
      .find(`:contains(${taskTodos[0].description})`)
      .should('have.css', 'text-decoration', 'line-through')
    
      // adjusted to the acutal code (checking class name), click method is a bit buggy?
    // cy.contains('li', `${taskTodos[0].description}`)
    // .find(`:contains(${taskTodos[0].description})`)
    // .prev()
    // .wait(1000) // wait for 1 second
    // .click()
    // .wait(1000) // wait for 1 second
    // .should('have.class', 'unchecked')

  })

  it('should re-active a crossed over todo item when the icon in front of the description is clicked', () => {
    
    cy.contains('li', `${taskTodos[0].description}`)
    .find(`:contains(${taskTodos[0].description})`)
    .prev()
    .wait(1000)
    .click()
    .wait(1000)
    
    cy.contains('li', `${taskTodos[0].description}`)
    .find(`:contains(${taskTodos[0].description})`)
    .should('not.have.css', 'text-decoration', 'line-through')  
      
    // adjusted to the acutal code (checking class name), click method is a bit buggy?
    // cy.contains('li', `${taskTodos[0].description}`)
    // .find(`:contains(${taskTodos[0].description})`)
    // .prev()
    // .wait(1000) // wait for 1 second
    // .click()
    // .wait(1000) // wait for 1 second
    // .should('have.class', 'unchecked')
  })


    it('should delete toto item when user clicks on the x symbol behind the description', () => {
      cy.contains('li', `${taskTodos[0].description}`)
      .find(`:contains(${taskTodos[0].description})`)
      .wait(1000)
      .next()
      .click()

      cy.contains('li', `${taskTodos[0].description}`)
      .should('not.exist');
    })


  after(function () {
    // clean up by deleting the user from the database
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`
    }).then((response) => {
      cy.log(response.body)
    })
  })
})