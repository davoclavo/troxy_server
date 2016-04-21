defmodule Davo.Repo do
  use Ecto.Repo, otp_app: :davo

  def get_demo do
    [
      %Plug.Conn{scheme: :https,  method: "GET", host: "github.com", request_path: "davoclavo", assigns: %{id: "asdf"}}
    ]
  end

end
