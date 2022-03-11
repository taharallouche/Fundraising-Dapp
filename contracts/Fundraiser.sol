pragma solidity >=0.4.21 <0.9.0;


//Import OpenZeppelin libraries: Ownable and SafeMath
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";



///@title fundraiser
///@author Tahar Allouche
///@notice use this contract to describe and interact with a fundraiser
contract Fundraiser is Ownable{

	//Use SafeMath for overflow security
	using SafeMath for uint256;

	// public variables
	string public name;
	string public url;
	string public imageURL;
	string public description;
	address payable public beneficiary;
	uint256 public totalDonations;
	uint256 public donationsCount;

	// Saves the value and the date of a donation
	struct Donation{
		uint256 value;
		uint256 date;
	}

	// Mapping to track the donations of each donator
	mapping (address => Donation[]) private _donations;

	///@title Donation received event
	///@notice Emitted when a donation is received
	///@param donor: the address of the donor
	///@param: the amount donated
	event DonationReceived(address indexed donor, uint256 value);



	///@title withdrawal event
	///@notice Emitted when the custodian withdraws the funds 
	///@param: the amount withdrawn (total amount of donations at moment of call)
	event Withdraw(uint256 amount);



	///@title fundraiser's constructor
	///@notice will initialize the fundraiser's information when the contract is created
	///@dev the custodian will own the contract using the OpenZeppelin _transferOwnership function
	///@param _name: name of the fundraiser
	///@param _website: website URL of the fundraiser
	///@param _image: image URL of the fundraiser
	///@param _description: description of the fundraiser
	///@param _beneficiary: address of the fundraiser
	///@param _custodian: address of the custodian (the one which can request the withdrawal of the funds)
	constructor(string memory _name, string memory _website,string memory _image,string memory _description, address payable _beneficiary, address _custodian) public {
		name = _name;
		url = _website;
		imageURL = _image;
		description = _description;
		beneficiary = _beneficiary;
		_transferOwnership(_custodian);
	}


	///@title change the beneficiary address
	///@notice only the custodian can call it to change the benficiary's address
	///@dev uses OpenZeppelin's onlyOwner modifier
	///@param _beneficiary: the new address
	function setBeneficiary(address payable _beneficiary) public onlyOwner{
		beneficiary = _beneficiary;
	}


	///@title donations' count
	///@notice computes and returns the number of donations received
	///@return the number of donations received
	function myDonationsCount() public view returns(uint256){
		return _donations[msg.sender].length;
	}



	///@title donate
	///@notice make a donation
	///@dev it will emits a DonationReceived event
	function donate() public payable{
		Donation memory donation = Donation({value: msg.value, date: block.timestamp});
		_donations[msg.sender].push(donation);
		totalDonations = totalDonations.add(msg.value);
		donationsCount = donationsCount.add(1);

		emit DonationReceived(msg.sender, msg.value);
	}


	///@title my (the donor's) donations
	///@notice returns an array of donations' amounts and another for their dates
	///@return values: array of donations' amounts
	///@return dates: array of donations' dates
	function myDonations() public view returns (uint256[] memory values, uint256[] memory dates){
		uint count = myDonationsCount();
		values = new uint256[](count);
		dates = new uint256[](count);
		for (uint256 i ;i<count; i++){
			Donation storage donation = _donations[msg.sender][i];
			values[i] = donation.value;
			dates[i] = donation.date;
		}
		return (values,dates);
	}

	///@title withdraw
	///@notice can be called by the custodian to withdraw the received funds
	///@dev it emits a Withdraw event
	function withdraw() public onlyOwner{
		uint256 balance = address(this).balance;
		beneficiary.transfer(balance);
		emit Withdraw(balance);
	}


	///@title fallback function
	///@dev it is for receiving an anonymous donation
	fallback() external payable {
		totalDonations = totalDonations.add(msg.value);
		donationsCount = donationsCount.add(1);
	}
}