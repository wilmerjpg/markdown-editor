import React, { Component } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import axios from "axios";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/neat.css";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/javascript/javascript.js";
import "./App.css";
import iconFile from "./images/icon-file.jpg";
import FilePanel from "./components/FilePanel";
import RenderPanel from "./components/RenderPanel";
import { MdDeleteForever, MdControlPoint } from "react-icons/md";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      fileSelected: 0
    };
    this.onClickFile = this.onClickFile.bind(this);
    this.updateLasModified = this.updateLasModified.bind(this);
    this.onClickGetFiles = this.onClickGetFiles.bind(this);
    this.onClickCreateFile = this.onClickCreateFile.bind(this);
    this.onClickUpdateFile = this.onClickUpdateFile.bind(this);
    this.onClickDeleteFile = this.onClickDeleteFile.bind(this);
  }

  componentDidMount(){
    //setInterval(this.updateLasModified, 1000);
    this.onClickGetFiles();
  }

  onClickFile(i) {
    this.setState({
      fileSelected: i
    });
  }

  onClickGetFiles() {
    axios.get('http://localhost:5000/api/v1/files')
      .then(res => {
        if(res.status === 200){
          this.setState({
            files: res.data,
            fileSelected: 0
          }, () =>{
            this.updateLasModified();
          })
        }
      });
  }

  onClickCreateFile(name) {
    if(name) {
      if(this.state.files.find(e => e.name.toLowerCase() === `${name}.md`.toLowerCase())){
        alert("The file name already exist");
      }else{
        axios.post('http://localhost:5000/api/v1/files', {name})
          .then(res => {
            if (res.status === 200) {
              this.onClickGetFiles();
            }
          });
      }
    }else{
      alert("The file name can not be empty");
    }
  }

  onClickUpdateFile() {
    const {files, fileSelected} = this.state;
    const {name,content} = files[fileSelected];
    axios.put('http://localhost:5000/api/v1/files', {name, content})
      .then(res => {
        if(res.status === 200){
          this.updateLasModified();
        }
      });
  }

  onClickDeleteFile() {
    const {files, fileSelected} = this.state;
    const {name} = files[fileSelected];
    axios.delete(`http://localhost:5000/api/v1/files/${name}`).then(res => {
      if(res.status === 200){
        this.onClickGetFiles();
      }
    });
  }

  updateLasModified() {
    const { files } = this.state;
    const auxFiles = files.map(file =>{
      const date1 = new Date();
      const date2 = new Date(file.dateLastModified);
      const timeDiff = Math.abs(date2.getTime() - date1.getTime());
      const diffMinutes = Math.ceil(timeDiff / (1000 * 3600 / 60 )) ? Math.ceil(timeDiff / (1000 * 3600 / 60 )) : 0;
      const diffHour = Math.ceil(timeDiff / (1000 * 3600 / 60 )) ? Math.ceil(timeDiff / (1000 * 3600 / 60)) : 0;
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : 0;
      let lastModified = "";
      if(diffMinutes < 59) {
        lastModified = `${diffMinutes} minutes ago`
      }else if( diffHour < 24){
        lastModified = `${diffHour} hours ago`
      }else {
        lastModified = `${diffDays} days ago`
      }
      file.lastModified = lastModified;
      return file;
    });
      this.setState({
        files: auxFiles
      });
  }

  render() {
    const { files, fileSelected } = this.state;
    const renderFiles = files.map((file, i) => {
      return (
        <li
          key={file.id}
          className={
            "list-group-item " + (i === fileSelected ? "active" : "")
          }
          onClick={() => this.onClickFile(i)}
        >
          <div className="d-flex align-items-center">
            <img src={iconFile} alt="Icon file" className="icon-file" />
            <div className="d-flex flex-column p-2 pr-1">
              <p className="title-file m-0 font-weight-bold">{file.name}</p>
              <p className="date-file  m-0">{file.lastModified}</p>
            </div>
          </div>
        </li>
      );
    });
    return (
      <div className="container-fluid">
        <div className="row d-flex justify-content-center h-100">
          <FilePanel renderFiles={renderFiles} />
          <div className="col-5 panel-editor border-gray h-100">
            <CodeMirror
              value={files[fileSelected] ? files[fileSelected].content : ""}
              onBeforeChange={(editor, data, value) => {
                if(files[fileSelected]){
                  const { files: auxFiles } = this.state;
                  auxFiles[fileSelected] = {
                    ...auxFiles[fileSelected],
                    content: value,
                    dateLastModified: new Date().toString()
                  };
                  this.setState({ files: auxFiles }, () => {
                    this.onClickUpdateFile();
                  });
                }

              }}
              onChange={(editor, data, value) => {}}
            />
            <MdDeleteForever size="3rem" color="red" style={{ zIndex: "100", position: "absolute", bottom: "20px", right: "20px", cursor: "pointer"}} onClick={() => { if (window.confirm(`Are you sure you wish to delete the file: ${this.state.files[fileSelected].name} ?`)) this.onClickDeleteFile() } }/>
          </div>
          <RenderPanel renderMarkdown={files[fileSelected] ? files[fileSelected].content : ""}/>
          <MdControlPoint size="3rem" color="green" style={{ zIndex: "100", position: "absolute", bottom: "20px", right: "20px", cursor: "pointer"}}  onClick={() => {const name = prompt("What is the name of file?", `Readme${(this.state.files.length + 1).toString()}`); this.onClickCreateFile(name)}}/>

        </div>
      </div>
    );
  }
}

export default App;
