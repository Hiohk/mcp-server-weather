import dotenv from 'dotenv';

dotenv.config();


// JavaScript example using fetch
const apiKey = process.env.SMITHERY_API_KEY;
const query = 'owner:mem0ai is:verified memory';
const encodedQuery = encodeURIComponent(query);

const response = await fetch(
  `https://registry.smithery.ai/servers?q=${encodedQuery}&page=1&pageSize=10`,
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data);




