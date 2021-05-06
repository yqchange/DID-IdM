pragma solidity ^0.5.16;
//pragma experimental ABIEncoderV2;

contract Logistics {
	struct Order {
        bytes32 orderID;
        string from;
        string to;
        uint freightClass;  //1normal, 2fluid, 3dangerous 
        uint estimate_arrival_time;
        uint orderStatus; //1Created, 2Comfirmed, 3Processing, 4ended, 5canceled. ShippingStatus similar.
        address orderOwner;
        address shipper;
        address shipOwner;
        bool bidByShipper;
        bool bidByShipOwner;
    }

    struct Ship {
        string shipID;
        address shipOwner; 
        uint shipStatus; //AtPort, WaitingCleaning, Cleaned, Loading, Loaded, Unloading, Unloaded
        uint startWaterDisplacement;
        uint endWaterDisplacement;
        //stateHistory[] shipStateHistory;
    }
    
    struct ClearanceRequest {
        string shipID;
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
    
    struct Bid {
        address bidder;
        uint currentPrice;
    }
    
    struct OrderOwnership {
        address shipper;
        address shipOwner;
    }

    struct Identity {
        bytes32 uuid;
        bool confirmed;
    }

	Order[] public orders;
    Ship[] public ships;
    ClearanceRequest[] public clearanceRequests;
    address public owner;
    string public pubkeyHash;
    string[] public reqCred;

    mapping(address => string) public roles; //Client, Shipper, Inspector, Gauger, hipOwner
    mapping(bytes32 => Order) public ordermapping; //orderID to a order struct
    mapping(string => Ship) public shipmapping;  //shipID to a ship struct
    mapping(bytes32 => Bid) private shipperBidder; 
    mapping(bytes32 => Bid) private shipOwnerBidder; 
    //mapping(bytes32 => address) public orderToShipOwner;  //place a order to ship company
    //mapping(bytes32 => address) orderOwnership; //who would take order to ship line
    mapping(address => string) public shipOwnership; //owner to ship
    mapping(bytes32 => OrderOwnership) private orderAssignment;
    mapping(string => Document) public shipClearanceReport;
    mapping(string => Confirmation) public confirmations;
    mapping(address => Identity) public shipowneruuid;

    event roleSet(string role);
    event accessDenied(string role);
    event UpdateorderStatus(bytes32 indexed orderID, string orderStatus, uint ts);
    event UpdateshipStatus(string shipID, string shipStatus, uint ts);
    event UpdateDocStatus(address CreatorOrSigner, string ipfsHash, string role);
    event bidByOthers(address add, string str);
    event sendUUID(address indexed shipowner, bytes32 indexed uuid);    //address would be used for assignment 
    //event DocSigned(address from, uint256 docId, uint8 singId, bytes16 signType, bytes sign);

    
    modifier hasRole(string memory role) {
    if (keccak256(abi.encodePacked(roles[msg.sender])) != keccak256(abi.encodePacked(role))) {
      emit accessDenied(role);
      return;
    }
    _;
  }
  
    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    constructor () public {
        owner = msg.sender;
    }

    function setRole(address addr, string memory role) public {
        roles[addr] = role;
        //shipOwners.push(msg.sender);
        emit roleSet(role);
    }

    function getRole(address addr) public view returns (string memory) {
        return roles[addr];
    }
    
    function createOrder (string memory from, string memory to, uint freightClass, uint estimate_arrival_time) public onlyOwner() returns(bytes32) {
        bytes32 uniqueId = keccak256(abi.encodePacked(msg.sender, now));
        ordermapping[uniqueId].orderID = uniqueId;
        ordermapping[uniqueId].from = from;
        ordermapping[uniqueId].to = to;
        ordermapping[uniqueId].freightClass = freightClass;
        ordermapping[uniqueId].estimate_arrival_time = estimate_arrival_time;
        ordermapping[uniqueId].orderStatus = 1;
        ordermapping[uniqueId].orderOwner = msg.sender;
        ordermapping[uniqueId].bidByShipper = false;
        ordermapping[uniqueId].bidByShipOwner = false;
        orders.push(ordermapping[uniqueId]);
        shipperBidder[uniqueId].currentPrice = 0;
        shipOwnerBidder[uniqueId].currentPrice = 0;
        emit UpdateorderStatus(uniqueId, 'Created', now);
        reqCred =['Insurance policy', 'Driver license']; //dangerous goods to be done
        return uniqueId;
    }
    
    function setpubkeyHash (string memory _pubkeyHash) public returns(string memory){
        pubkeyHash = _pubkeyHash;
        return pubkeyHash;
    }
    
    function getpubkeyHash() public view returns(string memory) {
        return pubkeyHash;
    }
    
    function getReqCredCount() public view returns(uint) {
        return reqCred.length;
    }

    function getReqCred(uint i) public view returns(string memory) {
        //for (uint i=0; i<reqCred.length; i++) {
            return reqCred[i];
        //}
    }

    function bidOrderByShipper(bytes32 orderID, uint price) public {
        require(ordermapping[orderID].orderStatus == 1);
        require(price > shipperBidder[orderID].currentPrice, 'price too low');
        shipperBidder[orderID].bidder = msg.sender;
        shipperBidder[orderID].currentPrice = price;
        ordermapping[orderID].bidByShipper = true;
        emit bidByOthers(msg.sender, 'bid by shipper');
    }

    function bidOrderByShipOwner(bytes32 orderID, uint price) public {
        require(ordermapping[orderID].orderStatus == 1);
        require(price > shipOwnerBidder[orderID].currentPrice, 'price too low');
        shipOwnerBidder[orderID].bidder = msg.sender;
        shipOwnerBidder[orderID].currentPrice = price;
        ordermapping[orderID].bidByShipOwner = true;
        emit bidByOthers(msg.sender, 'bid by ship');
    }
    
    function confirmOrder(bytes32 uuid) public {
        shipowneruuid[msg.sender].uuid = uuid;
        shipowneruuid[msg.sender].confirmed = false;
        emit sendUUID(msg.sender, uuid);
    }
    
    function confirmAssignment(bytes32 orderID, address shipOwner) public onlyOwner() {
        require(shipowneruuid[shipOwner].confirmed == true, 'Invalid identity');
        ordermapping[orderID].shipOwner = shipOwner;
    }

    function adminOrder(bytes32 orderID) public {
        require(ordermapping[orderID].orderOwner == msg.sender, 'not creator');
        require(ordermapping[orderID].bidByShipper && ordermapping[orderID].bidByShipOwner, 'No one bid yet');
        for(uint i=0; i<orders.length; i++){
            if (orders[i].orderID == orderID){
                orders[i].shipper = shipperBidder[orderID].bidder;
                orders[i].shipOwner = shipOwnerBidder[orderID].bidder;
                orders[i].orderStatus = 2;    //to processing part
            }
        }
        
        /*
        ordermapping[orderID].shipper = shipperBidder[orderID].bidder;
        ordermapping[orderID].shipOwner = shipOwnerBidder[orderID].bidder;
        ordermapping[orderID].orderStatus = 2;*/
    }
/*
    function getOrderAssignment(bytes32 orderID) public view returns(address shipper, address shipOwner) {
        require(ordermapping[orderID].orderOwner == msg.sender);
        return (orderAssignment[orderID].shipper, orderAssignment[orderID].shipOwner);
    }*/
    
	function getOrderCount() public view returns(uint) {
		return orders.length;
	}

    function getShipCount() public view returns(uint) {
		return ships.length;
	}

    function getClearanceRequestsCount() public view returns(uint) {
        return clearanceRequests.length;
    }
/*
    function AddShip(string memory shipID) public {
        shipmapping[shipID].shipID = shipID;
        shipmapping[shipID].shipOwner = msg.sender;
        shipmapping[shipID].shipStatus = 1;
        //ships[ships.length].shipStateHistory[0].currentState ='At Port';
        //ships[ships.length].shipStateHistory[0].currentTs = now;
        shipOwnership[msg.sender] = shipID;
        ships.push(shipmapping[shipID]);
        emit UpdateshipStatus(shipID, 'At port', now);
    }*/
/*
    function ChooseShipOwner(string memory shipID, bytes32 orderID) hasRole('Shipper') public {
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
/*
    function ChooseShipOwner(address shipOwner, bytes32 orderID) hasRole('Shipper') public {
        orderToShipOwner[orderID] = shipOwner;
        //generally work with a packlist but now seen as single order
        ordermapping[orderID].orderStatus = 3;  //processing
        for(uint i=0; i<orders.length; i++){
            if (orders[i].orderID == orderID){
                orders[i].orderStatus = 3;
            }
        }
    }*/



    function AskForClearance(string memory shipID) public {
        if (shipmapping[shipID].shipOwner == msg.sender && shipmapping[shipID].shipStatus == 1) {
            for(uint i=0; i<ships.length; i++){
                if (keccak256(abi.encodePacked(ships[i].shipID)) == keccak256(abi.encodePacked(shipID))) {
                    ships[i].shipStatus = 2;    //to processing part
                }
            }
            shipmapping[shipID].shipStatus == 2;
            clearanceRequests.push(ClearanceRequest(shipID, msg.sender));
            emit UpdateshipStatus(shipID, 'Waiting for clearance inspection', now);
        } 
    }

    function UploadClearanceReport(string memory shipID, string memory ipfsHash) public {
        //bytes32 uniqueId = keccak256(abi.encodePacked(msg.sender, now));
        //signedDocs[msg.sender].push(ipfsHash); //Add document to users's "signed" list
        //docmapping[uniqueId] = Document(ipfsHash, msg.sender, shipID, now);
        shipClearanceReport[shipID] = Document(ipfsHash, false);
        shipmapping[shipID].shipStatus = 3; //cleaned
        emit UpdateshipStatus(shipID, 'Cleaned, waiting for ship owner\'s confirmations', now);
        emit UpdateDocStatus(msg.sender, ipfsHash, 'Inspector has been upload doc.');
    }

    function SignClearanceReport(string memory shipID, string memory ipfsHash) public { //shipper and shipOwner would sign Report
        shipClearanceReport[shipID].signedByShipOwner = true;
        emit UpdateDocStatus(msg.sender, ipfsHash, 'Ship owner signed doc.');
    }
    
    function StartWaterDisplacement(string memory shipID, uint measure) public {
        require(shipClearanceReport[shipID].signedByShipOwner);
        shipmapping[shipID].startWaterDisplacement = measure;
        confirmations[shipID] = Confirmation(true, false, false, false, false, false);
    }
    
    function EnableLoad(string memory shipID) public {
        if (confirmations[shipID].signedByShipperStart && confirmations[shipID].signedByShipOwnerStart) {
            shipmapping[shipID].shipStatus = 4; //enable Loading
            emit UpdateshipStatus(shipID, 'Can start loading...', now);
        }
    }
    
    function EndWaterDisplacement(string memory shipID, uint measure) public {
        require(confirmations[shipID].startMeasured && confirmations[shipID].signedByShipperStart && confirmations[shipID].signedByShipperStart);
        shipmapping[shipID].endWaterDisplacement = measure;
        confirmations[shipID].endMeasured = true;
    }
    
    function SignConfirmation(string memory shipID, string memory role) public {
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

    function LoadGoods(string memory shipID) hasRole('Shipper') public {
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

