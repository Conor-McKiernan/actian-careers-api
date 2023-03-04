const express = require('express');
const axios = require('axios'); // convenient API for HTTP requests
const cheerio = require('cheerio'); // to parse HTML

const app = express();

app.get('/positions/:department', async (req, res) => {
    const { department } = req.params;
    
    if (!department) {
      return res.status(400).send('Department is required!');
    }
    
    const url = 'https://www.actian.com/company/careers';
    
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      
      let positions = [];
      
      $('div.job-posting').each((_, posting) => {
        const heading = $(posting).find('div.job-heading');
        const departmentName = heading.find('div.department').text().trim();
        const content = $(posting).find('div.job-content');
  
        if (departmentName.toLowerCase() === department.toLowerCase()) {
          content.find('div.listing').each((_, listing) => {
            const link = $(listing).find('a');
            const jobName = link.find('div.job-name').text().trim();
            positions.push(jobName);
          })
        }
      });
      
      // No job listings for specified department, return 404 Not Found response 
      if (positions.length === 0) {
        return res.status(404).send('No department found!');
      }
      // Otherwise, return 200 OK res with array of job titles.
      return res.status(200).json(positions);
    } catch (error) {
      return res.status(500).send('Error occurred while fetching data!');
    }
  });
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  