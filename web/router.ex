defmodule Davo.Router do
  use Davo.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Plug.Ribbon, [:dev, :staging, :test]
    plug :add_signature
  end

  # def add_signature(conn = %Plug.Conn{assigns: %{skip_troxy: true}}, _opts), do: conn
  def add_signature(conn, _opts) do
    conn
    |> Plug.Conn.put_resp_header("x-0-------------------", "")
    |> Plug.Conn.put_resp_header("x-1--xx---x--x-x--x---", "")
    |> Plug.Conn.put_resp_header("x-2--x-x-x-x-x-x-x-x--", "")
    |> Plug.Conn.put_resp_header("x-3--x-x-xxx-x-x-x-x--", ".io")
    |> Plug.Conn.put_resp_header("x-4--xx--x-x--x---x---", "")
    |> Plug.Conn.put_resp_header("x-5-------------------", "")
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Davo do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end
end
