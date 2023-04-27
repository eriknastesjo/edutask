describe('Logging into the system', () => {
  // define variables that we need on multiple occasions
  let uid // user id
  let name // name of the user (firstName + ' ' + lastName)
  let email // email of the user
  let task_title
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
          cy.log(JSON.stringify(response))
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
        task_title = response.body[0].title 
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
    // open the task in detail view
    cy.contains('div', task_title)
    .click()
  })

  it('create a todo', () => {
    cy.get('div.popup').find('input[type=text]').type(todo)
    cy.get('div.popup').find('input[type=submit]').click()
    
    cy.contains('li', `${todo}`)
    .should('exist');
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