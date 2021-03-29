pragma solidity ^0.5.16;

import "./OrderTransportation.sol";

contract OrderFactory{
    OrderTransportation[] public deployedOrders;

    function createOrder (string memory from, string memory to, uint freightClass, uint estimate_arrival_time, address consignee) public {
        OrderTransportation newOrder = new OrderTransportation(from, to, freightClass, estimate_arrival_time, consignee);
        deployedOrders.push(newOrder);
    }
    
    function getDeployedOrder() public view returns(OrderTransportation[] memory){
        return deployedOrders;
    }
}