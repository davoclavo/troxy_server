defmodule Davo.PageController do
  use Davo.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
