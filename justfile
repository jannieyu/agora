setup-frontend:
  npm i

setup-backend:
  python3 -m venv ./config/env
  source ./config/env/bin/activate
  python3 -m pip install -r ./config/pip/requirements.txt

run-frontend:
  cd config/webpack && npx webpack -w

run-backend:
  source ./config/env/bin/activate
  uvicorn src.app.main:app --reload --reload-dir src/app

validate-repo:
   npx eslint . --ext .jsx --ext .js --ext .ts --ext .tsx
   npx stylelint "**/*.{css,scss,sass}" --config .stylelintrc.json

