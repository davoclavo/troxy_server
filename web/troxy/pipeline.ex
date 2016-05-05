defmodule Davo.Troxy.Pipeline do
  require Logger
  use Plug.Builder

  plug :skip_self_requests # And let the normal phoenix router handle the conn
  # plug :cookies # Support upstream cookies
  # plug :inject_js # inject custom js
  # plug :disable_js # disable js scripts
  # plug :non_authoritative_info # send 203 responses instead of 200 if content is modified

  # plug :plug_uri

  plug Plug.RequestId
  plug :assign_request_id
  plug :remove_req_headers
  use Troxy.Interfaces.Plug
  plug :remove_resp_headers

  ########################
  # TODO: Move to its own package.
  # Or implement the URI protocol for Plug.Conn
  ########################

  # def plug_uri(conn, _opts) do
  #   # No need to add `authority` as it can be extracted from the other data
  #   uri = %URI{fragment: term, host: term,
  #              path: term, port: term, query: term, scheme: term, userinfo: term}

  #   t :: 
  #   t :: %Plug.Conn{adapter: adapter, assigns: assigns, before_send: before_send, body_params: params | Plug.Conn.Unfetched.t, cookies: cookies | Plug.Conn.Unfetched.t, halted: term, host: host, method: method, owner: owner, params: params | Plug.Conn.Unfetched.t, path_info: segments, peer: peer, port: :inet.port_number, private: assigns, query_params: params | Plug.Conn.Unfetched.t, query_string: query_string, remote_ip: :inet.ip_address, req_cookies: cookies | Plug.Conn.Unfetched.t, req_headers: headers, request_path: binary, resp_body: body, resp_cookies: resp_cookies, resp_headers: headers, scheme: scheme, script_name: segments, secret_key_base: secret_key_base, state: state, status: int_status}

  #   %Plug.Conn{port: 80, scheme: :https,  method: "GET", host: "github.com", request_path: "/davoclavo", assigns: %{id: "code"}, req_headers: [{"accept", "text/html"}], resp_headers: [{"content-type", "text/html; charset=utf8"}], status: 200},
  #   conn
  #   |> assign(:uri, uri)
  # end


  ########################
  # TODO: Move these to Troxy.Interfaces.
  # Troxy helper functions
  ########################

  def assign_request_id(conn, _opts) do
    [conn_id] = Plug.Conn.get_resp_header(conn, "x-request-id")
    Plug.Conn.assign(conn, :id, conn_id)
  end

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

  def req_handler(conn) do
    # Is broadcast async?? if not, I think it should

    # require IEx
    # IEx.pry
    Logger.info("Request proxied")
    Davo.Endpoint.broadcast("users:new", "conn:req", conn)
    conn
  end


  def resp_handler(conn) do
    # require IEx
    # IEx.pry
    Logger.info("Response proxied")
    conn_id = conn.assigns[:id]
    Davo.Endpoint.broadcast("users:new", "conn:resp" <> conn_id, conn)
    conn
  end

  def resp_body_handler(conn, body_chunk, more_body) do
    Logger.info("Response body chunk")
    conn_id = conn.assigns[:id]
    Davo.Endpoint.broadcast("users:new", "conn:resp_body_chunk" <> conn_id, %{body_chunk: body_chunk, more_body: more_body})
    conn
  end

  def broadcast_conn(conn) do
    Davo.Endpoint.broadcast("users:new", "conn:req", conn)
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

