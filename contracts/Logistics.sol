pragma solidity ^0.5.16;

contract Logistics {

    /*struct stateHistory {
        string currentState;
        uint currentTs;
    }*/

	struct Order {
        bytes32 orderID;
        string from;
        string to;
        uint freightClass;  //1normal, 2fluid, 3dangerous 
        uint estimate_arrival_time;

        address orderOwner;  
        uint orderStatus; //1Created, 2Comfirmed, 3Processing, 4ended, 5canceled. ShippingStatus similar.
        //stateHistory[] orderStateHistory;

        address shipper;  //which operator for shipping            
        uint EvaluateCost;
        uint FinalCost;
    }

    struct Ship {
        bytes32 shipID;
        address shipOwner; //default shipper address
        uint shipStatus; //AtPort, WaitingCleaning, Cleaned, Loading, Loaded, Unloading, Unloaded
        uint startWaterDisplacement;
        uint endWaterDisplacement;
        //stateHistory[] shipStateHistory;
    }

    struct Document {
        bytes ipfsHash;
        address signature;
        bytes32 shipID;
        uint timestamp;
    }

	Order[] public orders;
    Ship[] public ships;
    uint orderNum = 0;
    uint shipNum = 0;

    mapping(address => string) roles; //client, shipper, inspector, gauger, carrier
    mapping (bytes32=> Order) public ordermapping; //orderID to a order struct
    mapping (bytes32=> Ship) public shipmapping;  //shipID to a ship struct
    mapping(bytes32 => bytes32) orderToShip;
    mapping(bytes32 => bytes32) shipToOrder;
    mapping(bytes32 => address) orderOwnership;
    mapping(address => bytes32[]) shipOwnership; //owner to ship

    mapping(address => bytes[]) public signedDocs; 
    mapping (bytes32 => Document) public docmapping;

    event roleSet(string role);
    event accessDenied(string role);
    event UpdateorderStatus(bytes32 orderID, string orderStatus, uint ts);
    event UpdateshipStatus(bytes32 shipID, string shipStatus, uint ts);
    event DocCreated(address docCreator, uint256 docID);
    event DocSigned(address from, uint256 docId, uint8 singId, bytes16 signType, bytes sign);

    
    modifier hasRole(string memory role) {
    if (keccak256(abi.encodePacked(roles[msg.sender])) != keccak256(abi.encodePacked(role))) {
      emit accessDenied(role);
      return;
    }
    _;
  }

    function setRole(address addr, string memory role) public {
        roles[addr] = role;
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

    function confirmOrder(bytes32 orderID) hasRole('Shipper') public {
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

    function AddShip(address addr) hasRole('Shipper') public {
        require(addr == msg.sender);
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

    function AddOrderToShip(bytes32 shipID, bytes32 orderID) hasRole('Shipper') public {
        orderToShip[orderID] = shipID;
        ordermapping[orderID].orderStatus = 3;  //processing
        
        for(uint i=0; i<orders.length; i++){
            if (orders[i].orderID == orderID){
                orders[i].orderStatus = 3;
            }
        }
        //ordermapping[orderID].orderStateHistory[2].currentState ='Processing in dispatch port';
        //ordermapping[orderID].orderStateHistory[2].currentTs = now;
    }

    function AskForClearance(bytes32 shipID) hasRole('Shipper') public {
        if (shipmapping[shipID].shipOwner == msg.sender && shipmapping[shipID].shipStatus == 1) {
            shipmapping[shipID].shipStatus = 2; 
            //shipmapping[shipID].shipStateHistory[1].currentState ='Waiting for cleaning';
            //shipmapping[shipID].shipStateHistory[1].currentTs = now;
            emit UpdateshipStatus(shipID, 'Waiting for clearance inspection', now);
        }   
    }

    function ShipClearance(bytes32 shipID, bytes memory ipfsHash) hasRole('Inspector') public {
        if (shipmapping[shipID].shipOwner == msg.sender && shipmapping[shipID].shipStatus == 2) {
            UploadClearanceReport(shipID, ipfsHash);
            shipmapping[shipID].shipStatus = 3;
            //shipmapping[shipID].shipStateHistory[2].currentState ='Inspected, waiting for confirmation from ship owner';
            //shipmapping[shipID].shipStateHistory[2].currentTs = now;
            emit UpdateshipStatus(shipID, 'Inspected', now);
        }
    }

    function UploadClearanceReport(bytes32 shipID, bytes memory ipfsHash) hasRole('Inspector') public returns (bool) {
        bytes32 uniqueId = keccak256(abi.encodePacked(msg.sender, now));
        signedDocs[msg.sender].push(ipfsHash); //Add document to users's "signed" list
        docmapping[uniqueId] = Document(ipfsHash, msg.sender, shipID, now);
        return true;
    }

    function SignClearanceReport(bytes memory ipfsHash) public {
        signedDocs[msg.sender].push(ipfsHash);
        //docmapping[].signatures.push(msg.sender);
    }
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

