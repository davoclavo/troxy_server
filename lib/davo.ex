defmodule Davo do
  use Application

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    if Mix.env == :dev do
      {:ok, _} = Application.ensure_all_started(:httparrot)
    end

    children = [
      # Start the endpoint when the application starts
      supervisor(Davo.Endpoint, []),
      # Start the Ecto repository
      supervisor(Davo.Repo, []),
      # Here you could define other workers and supervisors as children
      # worker(Davo.Worker, [arg1, arg2, arg3]),
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Davo.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    Davo.Endpoint.config_change(changed, removed)
    :ok
  end
end
