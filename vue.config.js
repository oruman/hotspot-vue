module.exports = function(env) {
  env = env || {};

  const production = process.env.NODE_ENV === "production";

  const result = {
    productionSourceMap: false,
    transpileDependencies: ["vuetify", "vuex-module-decorators"]
  };

  if (production) result["publicPath"] = "";
  else {
    result["devServer"] = {
      https: true,
      proxy: {
        "^/a/": {
          target: "https://arriba-hotspot-staging.herokuapp.com/",
          secure: false,
          changeOrigin: true
        }
      }
    };
  }

  result["devServer"] = {
    proxy: "https://arriba-hotspot-staging.herokuapp.com"
  };

  return result;
};
