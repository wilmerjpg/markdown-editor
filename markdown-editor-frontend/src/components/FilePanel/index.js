import React from "react";
import "./styles.css";

const FilePanel = props => (
  <div className="col-2 border-gray panel-files p-0 overflow-a">
    <p className="d-flex justify-content-center align-items-center font-weight-bold m-0">
      MarkdownEditor
    </p>
    <ul className="list-group list-files">{props.renderFiles}</ul>
  </div>
);

export default FilePanel;