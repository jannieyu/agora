build-frontend:
  npm i

run-frontend:
  npm run start

validate-repo:
   npx eslint . --ext .jsx --ext .js --ext .ts --ext .tsx
