pragma solidity ^0.5.16;

contract OrderTransportation {
	struct Order {
        //bytes32 orderID;
        string from;
        string to;
        uint freightClass;  //1normal, 2fluid, 3dangerous 
        uint estimate_arrival_time;
        address consiginee;
    }

    enum StateType { BeginTrade, ExportClearance, ShipmentInitiation, ShipmentBoarding, TransferBillOfLading, ShipmentInTransit, ImportClearance, RecoverShipment, ShipmentDelivery, ShipmentFinalize, ShipmentComplete, Terminated }
    Order public InstanceOrder;
    StateType public State;
    StateType[] stateHistory;
    uint[] lastAction;

    
    address public InstanceShipper;
    address public InstanceOriginCustoms;
    address public InstanceDrayageAgent;
    address public InstanceDestinationCustomsBroker;
    address public InstanceDestinationCustoms;
    address public InstanceConsignee;
    //uint orderStatus; //1Created, 2Comfirmed, 3Processing, 4ended, 5canceled. ShippingStatus similar.

    mapping(address => string) public roles; //Client, Shipper, Inspector, Gauger, hipOwner

    event roleSet(string role);
    event accessDenied(string role);
    event OrderCreated(string message, address creator);
    event OrderStatusUpdated(string message, address sender);
    
    modifier hasRole(string memory role) {
    if (keccak256(abi.encodePacked(roles[msg.sender])) != keccak256(abi.encodePacked(role))) {
      emit accessDenied(role);
      return;
    }
    _;
  }

    constructor(string memory from, string memory to, uint freightClass, uint estimate_arrival_time, address consignee) public{
        InstanceOrder = Order(from, to, freightClass, estimate_arrival_time, consignee);
        State = StateType.BeginTrade;
        lastAction.push(now);
        stateHistory.push(State);
        emit OrderCreated('Order created by client', msg.sender);
    }
/*
    function setRole(address addr, string memory role) public {
        roles[addr] = role;
        shipOwners.push(msg.sender);
        emit roleSet(role);
    }

    function getRole(address addr) public view returns (string memory) {
        return roles[addr];
    }
    
    function createOrder (string memory from, string memory to, uint freightClass, uint estimate_arrival_time) hasRole('Client') public returns(bytes32) {
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

    function bidOrder(bytes32 orderID) hasRole('Shipper') public {
        require(ordermapping[orderID].orderStatus == 1);
        ordermapping[orderID].shipper = msg.sender;
        ordermapping[orderID].orderStatus = 2;
            //ordermapping[orderID].orderStateHistory[1].currentState ='Confirmed';
            //ordermapping[orderID].orderStateHistory[1].currentTs = now;
            //orders[orders.length].orderStateHistory.push('Confirmed', now);
        for(uint i=0; i<orders.length; i++){
            if (orders[i].orderID == orderID){
                orders[i].shipper = msg.sender;
                orders[i].orderStatus = 2;
            }
        }
        emit UpdateorderStatus(orderID, 'Confirmed', now);
        
    }

	function getOrderCount() public view returns(uint) {
		return orders.length;
	}

    function AddShip() hasRole('ShipOwner') public {
        bytes32 uniqueId = keccak256(abi.encodePacked(msg.sender, now));
        uint shipStatus = 1;
        shipmapping[uniqueId].shipID = uniqueId;
        shipmapping[uniqueId].shipOwner = msg.sender;
        shipmapping[uniqueId].shipStatus = shipStatus;
        //ships[ships.length].shipStateHistory[0].currentState ='At Port';
        //ships[ships.length].shipStateHistory[0].currentTs = now;
        shipOwnership[msg.sender].push(uniqueId);
        emit UpdateshipStatus(uniqueId, 'At port', now);
    }

    function ChooseShipOwner(bytes32 shipID, bytes32 orderID) hasRole('Shipper') public {
        //orderToShip[orderID] = shipID;
        // work with a packlist
        ordermapping[orderID].orderStatus = 3;  //processing
        
        for(uint i=0; i<orders.length; i++){
            if (orders[i].orderID == orderID){
                orders[i].orderStatus = 3;
            }
        }
        //ordermapping[orderID].orderStateHistory[2].currentState ='Processing in dispatch port';
        //ordermapping[orderID].orderStateHistory[2].currentTs = now;
    }

    function ChooseShipOwner(address shipOwner, bytes32 orderID) hasRole('Shipper') public {
        orderToShipOwner[orderID] = shipOwner;
        //generally work with a packlist but now seen as single order
        ordermapping[orderID].orderStatus = 3;  //processing
        for(uint i=0; i<orders.length; i++){
            if (orders[i].orderID == orderID){
                orders[i].orderStatus = 3;
            }
        }
    }

    function AskForClearance(bytes32 shipID) hasRole('ShipOwner') public {
        if (shipmapping[shipID].shipOwner == msg.sender && shipmapping[shipID].shipStatus == 1) {
            shipmapping[shipID].shipStatus = 2; 
            //shipmapping[shipID].shipStateHistory[1].currentState ='Waiting for cleaning';
            //shipmapping[shipID].shipStateHistory[1].currentTs = now;
            clearanceRequests.push(ClearanceRequest(shipID, msg.sender));
            emit UpdateshipStatus(shipID, 'Waiting for clearance inspection', now);
        } 
    }


    function ShipClearance(bytes32 shipID, strings memory ipfsHash) hasRole('Inspector') public {
        if ( UploadClearanceReport(shipID, ipfsHash) && shipmapping[shipID].shipStatus == 2) {
            UploadClearanceReport(shipID, ipfsHash);
            shipmapping[shipID].shipStatus = 3;
            //shipmapping[shipID].shipStateHistory[2].currentState ='Inspected, waiting for confirmation from ship owner';
            //shipmapping[shipID].shipStateHistory[2].currentTs = now;
            emit UpdateshipStatus(shipID, 'Inspected', now);
        }
    }

    function UploadClearanceReport(bytes32 shipID, string memory ipfsHash) hasRole('Inspector') public {
        //bytes32 uniqueId = keccak256(abi.encodePacked(msg.sender, now));
        //signedDocs[msg.sender].push(ipfsHash); //Add document to users's "signed" list
        //docmapping[uniqueId] = Document(ipfsHash, msg.sender, shipID, now);
        shipClearanceReport[shipID] = Document(ipfsHash, false);
        shipmapping[shipID].shipStatus = 3; //cleaned
        emit UpdateshipStatus(shipID, 'Cleaned, waiting for ship owner\'s confirmations', now);
        emit UpdateDocStatus(msg.sender, ipfsHash, 'Inspector has been upload doc.');
    }

    function SignClearanceReport(bytes32 shipID, string memory ipfsHash) hasRole('ShipOwner') public { //shipper and shipOwner would sign Report
        shipClearanceReport[shipID].signedByShipOwner = true;
        emit UpdateDocStatus(msg.sender, ipfsHash, 'Ship owner signed doc.');
    }
    
    function StartWaterDisplacement(bytes32 shipID, uint measure) hasRole('Gauger') public {
        require(shipClearanceReport[shipID].signedByShipOwner);
        shipmapping[shipID].startWaterDisplacement = measure;
        confirmations[shipID] = Confirmation(true, false, false, false, false, false);
    }
    
    function EnableLoad(bytes32 shipID) public {
        if (confirmations[shipID].signedByShipperStart && confirmations[shipID].signedByShipOwnerStart) {
            shipmapping[shipID].shipStatus = 4; //enable Loading
            emit UpdateshipStatus(shipID, 'Can start loading...', now);
        }
    }
    
    function EndWaterDisplacement(bytes32 shipID, uint measure) hasRole('Gauger') public {
        require(confirmations[shipID].startMeasured && confirmations[shipID].signedByShipperStart && confirmations[shipID].signedByShipperStart);
        shipmapping[shipID].endWaterDisplacement = measure;
        confirmations[shipID].endMeasured = true;
    }
    
    function SignConfirmation(bytes32 shipID, string memory role) public {
        if (confirmations[shipID].startMeasured && !confirmations[shipID].endMeasured) {
            if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked('Shipper'))) {
                confirmations[shipID].signedByShipperStart = true;
            }
            else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked('ShipOwner'))) {
                confirmations[shipID].signedByShipOwnerStart = true;
            }
        } 
        else if (confirmations[shipID].endMeasured) {
            if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked('Shipper'))) {
                confirmations[shipID].signedByShipperEnd = true;
            }
            else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked('ShipOwner'))) {
                confirmations[shipID].signedByShipOwnerEnd = true;
            }
        else revert();
        }
    }

    function LoadGoods(bytes32 shipID) hasRole('Shipper') public {
        require(shipmapping[shipID].shipStatus == 4);
        shipmapping[shipID].shipStatus = 5; //Finish loading
        emit UpdateshipStatus(shipID, 'All goods has been loaded', now);
    }*/
    
}


/*
    function ApproveClearanceReport(bytes32 orderID, bytes memory docID, bytes memory signature) hasRole('ShipOwner') public
    {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, docID, this));
        require(recoverSigner(message, signature) == msg.sender);
        emit UpdateshipStatus(orderID, 'Approve Clearance Report');
    }
    
    function recoverSigner(bytes32 message, bytes memory sig)
    internal
    pure
    returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    /// signature methods.
    function splitSignature(bytes memory sig)
    internal
    pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }
*/

