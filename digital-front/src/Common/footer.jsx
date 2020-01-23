import React from "react";

const footerStyle = {
  backgroundColor: "#895aa1",
  color: "white",
  textAlign: "center",
  paddingTop: "1em",
  paddingBottom: "1em",
  position: "fixed",
  left: "0",
  bottom: "0",
  width: "100%"
};

function Footer() {
    return (
      <div>
        <div style={footerStyle}>Desenvolvido por Giovanna Blasco e Mateus Vasconcelos</div>
      </div>
    );
}

export default Footer;