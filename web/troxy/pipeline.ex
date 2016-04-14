defmodule Davo.Troxy.Pipeline do
  require Logger
  use Plug.Builder

  plug :skip_self_requests # And let the normal phoenix router handle the conn
  # plug :cookies # Support upstream cookies
  # plug :inject_js # inject custom js
  # plug :disable_js # disable js scripts
  # plug :non_authoritative_info # send 203 responses instead of 200 if content is modified

  plug Plug.RequestId
  use Troxy.Interfaces.Plug


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
    Davo.Endpoint.broadcast("users:new", "conn", Map.new([{conn_id, conn}]))
    conn
  end


  def downstream_handler(conn) do
    # require IEx
    # IEx.pry

    [conn_id] = Plug.Conn.get_resp_header(conn, "x-request-id")
    Logger.info("Response proxied")
    Davo.Endpoint.broadcast("users:new", "conn", Map.new([{conn_id, conn}]))

    conn
    # |> Plug.Conn.delete_resp_header("x-request-id")
  end
end

defimpl Poison.Encoder, for: Plug.Conn do
  def encode(conn, options) do
    # peer = conn.peer
    req_headers = Enum.into(conn.req_headers, %{})
    resp_headers = Enum.into(conn.resp_headers, %{})

    conn
    |> Map.take([:scheme, :host, :port, :method, :request_path, :query_string])
    |> Map.merge(%{req_headers: req_headers, resp_headers: resp_headers})
    |> Poison.encode!
  end
end
