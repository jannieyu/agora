setup-frontend:
  npm i

build-api:
  npx openapi-generator-cli generate -i src/api/api.yaml -g typescript -o src/js/generated/openapi/
  cd src/js/generated/openapi && npm run build

run-frontend:
  cd config/webpack && npx webpack serve

run-backend:
  cd src/app && go run cmd/server.go

validate-repo:
   npx eslint . --ext .jsx --ext .js --ext .ts --ext .tsx
   npx stylelint "{src,config}/**/*.{css,scss,sass}" --config .stylelintrc.json

