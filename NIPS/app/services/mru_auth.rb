# This script is triggered when the login form in
# `login_mru/index.html.erb` is submitted. 
#
# Both parameters come directly from this form.
#
# Below is currently a placeholder function for the
# MRU calnder data detching functionality we will be implementing later.
#
# At the moment, it prints the username and password it recieved into logs, 
# and returns `true` upon successful execution.

class MruAuth
  def self.authenticate(username, password)
    # Simple authentication logic placeholder
    puts "MruAuth: Authenticating user..."
    puts "Username: #{username}"
    puts "Password: #{password}"
    
    # Add your authentication logic here
    # For now, just return true
    true
  end
end
