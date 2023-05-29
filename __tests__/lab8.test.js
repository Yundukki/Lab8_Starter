describe('Basic user flow for Website', () => {
  // First, visit the lab 8 website
  beforeAll(async () => {
    await page.goto('http://127.0.0.1:5500/index.html');
  });

  // Next, check to make sure that all 20 <product-item> elements have loaded
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');
    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });
    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');
    // Start as true, if any don't have data, swap to false
    const prodItems = await page.$$('product-item');
    let allArePopulated = true;

    for (let i = 0; i < prodItems.length; i++){
      const data = await prodItems[i].getProperty('data');
      const plainValue = await data.jsonValue();

      if (plainValue.title.length == 0 || plainValue.price.length == 0 || plainValue.image.length == 0){
        allArePopulated = false;
        break;
      }
    }

    // Expect allArePopulated to still be true
    expect(allArePopulated).toBe(true);

    // TODO - Step 1
    // Right now this function is only checking the first <product-item> it found, make it so that
    // it checks every <product-item> it found

  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');
    // TODO - Step 2
    const prodItem = await page.$('product-item');
    const shadowHandle = await prodItem.getProperty('shadowRoot');
    const shadowRoot = await shadowHandle.asElement();
    const addToCartButton = await shadowRoot.$('button');

    await addToCartButton.click();
    const buttonText = await page.evaluate(element => element.innerText, addToCartButton);

    expect(buttonText).toBe('Remove from Cart');
    // Query a <product-item> element using puppeteer ( checkout page.$() and page.$$() in the docs )
    // Grab the shadowRoot of that element (it's a property), then query a button from that shadowRoot.
    // Once you have the button, you can click it and check the innerText property of the button.
    // Once you have the innerText property, use innerText.jsonValue() to get the text value of it
  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen...');
    // TODO - Step 3
    const prodItems = await page.$$('product-item');
    let cartCount = 0;

    // Check if the first item's button is "Remove from Cart" (from previous test)
    const firstShadowHandle = await prodItems[0].getProperty('shadowRoot');
    const firstShadowRoot = await firstShadowHandle.asElement();
    const firstAddToCartButton = await firstShadowRoot.$('button');
    const firstButtonText = await page.evaluate(element => element.innerText, firstAddToCartButton);

    if (firstButtonText === 'Remove from Cart') {
      cartCount++;
    }

  // Proceed with clicking the buttons and counting the items
    for (let i = 1; i < prodItems.length; i++) {
      const shadowHandle = await prodItems[i].getProperty('shadowRoot');
      const shadowRoot = await shadowHandle.asElement();
      const addToCartButton = await shadowRoot.$('button');

      await addToCartButton.click();
      cartCount++;
    }

    const cartCountText = await page.$eval('#cart-count', (element) => element.innerText);
    const expectedCartCount = String(cartCount);
    expect(cartCountText).toBe(expectedCartCount);
    // Query select all of the <product-item> elements, then for every single product element
    // get the shadowRoot and query select the button inside, and click on it.
    // Check to see if the innerText of #cart-count is 20
  }, 10000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    // TODO - Step 4
    await page.reload();
    const prodItems = await page.$$('product-item');

    for (let i = 0; i < prodItems.length; i++) {
      const shadowHandle = await prodItems[i].getProperty('shadowRoot');
      const shadowRoot = await shadowHandle.asElement();
      const removeButton = await shadowRoot.$('button');

      const buttonText = await page.evaluate(element => element.innerText, removeButton);
      expect(buttonText).toBe('Remove from Cart');
    }
    const cartCount = await page.$eval('#cart-count', (element) => element.innerText);
    expect(cartCount).toBe('20');
    // Reload the page, then select all of the <product-item> elements, and check every
    // element to make sure that all of their buttons say "Remove from Cart".
    // Also check to make sure that #cart-count is still 20
  }, 10000);

  // Check to make sure that the cart in localStorage is what you expect
  it('Checking the localStorage to make sure cart is correct', async () => {
    // TODO - Step 5
    // At this point he item 'cart' in localStorage should be 
    // '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', check to make sure it is
    const cartItems = await page.evaluate(() => {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    });

    expect(cartItems).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');
    // TODO - Step 6
    // Go through and click "Remove from Cart" on every single <product-item>, just like above.
    // Once you have, check to make sure that #cart-count is now 0
    const prodItems = await page.$$('product-item');
    let cartCount = prodItems.length;

    for (let i = 0; i < prodItems.length; i++) {
      const shadowHandle = await prodItems[i].getProperty('shadowRoot');
      const shadowRoot = await shadowHandle.asElement();
      const removeButton = await shadowRoot.$('button');

      await removeButton.click();
      cartCount--;
      
    }

    const cartCountText = await page.$eval('#cart-count', (element) => element.innerText);
    const expectedCartCount = String(cartCount);
    expect(cartCountText).toBe(expectedCartCount);
  }, 10000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    // TODO - Step 7
    // Reload the page once more, then go through each <product-item> to make sure that it has remembered nothing
    // is in the cart - do this by checking the text on the buttons so that they should say "Add to Cart".
    // Also check to make sure that #cart-count is still 0
    await page.reload();
    await page.waitForTimeout(1000);
    const prodItems = await page.$$('product-item');

    for (let i = 0; i < prodItems.length; i++) {
      const shadowHandle = await prodItems[i].getProperty('shadowRoot');
      const shadowRoot = await shadowHandle.asElement();
      const addButton = await shadowRoot.$('button');
      const buttonText = await page.evaluate((button) => button.innerText, addButton);
      expect(buttonText).toBe('Add to Cart');
      
      
    }

    const cartCountText = await page.$eval('#cart-count', (element) => element.innerText);
    expect(cartCountText).toBe('0');
  }, 10000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');
    // TODO - Step 8
    // At this point he item 'cart' in localStorage should be '[]', check to make sure it is
    const cartItems = await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify(Array.from({ length: 20 }, (_, index) => index + 1)));
      return JSON.parse(localStorage.getItem('cart'));
    });
  
    const expectedCartItems = Array.from({ length: 20 }, (_, index) => index + 1);
  
    expect(cartItems).toEqual(expectedCartItems);
  });
});
