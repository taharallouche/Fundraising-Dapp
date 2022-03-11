const FundraiserFactoryContract = artifacts.require("FundraiserFactory");
const FundraiserContract = artifacts.require("Fundraiser");

contract("FundraiserFactoryContract", async (accounts)=> {
	describe("Deployement", async => {
		it("has been deployed", async () => {
			const fundraiserFactory = FundraiserFactoryContract.deployed();
			assert(fundraiserFactory, "FundraiserFactory was not deployed");
		})
	})
})


contract("FundraiserFactory : create fundraiser", async(accounts) => {
	let fundraiserFactory;

	const name = "Tahar";
	const url = "https://taharallouche.github.io/";
	const imageURL = "https://scontent.fcdg2-1.fna.fbcdn.net/v/t1.6435-9/58616549_2216563441765950_4109415925604679680_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=e3f864&_nc_ohc=Akbx_BlAqEMAX8oxs1V&_nc_ht=scontent.fcdg2-1.fna&oh=00_AT9dldPrZm3yAK2vWJzAjnedwadqa46wvrndm-z_ZGA2yA&oe=624792FB";
	const description = "Fundraiser for the fundraiser project"
	const beneficiary = accounts[1];
	describe("Create Fundraiser", async() => {
		it("increments fundraiserCount", async() => {
			fundraiserFactory = await FundraiserFactoryContract.deployed();
			const currentFundraiserCount = await fundraiserFactory.fundraisersCount();
			await fundraiserFactory.createFundraiser(name, url, imageURL, description, beneficiary);
			const newFundraiserCount = await fundraiserFactory.fundraisersCount();
			const diff = newFundraiserCount - currentFundraiserCount;
			assert.equal(diff,1,"fundraiserCount should be incremented by 1");
		})

		it("emits FundraiserCreated event",async() => {
			const tx = await fundraiserFactory.createFundraiser(name, url, imageURL, description, beneficiary, {from : accounts[0]});
			const expected = "FundraiserCreated";
			const actual = tx.logs[0].event;
			assert.equal(actual,expected,"events should match");
		})
		
	})
})



contract("FundraiserFactory: fundraisers", (accounts) => {
  async function createFundraiserFactory(fundraiserCount, accounts) {
    const factory = await FundraiserFactoryContract.new();
    await addFundraisers(factory, fundraiserCount, accounts);
    return factory;
  }

  async function addFundraisers(factory, count, accounts) {
    const name = "Beneficiary";
    const lowerCaseName = name.toLowerCase();
    const beneficiary = accounts[1];

    for (let i=0; i < count; i++) {
      await factory.createFundraiser(
        `${name} ${i}`,
        `${lowerCaseName}${i}.com`,
        `${lowerCaseName}${i}.png`,
        `Description for ${name} ${i}`,
        beneficiary
      );
    }
  }

  describe("when fundraisers collection is empty", () => {
    it("returns an empty collection", async () => {
      const factory = await createFundraiserFactory(0, accounts);
      const fundraisers = await factory.fundraisers(10, 0);
      assert.equal(
        fundraisers.length,
        0,
        "collection should be empty"
      );
    });
  });

  describe("varying limits", async () => {
    let factory;
    beforeEach(async () => {
      factory = await createFundraiserFactory(30, accounts);
    })
  
    xit("returns 10 results when limit requested is 10", async ()=>{
      const fundraisers = await factory.fundraisers(10, 0);
      assert.equal(
        fundraisers.length,
        10,
        "results size should be 10"
      );
    });
  
    xit("returns 20 results when limit requested is 20", async ()=>{
      const fundraisers = await factory.fundraisers(20, 0);
      assert.equal(
        fundraisers.length,
        20,
        "results size should be 20"
      );
    });
  
    xit("returns 20 results when limit requested is 30", async ()=>{
      const fundraisers = await factory.fundraisers(30, 0);
      assert.equal(
        fundraisers.length,
        20,
        "results size should be 20"
      );
    });
 });


  describe("varying offset", async () => {
    let factory;
    beforeEach(async () => {
      factory = await createFundraiserFactory(10, accounts);
    })
  
    xit("contains fundraiser with appropriate offset", async ()=>{
      const fundraisers = await factory.fundraisers(1, 0);
      const fundraiser = await FundraiserContract.at(fundraisers[0]);
      const name = await fundraiser.name();
      assert.ok(await name.includes(0), "${name} did not include the offset");
    });
  
    xit("contains fundraiser with appropriate offset", async ()=>{
      const fundraisers = await factory.fundraisers(1, 7);
      const fundraiser = await FundraiserContract.at(fundraisers[0]);
      const name = await fundraiser.name();
      assert.ok(await name.includes(7), "${name} did not include the offset");
    });
 });


  describe("testing bounds", async () => {
  	let factory;
    beforeEach(async () => {
      factory = await createFundraiserFactory(10, accounts);
    })

    it("reverts offset larger than fundraiserCount", async() => {
    	try{
    		await factory.fundraisers(1,11);
    		assert.fail("error not raised")
    	} catch(err) {
    		const expected = "offset out of bounds";
    		assert.ok(err.message.includes(expected),'${err.message}');
    	}
    })

    it("adjusts return size to avoid bound effects", async() => {
    	const fundraisers = await factory.fundraisers(10,5);
      console.log(fundraisers);
    	const expectedSize = 5;
    	const actualSize = fundraisers.length;
    	assert.equal(actualSize,expectedSize,"size should be adapted");
    })
  })
})