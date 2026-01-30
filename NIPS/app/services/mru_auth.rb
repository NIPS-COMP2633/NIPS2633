# This script is triggered server-side when the login form in
# `login_mru/index.html.erb` is submitted. 
#
# Both parameters come directly from this request.
#
# At the moment, it prints the username and password it recieved into logs, 
# and returns `true` upon successful execution.
#
# Future features that require storage of data may be implemented here.

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
