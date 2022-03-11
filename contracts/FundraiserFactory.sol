pragma solidity >=0.4.21 <0.9.0;


//Import the Fundraiser contract
import "./Fundraiser.sol";


///@title Fundraiser Factory
///@author Tahar Allouche
///@notice a fundraiser factory will create and manage fundraisers
contract FundraiserFactory{
	
	//state variables
	Fundraiser[] private _fundraisers;
	uint256 constant maxLimit = 20;

	///@title Fundraiser Created
	///@notice emitted when a new fundraiser is created
	///@param fundraiser: the Fundraiser object of the new fundraiser
	///@param owner: the owner (custodian) of the new fundraiser
	event FundraiserCreated(Fundraiser indexed fundraiser, address indexed owner);


	///@title Fundraisers Count
	///@notice computes the number of fundraisers in the factory
	///@return the number of alternatives in the factory
	function fundraisersCount() public view returns(uint256) {
		return _fundraisers.length;
	}

	///@title Create Fundraiser
	///@notice creates a new fundraiser
	///@dev it emits a FundraiserCreated event
	///@param _name the name of the new fundraiser
	///@param _url the website url of the new fundraiser
	///@param _imageURL the image URL of the new fundraiser
	///@param _description the new fundraiser's description
	///@param _beneficiary the address of the new fundraiser
	function createFundraiser(string memory _name, string memory _url,string memory _imageURL,string memory _description, address payable _beneficiary) public {
		Fundraiser fundraiser = new Fundraiser(_name,_url,_imageURL,_description,_beneficiary,msg.sender);
		_fundraisers.push(fundraiser);

		emit FundraiserCreated(fundraiser,msg.sender);
	}

	///@title Fundraisers
	///@notice it returns the list of fundraisers
	///@param limit the desired number of fundraisers to get
	///@param offset the index of the first returned fundraiser
	///@retur coll the list of fundraisers
	function fundraisers(uint256 limit , uint256 offset) public view returns(Fundraiser[] memory ){
		require(offset <= fundraisersCount() ,"offset out of bounds" );
		uint256 size = fundraisersCount() - offset;
		size = size < limit ? size : limit;
		size = size < maxLimit ? size : maxLimit;

		Fundraiser[] memory coll = new Fundraiser[](size);

		for (uint i=0; i<size; i++){
			coll[i] = _fundraisers[ i + offset];
		}
		return coll;
	}


} 