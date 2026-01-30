require "test_helper"

class LoginMruControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get login_mru_index_url
    assert_response :success
  end

  test "should get show" do
    get login_mru_show_url
    assert_response :success
  end

  test "should get new" do
    get login_mru_new_url
    assert_response :success
  end

  test "should post authenticate" do
    post login_mru_authenticate_url, params: { username: "test", password: "test" }
    assert_response :redirect
  end
end
