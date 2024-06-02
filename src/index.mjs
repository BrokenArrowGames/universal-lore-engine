import { join } from 'path';
import express from 'express';
import { Liquid } from 'liquidjs';
import { existsSync } from 'fs';

const port = 3000;

const app = express();
const engine = new Liquid({
  cache: process.env.APP_ENV === 'production'
});

const srcDir = '_site';
const viewDir = 'views';
const publicDir = 'public';

app.engine('liquid', engine.express());
app.use(express.static(join(srcDir, publicDir)));
app.set('views', join(srcDir, viewDir));
app.set('view engine', 'liquid');

app.get('/*', (req, res) => {
  const pageDir = 'pages';
  const fileDir = join(srcDir, viewDir, 'pages');
  
  const path = `${req.path.replace(/^\/|\/$/g, '')}`;
  if (existsSync(join(fileDir, `${path}.liquid`))) {
    res.render(join(pageDir, path));
  } else if (existsSync(join(fileDir, path, 'index.liquid'))) {
    res.render(join(pageDir, path, 'index'));
  } else {
    res.status(404)
    res.render("pages/404");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
