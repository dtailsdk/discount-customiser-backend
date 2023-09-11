From scratch:
  npm install

Create a public Shopify app based on this setup:
1. Create/configure a Shopify app via partners.shopify.com
2. Use the env.sample to create a .env file
3. Rename code, directories etc. as appropriate to the name of the app you are creating (look for TODO and replace appropriately)
4. Create a frontend based on the app-template-frontend library
5. Start ngrok to develop and test app
  ngrok start -config ~/.ngrok2/app-template.yml -all
  where the app-template.yml file e.g. contains:
  authtoken: <auth_token>
  region: eu
  tunnels:
    frontend:
      proto: http
      addr: 3000
      subdomain: app-template
      bind-tls: true
    backend:
      proto: http
      addr: 4000
      subdomain: app-template-backend
      bind-tls: true
6. Get app approved by Shopify