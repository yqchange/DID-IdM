import React, { Component } from 'react';
import moment from 'moment';

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

export default class NewOrder extends Component {
    render() {
      return (
        <div>
          <form onSubmit={(event) => {
          event.preventDefault();
          const from = this.orderFrom.value;
          const to = this.orderTo.value;
          const freightClass = this.orderFreightClass.value;
          const ts = new Date(this.orderEstimationTime.value).getTime();
          this.props.createOrder(from, to , freightClass, ts);
          }}>
          <p>From:
            <input id="orderFrom"
                   style={inputStyle}
                   placeholder=""
                   size="60"
                   type="text"
                   ref={(input) => { this.orderFrom = input }}>
            </input>
          </p>
          <p>To:
            <input id="orderTo"
                   style={inputStyle}
                   placeholder=""
                   size="60"
                   type="text"
                   ref={(input) => { this.orderTo = input }}>
            </input>
          </p>
          <p>Freight Class:
            <input id="orderFreightClass"
                   style={inputStyle}
                   placeholder=""
                   size="60"
                   type="number"
                   ref={(input) => { this.orderFreightClass = input }}>
            </input>
          </p>
          <p>Estimation Arrival Time:
            <input id="orderEstimationTime"
                   style={inputStyle}
                   placeholder=""
                   size="60"
                   type="date"
                   ref={(input) => { this.orderEstimationTime = input }}>
            </input>
          </p>
          <p><button type="submit" style={buttonStyle} onClick={this.props.createNewOrder}>Add</button></p>
          </form>
        </div>
      ); 
  }
  };