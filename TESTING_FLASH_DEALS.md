# Testing Flash Deals & Discount Feature

## Steps to Test:

1. **Login to Admin Panel**
   - Go to http://localhost:3000/admin
   - Login with admin credentials

2. **Add or Edit a Product with Discount**
   - Click "Products" tab
   - Click "+ Add New Product" or "Edit" an existing product
   - Fill in the product details
   - **IMPORTANT:** Set the "Discount (%)" field to a value >= 20 (e.g., 25, 30, etc.)
   - Upload an image if needed
   - Click "Add Product" or "Update Product"
   - Check browser console for the log: "Sending product data: {...discount: XX}"

3. **Verify Product Saved**
   - The product should appear in the products list
   - Navigate to http://localhost:3000 (home page)
   - Scroll down to find the "⚡ Flash Deals - Limited Time Only!" section
   - The product should appear there with:
     - Product card
     - Red discount badge showing percentage (e.g., "-25%")
     - Discounted price displayed (original price crossed out)

4. **Test Multiple Scenarios**
   - Create a product with discount 19% - should NOT appear in Flash Deals
   - Create a product with discount 20% - should appear in Flash Deals
   - Create a product with discount 50% - should appear in Flash Deals with higher priority (sorted by discount desc)

## Expected Behavior:

- Discount field shows on admin product form
- Discount value is saved to database
- Products with discount >= 20% appear in Flash Deals section on home page
- Product cards show:
  - Discount badge with percentage
  - Original price struck through
  - Discounted price calculated and displayed
- Flash deals are sorted by discount (highest first)

## Debug Tips:

1. Check browser console for "Sending product data:" log
2. Check browser network tab to see API response
3. Check terminal for MongoDB operations
4. Verify discount value is included in API response when editing/creating product
