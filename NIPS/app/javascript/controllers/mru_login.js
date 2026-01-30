import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="login-form"
export default class extends Controller {
  connect() {
    console.log("Login form controller connected")
  }

  handleSubmit(event) {
    // This runs when the form is submitted
    console.log("Form submitted!")
    
    // Access form data
    const formData = new FormData(event.target)
    const username = formData.get("username")
    const password = formData.get("password")
    
    console.log("Username:", username)
    console.log("Password:", password)
    
    // Add your client-side logic here:
    // - Validation
    // - Show loading indicators
    // - Transform data
    // - etc.
    
    // To prevent form submission (for testing):
    // event.preventDefault()
    
    // By default, the form will submit normally to the server
  }
}
