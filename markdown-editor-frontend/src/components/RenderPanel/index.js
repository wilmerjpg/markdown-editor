import React from "react";
import ReactMarkdown from "react-markdown";
import "./styles.css";


const RenderPanel = props => (
  <div className="col-5 panel-render border-gray overflow-a">
    <div>
      <ReactMarkdown source={props.renderMarkdown} />
    </div>
  </div>
);

export default RenderPanel;