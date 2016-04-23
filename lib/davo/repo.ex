defmodule Davo.Repo do
  use Ecto.Repo, otp_app: :davo

  def get_demo do
    [
      %Plug.Conn{port: 80, scheme: :https,  method: "GET", host: "github.com", request_path: "/davoclavo", assigns: %{id: "code"}, req_headers: [{"accept", "text/html"}], resp_headers: [{"content-type", "text/html; charset=utf8"}], status: 200},
      %Plug.Conn{port: 80, scheme: :https,  method: "GET", host: "ifttt.com", request_path: "/p/davoclavo", assigns: %{id: "work"}, req_headers: [{"accept", "text/html"}], resp_headers: [{"content-type", "text/html; charset=utf8"}], status: 200}
    ]
  end

end
