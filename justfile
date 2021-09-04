setup-frontend:
  npm i

run-frontend:
  cd config/webpack && npx webpack serve

validate-repo:
   npx eslint . --ext .jsx --ext .js --ext .ts --ext .tsx
   npx stylelint "**/*.{css,scss,sass}" --config .stylelintrc.json

setup-backend:
  python3 -m venv ./config/env
  source ./config/env/bin/activate
  python3 -m pip install -r ./config/pip/requirements.txt
