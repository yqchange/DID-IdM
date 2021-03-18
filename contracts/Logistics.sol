pragma solidity ^0.5.16;

contract Logistics {
    constructor() public {
        roles[0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5] = 'Client';
        roles[0xFe941a539EBa7E60071D83EfE71044C2f9FC0C1A] = 'ShipOwner';
        roles[0x0d9F585DC2E20BC9ef0248655625166eEF8FcA55] = 'Inspector';
        roles[0xC82641AfC5DFA85bb85bBa55B723303a16B8da2B] = 'Gauger';
        roles[0xDE7A5cf1867e989F01fE51fd7c74D057ba7f7954] = 'Shipper';
        //ships[0] = Ship(0x6504462484a07e2f2ba68947e0e16b0d2775ca8c1f36fbd87760b245e5ecc34b, 0xFe941a539EBa7E60071D83EfE71044C2f9FC0C1A, 1, 0, 0);
        //orders[0] = Order(0x63655f2290449be76d433d7df67fd73408ec8def43969421dc831c756cb3230d, 'A', 'B', 1, 0, 0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5, 1, 0x0000000000000000000000000000000000000000, 0, 0);
        shipOwners = [0xFe941a539EBa7E60071D83EfE71044C2f9FC0C1A, 0x5747238A76434e8BE13548A9B18aCE79ccFe455E];
        //shipOwnership[0xFe941a539EBa7E60071D83EfE71044C2f9FC0C1A] = [0x6504462484a07e2f2ba68947e0e16b0d2775ca8c1f36fbd87760b245e5ecc34b];
    }

	struct Order {
        bytes32 orderID;
        string from;
        string to;
        uint freightClass;  //1normal, 2fluid, 3dangerous 
        uint estimate_arrival_time;

        address orderOwner;  
        uint orderStatus; //1Created, 2Comfirmed, 3Processing, 4ended, 5canceled. ShippingStatus similar.
        //stateHistory[] orderStateHistory;

        address shipper;  //get order       
        uint EvaluateCost;
        uint FinalCost;
    }

    struct Ship {
        bytes32 shipID;
        address shipOwner; 
        uint shipStatus; //AtPort, WaitingCleaning, Cleaned, Loading, Loaded, Unloading, Unloaded
        uint startWaterDisplacement;
        uint endWaterDisplacement;
        //stateHistory[] shipStateHistory;
    }
    
    struct ClearanceRequest {
        bytes32 shipID;
        address requestor;
    }

    struct Document {
        string ipfsHash;
        bool signedByShipOwner;
    }

    struct Confirmation {
        bool startMeasured;
        bool signedByShipOwnerStart;
        bool signedByShipperStart;
        bool endMeasured;
        bool signedByShipOwnerEnd;
        bool signedByShipperEnd;
    }
    
	Order[] public orders;
    ClearanceRequest[] public clearanceRequests;
    uint orderNum = 0;
    uint shipNum = 0;
    address[] shipOwners; //choosen by shipper

    mapping(address => string) public roles; //Client, Shipper, Inspector, Gauger, hipOwner
    mapping(bytes32 => Order) public ordermapping; //orderID to a order struct
    mapping(bytes32 => Ship) public shipmapping;  //shipID to a ship struct
    //mapping(bytes32 => bytes32) orderToShip;
    //mapping(bytes32 => bytes32) shipToOrder;
    mapping(bytes32 => address) public orderToShipOwner;  //place a order to ship company
    //mapping(bytes32 => address) orderOwnership; //who would take order to ship line
    mapping(address => bytes32[]) public shipOwnership; //owner to ship

    //mapping(address => bytes[]) public signedDocs; 
    //mapping(bytes32 => Document) public docmapping;
    mapping(bytes32 => Document) public shipClearanceReport;
    mapping(bytes32 => Confirmation) public confirmations;

    event roleSet(string role);
    event accessDenied(string role);
    event UpdateorderStatus(bytes32 orderID, string orderStatus, uint ts);
    event UpdateshipStatus(bytes32 shipID, string shipStatus, uint ts);
    event UpdateDocStatus(address CreatorOrSigner, string ipfsHash, string role);
    //event DocSigned(address from, uint256 docId, uint8 singId, bytes16 signType, bytes sign);

    
    modifier hasRole(string memory role) {
    if (keccak256(abi.encodePacked(roles[msg.sender])) != keccak256(abi.encodePacked(role))) {
      emit accessDenied(role);
      return;
    }
    _;
  }

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
/*
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
    }*/

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

/*
    function ShipClearance(bytes32 shipID, strings memory ipfsHash) hasRole('Inspector') public {
        if ( UploadClearanceReport(shipID, ipfsHash) && shipmapping[shipID].shipStatus == 2) {
            UploadClearanceReport(shipID, ipfsHash);
            shipmapping[shipID].shipStatus = 3;
            //shipmapping[shipID].shipStateHistory[2].currentState ='Inspected, waiting for confirmation from ship owner';
            //shipmapping[shipID].shipStateHistory[2].currentTs = now;
            emit UpdateshipStatus(shipID, 'Inspected', now);
        }
    }*/

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

