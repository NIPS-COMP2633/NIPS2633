class LoginMruController < ApplicationController
  
  # Login page itself
  def index
  end

  # This takes the username and password parameters from the request, 
  # sent from the login page, and calls the
  # MruAuth class from the script app/services/mru_auth.rb
  def authenticate
    # Extract the form parameters
    username = params[:username]
    password = params[:password]
    
    # Trigger the MruAuth authentication function
    result = MruAuth.authenticate(username, password)
    
    # print whether or not the script succeeded in executing the function
    if result
      redirect_to login_mru_index_path, notice: "Login successful for #{username}"
    else
      redirect_to login_mru_index_path, alert: "Login failed for #{username}"
    end


  end
end
