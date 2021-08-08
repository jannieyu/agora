build-frontend:
  npm i

run-frontend:
  cd config/webpack && npx webpack serve

validate-repo:
   npx eslint . --ext .jsx --ext .js --ext .ts --ext .tsx
