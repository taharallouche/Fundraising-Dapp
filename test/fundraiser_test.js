const FundraiserContract = artifacts.require("Fundraiser.sol");

contract (FundraiserContract, async (accounts) => {
	let fundraiser;
	const name = "Tahar";
	const url = "https://taharallouche.github.io/";
	const imageURL = "https://scontent.fcdg2-1.fna.fbcdn.net/v/t1.6435-9/58616549_2216563441765950_4109415925604679680_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=e3f864&_nc_ohc=Akbx_BlAqEMAX8oxs1V&_nc_ht=scontent.fcdg2-1.fna&oh=00_AT9dldPrZm3yAK2vWJzAjnedwadqa46wvrndm-z_ZGA2yA&oe=624792FB";
	const description = "Fundraiser for the fundraiser project"
	const beneficiary = accounts[1];
	const owner = accounts[0];

	beforeEach(async() => {
			fundraiser = await FundraiserContract.new(name,url,imageURL,description,beneficiary,owner);
		})

	describe("Initialization", async () => {
		it("initializes name variable", async () =>{
			let actual;
			expected = name;
			actual = await fundraiser.name();
			assert.equal(actual,expected,"Name not set correctly");
		})

		it("initializes website variable", async () =>{
			let actual;
			expected = url;
			actual = await fundraiser.url();
			assert.equal(actual,expected,"Website not set correctly");
		})

		it("initializes image variable", async () =>{
			let actual;
			expected = imageURL;
			actual = await fundraiser.imageURL();
			assert.equal(actual,expected,"Image not set correctly");
		})

		it("initializes description variable", async () =>{
			let actual;
			expected = description;
			actual = await fundraiser.description();
			assert.equal(actual,expected,"Description not set correctly");
		})

		it("initializes beneficiary variable", async () =>{
			let actual;
			expected = beneficiary;
			actual = await fundraiser.beneficiary();
			assert.equal(actual,expected,"Beneficiary not set correctly");
		})

		it("initializes owner variable", async () =>{
			let actual;
			expected = owner;
			actual = await fundraiser.owner();
			assert.equal(actual,expected,"Owner not set correctly");
		})

	})

	describe("setBeneficiary()",async() => {
		const newBeneficiary = accounts[2];
		it("updates beneficiary", async () => {
			expected = newBeneficiary;
			let actual;
			await fundraiser.setBeneficiary(newBeneficiary,{from : accounts[0]});
			actual = await fundraiser.beneficiary();
			assert(actual, expected, "beneficiary shoud be updated");
		})

		it("is onlyOwner" ,async ()=>{
			try {
				await fundraiser.setBeneficiary(newBeneficiary,{from : accounts[1]});
			} catch(err) {
				const errorMessage = "Ownable: caller is not the owner";
				assert.equal(err.reason,errorMessage,"beneficiary should not be updated");
				return;
			}
			assert(false,"beneficiary should not update");
		})
	})

	describe("Donations",async() => {
		const donor = accounts[2];
		const value = web3.utils.toWei("0.1","ether");
		it("Increases myDonationsCount",async()=>{
			const currentDonationsCount = await fundraiser.myDonationsCount({from : donor});
			let actual;
			await fundraiser.donate({from : donor, value});
			actual = await fundraiser.myDonationsCount({from :donor});
			assert.equal(1,actual - currentDonationsCount,"Donation count should be incremented by 1");
		})

		it("Includes donation in myDonations", async() =>{
			await fundraiser.donate({from : donor, value});
			const {values,dates} = await fundraiser.myDonations({from: donor});
			assert.equal(values[0],value,"values should must");
			assert(dates[0],"date should be present");
		})

		it("Increases the totalDonations amount", async () => {
			const currentAmount = await fundraiser.totalDonations();
			await fundraiser.donate({from: donor, value});
			const updatedAmount = await fundraiser.totalDonations();
			assert.equal(value,updatedAmount-currentAmount,"should update totalDonations with value" );
		})

		it("Increments the donationsCount amount", async () => {
			const currentCount = await fundraiser.donationsCount();
			await fundraiser.donate({from: donor, value});
			const updatedCount = await fundraiser.donationsCount();
			assert.equal(1,updatedCount-currentCount,"should increment donationsCount by 1" );
		})

		it("Emits a DonationReceived event",async ()=>{
			const tx = await fundraiser.donate({from : donor, value});
			const expected = "DonationReceived";
			const actual = tx.logs[0].event;
			assert.equal(actual,expected,"Should emit DonationReceived event")
		})
	})

	describe("Withdrawing funds",async() => {
		beforeEach (async() => {
			await fundraiser.donate({from: accounts[1], value: web3.utils.toWei('0.1',"ether")});
		})

		describe("Access control", async() => {
			it("is onlyOwner" ,async ()=>{
			try {
				await fundraiser.withdraw({from : accounts[3]});
				assert.fail("withdraw was not restricted to owners");
			} catch(err) {
				const expectedError = "Ownable: caller is not the owner";
				assert.equal(err.reason,expectedError,"funds should not be withdrawn");
				return;
			}
		})

			it("permits owner to withdraw funds", async() => {
				try{
					await fundraiser.withdraw({from: owner});
					assert(true,"no errors were thrown");
				} catch(err) {
					assert.fail("should not have thrown error");
				}
			})
		})

		describe("Transfering funds", async() => {
			it("transfers balance to beneficiary", async() => {
				const currentContractBalance = await web3.eth.getBalance(fundraiser.address);
				const currentBeneficiaryBalance = await web3.eth.getBalance(beneficiary);
				await fundraiser.withdraw({from : owner})
				const newContractBalance = await web3.eth.getBalance(fundraiser.address);
				const newBeneficiaryBalance = await web3.eth.getBalance(beneficiary);
				const beneficiaryDifference = newBeneficiaryBalance - currentBeneficiaryBalance;

				assert.equal(newContractBalance,0,"contract should have 0 balance");
				assert.equal(beneficiaryDifference,currentContractBalance,"beneficiary shoudl receive all funds");
				
			})

			it("emits Withdraw event", async() => {
				const tx = await fundraiser.withdraw({from : owner});
				const actual = tx.logs[0].event;
				const expected = "Withdraw";
				assert.equal(actual, expected, "events should match")
			})
		})

	})

	describe("Fallback",async () => {
		const value = web3.utils.toWei("0.02","ether");
		it("increases the totalDonations amount", async() => {
			const currentTotalDonations = await fundraiser.totalDonations();
			await web3.eth.sendTransaction({from : accounts[9], to: fundraiser.address, value})
			const newTotalDonations = await fundraiser.totalDonations();
			const difference = newTotalDonations - currentTotalDonations;
			assert.equal(difference, value, "difference should be equal to value")
		})

		it("increments the donationsCount", async() => {
			const currentDonationsCount = await fundraiser.donationsCount();
			await web3.eth.sendTransaction({from : accounts[9], to: fundraiser.address, value})
			const newDonationsCount = await fundraiser.donationsCount();
			const difference = newDonationsCount - currentDonationsCount;
			assert.equal(difference, 1, "difference should be equal to 1")
		})
	})
})