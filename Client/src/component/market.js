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

export default class Market extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            price: 0,
            orderID: null,
            visible: false,
         };
      }

    render() {
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
                        <th scope="col">Options</th>
                        <th scope="col">Price</th>
                        <td></td>
                        </tr>
                    </thead>
                    <tbody id="orderList" style={{fontSize:20}}>
                    {this.props.orders.filter(order => order.orderStatus == 1).map((order) => {
                        return ( 
                            <tr key={order.orderID}>
                            <th scope="row">{order.orderID.toString()}</th>
                            <td>{order.from}</td>
                            <td>{order.to}</td>
                            <td>{order.freightClass}</td>
                            <td>{moment(parseInt(order.estimate_arrival_time)).format('YYYY-MM-DD')}</td>
                            <td>
                            <div>{this.state.text}</div>
                                <button
                                name={order.orderID} 
                                onClick={(event) => {
                                    this.props.bidOrder(event.target.name, this.price.value)
                                }}
                                >Bid</button>
                            </td>
                            <td>
                                <input id="price"
                                    size="10"
                                    type="number"
                                    width='5'
                                    ref={(input) => { this.price = input }}>
                                </input>
                            </td>
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
/*
class DialogCustom extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        orderID: this.props.OrderID,
        price: 0 
        };
    }
   
    handleOk = () => {
      this.props.onOk(this.state.price);
      this.props.onClose();
    }
   
    onChange = (e) => {
      this.setState({ price: e.target.value });
    }
   
    render() {
      const { visible, onClose } = this.props;
   
      return (
        <Modal title="Enter Price" visible={visible} onOk={this.handleOk} onCancel={onClose}>
          <p>Order: {this.props.OrderID}</p>  
          <Input value={this.state.price} onChange={this.onChange} />
        </Modal>
      );
    }
}
<Button onClick={this.showDialog}>Bid</Button>
<DialogCustom visible={this.state.visible} onOk={this.handleOk} onClose={this.handleClose} orderID={order.orderID}/>*/