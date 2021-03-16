import React from 'react';
import ReactDOM from 'react-dom';
import '../../app.css';
import * as serviceWorker from '../../serviceWorker';
import createReactClass from 'create-react-class';

const buttonStyle = {
  fontSize:20,
  borderTop:0,
  borderLeft:0,
  borderRight:0,
  height:50,
  width: 380,
  color:"#194f81",
  backgroundColor:"white",
  borderColor:"#194f81",
  border:"solid",
  borderWidth:4,
  borderRadius:5,
  textAlign:"center",
};

var Subpage = createReactClass({
  propoTypes: {
    pageName: "",
  },
  goToPage: function(event){
    switch (this.props.pageName) {
      case "Client":
        window.open("client.html");
        break;
      case "Shipper":
        window.open("shipper.html");
        break;
      case "Inspector":
        window.open("inspector.html");
        break;
      case "Gauger":
        window.open("gauger.html");    //other case like: Carrier To be done
        break;
      default:
        this.pageUrl = window.location.href;
    }
  },
  render: function(){
    return(
      <div>
        <button style={buttonStyle}
                onClick={this.goToPage}>{this.props.pageName}</button>
      </div>
    );
  }
});
function MainPage() {
  return (
    <div className="App">
        <div className="App-header">
          <h2 className="headerFont">Waterway Transportation Identity Management System</h2>
          <h2 className="headerFont">Please Select Your Identity: </h2>
        </div>
        <div className = "App-body">
          <Subpage pageName = "Client"/><br></br>
          <Subpage pageName = "Shipper"/><br></br>
          <Subpage pageName = "Inspector"/><br></br>
          <Subpage pageName = "Gauger"/><br></br>
        </div>
      </div>
  );
}

ReactDOM.render(<MainPage />, document.getElementById('root'));

serviceWorker.unregister();
