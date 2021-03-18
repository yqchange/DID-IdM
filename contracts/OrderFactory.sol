pragma solidity ^0.5.16;

import "./OrderTransportation.sol";

contract OrderFactory{
    address[] public deployedOrders;
    
    function createOrder(string description, address freightCarrier, address originCustoms, address consignee) public returns (address newSupplychain){
        newSupplychain = new OrderTransportation(msg.sender, description, freightCarrier, originCustoms, consignee);
        deployedSupplychains.push(newSupplychain);
    }

    function createOrder (string memory from, string memory to, uint freightClass, uint estimate_arrival_time) public returns(address newOrder) {
        newOrder = new SupplyChainTransportation(msg.sender, description, freightCarrier, originCustoms, consignee);
        bytes32 uniqueId = keccak256(abi.encodePacked(msg.sender, now));
        ordermapping[uniqueId].orderID = uniqueId;
        ordermapping[uniqueId].from = from;
        ordermapping[uniqueId].to = to;
        ordermapping[uniqueId].freightClass = freightClass;
        ordermapping[uniqueId].estimate_arrival_time = estimate_arrival_time;
        ordermapping[uniqueId].orderOwner = msg.sender;
        ordermapping[uniqueId].orderStatus = 1;
        //ordermapping[uniqueId].timestamp = now;
        //ordermapping[uniqueId].orderStateHistory[0].currentState ='Created';
        //ordermapping[uniqueId].orderStateHistory[0].currentTs = now;
        orders.push(ordermapping[uniqueId]);
        emit UpdateorderStatus(uniqueId, 'Created', now);
        return uniqueId;
}
    
    function getDeployedOrder() public view returns(address[]){
        return deployedSupplychains;
    }
}