defmodule Davo.Troxy.Pipeline do
  require Logger
  use Plug.Builder

  plug :skip_self_requests # And let the normal phoenix router handle the conn
  # plug :cookies # Support upstream cookies
  # plug :inject_js # inject custom js
  # plug :disable_js # disable js scripts
  # plug :non_authoritative_info # send 203 responses instead of 200 if content is modified

  plug Plug.RequestId
  plug :remove_req_headers
  use Troxy.Interfaces.Plug
  plug :remove_resp_headers

  ########################
  # TODO: Move these to Troxy.Interfaces.
  # Troxy helper functions
  ########################

  def skip_self_requests(conn, _opts) do
    # TODO: Use URI.parse for the port and subdomains
    host = Application.get_env(:davo, Davo.Endpoint)[:url][:host]
    ip = Application.get_env(:davo, Davo.Endpoint)[:url][:ip]

    [host, ip, "localhost"]
    |> Enum.any?(&(&1 == conn.host))
    |> if do
         Plug.Conn.assign(conn, :skip_troxy, true)
       else
         conn
       end
  end


  def remove_req_headers(conn, _opts) do
    conn
    # Remove nginx headers
    |> Plug.Conn.delete_req_header("x-forwarded-id")
  end

  def remove_resp_headers(conn, _opts) do
    conn
    |> Plug.Conn.delete_resp_header("x-request-id") # Added by Plug.RequestId
    |> Plug.Conn.delete_resp_header("cache-control") # Added by some Plug
    end

  # SSL - http://www.phoenixframework.org/v1.0.0/docs/configuration-for-ssl

  # http://stackoverflow.com/questions/12994611/relative-urls-in-a-proxied-website-dont-work
  defp add_base_url(host, body) do
    Regex.replace(~r/<head>/, body, ~s(<head><base href="#{host}" />))
  end


  ##########################
  # Troxy in-module handlers
  ##########################

  def upstream_handler(conn) do
    # Is broadcast async?? if not, I think it should

    # require IEx
    # IEx.pry

    Logger.info("Request proxied")
    [conn_id] = Plug.Conn.get_resp_header(conn, "x-request-id")
    conn = Plug.Conn.assign(conn, :id, conn_id)
    Davo.Endpoint.broadcast("users:new", "conn", conn)
    conn
  end


  def downstream_handler(conn) do
    Logger.info("Response proxied")
    [conn_id] = Plug.Conn.get_resp_header(conn, "x-request-id")
    conn = Plug.Conn.assign(conn, :id, conn_id)
    Davo.Endpoint.broadcast("users:new", "conn", conn)
    conn
  end

  def broadcast_conn(conn) do
    Davo.Endpoint.broadcast("users:new", "conn", conn)
  end

  def broadcast_demo do
    Davo.Repo.get_demo
    |> Enum.map(&broadcast_conn/1)
  end
end

defimpl Poison.Encoder, for: Plug.Conn do
  def encode(conn, options) do
    # peer = conn.peer

    # kwlists to maps to be able to JSON encodify easily
    req_headers = Enum.into(conn.req_headers, %{})
    resp_headers = Enum.into(conn.resp_headers, %{})

    conn
    |> Map.take([:scheme, :host, :port, :method, :request_path, :query_string, :status, :assigns])
    |> Map.merge(%{req_headers: req_headers, resp_headers: resp_headers})
    |> Poison.encode!
  end
end

