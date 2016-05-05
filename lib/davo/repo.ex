defmodule Davo.Repo do
  use Ecto.Repo, otp_app: :davo

  def get_demo do
    [
      %Plug.Conn{port: 443, scheme: :https,  method: "GET", host: "github.com", request_path: "/davoclavo", assigns: %{id: "code"}, req_headers: [{"host", "github.com"},{"accept", "text/html"}]},
      %Plug.Conn{port: 443, scheme: :https,  method: "GET", host: "ifttt.com", request_path: "/p/davoclavo", assigns: %{id: "work"}, req_headers: [{"host", "ifttt.com"},{"accept", "text/html"}]}
    ]
  end

end
