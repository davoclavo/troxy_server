use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
config :davo, Davo.Endpoint,
  secret_key_base: System.get_env("SECRET_KEY_BASE")

# Configure your database
# config :davo, Davo.Repo,
#   adapter: Ecto.Adapters.Postgres,
#   url: System.get_env("DATABASE_URL"),
#   pool_size: 20
