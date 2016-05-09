defmodule Davo.UsersChannel do
  use Phoenix.Channel

  def join("users:lobby", _auth_msg, socket) do
    {:ok, socket}
  end
end
