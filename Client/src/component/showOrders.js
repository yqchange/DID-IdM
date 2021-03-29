import React, { Component } from 'react';
import moment from 'moment';
import { Table, FormControl, ProgressBar } from 'react-bootstrap';
import Web3 from 'web3';
import LogisticsContract from "../contracts/Logistics.json";
import BN from 'bn.js';

//Styles
const inputStyle={
    borderRadius:5,
    fontSize:15,
    borderTop:0,
    borderLeft:0,
    borderRight:0,
    height:30,
    marginRight:10,
    width: 200
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

const buttonStyle3={
    borderRadius:5,
    fontSize:13,
    height:30,
    width: 60,
    marginLeft: 10,
    color:"white",
    backgroundColor:"coral"
  };
const buttonStyle4={
    borderRadius:5,
    fontSize:13,
    height:30,
    width: 60,
    marginLeft: 100,
    color:"white",
    backgroundColor:"coral"
  };

export default class ShowOrders extends Component {

    shouldComponentUpdate(nextProps) {
        if(this.props.account !== nextProps.account || this.props.role !== nextProps.role || this.props.orders !== nextProps.orders) {
          return true
        }
        if(this.props.setRole !== nextProps.setRole ||  this.props.askForClearance !== nextProps.askForClearance || this.props.addOrderToShip !== nextProps.addOrderToShip) {
          return true
        }
        return false;
    }

    render() {
        const filteredOptions1 = this.props.orders.filter(
            order => order.orderOwner === this.props.account   //get own orders for client created by themselves
        );
        const filteredOptions2 = this.props.orders.filter(
            order => order.shipper ===  this.props.account  //get all confirmed orders for single ShipOwner 
        );
        const filteredOptions3 = this.props.orders.filter(
            order => order.shipOwner ===  this.props.account  //get all confirmed orders for single ShipOwner 
        );
        var filteredOptions;
        if (this.props.role == 'Shipper') {
            filteredOptions = filteredOptions2;
        }
        else if (this.props.role == 'ShipOwner') {
            filteredOptions = filteredOptions3;
        }
        else if (this.props.role == 'Client') {
            filteredOptions = filteredOptions1;
        }
        return (
            <div>
                <div style={{width:450}}>
                    <table>
                    <thead>
                        <tr style={{fontSize:15}}>
                        <th scope="col">Order ID</th>
                        <th scope="col">Dispatch</th>
                        <th scope="col">Destination</th>
                        <th scope="col">Freight Class</th>
                        <th scope="col">Estimation Arrival Time</th>
                        {
                            (this.props.role == 'Client' )?(
                                <div>
                                <th scope="col">Status</th>
                                <th scope="col">Options</th>
                                </div>
                            ):null
                        }
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
                            {
                                this.props.role == 'Client'?(
                                    <div>
                                    <td>
                                        {
                                        {
                                            1: 'Created',
                                            2: 'Confirmed',
                                            3: 'Processing'
                                        }[order.orderStatus]
                                        }
                                    </td>
                                    <td>
                                        <button
                                            name={order.orderID} 
                                            onClick={(event) => {
                                                this.props.adminOrder(event.target.name)
                                        }}
                                        >Admin</button>
                                    </td>
                                    </div>
                                ):null
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