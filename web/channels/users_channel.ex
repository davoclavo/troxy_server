defmodule Davo.UsersChannel do
  use Phoenix.Channel

  def join("users:new", _auth_msg, socket) do
    {:ok, socket}
  end
end
