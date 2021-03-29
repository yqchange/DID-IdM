import React, { Component } from 'react';
import moment from 'moment';
import { Table, FormControl, ProgressBar } from 'react-bootstrap';
import Web3 from 'web3';
import LogisticsContract from "../contracts/Logistics.json";
import BN from 'bn.js';

//Styles
const buttonStyle3={
    borderRadius:5,
    fontSize:13,
    height:30,
    width: 60,
    marginLeft: 10,
    color:"white",
    backgroundColor:"coral"
  };

export default class ShowShips extends Component {
    render() {
        return (
            <div>
                <div style={{width:450}}>
                    <table>
                    <thead>
                        <tr style={{fontSize:15}}>
                        <th scope="col">Ship ID</th>
                        <th scope="col">Ship Status</th>
                        </tr>
                    </thead>
                    <tbody id="shipList" style={{fontSize:20}}>
                    </tbody>
                    </table>
                </div>
                <div>
                <p> Add new ships:
                <form onSubmit={(event) => {
                    event.preventDefault();
                    const ship = this.ship.value;
                    this.props.addShip(ship);
                    }}>
                    <input id="ship"
                        type="string"
                        ref={(input) => { this.ship = input }}>
                    </input>
                    <button type="submit" style={buttonStyle3} onClick={this.props.addShip}>Add</button>
                </form>
                </p>
                </div>
                <p>
                Ask for inspection:
                <form onSubmit={(event) => {
                    event.preventDefault();
                    const ship = this.shipId.value;
                    this.props.askForClearance(ship);
                    }}>
                    <input id="shipId"
                        type="string"
                        ref={(input) => { this.shipId = input }}>
                    </input>
                    <button type="submit" style={buttonStyle3} onClick={this.props.askForClearance}>Add</button>
                </form>
                </p>
            </div>
      );
  }
  };
