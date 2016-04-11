defmodule Davo.Router do
  use Davo.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Plug.Ribbon, [:dev, :staging, :test]
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Davo do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end
end
