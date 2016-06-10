defmodule Davo.Mixfile do
  use Mix.Project

  def project do
    [app: :davo,
     version: "0.0.1",
     elixir: "~> 1.2",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [:phoenix, :gettext] ++ Mix.compilers,
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [mod: {Davo, []},
     applications: [:phoenix, :phoenix_html, :cowboy, :logger, :gettext,
                    # :phoenix_ecto, :postgrex,
                    :troxy, :corsica, :httparrot, :plug_ribbon,
                    :phoenix_live_reload, :edeliver]]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "web", "test/support"]
  defp elixirc_paths(_),     do: ["lib", "web"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [{:phoenix, "~> 1.1.6"},
     # {:postgrex, ">= 0.0.0"},
     # {:phoenix_ecto, "~> 2.0"},
     {:phoenix_html, "~> 2.4"},
     {:phoenix_live_reload, "~> 1.0", only: :dev},
     {:gettext, "~> 0.9"},
     {:cowboy, "~> 1.0"},
     {:corsica, "~> 0.4"},
     {:httparrot, "~> 0.3.4"},
     # {:troxy, path: "../troxy" },
     {:troxy, github: "davoclavo/troxy_plug", app: false},
     {:plug_ribbon, "~> 0.2.0"},
     # {:edeliver, "~> 1.2.8"}
     {:edeliver, github: "boldpoker/edeliver"}
    ]
  end
end
