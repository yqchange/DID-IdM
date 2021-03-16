import React, { Component } from 'react';
import getWeb3 from '../getWeb3';
import LogisticsContract from "../contracts/Logistics.json";
//Styles
const inputStyle={
    borderRadius:5,
    fontSize:15,
    borderTop:0,
    borderLeft:0,
    borderRight:0,
    height:30,
    marginRight:10
  };
  const buttonStyle={
    borderRadius:5,
    fontSize:15,
    borderTop:0,
    borderLeft:0,
    borderRight:0,
    height:40,
    width: 90,
    marginLeft: 180,
    color:"white",
    backgroundColor:"LightSalmon"
  };
  const buttonStyle2={
    borderRadius:5,
    fontSize:15,
    borderTop:0,
    borderLeft:0,
    borderRight:0,
    height:40,
    width: 100,
    marginLeft: 10,
    color:"white",
    backgroundColor:"coral"
  };
  const popupStyle={
    borderRadius:5,
    backgroundColor:"#f6f5be",
    width:300,
    zIndex:100,
    margin:"auto",
    fontSize:15,
    marginTop:30,
    marginBottom:30,
    borderWidth:2
  };
  const buttonStyle3={
    borderRadius:5,
    fontSize:13,
    height:30,
    width: 60,
    marginLeft: 10,
    color:"white",
    backgroundColor:"coral"
  };
  
export default class ShowInfo extends Component {
    render () {
      if (!this.props.role) {
        alert('Please set role first.');
      }
      return (
        <div>
          <p>Your current role: {this.props.role}</p>
          <p>Your address: {this.props.account}</p>
          <form onSubmit={(event) => {
            event.preventDefault();
            const role = this.role.value;
            this.props.setRole(this.props.account, role);
            }}>
          <p> 
            <select id="role" type="string" ref={(select) => { this.role = select }} >
              <option value="Client" >Client</option>
              <option value="Shipper">Ship Owner</option>
              <option value="Inspector">Cargo hold inspector</option>
              <option value="Gauger">Gauger</option>   
            </select>
          </p> 
          <p><button type="submit" style={buttonStyle} onClick={this.props.setRole}>Set</button></p>
          </form>
        </div>
      );
    }
  };