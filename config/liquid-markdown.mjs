import { Transform } from 'stream';

export const liquidjs = {
  name: 'liquidjs',
  level: 'block',
  start(src) { return src.match(/{/)?.index; },
  tokenizer(src, tokens) {
    const rule = /^({%\s*(.+)\s*%}|{{\s*(.+)\s*}})/;
    const match = rule.exec(src);
    if (match) {
      const token = {
        type: 'liquidjs',
        raw: match[0],
        text: match[0].trim(),
        tokens: []
      };
      return token;
    }
  },
  renderer(token) {
    return `${token.text}\n`;
  }
};

export function postprocess() {
  var transformStream = new Transform({objectMode: true});
  
  transformStream._transform = function(file, _enc, cb) {
    if (file.isBuffer()) {
      if (file.frontMatter) {
        let content = file.contents.toString();
        if (!file.path.includes("/layouts/")) {
          content = `{% block content %}
${content}
{% endblock %}`;
        }
        if (file.frontMatter.layout) {
          content = `{% layout "layouts/${file.frontMatter.layout}.liquid" %}
${content}`;
        }
        file.contents = Buffer.from(content);
      }
    } else {
      return cb("unsupported format");
    }

    cb(null, file);
  };

  return transformStream;
};