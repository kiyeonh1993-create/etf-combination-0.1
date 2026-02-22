{ pkgs ? import <nixpkgs> {} }: {
  channel = "stable-24.11";
  packages = [
    pkgs.nodejs_20
  ];
  idx = {
    extensions = [
      "dsznajder.es7-react-js-snippets"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
          id = "web";
        };
      };
    };
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        # Optional: commands to run when the workspace starts
      };
    };
  };
}
