defmodule Davo.UsersChannel do
  use Phoenix.Channel

  def join("users:lobby", _auth_msg, socket) do
    {:ok, socket}
  end

  intercept ["conn:req",
             "conn:req_body_chunk",
             "conn:resp",
             "conn:resp_body_chunk"]
  def handle_out(topic, msg, socket) do
    if socket.assigns[:room] == msg.room do
      msg = Map.delete(msg, :room)
      push socket, topic, msg
      {:noreply, socket}
    else
      {:noreply, socket}
    end
  end
end
