const cheerio = require('cheerio'); 

function parseStoreHtml(storeName, html) { 
    const $ = cheerio.load(html); 
    const items = []; 
    const normalizedName = storeName.toLowerCase(); 

    // Generic fallback parser
    $('[class*="product"], [class*="item"]').each((i, element) => {
        const card = $(element);
        items.push({
            name: card.find('[class*="name"], [class*="title"]').text().trim(),
            price: card.find('[class*="price"], [class*="cost"]').text().trim(),
            url: card.find('a').attr('href'),
            image: card.find('img').attr('src'),
            brand: storeName.split(' ')[0] // Gets first word (e.g. "Nike" from "Nike Store")
        });
    });
    
    return {
        store: storeName,
        items: items.filter(item => item.name && item.price).map(item => ({
            ...item,
            url: item.url.startsWith('http') ? item.url : 
                `https://${normalizedName.replace(/\s+/g, '')}.com${item.url}`
        }))
    };
}


module.exports = { parseStoreHtml }; 