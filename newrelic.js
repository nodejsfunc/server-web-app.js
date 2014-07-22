/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
var config = require('./app/config/config');

exports.config = {
  /**
   * Array of application names.
   */
  app_name : ['server_web_app'],
  /**
   * Your New Relic license key.
   */
  license_key : config.newRelicKey,
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'trace'
  },
  rules: {
    name: [
      { pattern: "/api/secure-service/admin/users/.*", name: "/admin/users/:user" },
      { pattern: "/api/auth/users", name: "/auth/users" },
      { pattern: "/api/auth/users/.*", name: "/auth/users/:user" },
      { pattern: "/api/auth/clients", name: "/auth/clients" },
      { pattern: "/api/auth/clients/.*", name: "/auth/clients:client" },
      { pattern: "/api/auth/oauth2/token", name: "/auth/oauth2/token" },
      { pattern: "/api/auth/password/change", name: "/auth/password/change" },
      { pattern: "/api/auth/password/reset", name: "/auth/password/reset" },
      { pattern: "/api/auth/password/reset/validate-token", name: "/auth/password/reset/validate-token" },
      { pattern: "/api/secure-service/my/clubcards", name: "/my/clubcards" },
      { pattern: "/api/secure-service/clubcards/validation", name: "/clubcards/validation" },
      { pattern: "/api/secure-service/my/creditcards", name: "/my/creditcards" },
      { pattern: "/api/secure-service/my/baskets", name: "/my/baskets" },
      { pattern: "/api/secure-service/my/baskets/items", name: "/my/baskets/items" },
      { pattern: "/api/secure-service/my/payments", name: "/my/payments" },
      { pattern: "/api/secure-service/my/credit", name: "/my/credit" },
      { pattern: "/api/secure-service/my/library", name: "/my/library" },
      { pattern: "/api/local/signout", name: "/local/signout" },
      { pattern: "/api/local/config", name: "/local/config" },
      { pattern: "/api/secure-service/admin/users/.*/credit", name: "/admin/users/:user/credit" },
      { pattern: "/api/secure-service/admin/users/.*/purchases", name: "/admin/users/:user/purchases" }
    ]
  }
};
