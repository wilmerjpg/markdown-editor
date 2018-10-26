const express = require ("express");
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

function readFilesSync(dir, files = []) {
  fs.readdirSync(dir)
    .forEach( (filename,i) => {
      const name = path.parse(filename).name + path.parse(filename).ext;
      const content = fs.readFileSync(dir + name, 'utf-8');
      const filepath = path.resolve(dir, filename);
      const stat = fs.statSync(filepath);
      const isFile = stat.isFile();

      if (isFile) files.push({name, content, dateLastModified: stat.mtime, lastModified: "" });
    });

  return files;
}

app.get('/api/v1/files', (req, res) => {
  let files = readFilesSync("./files/");
  let sortedFiles = [];
  if(files.length > 0){
    sortedFiles = files.sort((a, b) =>
      b.dateLastModified.getTime() - a.dateLastModified.getTime()
    ).map((e,i) => {e.id = i; return e});
  }
  res.send(sortedFiles);
});

app.post('/api/v1/files', function(req, res) {
  const name = req.body.name;
  fs.appendFile(`./files/${name}.md`, '', function (err) {
    if(err) {
      return console.log(err);
    }
  });
  res.send(`Add ${name}.md`);
});

app.put('/api/v1/files', function(req, res) {
  const name = req.body.name;
  const content = req.body.content;
  const fs = require('fs');
  fs.writeFile(`./files/${name}`, content, function(err) {
    if(err) {
      return console.log(err);
    }
  });
  res.send(`Update ${name}`);
});

app.delete('/api/v1/files/:name', function(req, res) {
  const name = req.params.name;
  const filePath = `./files/${name}`;
  fs.unlinkSync(filePath);
  res.send(`Delete ${name}`);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
