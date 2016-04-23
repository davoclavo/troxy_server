defmodule Davo.PageController do
  use Davo.Web, :controller

  def index(conn, _params) do
    conn
    # |> put_flash(:info, "info")
    # |> put_flash(:error, "error")
    |> render("index.html")
  end
end
