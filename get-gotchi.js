import Web3 from 'web3';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const web3 = new Web3(process.env.WEB3_PROVIDER);

async function fetchETHBalance(address) {
    try {
      const balanceWei = await web3.eth.getBalance(address);
      const balanceETH = web3.utils.fromWei(balanceWei, 'ether');
      return balanceETH;
    } catch (error) {
      console.error(`Error fetching ETH balance for ${address}:`, error);
      throw error;
    }
  }
async function fetchAavegotchis(n) {
    const query = {
      query: `
        {
          aavegotchis(first: ${n}) {
            id
            gotchiId
            owner {
              id
            }
            name
          }
        }
      `
    };
  
    try {
      const response = await fetch('https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
  
      const data = await response.json();
  
      // Debugging: Log the response to ensure the structure is as expected
      console.log(JSON.stringify(data, null, 2));
  
      // Ensure you're accessing the data correctly
      if (data && data.data && data.data.aavegotchis) {
        return data.data.aavegotchis;
      } else {
        throw new Error('Aavegotchis data not found in the response');
      }
    } catch (error) {
      console.error('Error fetching Aavegotchis:', error);
      throw error; // Rethrow the error after logging it
    }
  }

  // Test fetching the first 5 Aavegotchis
/*fetchAavegotchis(5).then(aavegotchis => {
    console.log('Fetched Aavegotchis:', aavegotchis);
  }).catch(error => {
    console.error('Error fetching Aavegotchis:', error);
  });
*/
 /* async function fetchAavegotchisAndBalances(n) {
    try {
      const aavegotchis = await fetchAavegotchis(n);
      for (const gotchi of aavegotchis) {
        const ethBalance = await fetchETHBalance(gotchi.owner.id);
        console.log(`Owner id (address): ${gotchi.owner.id} ETH Balance: ${ethBalance}`);
      }
    } catch (error) {
      console.error('Error fetching Aavegotchis and ETH balances:', error);
    }
  }
  
  // Test fetching the first 5 Aavegotchis and their ETH balances
  fetchAavegotchisAndBalances(100).catch(error => {
    console.error('Error:', error);
  });
  */
  async function findOwnerWithHighestETHBalance() {
    try {
      const aavegotchis = await fetchAavegotchis(333); // Adjust the number based on your needs
      let highestBalance = 0;
      let ownerWithHighestBalance = '';
  
      const balancePromises = aavegotchis.map(async (gotchi) => {

        if (gotchi.owner.id.toLowerCase() === '0x0000000000000000000000000000000000000000') {
          return;
        }

        const ethBalance = await fetchETHBalance(gotchi.owner.id);
        console.log(`Owner id (address): ${gotchi.owner.id} ETH Balance: ${ethBalance} Gotchi name: ${gotchi.name}`);
        if (parseFloat(ethBalance) > highestBalance) {
          highestBalance = parseFloat(ethBalance);
          ownerWithHighestBalance = gotchi.owner.id;
        }
      });
  
      await Promise.all(balancePromises);
  
      console.log(`Owner with the highest ETH balance: ${ownerWithHighestBalance} with ${highestBalance} ETH`);
    } catch (error) {
      console.error('Error determining the owner with the highest ETH balance:', error);
    }
  }

  findOwnerWithHighestETHBalance().catch(console.error);
  