import React, { Component } from 'react';
import moment from 'moment';
import { Table, FormControl, ProgressBar } from 'react-bootstrap';
import Web3 from 'web3';
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
export default class ShowOrders extends Component {
    /* todo 
    showContent = function(e) {
        //{console.log(this.order.orderOwner)}
        console.log('this.order.orderOwner');
        console.log(e.target.name);
      return (
        <div style={popupStyle}>
            <p>Tttttt</p>

        </div>
      );
    }*/

    render() {
        const filteredOptions1 = this.props.orders.filter(
            order => order.orderOwner === this.props.account   //get own orders for client created by themselves
        );
        const filteredOptions2 = this.props.orders.filter(
            order => order.orderStatus === 1 || 2  //get all available orders for shippers
        );
        /*
        const filteredOptions3 = this.props.confirmedOrders.filter(
            order => order.orderStatus ===  2  //get all confirmed orders for single shipper 
        );*/
        var filteredOptions;
        switch (this.props.role)
            {
                case 'Client': filteredOptions = filteredOptions1;
                case 'Shipper': filteredOptions = filteredOptions2;
                default: filteredOptions = filteredOptions2;
            }
        /*
        if (this.props.confirmedOrders !== null) {
            filteredOptions = filteredOptions3
        }*/
        return (
            <div>
                <div style={{width:500}}>
                    <table>
                    <thead>
                        <tr style={{fontSize:15}}>
                        <th scope="col">Order ID</th>
                        <th scope="col">Dispatch</th>
                        <th scope="col">Destination</th>
                        <th scope="col">Freight Class</th>
                        <th scope="col">Estimation Arrival Time</th>
                        <th scope="col">Status</th>
                        <th scope="col">Options</th>
                        <td></td>
                        </tr>
                    </thead>
                    <tbody id="orderList" style={{fontSize:20}}>
                    {filteredOptions.map((order) => {
                        return ( 
                            <tr key={order.orderID}>
                            <th scope="row">{order.orderID.toString()}</th>
                            <td>{order.from}</td>
                            <td>{order.to}</td>
                            <td>{order.freightClass}</td>
                            <td>{moment(parseInt(order.estimate_arrival_time)).format('YYYY-MM-DD')}</td>
                            <td>
                                {
                                {
                                    1: 'Created',
                                    2: 'Confirmed'
                                }[order.orderStatus]
                                }
                            </td>
                            {
                                {
                                    'Client': 
                                        <td><button
                                            name={order.orderID} 
                                            value={order.orderOwner}
                                            onClick={(event) => {
                                                this.getDetail(event.target.name)
                                        }}
                                        >Detail</button>
                                        </td>,
                                    'Shipper': 
                                        <td><button
                                            name={order.orderID} 
                                            value={order.orderOwner}
                                            onClick={(event) => {
                                                this.props.confirmOrder(event.target.name)
                                        }}
                                        >Confirm</button>
                                        </td>
                                }[this.props.role]
                            }
                            </tr>
                        )
                    })}
                    </tbody>
                    </table>
                </div>
            </div>
      );
  }
  };
