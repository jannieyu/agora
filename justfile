setup-frontend:
  npm i

run-frontend:
  cd config/webpack && npx webpack serve

run-backend:
  cd src/app && go build
  cd src/app && ./web

validate-repo:
   npx eslint . --ext .jsx --ext .js --ext .ts --ext .tsx
   npx stylelint "{src,config}/**/*.{css,scss,sass}" --config .stylelintrc.json

