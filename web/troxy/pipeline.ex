defmodule Davo.Troxy.Pipeline do
  require Logger
  use Plug.Builder

  # plug :rewrite_composed_host
  plug :rewrite_troxy_host_header
  plug :skip_self_peer # And let the normal phoenix router handle the conn
  # plug :skip_self_hosts
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

  def rewrite_troxy_host_header(conn, _opts) do
    case get_req_header(conn, "x-troxy-host") do
      [] ->
        conn
      [target_host] ->
        %Plug.Conn{conn | host: target_host, peer: {{127,0,0,2}, 111317}}
        |> delete_req_header("host")
        |> put_req_header("host", target_host)
    end
  end

  def rewrite_composed_host(conn, _opts) do
    host_header = Plug.Conn.get_req_header(conn, "host") |> hd
    case Regex.named_captures(~r/(?<target_host>.*)(?<host>localhost:4000)/, host_header) do
      %{"host" => host, "target_host" => target_host} ->
        case String.length(target_host) do
          0 ->
            conn
          _ ->
            # TODO: Fix regex to remove rightmost "."
            target_host = String.rstrip(target_host, ?.)
            conn
            |> delete_req_header("host")
            |> put_req_header("host", target_host)
        end
      nil ->
        # No regexp match means it is a normal host header
        conn
    end
  end

  def skip_self_peer(conn, _opts) do
    [get_public_ip, get_local_ips]
    |> Enum.any?(&(&1 == (conn.peer |> Tuple.to_list |> hd |> Tuple.to_list |> Enum.join("."))))
    |> if do
      Logger.info("Skip Troxy")
      Plug.Conn.put_private(conn, :plug_skip_troxy, true)
    else
      conn
    end
  end

  def skip_self_hosts(conn, _opts) do
    # TODO: Use URI.parse for the port and subdomains
    loopback_hosts
    # This proxies to other ports as well
    # host_header = Plug.Conn.get_req_header(conn, "host") |> hd
    # |> Enum.any?(&(&1 == host_header))
    # This only matches to the the host without port
    |> Enum.any?(&(&1 == conn.host))
    |> if do
         Logger.info("Skip Troxy")
         Plug.Conn.put_private(conn, :plug_skip_troxy, true)
       else
         conn
       end
  end

  def loopback_hosts do
    get_local_ips
    |> Enum.concat(get_public_hosts)
    |> Enum.concat(["localhost"])
  end

  def get_local_ips do
    {:ok, local_ips} = :inet.getif
    local_ips
    |> Enum.map(fn ip_record ->
      # Example: {{192, 168, 99, 1}, {192, 168, 99, 255}, {255, 255, 255, 0}}
      ip_record
      |> Tuple.to_list
      |> hd
      |> Tuple.to_list
      |> Enum.join(".")
    end)
  end

  def get_public_ip do
    Application.get_env(:davo, Davo.Endpoint)[:url][:ip]
  end

  def get_public_hosts do
    [Application.get_env(:davo, Davo.Endpoint)[:url][:host]]

    # TODO: Parse the hosts
    # {output, 0} = System.cmd("nslookup", [get_public_ip])
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

  @channel_name "users:lobby"

  def req_handler(conn) do
    # Is broadcast async?? if not, I think it should
    # require IEx
    # IEx.pry
    Logger.info("Request proxied")
    Davo.Endpoint.broadcast(@channel_name, "conn:req", conn)
    conn
  end

  def req_body_handler(conn, body_chunk, more_body) do
    Logger.info("Request body chunk")
    conn_id = conn.assigns[:id]
    # replaced_chunk = String.replace(body_chunk, "davoclavo", "carletex")
    encoded_body_chunk = Base.encode64(body_chunk)

    Davo.Endpoint.broadcast(@channel_name, "conn:req_body_chunk:" <> conn_id, %{body_chunk: encoded_body_chunk, more_body: more_body})
    conn
  end

  def resp_handler(conn) do
    # require IEx
    # IEx.pry
    Logger.info("Response proxied")
    conn_id = conn.assigns[:id]
    Davo.Endpoint.broadcast(@channel_name, "conn:resp:" <> conn_id, conn)
    conn
  end

  def resp_body_handler(conn, body_chunk, more_body) do
    Logger.info("Response body chunk")
    conn_id = conn.assigns[:id]
    # replaced_chunk = String.replace(body_chunk, "davoclavo", "carletex")
    encoded_body_chunk = Base.encode64(body_chunk)

    Davo.Endpoint.broadcast(@channel_name, "conn:resp_body_chunk:" <> conn_id, %{body_chunk: encoded_body_chunk, more_body: more_body})
    conn
  end

  def broadcast_conn(conn) do
    Davo.Endpoint.broadcast(@channel_name, "conn:req", conn)
  end
end

defimpl Poison.Encoder, for: Plug.Conn do
  def encode(conn, options) do
    # peer = conn.peer

    # TODO: Treat proplists as arrays to preserve order
    # kwlists to maps to be able to JSON encodify easily
    req_headers = Enum.into(conn.req_headers, %{})
    resp_headers = Enum.into(conn.resp_headers, %{})

    conn
    |> Map.take([:scheme, :host, :port, :method, :request_path, :query_string, :status, :assigns])
    |> Map.merge(%{req_headers: req_headers, resp_headers: resp_headers})
    |> Poison.encode!
  end
end
